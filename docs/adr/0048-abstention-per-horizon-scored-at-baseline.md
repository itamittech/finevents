# ADR-0048: Abstention is per-horizon, and abstained days are scored at the baseline

- **Status:** Accepted
- **Date:** 2026-08-09
- **Supersedes:** [ADR-0013](0013-permit-abstention-with-tracked-coverage.md)
- **Serves:** REQ-608, REQ-609, REQ-610, REQ-806, REQ-908
- **Relates to:** [ADR-0046](0046-pre-registered-skill-comparison.md) (the comparison this protects)

## Context

[ADR-0013](0013-permit-abstention-with-tracked-coverage.md) permits the agent to output "no signal" and its reasoning is sound: forcing a prediction on the ~90% of days with no event teaches the loop nothing and dilutes the metric. That decision stands. Two things it left are not workable as written.

**1. The granularity is unimplementable.** ADR-0013 says the agent may abstain "per instrument **per horizon**." The output schema in `prediction-contract.md` puts `abstain` at the top level, outside `horizons`. Built as written, the natural case — *no signal at t+5, a call at t+1* — cannot be expressed. That case is not an edge case: it is what ADR-0034's decay argument predicts, since event effects are strongest at t+1 and often gone by t+5.

**2. "RPS on covered predictions only" breaks the ladder.** ADR-0013 scores the agent on the days it chose to cover. REQ-806 scores all six rungs on **identical live days**. Both cannot hold. And the ADR-0013 version is the dangerous one: an agent scored on a self-selected subset, against baselines scored on everything, produces a learning curve that is a **selection artefact**. Abstain on the hard days and skill appears from nothing — with no leakage, no bug, and nothing in the harness that would catch it, because nothing has gone wrong except the sampling.

Under [ADR-0046](0046-pre-registered-skill-comparison.md) this matters more than it did. The paired comparison requires the pairs to exist. An abstained instrument-day with no agent score is a hole in the pairing, and dropping the pair drops the *comparator's* observation too — silently discarding exactly the days the agent found hard.

## Decision

**Abstention is expressed per instrument per horizon**, inside the `horizons` object:

```json
"t+1": { "abstain": false, "buckets": { … }, "confidence": 0.62 },
"t+5": { "abstain": true,  "buckets": null,  "confidence": null }
```

`abstain: true` requires `buckets: null` — an abstention carrying a distribution is a contradiction and fails validation. The top-level `abstain` flag is removed.

**An abstained instrument-horizon is scored at the shown baseline for that instrument and horizon.** Not skipped, not scored as a miss.

The rule follows from what abstention means. "No signal" is a statement that *the agent has nothing to add to the baseline it was shown* — so the honest score is the baseline's score. This gives abstention three properties nothing else does:

- **The ladder stays intact.** Every rung is scored on every live day. REQ-806 holds without exception, and ADR-0046's pairing is complete.
- **Abstention is neither rewarded nor punished.** The agent gains nothing by abstaining on hard days, because it inherits the baseline's score exactly. The incentive to game coverage disappears rather than being policed.
- **The skill measure keeps its meaning.** Agent RPS minus comparator RPS is unchanged by abstention on any day, so the headline measures departures that were actually made.

**Coverage, abstention rate and missed moves remain tracked and displayed separately** (REQ-610, REQ-908) — that was ADR-0013's real contribution and it is untouched. An agent abstaining 95% of the time now scores *exactly* the baseline rather than appearing skilful, which is the correct and legible outcome.

**REQ-609 is unchanged:** abstention is rejected when severity exceeds the REQ-311 threshold. The agent may be silent on quiet days, not on the days the system exists for.

## Consequences

- **The abstention coverage floor is no longer load-bearing for correctness.** ADR-0013 needed it to stop the agent buying accuracy by declining hard days; scoring at the baseline closes that structurally. The floor stays as a *diagnostic* — a high abstention rate says the wiki is not yet informative — but it no longer protects the metric.
- **`prediction-contract.md`'s schema and validation change**, including the rule that `abstain: true` is incompatible with a non-baseline distribution, which now has a precise meaning.
- **Scoring must join each abstained horizon to the baseline that was shown**, so the shown baseline has to be stored with the prediction. It already is — block 3 is part of the prompt snapshot (REQ-1202) and the baseline tracks are scored anyway.
- **A subtle bias is removed from the calibration map.** ADR-0042 fits the isotonic map on `(prediction, outcome)` pairs. Abstained horizons contribute no agent-authored probability, so they are excluded from the *fit* while still counting in the *score* — the map describes the agent's own forecasts, and the ladder describes the whole record.
- **This is a decision that reduces measured skill** relative to ADR-0013 as written. That is the intended direction.

## Alternatives considered

- **Score abstained days as a miss.** Rejected: it punishes abstention harder than a hedged uniform forecast, so the agent would always hedge and the mechanism would be dead.
- **Exclude abstained days from the agent's score only** (ADR-0013 as written). Rejected: selection artefact, and it breaks the ladder's identical-days guarantee and ADR-0046's pairing.
- **Exclude abstained days from every rung** — preserving identical days by dropping the day entirely. Rejected: the agent still selects the sample, just for everyone at once, and the days it declines are systematically the informative ones.
- **Score at climatology rather than at the shown baseline.** Rejected: the agent is shown Chronos and TimesFM (block 3), not climatology, so climatology is not what it declined to improve on.

## Revisit trigger

Abstention rate exceeds the coverage floor for a sustained period **and** the missed-move count on abstained days materially exceeds the error the agent would have incurred by predicting — which would mean silence is costing more than a wrong answer would.
