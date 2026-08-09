# ADR-0037: Forward-only agent learning; no historical replay

- **Status:** Accepted
- **Date:** 2026-08-09
- **Supersedes:** [ADR-0036](0036-event-stratified-replay-scope.md) — event-stratified replay is withdrawn in full
- **Amends:** [ADR-0035](0035-backfill-execution-model.md) (Phase 2 removed), [ADR-0007](0007-bootstrap-with-historical-backfill.md) (backfill redefined), [ADR-0033](0033-evaluation-harness-as-first-class-deliverable.md) (ladder runs live)
- **Serves:** ADR-0016 (point-in-time correctness), the cost constraint

## Context

Every replay design considered — full eleven-year replay (~$1,584), post-cutoff window only (~$173), event-stratified sampling (~$24) — shares two defects that no amount of engineering removes. They differ only in how much they cost to be wrong.

**1. Contamination is bounded, never eliminated.** Vector L11 in the [threat model](../design/point-in-time-test-harness.md): Chronos-2 and TimesFM 2.5 were pre-trained on public price series, so any backtest date inside their training window inflates baseline accuracy — 47–184% in published replications. The system's central question is *"does the agent beat the numeric baselines?"*, and an inflated baseline biases that toward a **false negative**. The best available answer was "report two numbers, pre- and post-cutoff, and weight the post-cutoff one." That is mitigation, not a fix.

**2. Reconstruction is where leakage lives.** Seven of the eleven catalogued vectors exist *only* because the pipeline is asked to answer "what was known on date D" for a D in the past. They are failures of reconstruction, not of logic. A pipeline that only ever runs against today never attempts the reconstruction and so cannot fail it.

Running the agent forward only removes both classes by construction. It also removes the single largest line item in the project.

## Decision

**The agent never runs against a historical date.** It runs once per day, against that day, from go-live onward. There is no Phase 2 sequential replay, at any scope.

### Two lanes with different historical treatment

The confusion to avoid is treating "no backtest" as a property of the whole system. It is a property of the *agent lane* only.

| Lane | Component | Historical treatment | Model cost | Why |
|---|---|---|---|---|
| **A — numeric** | Climatology | Fit over full 11 years | $0 | Arithmetic. No pre-training, so no contamination. |
| | Conditional climatology (ADR-0017) | Fit over full 11 years | $0 | Same. |
| | Chronos-2 | Backtested over 11 years, **for calibration only** | ~$0.50 compute | Free to run; establishes the rung's shape and sanity. Contaminated, and labelled as such. |
| | TimesFM 2.5 | Same | included above | Same. |
| **B — agent** | Prediction, consolidation, wiki | **Forward only. Never replayed.** | **$0** | Contamination-free by construction; also the only expensive lane. |

**Lane A's historical numbers are calibration, not evidence.** They exist to confirm the baselines behave sanely and to set bucket boundaries — not to claim skill, and never to be compared against the agent. Any dashboard surface showing them must carry that label.

### The head-to-head happens live, on identical days

All five rungs of ADR-0033's ladder run every day against the same unseen future:

```
climatology → conditional climatology → Chronos-2 → TimesFM 2.5 → agent
```

This is a **stronger** comparison than any backtest would have produced, not a weaker one. Every track faces the same genuinely unknown target on the same day, under the same information cut-off. There is no sample-selection argument available to any of them, and no rung enjoys a contamination advantage over another.

### Event-day designation, and why the bar moves

Replay could afford a top-5% severity bar (~140 days) because it bought eleven years in one purchase. Forward-only buys one day per day, and at ~1 event/month the top-5% bar would put the first interpretable aggregate result roughly three years out.

**The event-day bar is set at the top 20% of post-filter days by financial severity score** (ADR-0011), approximately 50 days per year.

| Bar | Event days / yr | Time to ~40 event days | Per-event signal |
|---|---|---|---|
| Top 5% | ~13 | ~3 years | Strong |
| **Top 20%** | **~50** | **~10 months** | **Weaker, workable** |
| Top 40% | ~100 | ~5 months | Diluted toward noise |

Weaker per-event signal in exchange for a first result inside a year. That tradeoff points the other way the moment replay is off the table, because the binding constraint changes from money to calendar time.

**This is a distinct threshold from ADR-0013's.** ADR-0013 governs *when the agent may not abstain*. This one governs *which days are labelled event days in evaluation reporting*. They are calibrated separately and must not be collapsed into one parameter.

### Volume, for comparison

| | Scored predictions |
|---|---|
| ADR-0036 replay (withdrawn) | 2,240 — one purchase, then static |
| Forward-only, year 1 | ~5,500 (11 instruments × 2 horizons × ~250 days) |
| Forward-only, year 1, event days only | ~1,100 |

Raw count is not the constraint — year 1 alone exceeds the entire withdrawn replay sample. Same-day cross-instrument correlation means effective sample size is well below the raw figure, but the direction holds.

### What the calendar actually costs

| Milestone | Expected |
|---|---|
| Numeric ladder calibrated and running | Day 1 (free, from Lane A) |
| Aggregate agent-vs-ladder skill measurable | ~month 8–10 |
| Individual correlation page reaching actionable confidence | Year 2–3 |

The second row is the product claim. The third is the bottleneck, and it is the reason [ADR-0038](0038-wiki-seeding-tagged-and-toggleable.md) exists: a specific pairing such as *central-bank surprise → MCX gold* may occur eight times a year, and a Beta posterior over eight observations (ADR-0034) is still too wide to act on.

## Alternatives considered

- **Event-stratified replay (ADR-0036, ~$24).** Rejected. Cheap, but still contaminated across its pre-cutoff majority, still requires the full as-of reconstruction machinery, and still produces a number that must be caveated in two directions.
- **Post-cutoff replay window only (~$173).** The cleanest replay available — every date interpretable. Rejected: costs seventy times the forward-only design to buy a few months of head start, and it covers only one market regime.
- **Forward-only with an empty wiki, no seed.** The purest demonstration of the knowledge-accretion claim. Not rejected — retained as a configuration flag and an ablation arm ([ADR-0038](0038-wiki-seeding-tagged-and-toggleable.md)).
- **Keep replay solely to tune thresholds before go-live.** Rejected as stated, but the underlying need is real and met more cheaply: severity-bar and abstention calibration run against the free deterministic join (ADR-0038), which needs no model calls at all.

## Consequences

### Point-in-time threat model contracts sharply

Seven of eleven vectors evaporate for the live path. Four survive, and their relative ranking changes.

| Vector | Status under forward-only |
|---|---|
| L1 wiki state | **Gone** — wiki state is current state; nothing to reconstruct |
| L2 volatility window | **Gone** — trailing-60 from today cannot reach forward |
| L3 climatology baseline | **Gone** — fit on all history up to today, which is correct by definition |
| L7 index composition | **Gone** — v1 tracks index level, not constituents (ADR-0009) |
| L10 feature normalisation | **Gone** in the live path; applies to Lane A calibration only |
| L11 pre-training contamination | **Gone for every live prediction.** The target is always tomorrow, which is in no published model's training set. Survives only in Lane A calibration, where it is labelled and never compared against the agent. |
| L8 event timestamp | **Largely gone** — a nightly fetch can only return what was already published |
| L4 severity overlay versioning | **Survives unchanged.** An overlay change still rewrites event history retroactively. Version stamping (ADR-0011) remains mandatory. |
| L5 consensus revision | **Survives, but downgraded** from reconstruction to recording: snapshot consensus at fetch time and never re-read it |
| L6 data vintage | **Survives, downgraded identically** |
| L9 cross-market timing | **Survives fully — and is now the highest-ranked leakage risk.** India closes before the US opens; using a US close to predict the same Indian session is a within-day ordering failure that has nothing to do with historical reconstruction. Forward-only does nothing for it. |

**L9 replaces L11 at the top of the risk register.** Recording forward is trivially correct; reconstructing backward is where leakage lived, and reconstruction is gone. What remains is ordering *within* a day, which the new harness centrepiece must target.

### The test harness is repurposed, not discarded

Truncated replay was the centrepiece because reconstruction was the main threat. Under forward-only it becomes trivially true for the live path (the database *is* truncated to today) and is demoted to a Lane A regression test — still worth keeping, because it catches an accidentally future-reading query.

The new centrepiece is the **daily snapshot integrity test**: everything fetched is stamped with fetch time, and nothing bearing a timestamp after the prediction cut-off may enter the prompt. Paired with an explicit **cross-market ordering test** for L9.

### Costs

| Line | Before | After |
|---|---|---|
| Backfill — event classification + severity, 11 yr, Nova Lite batch | $1.87 | $1.87 |
| Backfill — Chronos + TimesFM historical forecasts (compute) | $0.50 | $0.50 |
| Backfill — wiki seed (deterministic join) | — | $0 |
| **Phase 2 sequential replay** | **$24** | **$0** |
| Model A/B | $12 offline | ~$18 live shadow ([ADR-0039](0039-live-shadow-model-ab.md)) |
| Prompt regression set, ~20 dates | — | ~$2 |
| **One-off total** | **~$38** | **~$4.40**, +$18 when the shadow A/B runs |
| Monthly recurring | ~$12–28 | unchanged |

### What is genuinely lost

- **Prompt iteration becomes expensive in calendar time rather than money.** Every material prompt change restarts the live measurement clock. The ~20-date regression set catches contract breakage, not quality regression.
- **Early live running is partly a tuning period.** ADR-0013's abstention threshold and the coverage floor can only be calibrated against live agent behaviour. That period's results should be marked as tuning and excluded from the skill record — decided in advance, not after seeing them.
- **No pre-launch evidence of any kind about the agent.** The system ships on the strength of its design and its free numeric ladder. Nothing about the agent is known on day 1, by construction.

### What is gained beyond cost

- Every agent number the project ever publishes is genuinely out-of-sample. There is no caveat to attach, no pre/post-cutoff split to explain, and no reviewer objection about reconstruction fidelity available.
- The as-of reconstruction machinery is no longer load-bearing for the agent, which removes the project's single hardest correctness problem from the critical path.
- The dashboard's learning curve becomes literal rather than reconstructed: a calibrated numeric ladder on day 1 and an agent that starts below it, with everything after that being real elapsed evidence.

## Revisit trigger

Twelve months of live running produce no measurable separation between the agent and the numeric ladder on event days **while** [ADR-0039](0039-live-shadow-model-ab.md) indicates the reasoning model is not the limiting factor — at which point the hypothesis, not the sampling design, is what needs re-examining.
