# ADR-0022: Nova Lite for event classification and severity scoring

- **Status:** Accepted — **amended by [ADR-0027](0027-model-selection-as-configuration.md)**
- **Date:** 2026-08-09
- **Serves:** ADR-0011 (CAMEO substrate + overlay), cost control (project summary point 10)

> **Amendment note (2026-08-09):** This ADR's classification decision stands — Nova Lite, same model for backfill and daily, for the consistency reasons below. What ADR-0027 changes is the *reasoning* assignment: where this ADR says "Opus 5 retains everything that is actual judgment", the reasoning model is now **configuration** (`/finevents/{env}/model/reason`), defaulting to Nova Pro under current Bedrock availability. The split between mechanical mapping and judgment is unchanged; only the model filling the judgment slot is no longer fixed. Original decision text preserved unedited.
>
> **Second amendment note (added on review):** [ADR-0040](0040-split-reasoning-model-by-role.md) split the reasoning slot again, by role — **Nova Pro predicts, Nova Premier curates**. Two consequences for the text below. First, the consequence *"a model-family boundary now sits inside the pipeline: Nova produces severity scores that **Claude** consumes"* **no longer holds** — every role is Nova, so there is no cross-family boundary at all, and that consequence can be struck rather than managed. Second, the spot-check "against Opus 5" is now a spot-check against **whichever stronger model is configured**; under ADR-0038 it **gates the wiki seed**, so it must pass *before* the seed is built rather than before backfill is accepted. The consistency argument — one classifier across all time — is untouched and remains the load-bearing part.

## Context

Classification and severity scoring (ADR-0011) is the highest-volume model workload in the project — every backfilled and every daily event passes through it. Correlation reasoning, prediction, and wiki curation are lower-volume and genuinely judgment-heavy.

**The binding constraint is consistency, not absolute quality.** Backfill and daily runs must use the *same* model. Severity scores from two different models sit on two different scales; the system would learn correlations against one scorer's judgment and then predict against another's. That failure is silent, presents as model drift rather than a scale mismatch, and the only clean fix is re-scoring the entire history.

The deterministic pre-filter (ADR-0021) removed most of the cost pressure before this decision was made. Post-filter, backfill costs roughly $0.21 on Nova Lite, $4 on Haiku 4.5, and $19 on Opus 5 — all affordable, which made this a quality judgment rather than a budget one.

Amazon Titan was considered and rejected on a factual basis: it is the older family Nova superseded, not an upgrade over it.

## Decision

**Nova Lite** (`amazon.nova-lite-v1`) performs event classification and financial-severity scoring, for **both backfill and daily runs**.

**Opus 5 retains everything that is actual judgment** — correlation hypothesis generation, prediction with reasoning, and wiki consolidation and linting. The split follows ADR-0004's line: mechanical mapping goes to the cheap model, reasoning does not.

**Rationale:** ADR-0011 designed classification as a mapping from *pre-structured* CAMEO records — event code, actors, geography, Goldstein intensity, mention counts are all supplied by GDELT. The model's job is to map that structure onto a financial-relevance category and severity score, not to interpret free text from scratch. That is within a small model's range.

**Cost:** ~$0.21 one-off backfill (batched), ~$0.05/month ongoing.

**A quality spot-check is mandatory before backfill is accepted.** The hand-labelled sample built for filter calibration (ADR-0021) is reused: classify it with both Nova Lite and Opus 5 and measure disagreement. This costs a few dollars, quantifies exactly what the cheaper model gives up, and converts an assumption into a number. If disagreement on severity ranking exceeds the agreed threshold, this ADR is reopened before eleven years of history are scored.

## Alternatives considered

- **Haiku 4.5 for both** (~$4 backfill, ~$1/month). Claude-family consistency with the reasoning layer and better nuance on ambiguous events. Rejected on cost-per-marginal-quality, contingent on the spot-check confirming Nova Lite is adequate.
- **Opus 5 for both** (~$19 backfill, ~$5/month). One family throughout, no scale question anywhere. Rejected as overspend for a largely mechanical mapping.
- **Nova Lite for backfill, a different model for daily.** Rejected — this is the scale-inconsistency failure described above, and it was the original proposal that prompted this ADR.
- **Amazon Titan.** Rejected: superseded by Nova, weaker on general capability. Recorded here because it was proposed as an upgrade over Nova Lite, which is backwards.

## Consequences

- Classification cost becomes effectively free, and stops being a factor in scope decisions — adding instruments or loosening the filter no longer carries a meaningful classification bill.
- **A model-family boundary now sits inside the pipeline**: Nova produces severity scores that Claude consumes as reasoning input. This is acceptable because the scale is consistent *across time*, which is what the learning layer requires. It is not the same hazard as the backfill/daily split.
- Nova Lite is weaker on genuinely ambiguous events, where severity is a judgment rather than a lookup. The spot-check bounds this rather than eliminating it.
- Two model families to manage — separate prompt formats, separate token accounting, separate behaviour on upgrade. The record-and-replay layer (ADR-0018) covers both, since the cache key includes model ID.
- Nova availability is per-region like all Bedrock models; us-east-1 is confirmed as the target.

## Revisit trigger

Spot-check disagreement against Opus 5 exceeds the agreed threshold on the labelled sample, **or** severity scores show no relationship to realised volatility after backtest (ADR-0011's trigger, which this decision could plausibly cause).
