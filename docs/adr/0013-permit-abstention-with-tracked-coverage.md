# ADR-0013: Permit abstention, with coverage tracked as a first-class metric

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Prediction contract, eval framework (project summary points 12, 13)

## Context

Most days carry no meaningful event signal. Forcing a directional call on all eleven series every day would compel the agent to emit noise on quiet days, which dilutes the accuracy metric and teaches the learning loop nothing.

The honest goal (ADR-0008) is a *calibrated* system — one that knows when it does not know. A system that is accurate when it speaks and silent otherwise is more useful than one that always speaks and is right slightly more than half the time.

The obvious hazard: an agent free to abstain can protect its score by abstaining almost always, reporting excellent accuracy on a handful of easy days.

## Decision

The agent may output **"no signal"** per instrument per horizon. Abstention is permitted, bounded, and scored.

**Metrics — reported together, never separately:**

- **Coverage** — the fraction of prediction opportunities where a call was made.
- **Accuracy and Ranked Probability Score on covered predictions** only.
- **The coverage-versus-accuracy curve.** Accuracy at 20% coverage and accuracy at 90% coverage are different claims; reporting one number without coverage is meaningless.

**Two guards against score-protecting abstention:**

1. **Mandatory prediction on event days.** Abstention is not permitted when an event's financial severity score (ADR-0011) exceeds a configured threshold, or when a scheduled release with material standardised surprise (ADR-0012) has occurred. The agent may be silent on quiet days; it may not be silent on the days the system exists to handle.
2. **Missed-move tracking.** An abstention on a day that produced a >1.5σ move is recorded as a **missed move** — a distinct failure category, reported alongside accuracy. Without this, abstention becomes a place to hide failures rather than an expression of uncertainty.

**A coverage floor applies.** Sustained coverage below the floor triggers review rather than being silently accepted as good calibration.

**Abstentions are stored, not discarded.** A "no signal" output is a dated, immutable prediction record like any other, with its reasoning. Abstention patterns are themselves learnable: discovering the agent systematically abstains before a particular event type is a finding.

## Alternatives considered

- **Must predict every instrument every day.** Rejected: forces noise on quiet days, dilutes metrics, and teaches the loop nothing on the ~90% of days with no signal.
- **Always predict, with a confidence score.** Rejected as primary, though close. It relies entirely on confidence being well-calibrated, which is exactly what an early-stage system will not have. Explicit abstention is a cruder but more honest instrument while calibration is still developing. Confidence scores are still emitted on covered predictions — this is abstention *in addition to*, not instead of.

## Consequences

- The prediction contract becomes three-valued: bucket, confidence, or abstain.
- Metrics become two-dimensional — no single accuracy number is quotable without coverage, which the dashboard must enforce in how it presents results.
- Missed-move tracking prevents the metric gaming that permissive abstention would otherwise invite.
- The severity threshold governing mandatory prediction is a tunable parameter and needs calibration during backtest; too high and the agent can duck real events, too low and it is forced back into noise.
- Backtest evaluation must replay abstention decisions point-in-time, using only severity scores computable as of that date.

## Revisit trigger

Coverage falls below the configured floor for a sustained period, **or** missed moves exceed covered-prediction errors — either indicates abstention is being used to avoid difficulty rather than to express genuine uncertainty.
