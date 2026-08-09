# ADR-0031: TimesFM 2.5 as a third track; ensemble the baselines, never the agent

- **Status:** Accepted in part — **ensemble decision superseded by [ADR-0032](0032-no-ensembling-three-independent-tracks.md)**
- **Date:** 2026-08-09
- **Amends:** [ADR-0030](0030-chronos-as-baseline-and-shown-forecast.md) (block 3 content, baseline ladder), [ADR-0020](0020-static-spa-frontend.md) (dashboard views)

> **Correction note (2026-08-09):** this ADR was recorded before its ensemble proposal was confirmed, and the proposal was subsequently rejected. **ADR-0032 supersedes everything below concerning ensembling and the ensemble rungs of the baseline ladder** — the three tracks run and are scored fully independently, and the bar is beating the *best* baseline rather than an average of them. What stands unchanged: the adoption of TimesFM 2.5 as a third track, its specifications and complementarity with Chronos, the same-window rule, and **L11 (pre-training contamination)**, which is unaffected by how tracks are combined. Original text preserved unedited.
- **Detail:** [Prediction Contract](../design/prediction-contract.md)

## Context

Chronos-2 alone is a single point of view. **TimesFM 2.5** is a genuinely different one, not a redundant one:

| | Chronos-2 | TimesFM 2.5 |
|---|---|---|
| Vendor | Amazon | Google |
| Parameters | 120M | 200M |
| Architecture | Encoder-only, discrete tokenisation | Decoder-only, continuous patched representations |
| Context | Bounded (verify exact) | **16K** (up from 2,048 in v2.0) |
| Covariates | Native | Via XReg |
| Weights | Hugging Face | Hugging Face |

Benchmarks place Chronos-2, TimesFM-2.5 and TiRex as the top three, with a specific and useful split: **Chronos-2 dominates stationary sequences; TimesFM-2.5 surpasses it on non-stationary data.** Financial series are characteristically non-stationary, so TimesFM may be the better fit for ours — and running both covers both regimes.

That architectural diversity is precisely the condition under which forecast combination works. Combining diverse forecasters is among the most robust findings in the forecasting literature, and simple averaging routinely beats trying to pick the best one, because it reduces variance rather than chasing it.

**TimesFM's 16K context also revises an earlier constraint.** ADR-0030 assumed the full eleven-year history could not fit in context. That was true of Chronos; at 16K, TimesFM could hold roughly 2,750 daily points comfortably. Window length becomes a design choice rather than a hard limit.

## Decision

### Three tracks

1. **Chronos-2** — numeric, encoder architecture
2. **TimesFM 2.5** — numeric, decoder architecture
3. **The agent** — Nova Premier reading the wiki

Both numeric models run in-process from Hugging Face weights, exactly as ADR-0030 established for Chronos. TimesFM being a Google model introduces **no GCP dependency** — the weights are local and inference is local.

### Ensemble the baselines; never the agent

**Chronos and TimesFM univariate forecasts combine into an ensemble, and that ensemble fills prompt block 3** — replacing Chronos alone. The agent departs from a stronger, more robust starting point.

**The agent is never ensembled into that.** This is the same reasoning ADR-0030 used to reject blending agent and Chronos: the moment the agent's output is mixed into the baseline, its contribution stops being measurable and the project's central claim stops being testable. Combining the two *numeric* models has no such cost, because neither of them is the thing under test.

Both models also run covariate-informed, as separate scoring rivals.

### Baseline ladder

| Rung | Baseline |
|---|---|
| 1–3 | Always-flat, persistence, conditional climatology |
| 4 | Chronos-2 univariate |
| 5 | TimesFM 2.5 univariate |
| 6 | **Ensemble univariate** — shown to the agent as block 3 |
| 7 | Chronos-2 covariate-informed |
| 8 | TimesFM 2.5 covariate-informed |
| 9 | **Ensemble covariate-informed** — the hardest bar |
| — | Agent |

**Rung 9 is now the sharpest test in the project.** Two architecturally distinct foundation models, both handed the same event severity as a numeric covariate, combined. If the agent cannot beat that, the wiki apparatus adds nothing beyond a scalar that statistical models use just as well.

### Window: same as Chronos by default

Both numeric models use the **same rolling window**, for like-for-like comparability. TimesFM's longer-context capability is tested as a **variant**, not adopted by default — otherwise a difference in results would be ambiguous between architecture and context length.

### The ship decision is deferred by design

Whether the product eventually ships the agent's prediction, the ensemble, or some combination is **not decided now, and does not need to be.** The three-track design generates the evidence to decide it. The project must be genuinely willing to conclude that a numeric ensemble beats the agent — otherwise the evaluation is theatre.

## New leakage vector: L11 — pre-training contamination

**This is the most serious consequence of adopting foundation-model baselines, and it was not previously catalogued.**

Research on time-series foundation models has found that evaluations inadvertently include test data overlapping with pre-training data, **inflating reported accuracy by 47–184%**.

Our instruments are among the most public series in existence — gold, silver, S&P 500, NIFTY 50. It is entirely plausible that both Chronos and TimesFM were pre-trained on data covering our backtest window.

If so, a backtest over that period is contaminated in a direction that matters: **the baselines may have effectively memorised the answers**, making them look stronger than they are, and making the agent look weaker than it is. A conclusion of "events don't help" could be an artefact of baseline contamination rather than a finding.

**Required mitigations:**

- Establish the pre-training data cutoff for both models, and record it alongside every backtest result.
- **Report backtest performance split by pre-cutoff and post-cutoff periods.** A large baseline advantage inside the pre-training window and not outside it is direct evidence of contamination.
- Weight conclusions toward the post-cutoff period, and treat pre-cutoff comparisons as indicative only.
- Note that the agent's own reasoning model has a training cutoff too, and the same question applies — though the wiki, not the model, is meant to carry the domain knowledge.

This vector goes into the leakage threat model alongside L1–L10.

## Alternatives considered

- **Chronos only** (ADR-0030 as written). Rejected: one architecture is one set of failure modes, and TimesFM's non-stationary advantage matters for financial series specifically.
- **Ensemble all three, including the agent.** Likely the best raw forecast. Rejected: destroys attribution, which is the whole point of the evaluation.
- **Pick the better numeric model and drop the other.** Rejected: their strengths are complementary and regime-dependent, so picking one throws away the regime the other covers — and the pick would have to be made before there is evidence.
- **Adopt TimesFM's 16K context immediately.** Rejected as a default: confounds architecture with context length. Retained as a tested variant.

## Consequences

- The hardest baseline in the project is now genuinely hard, which makes a positive result meaningful and a negative result honest.
- **Continuous evaluation becomes a three-way daily comparison.** Every day yesterday's predictions are scored against the close, so the tracks are compared live rather than only in backtest.
- **The agent's edge over the ensemble, plotted over time, is the visualisation of the learning thesis.** If the wiki compounds, that edge should grow as evidence accumulates; if it is flat, the wiki is not contributing. This is the single most important chart in the product.
- Dashboard scope grows (amends ADR-0020): three-track running comparison, the edge-over-time trend, per-instrument breakdown, a **disagreement view** surfacing days where tracks diverge most, and drill-down comparing the agent's reasoning and cited pages against what the numeric models said.
- Backtest compute roughly doubles for the numeric tracks — still under a few dollars and a couple of hours.
- Two more model versions to stamp on every prediction, and two more sets of weights in the container image (~700MB combined).
- **TimesFM's licence needs verifying** before it goes into a public repo's build.
- L11 must be resolved before any backtest conclusion is drawn, not after.

## Revisit trigger

The two numeric tracks prove statistically indistinguishable across regimes over a full backtest — at which point one can be dropped for simplicity — **or** contamination analysis shows the backtest window is unusable, forcing evaluation onto post-cutoff data only.
