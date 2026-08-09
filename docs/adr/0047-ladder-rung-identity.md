# ADR-0047: Ladder rungs 3 and 4 are the covariate-informed forecasts

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** REQ-806, REQ-904, REQ-505
- **Amends:** [ADR-0030](0030-chronos-as-baseline-and-shown-forecast.md), [ADR-0031](0031-timesfm-third-track-and-ensemble-baselines.md) (rung numbering), [ADR-0033](0033-evaluation-harness-as-first-class-deliverable.md) (what the ladder reports)

## Context

The ladder has six rungs (REQ-806): climatology, conditional climatology, Chronos-2, TimesFM 2.5, agent raw, agent calibrated. Rungs 3 and 4 name a *model* but not a *configuration* — and each numeric model runs two (REQ-504): univariate, and covariate-informed with the severity series among its covariates.

`Design.md` §3 scores all four as separate tracks (`chronos_uni`, `chronos_cov`, `timesfm_uni`, `timesfm_cov`). Nothing said which pair the ladder reports, and the two choices support materially different claims:

- Against **univariate**: "the agent beats a price-only model." But the univariate forecasts are *shown to the agent* in prompt block 3, so beating them partly measures whether the agent can improve on something it was handed — which is what the anchoring index exists to measure, not the ladder.
- Against **covariate-informed**: "the agent beats a model given the same severity signal." That is the wiki thesis stated as a falsifiable claim.

[ADR-0030](0030-chronos-as-baseline-and-shown-forecast.md) already answered this and the answer was lost in renumbering. It called the covariate-informed run "the actual test of the wiki thesis" and rejected a univariate-only design because it "leaves rung 5 — the actual test — unanswered." Its rung 5 is this ladder's rung 3.

## Decision

**Ladder rungs 3 and 4 report the covariate-informed configurations** — `chronos_cov` and `timesfm_cov`.

The univariate tracks continue to be computed, scored and published as secondary series. They remain the forecasts shown to the predictor in block 3 (REQ-505 is unchanged: only univariate forecasts reach a prompt).

This makes the ladder and [ADR-0046](0046-pre-registered-skill-comparison.md)'s primary comparator the same object, which they must be — a headline comparator that is not a reported rung would be unauditable.

**Rung numbers are not a stable identifier.** They have shifted twice: ADR-0030's six-rung ladder differs from ADR-0042's. New documents name the track (`chronos_cov`), not the rung.

## Consequences

- **The bar rises, deliberately.** The covariate-informed rival is handed the severity series the agent reasons about, so this is the harder comparison. Combined with ADR-0046's power analysis it makes a positive result less likely — which is the point. A bar that the agent clears by being handed something its rival was not is not a bar.
- **Beating the univariate track is no longer a headline claim.** It is reported, and it is interesting mainly as an anchoring diagnostic: an agent that beats the univariate forecast it was shown but not the covariate one has probably learned to nudge a baseline rather than to reason about events.
- **The dashboard shows six rungs plus two secondary series**, not four numeric tracks of equal standing (REQ-904).
- **If the covariate-informed configuration proves unavailable** — the ADR-0030 open item on whether the models accept the covariates as specified — this ADR reopens rather than silently falling back to univariate.

## Alternatives considered

- **Univariate as the rung.** Rejected: it is the forecast the agent is shown, so the comparison is contaminated by anchoring rather than measuring event reasoning.
- **Report both as separate rungs (eight-rung ladder).** Rejected: it doubles the multiplicity burden ADR-0046 just constrained, and invites reporting whichever pair is more favourable.
- **Let the dashboard switch configuration.** Rejected outright — a selectable comparator is the selection bias ADR-0046 exists to remove, moved into the UI.

## Revisit trigger

The covariate-informed configuration proves unavailable or degenerate for either model — for instance if covariate support does not accept the severity series as an aligned series (REQ-503), making the two configurations identical in practice.
