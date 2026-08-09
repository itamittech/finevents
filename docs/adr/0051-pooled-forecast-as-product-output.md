# ADR-0051: A pooled forecast is the product output

- **Status:** Accepted
- **Date:** 2026-08-09
- **Supersedes:** the *no-combination* decision in [ADR-0032](0032-no-ensembling-three-independent-tracks.md). Its no-averaging-the-bar rule stands.
- **Serves:** REQ-806, REQ-903, REQ-922
- **Evidence:** [power analysis](../analysis/power/results.md)

## Context

[ADR-0032](0032-no-ensembling-three-independent-tracks.md) rejected ensembling because *"where the two disagree is itself signal — an ensemble would average that signal away."*

That argument is sound about **the bar for the skill claim** and was applied, without noticing, to **what the system outputs**. Those are different questions. Keeping every track reported per-rung is entirely compatible with also computing a combined forecast: the individual tracks still exist, still get scored, and still show their disagreement. Nothing is averaged away — a row is added.

Two consequences of the gap, both live today:

**The system has no answer to "what will gold do tomorrow."** It emits three distributions and a ladder ranking them, and ADR-0032 itself says which track leads varies by regime. A user has to pick one, and the design declines to say which.

**The only thing combining the forecasts is Nova Pro, in prose.** The predictor receives both univariate baselines in block 3 and is asked to shift the distribution. That is forecast combination performed by a mid-tier language model — and it contradicts invariant I2, *every number that can be computed, is computed*. Pooling two distributions is arithmetic.

The framing underneath this is worth naming: the numeric models were cast as **adversaries to beat** rather than as components. That is an evaluation-first decision that leaked into product design, and it means the product cannot benefit from a foundation model being good — which is the most likely way this project produces something useful early.

## Decision

**A pooled forecast is computed each run and is the system's product output.**

| | |
|---|---|
| **Inputs** | All available tracks for that instrument and horizon: climatology, conditional climatology, `chronos_cov`, `timesfm_cov`, and the agent |
| **Method** | Logarithmic pooling of the bucket distributions, renormalised. Deterministic, in `eval/`, no model call |
| **Weights** | **Equal, initially.** Not learned |
| **Stored as** | A track like any other (`pool`), scored on identical days by the same RPS |
| **Reported as** | The product forecast — distinct from, and alongside, the six-rung ladder |

**Equal weights are deliberate, not a placeholder.** The forecast-combination literature's most durable finding is that simple averages are hard to beat and that estimated optimal weights routinely underperform them out of sample, because weight estimation error exceeds the gain. Fitted weights are a later change requiring evidence they help, not a starting position.

**The ladder is unchanged.** Six rungs, per-rung reporting, no averaging of the bar. ADR-0032's actual decision survives intact.

## Consequences

- **The product works on day 1 of go-live**, and does not depend on the agent thesis being true or the agent working at all. If TimesFM is strong, the pool is strong.
- **One new track to score and store.** No new data, no new model call, no new service — one Lambda reading distributions already written and writing one more.
- **A seventh thing to report**, and a discipline to hold: the pooled track is the *product*, never the *skill claim*. Reporting pool performance as the agent's skill would be the same error rung 6 already guards against (REQ-809).
- **The predictor's job gets clearer.** It is no longer implicitly responsible for weighing the baselines against its own view; it contributes a view, and code combines. That is I2 restored rather than bent.
- **Gain is modest and should not be oversold.** Chronos and TimesFM have correlated errors — both are time-series models on the same series — so pooling buys perhaps 5–25% on effect size. The large win from this line of thinking is [ADR-0052](0052-leave-one-out-attribution.md)'s measurement change, not this.

## Alternatives considered

- **Keep no combination (status quo).** Rejected: it leaves the product with no answer, and leaves an LLM doing arithmetic the design forbids elsewhere.
- **Learned weights from day 1.** Rejected as the starting position — estimation error is the documented failure mode, and it adds a moving part before there is evidence it earns one.
- **Let the agent do the combining, explicitly.** Rejected: that is the current state, and it is what I2 exists to prevent.
- **Pool only the numeric tracks, excluding the agent.** Rejected: it would make [ADR-0052](0052-leave-one-out-attribution.md)'s leave-one-out comparison impossible, and that comparison is worth more than this ADR.

## Revisit trigger

The pooled track underperforms the best single track over a full measurement period — which would mean the pool is being dragged by a component that should be dropped rather than down-weighted.
