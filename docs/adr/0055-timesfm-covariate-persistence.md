# ADR-0055: Hold TimesFM's future covariates at their last observed value, and record that we did

- **Status:** Accepted
- **Date:** 2026-08-13
- **Serves:** REQ-503, REQ-504, REQ-507

## Context

REQ-504 runs each numeric model in two configurations, univariate and covariate-informed, giving four of the ladder's rungs. REQ-503 requires covariates be passed as **series aligned to the context window**, not scalars.

The two libraries turn out to mean different things by that. Measured against the installed versions on 2026-08-13:

| Call | Result |
|---|---|
| Chronos-2, `past_covariates`, context-length array | **works** |
| TimesFM XReg, covariates, context-length array | `ValueError: math domain error` |
| TimesFM XReg, covariates, context **+ horizon** array | **works** |

Chronos-2 supports past-only covariates natively — its architecture distinguishes `past_covariates` from `future_covariates`. TimesFM's XReg is a regression on the covariates *including the forecast period*, so it has no past-only mode: it requires values for days that have not happened.

Those values do not exist at the cut-off. Something has to be supplied, and the choice is not neutral.

## Decision

We will supply TimesFM's future covariate values by **holding each covariate at its last observed value** across the horizon, and we will **record that this was done** on the forecast itself.

`QuantileForecast.future_covariate_policy` takes `none` (Chronos-2 — past-only, nothing assumed) or `persistence` (TimesFM — future values held flat). It is stored with the forecast and travels with it into scoring and reporting.

**Persistence is not leakage.** The last observed value is knowable at the cut-off; no information from after the cut-off enters the forecast. The forward-only guarantee (ADR-0037) and the as-of guarantee (ADR-0016) both hold.

**But it is an assumption, and it is not the assumption Chronos-2 is making.** `chronos_cov` is told nothing about the horizon; `timesfm_cov` is told the covariates do not move. Recording the difference is what stops a reader treating `chronos_cov` vs `timesfm_cov` as a controlled comparison of two models given identical inputs. It is not one.

## Alternatives considered

- **Drop `timesfm_cov` from the ladder.** Rejected: it removes the only independent check on whether a covariate benefit is a property of covariates or a property of Chronos. ADR-0031 added TimesFM precisely so a single model's result cannot be mistaken for a general one.
- **Give Chronos-2 the same persistence-extended `future_covariates`, for symmetry.** Rejected: it would degrade the honest track to match the constrained one. Chronos-2's past-only path is the better input, and deliberately weakening it to make a table look tidy is the wrong direction.
- **Forecast each covariate and feed the forecast.** Rejected as unfalsifiable complexity: the covariate forecasts would themselves need scoring, and an error in one propagates into the target forecast with no way to attribute it. It also multiplies model calls by the covariate count for no measured benefit.
- **Extend with a random walk or the covariate's own drift.** Rejected: it invents a value with more structure than persistence and no better justification. Persistence is the minimal assumption — "nothing new happens" — and is the standard no-change benchmark in forecasting.
- **Say nothing and let both tracks be called "covariate-informed."** Rejected outright. This is the option that makes a later comparison quietly wrong, and it is the reason this ADR exists rather than a code comment.

## Consequences

**Easier.** All four numeric rungs exist and run. The ladder is complete on the numeric side without waiting for a library change.

**Harder.** Any figure comparing `chronos_cov` with `timesfm_cov` must carry the policy difference, or it misleads. That obligation now falls on the reporting layer and on the dashboard, not just on whoever writes the analysis.

**A measurement becomes available that was not planned.** Because `timesfm_uni` and `timesfm_cov` differ only in the covariates, and `chronos_uni`/`chronos_cov` likewise, the *within-model* covariate effect is still cleanly attributable for each model separately. It is only the *across-model* covariate comparison that is confounded — a narrower loss than it first appears.

**A dependency consequence.** TimesFM's covariate path needs XReg, and `timesfm[xreg]` declares `jax[cuda]`, whose plugin ships no Windows wheel. `jax`, `jaxlib` and `scikit-learn` are therefore pinned directly. Without them the covariate track raises `ImportError` at **call** time rather than install time, so the failure would land mid-evaluation with the univariate track already green.

## Revisit trigger

TimesFM gains a past-only covariate mode, **or** the measured gap between `timesfm_uni` and `timesfm_cov` proves large enough that the persistence assumption is doing visible work — at which point the assumption needs testing rather than recording.
