# Prediction Contract

**Status:** Design
**Serves:** ADR-0008 (buckets), ADR-0013 (abstention), ADR-0017 (covariates), ADR-0029 (prediction mechanics), **ADR-0037 (forward-only), ADR-0038 (seeded evidence)**

> **Revision 2026-08-09 — forward-only.** [ADR-0037](../adr/0037-forward-only-agent-learning.md) removed historical agent replay. **The prompt contract itself is unchanged** — the same blocks, the same schema, the same validation rules. What changed is that `as_of` is now always *now*, block 6's evidence carries provenance tags, and the historical Chronos/TimesFM run is calibration rather than a rival result.

## Principle

The model predicts a **departure from a computed baseline**, never an absolute outcome, and never a price.

It is not asked *"what will gold do tomorrow?"* It is asked: *"the conditional climatology baseline for gold on this calendar date in this regime is distribution B; event E occurred with severity S; accumulated evidence for (E × gold) says H — how should B shift?"*

This framing is what makes the result interpretable. Climatology is precisely what skill is measured against (ADR-0008), so a model that departs and is right has demonstrated something, and a model that echoes the baseline scores zero skill honestly.

**The model does no arithmetic.** Bucket boundaries, σ, baselines, surprise values and severity scores all arrive as computed inputs. It returns probabilities against boundaries it was given. Any number the model derives is a number that can be silently wrong.

## Split of responsibilities

| Computed in code — no model call | Judged by the model |
|---|---|
| σ over trailing 60 sessions → bucket boundaries | Does this event shift the distribution away from baseline? |
| Conditional climatology baseline (calendar + regime) | Which direction, and how far? |
| Regime covariate values, as σ-relative moves | How much weight does accumulated evidence deserve? |
| Standardised surprise for scheduled releases | Is the evidence strong enough to depart at all — or abstain? |
| Severity score (from the classifier agent) | |
| Wiki page selection (manifest key lookup) | |
| Cross-instrument coherence check (post-hoc) | |

## Call granularity

**One call per instrument — eleven calls per run** (ADR-0029). Each prediction is independent, attributable, and small enough to validate reliably; one malformed response costs one instrument rather than the day.

**Coherence comes from shared context, not from a shared call.** Every one of the eleven prompts carries the *same* regime block — real 10Y yield, dollar index, VIX, crude, all as σ-relative moves. The instruments are therefore reasoning from an identical view of market state even though they are predicted separately. No twelfth "market state" call is needed; the regime covariates already are the market state.

**Residual incoherence is measured, not prevented.** After all eleven predictions land, a deterministic check scores them against known structural relationships:

| Relationship | Expectation |
|---|---|
| NIFTY 50 ↔ SENSEX | Near-identical; opposite directions is almost certainly an error |
| Gold ↔ dollar index | Predominantly inverse |
| Gold ↔ equity indices | Inverse under risk-off conditions |
| Gold spot USD ↔ MCX gold INR | Linked through USD/INR; divergence must be explicable by the currency leg |

Violations are **flagged as a metric, not blocked**. A genuine decoupling is a real market event and should not be suppressed — but a sustained rise in violations means the per-instrument design is costing coherence, and that is the signal to revisit.

## What Chronos actually receives

**A fixed-length rolling window of recent history — never the full archive, never just today.** The same length on every call, sliding forward one session at a time.

### Univariate call — one array

For gold on 12 August 2026:

```
context           = [close[t-N], … , close[t-1], close[t]]   # N ≈ 512–1024 sessions
prediction_length = 5                                         # covers t+1 and t+5
```

That array of numbers is the entire input. No prompt, no metadata, no event text.

### Covariate-informed call — aligned series, not scalars

```
target     = [close[t-N] … close[t]]
covariates = {
  "dxy":            [… same window …],
  "real_yield_10y": [… same window …],
  "vix":            [… same window …],
  "wti":            [… same window …],
  "severity":       [0, 0, 0, 2.1, 0, 0, …],   # mostly zeros, spikes on event days
}
```

**Covariates are full time series aligned to the target window, not single values.** Event severity is not "today's severity is 2.1" — it is a series across the whole window, zero on most days. This is what lets Chronos learn the *shape* of a post-event reaction statistically, which is precisely what makes it a fair rival to the agent's semantic reasoning.

### Why not the full eleven years

- **Context is bounded.** Eleven years of daily data is roughly 2,750 points and likely exceeds the model's maximum context.
- **Chronos is zero-shot — it does not train on what you send.** More history does not make it learn more; it pattern-matches on the context given. Ancient data mostly adds noise.
- **Regime relevance.** 2015 gold dynamics say little about 2026 dynamics compared with the last two years.

### The system uses five different history spans

Conflating these is the most likely source of confusion:

| Purpose | Span |
|---|---|
| σ and bucket boundaries (ADR-0008) | Trailing 60 sessions |
| **Chronos context** | **Trailing ~512–1024 sessions (~2–4 years)** |
| Conditional climatology (ADR-0017) | All available, grouped by calendar and regime condition |
| Wiki evidence — seeded (ADR-0038) | All history to go-live, via deterministic join |
| Wiki evidence — observed | Go-live → today, one day at a time |
| Lane A calibration dates (ADR-0037) | All history, Feb 2015 → present |

The eleven-year archive builds the **wiki seed** and supplies **Lane A calibration dates**. It is never sent to Chronos as context, and — since [ADR-0037](../adr/0037-forward-only-agent-learning.md) — it is never replayed through the agent.

**Contamination note.** Chronos and TimesFM were pre-trained on public price series, so a context window ending inside their training period overlaps data they have seen. **This is not leakage.** Contamination is a property of the *target*, not the context. Running live, the target is always tomorrow — outside any published training set regardless of cutoff — so the full window is sent as normal. Restricting the context to post-cutoff data would starve the models for two years and buy nothing. See [L11 in the threat model](point-in-time-test-harness.md).

### Shape: independent per instrument, matching the agent

Both Chronos configurations run **one series at a time**, eleven times — the same shape as the agent's eleven calls. Chronos-2 supports multivariate forecasting natively and a joint forecast would be a stronger baseline, capturing gold-versus-equities and NIFTY-versus-SENSEX structure directly. It is deliberately not used.

**The reason is attribution.** If Chronos had cross-instrument structure the agent lacks, a loss would be ambiguous between "event reasoning doesn't help" and "the agent was handicapped by design." Like-for-like keeps the comparison clean: any difference in outcome comes from event reasoning, not from structural advantage.

**This also gives the coherence check (ADR-0029) a control.** With both sides forecasting per-instrument, the coherence-violation metric can be computed for Chronos too. If Chronos violates structural relationships at a similar rate, incoherence is a property of per-instrument forecasting rather than a defect in the agent — which is worth knowing before spending effort fixing the wrong thing.

### Cost in Lane A calibration

The window slides, so calibration needs one Chronos call per simulated date, per instrument, per configuration:

`~2,750 trading days × 11 instruments × 2 configurations ≈ 60,000 calls`

At 120M parameters on CPU this is roughly **1.5–4 vCPU-hours**, and it batches across series. In money that is **well under a dollar** (see the architecture document); the cost is **wall-clock time of one to two hours**, not spend. It fits comfortably inside AgentCore Runtime's 8-hour execution window. A live run is 22 forecasts and takes seconds.

**These historical figures are calibration, not evidence** ([ADR-0037](../adr/0037-forward-only-agent-learning.md)). They set bucket boundaries and confirm the baselines behave sanely. They are contaminated across the pre-cutoff period and are never quoted as skill, never compared against the agent. **The head-to-head against the agent happens live, on identical days, for all five rungs of the ladder.**

### Verification items

- Chronos-2's exact maximum context length, which fixes N.
- Whether known-future covariates are supported. Calendar factors from ADR-0017 — Diwali, Akshaya Tritiya, expiry dates — are known years ahead and would fit that slot naturally if so.

## Prompt structure

| Block | Content | Volatility |
|---|---|---|
| 1 | Task frame — bucket definitions, output schema, abstention rules | Stable |
| 2 | Instrument page from the wiki | Stable day to day |
| 3 | **Baselines** — **both** univariate forecasts, separately labelled: Chronos-2 and TimesFM 2.5, each converted to bucket probabilities (ADR-0032). Where they disagree is itself signal — it marks the series-dynamics view as uncertain, which is when event context most likely matters. Covariate-informed runs are scoring rivals and are never shown. | Daily |
| 4 | **Regime state** — the five covariates as σ-relative moves (identical across all 11 calls) | Daily |
| 5 | **Today's events** — category, severity, actors, geography; scheduled releases with standardised surprise | Daily |
| 6 | **Accumulated evidence** — correlation pages: observation count, hit rate, computed confidence, disconfirming evidence — **each observation tagged `seeded` or `observed` (ADR-0038)**, with hit rate and confidence given three ways: seeded-only, observed-only, combined | Slow |
| **6b** | **The predictor's own track record** ([ADR-0042](../adr/0042-calibration-feedback-and-calibrated-track.md)) — reliability by confidence band, directional balance, departure discipline, RPS by severity, over a trailing window. **Every line is arithmetic over the scored record; none of it is model-written**, for the same reason scoring has no model in it — a self-assessment the model produced is one the model could flatter. | Daily |
| 7 | Output instruction | Stable |

Blocks 1–2 are the natural cache boundary. Nova caps cached content at roughly 20k tokens, so only part of that prefix caches — re-derive on every model change (ADR-0027).

**Block 6 provenance is not decoration.** The model must be able to see that a hit rate rests on a deterministic join over history rather than on the system's own track record — those two things warrant different weight, and collapsing them would make the project's central claim unmeasurable from inside the prompt as well as from outside it.

**Prompt assembly is itself a point-in-time surface**, and under forward-only it is *the* surface. Every value in blocks 3–6 must carry a `knowledge_time` at or before the run's declared cut-off, asserted in the assembly path rather than reviewed. This is the harness's **snapshot integrity test** ([Layer 2](point-in-time-test-harness.md)), which replaced truncated replay as the merge gate: the assembled prompt must rebuild byte-identically from the stored snapshot, so what was scored is what was sent. Vectors L2, L3 and L10 live in prompt construction rather than in storage and are structurally closed live — but **L9 (cross-market timing) is not**, and it is the one prompt-assembly vector that still needs a targeted test.

## Output schema

```json
{
  "instrument": "gold_spot_usd",
  "as_of": "2026-08-12T21:00:00Z",
  "abstain": false,
  "horizons": {
    "t+1": {
      "buckets": {
        "strong_down": 0.05, "moderate_down": 0.15, "flat": 0.30,
        "moderate_up": 0.35, "strong_up": 0.15
      },
      "confidence": 0.62
    },
    "t+5": { "buckets": { }, "confidence": 0.41 }
  },
  "cited_pages": [
    "correlations/geopolitical-conflict__gold.md@<version_id>",
    "instruments/gold.md@<version_id>"
  ],
  "reasoning": "…",
  "baseline_shown": true,
  "model_id": "amazon.nova-premier-v1",
  "prompt_version": "2026-08-09",
  "filter_version": "1",
  "overlay_version": "1"
}
```

**Cited pages carry version IDs**, so a prediction records exactly which page revision informed it — required for audit and for verifying point-in-time correctness after the fact.

**Version stamps on every prediction** — model, prompt, filter, overlay. Each of those can change what a prediction would have been, and each has a recorded hazard of silently rewriting history (ADR-0011, ADR-0021, ADR-0027). Without the stamps, a metric shift is uninterpretable.

## Validation — output is checked, never trusted

Enforced in code before a prediction is written:

- Bucket probabilities sum to 1.0 within tolerance; all five buckets present at both horizons.
- Confidence within [0, 1].
- Every cited page exists in the manifest **as of `as_of`** — a citation to a page that did not yet exist is a leakage signal, not a formatting error.
- `abstain: true` is incompatible with a non-baseline distribution.
- **If event severity exceeds the mandatory-prediction threshold, `abstain` must be false** — this is where ADR-0013's "may not be silent on event days" rule is enforced, in code rather than in the prompt.

A response failing any check fails the step. It never writes a partial or corrected prediction.

## Anchoring control

Handing the model a baseline invites it to echo the baseline — producing apparent competence that is pure climatology with a reasoning trace attached.

**Baseline-blind control runs** (ADR-0029) quantify this. On a sampled fraction of days, each instrument is predicted twice: once with block 3 present, once with it removed. Both are recorded, distinguished by the `baseline_shown` flag.

Two metrics follow:

- **Anchoring index** — how much closer the baseline-shown prediction sits to the baseline than the blind prediction does. A high value means the model is largely restating what it was handed.
- **Blind skill** — Ranked Probability Score of the blind predictions. If blind predictions score comparably, the baseline is contributing little; if they collapse, the baseline is carrying the result.

Cost is a second call on sampled days only.

## Self-history

The predictor sees **outcomes, never its own prior reasoning** (ADR-0029). Correlation pages carry hit rates and disconfirming evidence, all grounded in what actually happened. The model's past arguments are not fed back.

This keeps the feedback loop anchored to reality rather than to the model's own prior rhetoric, and avoids the failure where a model rationalises consistency with itself instead of reassessing from evidence.

**A known residual:** hit rates are grounded in outcomes, but the *hypothesis space* is model-generated — evidence only ever accumulates on pairings the model thought to propose. Nothing in the current design surfaces a correlation the model never hypothesised. This is unaddressed and worth revisiting once the loop is running.

## Open items

- Sampling rate for baseline-blind control runs.
- Threshold at which the coherence-violation metric triggers review.
- Whether `reasoning` text is stored in full (audit value) or truncated (storage cost) — currently assumed full, since it is small relative to everything else.
