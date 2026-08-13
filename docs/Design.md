# FinEvents — Design

**Status:** Baseline v1
**Date:** 2026-08-09
**Sits between:** [Requirement.md](Requirement.md) and [Tasks.md](Tasks.md)
**Architecture:** [SystemDesign.md](SystemDesign.md) — read that first; this document is the component level

Where SystemDesign describes *what the machine does*, this describes *how it is built*: module boundaries, interfaces, schemas, and the algorithms specified precisely enough to implement without further decisions.

---

## 1. Module layout

```
finevents/
  config/        SSM parameter resolution, environment binding
  repository/    AsOfRepository, bitemporal read/write, manifest access
  ingest/        per-source fetchers, validation, bitemporal write
  events/        pre-filter, classification client, severity overlay
  features/      sigma, buckets, climatology, covariates, surprise
  numeric/       Chronos-2 and TimesFM 2.5 wrappers
  predict/       prompt assembly, model client, output validation
  score/         maturity detection, RPS, revision handling
  wiki/          page model, manifest, seed, consolidation, statistics, sweep
  calibrate/     block 6b computation, isotonic map fit and apply
  eval/          ladder, anchoring index, coherence, controls
  steering/      four verbs, audit log
  api/           API Gateway handlers
  harness/       leakage tests, canaries, cassette record/replay
```

**Two import rules are enforced in CI, not by review** (REQ-104, REQ-1005):

- No module outside `ingest/` and `repository/` imports a storage client.
- No module outside `events/`, `predict/` and `wiki/` imports a model client. This is ADR-0004's dividing line expressed as a lint.

## 2. Core interfaces

Protocols, so cassette and test doubles substitute cleanly.

```python
class AsOfRepository(Protocol):
    """The single temporal gateway. as_of is always `now` in Lane B."""
    def prices(self, instrument: str, window: int) -> Series: ...
    def events(self, since: datetime) -> list[Event]: ...
    def covariates(self, names: list[str], window: int) -> dict[str, Series]: ...
    def page(self, path: str) -> Page | None: ...
    def manifest(self, run_id: str | None = None) -> Manifest: ...

class Forecaster(Protocol):
    """Chronos-2 and TimesFM 2.5 both implement this."""
    name: str
    def forecast(self, context: Series, covariates: dict[str, Series] | None,
                 horizons: list[int]) -> QuantileForecast: ...

class ModelClient(Protocol):
    """Bedrock in production, cassette replay in tests."""
    def invoke(self, role: Role, prompt: Prompt) -> ModelResponse: ...
```

`Role` is an enum of `CLASSIFY | PREDICT | CURATE`, resolved to a model ID through `config/` (REQ-1007). **No call site names a model.**

### 2.1 What `Forecaster` normalises, and the one thing it cannot

*Added 2026-08-13, from building `numeric/` against both libraries. Measured, not assumed.*

Both wrappers emit the same nine deciles (0.1 … 0.9) so that the Design §4.13 bucket conversion is identical for every track. Two library conventions are absorbed at this boundary:

| Library | Convention | Why it matters |
|---|---|---|
| TimesFM 2.5 | Quantile array is `[n, horizon, 10]` with **index 0 the mean**, deciles at 1–9 | Read index 0 as a quantile and the row is non-monotone, so §4.13 yields a **negative probability** for the lowest bucket |
| Chronos-2 | Covariate slot is `past_covariates`; returns exactly the levels requested, in order | — |

**The asymmetry that cannot be absorbed.** Chronos-2 accepts *past-only* covariates. TimesFM's XReg requires covariate values spanning **context and horizon** and raises `math domain error` on a context-length array. Future covariate values do not exist at the cut-off, so `timesfm_cov` holds them at the last observed value.

That uses only information available at the cut-off, so it is **not leakage** — but it is an assumption `chronos_cov` is not making, and the two covariate tracks therefore did not receive the same input. `QuantileForecast` carries `future_covariate_policy ∈ {none, persistence}` and it is stored with the forecast, so no consumer can compare the two tracks as though they had. See [ADR-0055](adr/0055-timesfm-covariate-persistence.md).

**Context length is fixed, not "as much as the model allows."** REQ-502 says sized to the model's maximum; taken literally with a growing archive, a later cut-off would silently receive a longer window and the rolling comparison would measure context length rather than model quality. The POC fixes 512 sessions for both models. That value is a POC choice, not a specified one.

## 3. Data schemas

### DynamoDB

| Table | PK | SK | Notes |
|---|---|---|---|
| `predictions` | `{env}#{instrument}` | `{as_of}#{track}#{horizon}` | `track` ∈ climatology, cond_climatology, chronos_uni, chronos_cov, timesfm_uni, timesfm_cov, agent_raw, agent_cal, agent_blind, shadow |
| `scores` | `{env}#{instrument}` | `{matured_on}#{track}#{horizon}#{revision}` | `revision` = 0 for the original; ≥1 for revised-close records (REQ-804) |
| `runs` | `{env}` | `{run_id}` | cut-off, step timings, token usage, manifest pointer, config version, `period_id`, **consolidation watermark** (last step folded in, for crash recovery — Design §7) |
| `steering` | `{env}` | `{ts}#{actor}#{verb}` | target, before, after, applied-in run (REQ-916) |
| `events` | `{env}#{event_date}` | `{event_id}#{overlay_version}` | Classified events with category, severity, actors, geography. **Overlay version in the sort key** so a rescore appends rather than overwrites (REQ-305, REQ-306); `corrected_by` set by steering (REQ-913) |
| `candidate_events` | `{env}#{run_id}` | `{event_id}` | Post-pre-filter, pre-classification (REQ-301). Kept because the recall floor (REQ-302) is calibrated against what the filter discarded |
| `features` | `{env}#{instrument}` | `{as_of}` | σ_h, bucket boundaries, climatology and conditional climatology, standardised surprise, regime block. Duplicated inline on each prediction per REQ-402 — this table is the audit copy, not the scoring source |

> **These four were absent from the original §3** while SystemDesign steps 7, 8 and 9 wrote to them, so T1.6 ("tables and prefixes per Design §3") would have created neither, and REQ-101's CI assertion — `event_time` and `knowledge_time` on every record in **every store** — had no store to assert against. Keys drafted here for review; `knowledge_time` is non-retrofittable (T1.1), so settle them before the first write, not after.

Every prediction item stores its **bucket boundaries** inline (REQ-402). Scoring never recomputes them, so a later change to the σ window cannot retroactively alter a past score.

**`run_id` is `{YYYY-MM-DD}T{HHMMSS}Z` — lexicographically sortable, chronologically ordered.** Both `AsOfRepository.manifest(run_id=None)` ("the latest") and "the next run resumes from the last manifest" (§7) depend on that ordering; a UUID breaks both silently.

**`measurement/period_id` is stored on every `predictions`, `scores` and `runs` item.** REQ-819 makes the skill record partitioned by it and Design §6 states a changed system cannot silently continue an old series — neither is achievable if no item carries the key. Reporting queries filter on it, so it also needs a GSI (`{env}#{period_id}` → `{matured_on}`) before the first dashboard query, though GSIs are additive to a live table and need not exist on day 1.

### S3

```
raw/{source}/{date}/{fetch_ts}.json        never published (REQ-1107)
wiki/pages/{type}/{key}.md                 versioning on
wiki/_runs/{run_id}.json                   the run manifest, written last (REQ-714)
snapshots/{run_id}/{role}/{instrument}.json   the assembled prompt, byte-exact (REQ-1202)
parquet/prices/{instrument}/{year}.parquet
parquet/covariates/{name}/{year}.parquet
cassettes/{model_id}/{prompt_hash}.json
calibration/{run_id}/map.json
published/{date}/…                          the derived-data mirror (REQ-1106)
```

**`snapshots/` was missing** while `assemble()` below calls `snapshot.persist()` with no target. It is load-bearing twice over: REQ-1202 (the prompt rebuilds byte-identically) is a merge gate, and REQ-905 (per-prediction audit) is the dashboard's central view. It is **never published** — a predictor snapshot contains block 5 event detail and a curator snapshot contains source material, both inside REQ-1107's boundary.

**`wiki/_runs/` rather than `wiki/manifests/`** to match ADR-0026. The underscore also keeps manifests out of any `wiki/pages/` prefix scan.

### Page format

Markdown with a YAML front-matter block for machine-read fields, body for human-read content. Statistics live in front matter because they are computed (REQ-705) and must never be hand-edited into prose.

```yaml
---
key: central-bank-surprise__gold-spot-usd
type: correlation
author: agent            # agent | human | mixed   (REQ-912)
overlay_version: 1
stats:
  t+1:
    seeded:   {n: 31, hits: 19, mean: 0.613, ci90: [0.44, 0.76]}
    observed: {n: 4,  hits: 3,  mean: 0.750, ci90: [0.36, 0.96]}
    combined: {n: 35, hits: 22, mean: 0.629, ci90: [0.47, 0.76]}
  t+5: {…}
links: [central-bank-surprise__nifty-50, regimes/real-yields-rising]
---
```

Evidence rows are a Markdown table in the body, each carrying `source: seeded|observed` and an optional `corrected_by` (REQ-708, REQ-913).

## 4. Algorithms

Specified to remove implementation ambiguity. Each is pure, deterministic, and unit-testable.

### 4.1 Volatility and buckets (REQ-401)

σ_h is the standard deviation of **overlapping h-day log returns** over the trailing 60 sessions.

Specified to remove implementation drift — two conforming-looking implementations differ by ~1% on n≈56 observations, which flips borderline bucket assignments, and the Lane A calibration path and the live path are separate code that can diverge silently:

| Choice | Value |
|---|---|
| Returns | `log(close[t] / close[t−h])`, computed on the **adjusted** series (REQ-213) |
| Sample | The 60 most recent sessions **on that instrument's own market calendar**, ending at the run cut-off. Gold spot USD and MCX gold INR therefore use different session sets |
| Demeaning | Yes — sample mean subtracted |
| `ddof` | 1 (sample standard deviation) |
| Minimum history | 40 sessions. Below that the instrument is **abstained by construction**, not defaulted — no substituted σ (REQ-209's principle) |
| Missing sessions | A gap in the calendar is not a gap in the series; the window counts sessions present, never calendar days |

> *Overlapping windows make the estimator autocorrelated, which understates its own standard error. That affects the precision of the σ estimate, not the bucket definition — and 60 sessions yields only 12 non-overlapping 5-day returns, which is too thin to use instead. The choice is documented rather than hidden.*

Boundaries, with `r` the realised log return over the horizon:

| Bucket | Condition |
|---|---|
| large down | `r < −1.5 σ_h` |
| small down | `−1.5 σ_h ≤ r < −0.5 σ_h` |
| flat | `−0.5 σ_h ≤ r < 0.5 σ_h` |
| small up | `0.5 σ_h ≤ r < 1.5 σ_h` |
| large up | `r ≥ 1.5 σ_h` |

### 4.2 Ranked Probability Score (REQ-803)

With K = 5 buckets, `F_k` the cumulative predicted probability through bucket k, and `O_k` the cumulative observed indicator:

```
RPS = (1 / (K − 1)) · Σ_{k=1}^{K−1} (F_k − O_k)²
```

Lower is better. Being wrong by one bucket costs less than being wrong by four — which is the entire reason RPS is used rather than log loss or accuracy.

### 4.3 Beta-Binomial confidence (REQ-706)

Jeffreys prior `Beta(0.5, 0.5)`; with `h` hits and `m` misses the posterior is `Beta(0.5 + h, 0.5 + m)`. Reported confidence is the equal-tailed 90% credible interval from the Beta quantile function.

**Jeffreys rather than uniform** because it is the reference prior for a binomial proportion and stays well-behaved at the extremes — a page with 4 hits and 0 misses gets an honest interval rather than a point estimate of 1.0.

This is also what bounds recency swing mathematically: a single new observation moves a 35-observation posterior very little, with no clamp parameter to tune.

### 4.4 Standardised surprise (REQ-308)

```
surprise = (actual − consensus) / σ_surprise
```

where `σ_surprise` is the standard deviation of `(actual − consensus)` over that release series' available history. Consensus is the value snapshotted before the release (REQ-309), never a later revision.

### 4.5 Isotonic calibration (REQ-812)

Each `(prediction, bucket)` pair is one binary observation: predicted probability `p`, outcome indicator `y`. Isotonic regression is fitted on all such pairs, **pooled across instruments, split by horizon**, cross-validated.

**Scope of the fit.** Restricted to the current `measurement/period_id` and the current predictor model. A map fitted across a predictor switch — which ADR-0039's shadow A/B may cause at ~month 3 — pools two different models' probability distributions; a map fitted across the tuning window pools a system being changed daily with one that is frozen. REQ-819 partitions the skill record for exactly this reason, and rung 6 must be partitioned the same way or the REQ-809 headline gap measures the seam. The version stamped per REQ-814 records both scopes.

**Fold construction.** The pairs are *not* independent, and random folds make cross-validated error optimistic — which matters because REQ-813's sample gate is set from that quantity, so a naive fit opens the gate early on a map fitted to noise:

- Five buckets from one prediction are mutually determined (REQ-605) — **fold on the prediction, never the pair**.
- Same-day predictions across 11 instruments are correlated through the byte-identical regime block (REQ-406) — **fold on contiguous date blocks**, so a whole day lands on one side.
- Folds: 5, date-blocked, deterministic seed recorded with the map so the *fit* is reproducible and not merely its application.

Applying the map to a distribution breaks its normalisation, so:

```
p'_k = map(p_k)                    for each bucket k
p''_k = p'_k / Σ_j p'_j            renormalise
```

Below the REQ-813 sample gate the map is the identity and rung 6 equals rung 5.

### 4.6 Anchoring index (REQ-611)

With `d` the total variation distance, `B` the shown baseline, `P_shown` the prediction with baselines visible and `P_blind` without:

```
A = clip( 1 − d(P_shown, B) / d(P_blind, B) , 0, 1 )
```

`A = 1` means the prediction reproduced the baseline exactly — full anchoring. `A = 0` means showing the baseline changed nothing. Undefined when `d(P_blind, B) = 0`; those cases are excluded and counted.

### 4.7 Cross-market ordering (REQ-1203)

For a close from market `S` used as input to a prediction for market `T` targeting session `s_T`:

```
assert close_utc(S, last_session_at_or_before(cutoff)) < open_utc(T, s_T)
```

**Compared as UTC instants, never as calendar dates.** A date comparison passes the common case and fails every asymmetric-holiday and DST case, which is precisely why L9 is the top remaining leakage risk.

### 4.8 Sweep ranking (REQ-718, REQ-719)

For each grid cell with 90% credible interval `[l, u]`:

```
notability = max(l − 0.5, 0.5 − u, 0)
```

Cells whose entire interval sits away from 0.5 rank highest; cells straddling 0.5 score zero and are never surfaced. Ranked descending, filtered to cells with no page or whose page's stated direction contradicts the interval, then cut at the REQ-719 candidate volume.

**Multiplicity.** The grid is several hundred cells swept nightly at a 90% interval, so under a true null roughly 10% of cells exclude 0.5 by chance. Two things bound this — the Jeffreys posterior (§4.3) keeps thin cells honest by widening their intervals, and the curator judges each candidate rather than accepting it — but neither is an error rate. **The sweep therefore reports, alongside every candidate list: cells tested, cells surfaced, and expected chance exclusions at the current interval width.** REQ-719 calibrates candidate *volume*; the target false-discovery rate is the quantity that volume is a proxy for, and it should be recorded as such.

### 4.9 Seeded/observed divergence (REQ-721)

Flagged when the seeded and observed 90% credible intervals for the same cell **do not overlap**. Non-overlap means the agent's own record disagrees with the historical statistics — which is either genuine regime change or a defect, and either way is the thing to look at.

### 4.10 Conditional climatology (REQ-405)

Rung 2 of the ladder, and the rung SystemDesign calls the one that matters most for honesty — if Diwali and a rate-hike regime explain the movement, the event narrative is decoration. It was previously specified only as "conditions on calendar factors and regime state", with granularity deferred by ADR-0017 to *"calibrate during backtest"* — a mechanism ADR-0037 removed. This replaces that.

**Regime state** is discretised to 9 cells: the tercile of the trailing 20-session change in the **real 10Y yield** (`DFII10` — ADR-0017 calls it arguably *the* dominant gold driver) crossed with the tercile of **VIX** level. Terciles are cut on the trailing 250 sessions, at the run cut-off, from data with `knowledge_time ≤ cutoff` (REQ-407).

**Calendar factors** are `is_festival_window` (within ±2 sessions of a table entry), `is_expiry_week`, `month`, `weekday`.

The full cross-product is mostly empty, so conditioning uses a **backoff ladder** — the most specific level with at least `N_min` observations wins:

| Level | Conditioning |
|---|---|
| 4 | regime cell × festival-window × expiry-week |
| 3 | regime cell × festival-window |
| 2 | regime cell |
| 1 | month × weekday |
| 0 | unconditional (= rung 1, climatology) |

**The level used is stored with the prediction**, like the bucket boundaries (REQ-402). Without it a backoff to level 0 is invisible, and rung 2 silently becomes rung 1 — which would make the confounding check pass by not running.

`N_min` is the one free parameter and it is **not invented here**: too low and rung 2 fits noise and beats the agent for the wrong reason; too high and it collapses to level 0. It calibrates free against the seed join, alongside the other thresholds — see REQ-408.

### 4.11 Block 6b — the predictor's own track record (REQ-810)

All arithmetic over the scored record. **Scoped to the current `measurement/period_id` and the current predictor model**, for the same reason §4.5's map is: pooling across a configuration change or a model switch describes a system that no longer exists.

| Line | Computation |
|---|---|
| Reliability by confidence band | Predicted bucket probabilities binned into ten fixed bands `[0,0.1) … [0.9,1.0]`. Per band: mean predicted probability, observed frequency, n |
| Directional balance | Share of predictions whose expected move (§4.12) sat above the shown baseline's, against the realised share of up-moves |
| Departure discipline | Mean total-variation distance from the shown baseline, split by whether the departure was toward the realised outcome; plus the RPS of departing predictions against the baseline's RPS **on those same days** |
| RPS by severity | Mean RPS grouped by the event-severity bands of REQ-310 |

**A line with fewer than 20 observations is omitted, not shown with a caveat.** A thin reliability band is worse than no line — it invites the model to correct toward noise, which is the ADR-0042 over-correction risk (excessive abstention) arriving through the prompt rather than through the map.

### 4.12 Expected move, and the coherence predicate (REQ-613)

Every five-bucket distribution reduces to a signed scalar in bucket units:

```
E(p) = Σ_k p_k · c_k        c = (−2, −1, 0, +1, +2)
```

Coherence is then checkable between **pairs of predicted instruments** — and only those:

| Pair | Violation when |
|---|---|
| NIFTY 50 ↔ SENSEX | `sign(E) ` differs and `min(|E₁|,|E₂|) > τ_floor` — the sharpest tripwire |
| S&P 500 ↔ Nasdaq ↔ Dow | Any pair as above, at a wider `τ_floor` |
| Gold spot USD ↔ MCX gold INR | As above; likewise silver |
| Gold ↔ equity indices | Same-sign strong moves in a risk-off regime cell (§4.10), counted rather than flagged |

Computed identically for Chronos, as ADR-0029's control — if Chronos violates at a similar rate, incoherence is a property of per-instrument forecasting rather than a defect in the agent.

> **Two rows of `prediction-contract.md`'s relationship table are not computable as coherence checks and must not be implemented as such.** *Gold ↔ dollar index* pairs a prediction with a covariate — DXY is never predicted, so there is no second distribution. And *gold spot USD ↔ MCX gold INR divergence must be explicable by the currency leg* requires **USD/INR, which is in neither the instrument set (REQ-201) nor the covariate set (REQ-205)**. Either add it as a sixth covariate — which changes the byte-identical regime block's wire shape (REQ-406) and is therefore a decision, not an edit — or restate the relationship without the currency leg. Left as-is it is an assertion no code can evaluate.

`τ_floor` is calibrated with `N_min` (REQ-408). Violations are **flagged as a metric, never blocked** — a genuine decoupling is a real market event.

### 4.13 Quantile → bucket conversion (REQ-508)

Chronos-2 and TimesFM 2.5 emit quantiles; the ladder needs bucket probabilities against the **same boundaries the agent receives**. This conversion sets rungs 3 and 4 — the bar the whole project is measured against — so its tail rule is load-bearing rather than incidental.

1. Take the model's quantile levels and values as points on the CDF of the horizon return.
2. **Interior** — evaluate the CDF at each of the four bucket boundaries by monotone (PCHIP) interpolation in value-space, which cannot produce a non-monotone CDF the way a cubic spline can.
3. **Tails** — beyond the outermost quantiles, fit an exponential tail matched to the slope between the two outermost quantile pairs.
4. Difference the four CDF values into five bucket probabilities; floor each at `1e-6` and renormalise.

**Why the tail rule is not a detail.** The outer buckets — large up, large down — lie entirely in the tails. Clamping at the extreme quantile level would cap each tail at that level's mass, systematically understating large moves in rungs 3 and 4. Large moves on event days are exactly what the agent's thesis predicts, so an understated baseline tail would **flatter the agent** in the one comparison the project exists to make. Whatever rule is used, it must be applied identically to both numeric tracks and recorded with the forecast.

## 5. Prompt assembly

One assembler builds all three prompt types. It is the **only** place a prompt is constructed (REQ-1202).

```python
def assemble(role: Role, ctx: RunContext) -> Prompt:
    blocks = [...]
    snapshot = Snapshot(blocks, cutoff=ctx.cutoff)
    snapshot.assert_no_record_after_cutoff()   # REQ-1201, no exceptions list
    snapshot.persist()                          # REQ-1202
    return snapshot.to_prompt()
```

`assert_no_record_after_cutoff` walks every record that contributed to any block and checks `knowledge_time ≤ cutoff`. **It takes no allowlist parameter** — an exceptions mechanism is exactly how this check erodes.

**Cache breakpoint after block 1, not block 2.** Block 2 is the *instrument page* — different on each of the eleven calls — so a breakpoint after it makes the cached prefix unique per call: eleven writes at 1.25× input and zero reads. Block 1 (task frame, bucket definitions, output schema, abstention rules) is the only prefix genuinely shared across the eleven, giving one write and ten reads at 0.1×. Nova caps cached content near 20k tokens, so only part of the prefix caches, and the TTL is ~5 minutes — caching pays *within* a run, never across days. The economics are re-derived per model (REQ-1014); if block 1 alone is too small to clear the model's minimum cacheable prefix, caching contributes nothing and the credit in the cost model must be removed rather than assumed.

## 6. Configuration

All configuration is SSM Parameter Store, per environment.

| Parameter | Purpose |
|---|---|
| `model/classify` | `amazon.nova-lite-v1` |
| `model/reason/predict` | `amazon.nova-pro-v1` |
| `model/reason/curate` | `amazon.nova-premier-v1` |
| `wiki/seed_enabled` | seed vs empty arm (REQ-712) |
| `thresholds/*` | the seven calibrated values (REQ-302, 307, 310, 311, 612, 719, 813) |
| `shadow/enabled`, `shadow/instruments` | ADR-0039 window |
| `measurement/period_id` | increments on any config change (REQ-819) |

Deploy asserts every parameter resolves, that all three models are available with access granted (REQ-1008), and that `model/reason/predict` equals the model used for the baseline-blind control (REQ-1009).

**A configuration change bumps `measurement/period_id`.** That is the mechanism behind REQ-819 — the skill record is partitioned by it, so a changed system cannot silently continue an old series.

## 7. Error handling

| Failure | Behaviour |
|---|---|
| Source fetch fails | Retry with exponential backoff, 3 attempts. A **price or calendar** source failing halts the run. A **news or supplementary** source failing degrades gracefully, is recorded on the run, and the day proceeds (ADR-0010). No partial write either way. |
| Ingest validation fails | Hard halt (REQ-209). Never substitute or interpolate. |
| A single prediction call fails | Retry 3 times with backoff, then **record that instrument as a missed day and continue the other ten** (ADR-0029: "a malformed response costs one instrument, not the day" — this is the reason the per-instrument split was chosen). The instrument's absence is recorded, never imputed. |
| The classify or curate call fails | Retry 3 times, then halt — both are single points with no per-instrument fallback, and the curator's output is what compounds. |
| Cassette miss in replay mode | Hard failure, never a live call (REQ-1210) |
| Crash mid-consolidation | Manifest unwritten, so the previous wiki state stands (REQ-714). The next run resumes from the last **consolidation watermark** on the `runs` record — steps 10–12 commit scores and page versions before step 16 predicts, so without a watermark a mid-run halt orphans the day's evidence rows with no pointer to what was already folded in. |
| Run crosses an instrument's next market open | **Halt that instrument's prediction and record a missed day** — never publish it late (REQ-614). A post-open prediction is not a degraded observation, it is an invalid one entering a record that under forward-only cannot be re-run. |
| Run exceeds the 60-minute budget without crossing an open | Alert; the run continues. A slow run is not a wrong run. |

**Halting is preferred to degrading wherever the alternative is a substituted value.** Under forward-only a missing day is a gap in the record — recoverable and visible. A day built on substituted data is a silent corruption of the only evidence the project will ever have.

**But halting is not preferred over partial completion where the parts are independent.** Eleven separate prediction calls exist precisely so that one failure costs one instrument. Discarding ten good predictions to punish one bad one throws away evidence that forward-only cannot regenerate. The distinction is: *never invent a value; always keep a value that was honestly produced.*

## 8. Local development

Docker Compose provides DynamoDB Local, MinIO for S3, and a cassette-backed `ModelClient`. The pipeline runs end to end with no AWS account and no model spend, which is what makes the harness runnable in CI.

Numeric model weights are baked into the container image (~1.3GB) rather than downloaded at start, so local runs and AgentCore runs execute identical code paths.

## 9. The scraped-payload signature (REQ-1102)

The pre-commit hook (T0.5) blocks raw acquired content from entering a repository that ADR-0044 intends to be public. `.gitignore` is the first line of defence; this hook is the enforced one, and it needs a definition rather than an intention. A commit is **blocked** when any staged file matches:

| Rule | Matches |
|---|---|
| Path | Any `raw/` path segment, any `cassettes/` segment, `*.parquet` |
| Firecrawl envelope | JSON/JSONL containing `sourceURL`, `rawHtml`, `screenshot`, or `markdown` alongside a `metadata` object |
| Article shape | Any file with an `article_text`, `body_html`, `content_html` or `full_text` key |
| Provenance keys | `scrape_id`, `firecrawl_`-prefixed keys |
| Bulk HTML | A staged file over 50 KB whose content is >30% HTML tags |

**Two carve-outs, both narrow.** Test fixtures under `harness/fixtures/` are permitted only if synthetic — asserted by a `# synthetic: <reason>` header the hook requires. Published derived artefacts under `published/` are permitted, since REQ-1106 requires them; they carry source URLs and fetch timestamps (REQ-1108) but never source text.

**The hook is bypassable by design** (`--no-verify`), so CI re-runs the identical scan on the pull request (REQ-1104). For a public repo, assume any pushed content is permanently public regardless of later removal.

> **Cassettes are the non-obvious exposure.** A recorded model response is keyed by prompt hash, and the curator's prompt contains source material. Committing cassettes would put scraped text into the repo through the back door — which is why they are blocked by path here, and why T2.3 must settle where CI gets them from instead.

## 10. Open at the design level

| Item | Resolved by |
|---|---|
| N for 1-hop link-neighbour cap (REQ-717) | Prompt-size budget against the 20k cache ceiling |
| N for the bulk-correction refusal limit (REQ-915) | Operational judgement during steering build |
| Chronos-2 maximum context length | Pre-build verification (`aws-architecture.md`) |
| Whether Chronos/TimesFM accept known-future covariates | Pre-build verification — if so, calendar factors fit that slot naturally |
