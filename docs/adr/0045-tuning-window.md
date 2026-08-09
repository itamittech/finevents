# ADR-0045: The tuning window ends when the configuration freezes — 60 trading days

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** [ADR-0037](0037-forward-only-agent-learning.md), ADR-0033 (evaluation harness), [ADR-0039](0039-live-shadow-model-ab.md)
- **Settles:** the tuning-window open item

## Context

[ADR-0037](0037-forward-only-agent-learning.md) removed historical replay, which moved several calibration tasks from backtest into live running: the abstention threshold, the coverage floor, and any behaviour that depends on how the agent actually acts rather than on what the data says.

That makes the first weeks of live running partly a tuning period. Results produced while thresholds are still moving should not count toward the skill record — and **the boundary has to be fixed in advance**, because choosing it after seeing results is indistinguishable from selecting a favourable start date.

Treating this as "pick a duration" missed something. The window has a natural end, and it is not arbitrary.

## Decision

**The tuning window is 60 trading days from go-live, and it ends when the system configuration freezes.**

Those are the same moment by design. [ADR-0039](0039-live-shadow-model-ab.md)'s shadow arm runs Nova Premier alongside the Nova Pro predictor for 60 trading days, and until it concludes the reasoning model may still change. Before day 61 the system is not yet the system; after it, the configuration is fixed.

**This is why the boundary is principled rather than chosen.** It is defined by *"the last day on which the configuration could still change"* — a fact about the design, decidable before go-live and unaffected by any result.

### What "excluded" means precisely

| | During the window | After |
|---|---|---|
| Predictions made | Yes, all tracks | Yes |
| Predictions scored | Yes | Yes |
| Published in the record ([ADR-0044](0044-licence-and-publication-policy.md)) | **Yes, labelled `tuning`** | Yes |
| Wiki learns from outcomes | **Yes** | Yes |
| Counts toward headline skill | **No** | Yes |
| Included in the learning-curve trend | **No** | Yes |

**The wiki keeps learning throughout.** Only the *skill claim* is suspended, not the accretion. Excluding the window from learning would waste three months of genuine observations for no benefit — the concern is that thresholds were moving, not that the outcomes were unreal.

**Excluded results are published, not hidden.** They appear in the record labelled `tuning`, which is the difference between an exclusion and a quiet deletion. A reader can compute the numbers including the window if they want to; the project simply does not headline them.

### No extension

The window does not extend if calibration is unfinished at day 60.

**An incomplete calibration at day 60 is a finding, not grounds for moving the line.** It means the thresholds need more evidence than three months provides, which is worth knowing and worth reporting — and it is exactly the reasoning that, if accepted once, extends indefinitely until the numbers look acceptable.

### Configuration changes after the window

If the configuration changes later — a model switch, a prompt revision, a filter or overlay version bump — **a new measurement period begins**, versioned and reported separately. It does not reopen a tuning window.

The skill record is therefore a sequence of configuration-stamped periods rather than one continuous series. The dashboard shows the seams. This is less tidy than a single line, and it is honest: a system that changed is not the same system, and pretending otherwise is how gradual redesign gets reported as gradual improvement.

## Alternatives considered

- **30 trading days.** Half the exposure, results count sooner. Rejected: it ends while the shadow A/B is still running, so the first month of counted results was produced under a configuration that could still change — precisely the mismatch the window exists to prevent.
- **Until 20 event days have occurred** (~100 trading days at the top-20% bar). Scales to signal rather than calendar. Rejected: its end date is unknown in advance and data-dependent, which is the property that makes an exclusion boundary suspect.
- **Until abstention rate stabilises.** Rejected outright — outcome-dependent by construction. The stopping rule would be a function of the results it is meant to exclude.
- **No tuning window; count everything from day 1.** Simplest and most conservative-looking. Rejected: it would report results from a period when the model itself might be replaced, understating the configured system's skill and muddying the shadow A/B's own comparison.

## Consequences

- **The first agent skill number arrives at roughly month 11–13** rather than 8–10: three months of tuning plus the eight-to-ten ADR-0037 projects for an interpretable aggregate. That is the true time-to-first-result and should be stated as such rather than discovered later.
- **The window and the shadow A/B are deliberately coincident.** Anything that changes one changes the other, and they should be revisited together.
- **The dashboard needs a visible boundary**, and every reported figure must name the periods it covers.
- Configuration versioning becomes load-bearing rather than good practice: without it, the seams cannot be drawn and the skill record silently becomes a mixture.
- **The tuning window is itself a leakage surface for a human.** Thresholds set during it are set by someone who has seen the early results. That is unavoidable — it is what a tuning period is — but it is the reason those results are excluded, and the reason the thresholds chosen are recorded with the evidence that motivated them.

## Revisit trigger

The shadow A/B's duration changes for any reason — the two are defined to coincide, and a change to one without the other reintroduces the mismatch this ADR exists to close.
