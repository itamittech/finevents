# ADR-0008: Volatility-relative movement buckets at 1-day and 5-day horizons

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Prediction output format, eval framework (project summary points 12, 13)

## Context

The project summary proposes forecasting movement as "5% up, 5% down". Applied to daily closes this is close to unusable: **a ±5% daily move is rare.** NIFTY exceeds ±2% on a handful of sessions a year; gold rarely moves 5% in a session. With ±5% daily buckets the correct answer is "flat" on roughly 99% of days, so a model that always predicts flat scores ~99% accuracy while carrying zero information.

A fixed percentage also cannot serve instruments with different volatility. A 2% move in NIFTY is a significant event; the same move in palladium is an ordinary Tuesday. One threshold cannot be meaningful for both.

## Decision

We will express predicted movement in **volatility-relative buckets**, at **1-day and 5-day horizons**.

**Bucket scheme** — thresholds in standard deviations of that instrument's returns over a trailing 60-session window, recomputed per instrument per horizon:

| Bucket | Range |
|---|---|
| Strong down | < −1.5σ |
| Moderate down | −1.5σ to −0.5σ |
| Flat | −0.5σ to +0.5σ |
| Moderate up | +0.5σ to +1.5σ |
| Strong up | > +1.5σ |

**Horizons:** t+1 (next session close) captures immediate reaction; t+5 captures sustained move. Predicting both separates "the market noticed" from "the market repriced" — a distinction that matters for event correlation, since many shocks reverse within days.

**Display:** the UI shows both the σ bucket and its current percentage equivalent, so a human reads "moderate up (roughly +1.2% to +3.5%)". The internal representation stays σ-relative; the human-facing one is translated.

**Baselines — the prediction is scored against all three:**

1. **Climatology** — predict the historical bucket frequency for that instrument. This is the honest baseline and the hardest to beat.
2. **Persistence** — tomorrow's direction equals today's.
3. **Always-flat** — the trivial baseline the ±5% scheme would have flattered.

A result that does not beat climatology out-of-sample is not a result.

**Metrics:**

- **Ranked Probability Score** as the primary metric. Buckets are *ordinal*, so predicting "strong up" when the outcome was "moderate up" must be penalised less than predicting "strong down". Plain accuracy and multi-class Brier both ignore this ordering.
- Directional accuracy (up/flat/down collapsed) as the readable summary.
- Calibration curve — stated confidence versus realised frequency.

**Abstention is permitted and measured.** The agent may output "no signal", and we track the coverage-versus-accuracy trade-off. A system that is accurate when it speaks and silent otherwise is more valuable than one forced to call every day — and it directly serves the honest-uncertainty goal.

## Alternatives considered

- **Fixed ±5% as originally specified.** Rejected: degenerate at daily horizon, as shown above.
- **Fixed ±5% at weekly horizon.** Rejected: better, but still uncommon for metals, and retains the one-threshold-for-all-instruments flaw.
- **Fixed percentages calibrated per instrument.** Rejected as primary, though close. Volatility regimes shift, so static thresholds drift out of calibration and need periodic manual recalibration — σ-relative buckets self-adjust.
- **Continuous point forecast (predict the exact return).** Rejected: implies precision the system will not have, and is harder to evaluate honestly.

## Consequences

- Buckets stay meaningful across instruments and across volatility regimes without manual retuning.
- Requires a rolling volatility calculation per instrument as pipeline infrastructure — modest, and needed for risk framing regardless.
- Slightly less intuitive than "5% up", mitigated by dual display.
- The trailing-60-session window is itself a parameter; too short is noisy, too long lags regime changes. Sensitivity to this needs checking during backtest.
- Ranked Probability Score is less familiar than accuracy and will need explaining in the dashboard.
- **Bucket boundaries must be computed point-in-time.** Using full-history volatility to bucket a past prediction leaks future information into the label and inflates backtest results.

## Revisit trigger

Ranked Probability Score fails to beat climatology on any instrument after full historical backtest, **or** the flat bucket exceeds 80% of outcomes (indicating thresholds are still too wide).
