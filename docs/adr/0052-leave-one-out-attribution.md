# ADR-0052: Leave-one-out contribution is the primary skill endpoint

- **Status:** Accepted
- **Date:** 2026-08-09
- **Amends:** [ADR-0046](0046-pre-registered-skill-comparison.md) — the statistic and comparator change; everything else in the pre-registration stands
- **Depends on:** [ADR-0051](0051-pooled-forecast-as-product-output.md)
- **Serves:** REQ-903, REQ-919, REQ-920, REQ-923
- **Evidence:** [power analysis](../analysis/power/results.md)

## Context

[ADR-0046](0046-pre-registered-skill-comparison.md) pre-registered the skill comparison as a paired RPS difference between the agent and one fixed comparator — the better covariate-informed numeric track. That was a large improvement on the per-day minimum it replaced, and it is still the wrong statistic.

The power analysis put a defensible result at ~23 years for a metals set under realistic assumptions. That number is not a property of the system; **it is a property of the question**. Simulated on identical data, identical days, identical everything:

| Comparison | Mean ΔRPS | SD | Years to 80% power |
|---|---|---|---|
| agent vs `chronos_cov` (ADR-0046) | −0.00043 | 0.0133 | **23.0** |
| pool **with** agent vs pool **without** | −0.00030 | 0.0041 | **4.5** |

The second effect is *smaller* and still five times faster to detect.

The reason is that the first comparison is unpaired and the second is paired. Every forecast decomposes into signal, the noise the day dealt every forecaster, and that forecaster's own error. In `agent − chronos` the day noise cancels but **two** independent forecaster errors remain. In `pool_with − pool_without` the day noise cancels *and so does Chronos' error* — it is literally the same number on both sides of the subtraction. Only the agent's own contribution survives, and the standard deviation falls 3.2×. Days to power scale with (sd/μ)².

This also asks a better question. "Does the agent beat Chronos?" is a horse race between two things nobody would use alone. "Does adding the agent to everything else we have make the forecast better?" is what a user of the system actually needs to know, and it is the question ADR-0051's pooled output makes askable.

## Decision

**The primary endpoint is the agent's leave-one-out contribution to the pooled forecast.**

| Element | Decision |
|---|---|
| **Statistic** | Paired RPS difference: `pool(all tracks)` − `pool(all tracks except the agent)`, on identical live days |
| **Aggregation** | The **day**, as before — instruments averaged within a day first |
| **Horizon** | t+1 primary; t+5 secondary. Unchanged |
| **Interval** | Stationary block bootstrap over days, block length 10, 10,000 resamples. Unchanged |
| **Test** | One-sided, α = 0.05. Unchanged |
| **Reported** | Point estimate **and** interval, always together. Unchanged |

**Leave-one-out is computed for every track, not only the agent.** The same subtraction says what Chronos contributes, what TimesFM contributes, and what conditional climatology contributes. That is a full attribution table for the price of one operation, and it answers "which parts of this system are earning their place" — a question the ladder cannot answer, because a track can rank well and still add nothing the others did not already have.

**ADR-0046's head-to-head becomes a secondary endpoint.** It is still reported. It is no longer what the claim rests on.

## Consequences

- **~5× faster to a defensible result**, from a change to what is computed at scoring time. No new data, no new model call, no change to the pipeline.
- **The anchoring index becomes load-bearing rather than a guard.** If the agent merely echoes the baselines it was shown, leave-one-out correctly shows no contribution — it added no independent information to the pool. Under ADR-0046 a null was ambiguous between *no skill* and *not enough data*; here it has a third and more likely reading, and the anchoring index is what distinguishes them. It is promoted from control to explanation.
- **A negative contribution is now expressible, and that is a feature.** The agent can measurably make the pool *worse*. The old statistic could only say it lost a race.
- **This depends on ADR-0051.** Without a pool there is nothing to leave one out of.
- **It does not fix the wiki.** Individual correlation pages still need ~24 observations before their intervals exclude a coin flip. Per-page confidence remains a year-2–3 matter, and no change to the statistic reaches it.
- **The timeline claim in every document changes again**, and this is the second revision. Both moved in the same direction — toward what the evidence supports rather than what was assumed — but a reader is entitled to notice the number keeps moving. It should be stated as a range with its assumptions, never as a date.

## Alternatives considered

- **Keep ADR-0046's head-to-head.** Rejected: five times slower for a less useful question.
- **Compare the pool against the best single track.** Rejected: that measures whether pooling helps, not whether the *agent* helps, and the agent is the thesis.
- **Ablate by retraining without the agent.** Not applicable — nothing is trained. The pool is recomputed, which is why this costs a subtraction rather than a run.
- **Report leave-one-out for the agent only.** Rejected: the same computation gives every track, and knowing that a component contributes nothing is worth as much as knowing one does.

## Revisit trigger

The pooled forecast is withdrawn or its composition changes materially — leave-one-out is defined against a specific pool, and a different pool is a different statistic.
