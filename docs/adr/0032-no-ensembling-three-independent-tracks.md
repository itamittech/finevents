# ADR-0032: No ensembling; three fully independent tracks

- **Status:** Accepted
- **Date:** 2026-08-09
- **Supersedes:** the ensemble decision in [ADR-0031](0031-timesfm-third-track-and-ensemble-baselines.md) (its TimesFM adoption stands)
- **Amends:** [ADR-0020](0020-static-spa-frontend.md) (dashboard view ordering)

## Context

ADR-0031 proposed combining Chronos-2 and TimesFM 2.5 into an ensemble baseline, on the strength of forecast-combination results. That was recorded before it was confirmed, and on review the ensemble is not wanted.

The reasoning against it is stronger than the reasoning for it, in this specific setting:

**An ensemble is a weaker test than the models it averages.** Beating the *mean* of two forecasters is easier than beating the *better* of them. Since the point of these baselines is to set a bar the agent must clear, averaging them lowers that bar — the opposite of what the evaluation needs.

**Ensemble weights are another estimation problem** on data the project is already short of.

**And nothing needs a single combined number.** The system publishes all three tracks and marks none canonical (below), so there is no product requirement for one best forecast. Combining exists to produce a single better answer; that is not what this system is for yet.

## Decision

### No ensembling anywhere

Chronos-2, TimesFM 2.5, and the agent run and are scored **fully independently**. Every number in the system belongs to exactly one method.

### Revised baseline ladder

| Rung | Baseline |
|---|---|
| 1–3 | Always-flat, persistence, conditional climatology |
| 4 | Chronos-2 univariate |
| 5 | TimesFM 2.5 univariate |
| 6 | Chronos-2 covariate-informed |
| 7 | TimesFM 2.5 covariate-informed |
| — | Agent |

**The bar is beating the best-performing rung, not an average of them.** Reported per period, since which numeric model leads is expected to vary by regime — Chronos on stationary stretches, TimesFM on non-stationary ones.

### Block 3 shows both forecasts, separately labelled

*This is a consequence of the above rather than a separately-confirmed decision, and is flagged for correction.*

Prompt block 3 carries **both univariate forecasts, labelled by source**, rather than one combined distribution.

The reason this is preferable to picking one: **where the two models disagree is itself information** — it signals that the series-dynamics view is uncertain, which is exactly when event context is most likely to matter. An ensemble would average that disagreement away. Showing both preserves it as a signal the agent can reason about.

The agent's departure is measured against **each** baseline separately, and the anchoring control (ADR-0029) extends to both.

### Publish all three; mark none canonical

The dashboard shows all three tracks side by side with the outcome. No single number is designated "the prediction" until there is evidence for which deserves to be.

This is honest during the learning phase and defers the choice without blocking anything. It is also coherent with the no-ensemble decision: **the system is currently an experiment, not a forecast product**, and both decisions follow from that.

### Dashboard build order

Amending ADR-0020's view list, first two views to build:

1. **Edge-over-time** — agent Ranked Probability Score against the *best-performing* baseline at each point, rolling, aggregate and per instrument. This is the visualisation of the learning thesis: if the wiki compounds, the edge should trend up; if flat, it is not contributing.
2. **Three-track running comparison** — all tracks scored daily against the close.

Wiki browsing, diffs, disagreement views and steering controls follow once there is something worth steering. The early question is "is this working at all", and only these two answer it.

## Alternatives considered

- **Ensemble the two numeric baselines** (ADR-0031 as recorded). Rejected: lowers the bar the agent must clear, adds a weight-estimation problem, and serves a single-best-forecast requirement the project does not have.
- **Ensemble all three including the agent.** Rejected on the same grounds as in ADR-0030 — it would destroy attribution and leave a product without an experiment.
- **Show only one baseline in block 3.** Rejected: discards the disagreement signal, and the choice of which to show would be arbitrary before there is evidence.
- **Publish whichever track is currently winning.** Rejected: the published number's meaning would change underneath the viewer, and the selection effect would make long-run evaluation harder to interpret.

## Consequences

- **The bar is higher and the attribution cleaner** — every number traces to exactly one method, and the agent must beat the best rival rather than a diluted average.
- The disagreement between Chronos and TimesFM becomes usable signal rather than averaged-away noise, both in the prompt and as a dashboard view.
- No combination logic, no weights to fit, no ensemble version to stamp.
- Two baselines shown in block 3 rather than one, so prompt length grows slightly and the anchoring control must cover both.
- **"Best-performing baseline" must be defined carefully in the eval** — chosen per period from measured results, not cherry-picked after seeing the agent's score, or the comparison becomes self-serving.
- Which numeric model leads is expected to vary by regime, so single-number summaries of "the baseline" will be misleading; reporting must stay per-rung.
- Giving up the ensemble gives up a likely accuracy gain. Accepted: measurable attribution matters more than raw accuracy at this stage.

## Revisit trigger

The project moves from experiment to product — at which point a canonical published forecast is needed, and ensembling becomes worth reconsidering on accuracy grounds rather than evaluation grounds.
