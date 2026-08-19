# ADR-0058: Controls for the reasoning rung, because three inputs changed at once

- **Status:** Accepted (2026-08-19)
- **Date:** 2026-08-19 · proposed in the [2026-08-18 review](../analysis/poc-review-2026-08-18.md) as finding L1, accepted by the builder the next day
- **Serves:** REQ-1301, REQ-1304
- **Relates to:** [ADR-0056](0056-random-walk-covariate-control.md) (the same principle, one layer down), [ADR-0057](0057-strands-for-the-reasoning-layer.md) (the rung being controlled), [ADR-0029](0029-baseline-blind-control.md) (the anchoring control this finally builds), [ADR-0037](0037-forward-only-agent-learning.md) (why these accrue live and cannot be backfilled)

## Context

ADR-0056 settled the principle for the numeric lane: **a rung that receives extra
information ships with a control that receives the same shape of information with
the content removed.** Covariate rungs carry `*_rwcov`; without it, "covariates
help" and "covariates hurt" are indistinguishable from spurious regression.

The reasoning rung was built without one. `llm_raw` differs from every numeric
rung in **three inputs at once**:

1. the deterministic event shortlist (GDELT metadata),
2. the related-market block (the target's own recent moves and seven other series),
3. the field — every other method's sealed bet for the day, the live track record,
   and the offline ladder.

After nine graded live days the rung sits at −0.010 RPS against climatology with a
day-clustered interval of [−0.030, +0.010]. Suppose that gap were to harden. We
could not say *which of the three* produced it — and the recorded rationales
argue against the one the project is actually testing: they are momentum stories
("silver is rising and USD/RUB is up 3.39% over five days"), not event stories.
Every sealed `llm_raw` distribution so far also sits within L1 0.03–0.15 of
climatology, which is what anchoring looks like, and the brief itself tells the
model that climatology is the bar (a separate defect, addressed by the `llm_blind`
arm below rather than by editing `llm_raw` mid-measurement).

An uncontrolled result is not evidence about the events→prices thesis. It is an
anecdote with a decimal point.

## Decision

**Every reasoning arm ships with controls sealed on the same days, and the
comparison that decides the thesis is pre-registered before the data exists.**

Three additions, all **purely additive** — no existing rung's brief, bet or seal
changes, so the measurement already running is not disturbed:

| Rung | Brief | Isolates |
|---|---|---|
| `llm_noevents` | `llm_raw` minus the event block | **The thesis.** `llm_raw − llm_noevents` is the value of world events, and nothing else differs |
| `llm_blind` | `llm_raw` minus the field (other methods' bets, live record, offline ladder) | Anchoring — ADR-0029's baseline-blind control, unbuilt until now. How much of the agent's calibration is judgement, and how much is copying the bar it was shown? |
| `momentum_climo` | *deterministic, no model* — climatology recomputed with the recent per-session drift added to every historical return, in σ units | A **free** bar for the momentum story. If a rule that only tilts base rates toward recent drift matches the agent, the agent is an expensive trend indicator |

`momentum_climo` is deterministic and reproducible (REQ-507); it uses only the
target's own closes and the drift window is a named constant.

**Pre-registered before the first control seals** (this is the point of writing it
down today rather than after the numbers arrive):

- **Primary:** `llm_raw − llm_noevents`, paired per day, Newey–West at lag h−1,
  pooled across instruments with day-clustered errors. Positive means events cost
  accuracy; an interval containing zero after the horizon below means **the event
  layer is not earning its place**.
- **Secondary:** `llm_raw − llm_blind` (anchoring), `llm_mem − llm_raw` (memory),
  `llm_raw − momentum_climo` (reasoning over trend-following).
- **Nothing is called before ~60 graded days per comparison.** The measured
  Newey–West per-day SD is 0.03–0.06 at t+1, so the minimum detectable difference
  is ~0.03–0.05 at n=5 and ~0.007–0.016 at n=60. A verdict earlier than that would
  be reading noise, whatever it says.
- The controls **start their own clock** the day they first seal. They cannot be
  backfilled (ADR-0037), so `llm_raw`'s existing days have no matching control day
  and are excluded from the primary comparison.

## Consequences

- **Cost roughly doubles for the reasoning layer**: four model calls per instrument
  per day instead of two, so ~12 calls on a typical day (three instruments seal;
  USD/INR and WTI seal about weekly) against ~6 today. Still inside the POC's cost
  envelope, and the alternative is an unattributable result, which is worth nothing.
- **A null becomes informative.** "Events add nothing detectable" is a publishable
  finding with a control and an interval; without one it is a shrug.
- The offline ladder gains no rows: these rungs are forward-only like the rest of
  the reasoning layer.
- **This does not fix the event feed's relevance** ([review finding L3](../analysis/poc-review-2026-08-18.md)):
  the shortlist is still conflict-coded GDELT rows dominated by US domestic crime.
  That is deliberate sequencing — the control framework has to exist *first*, so
  that any later enrichment (macro releases, policy-rate changes, a relevance
  filter) is measured as its own arm rather than silently folded into `llm_raw`.

## Alternatives considered

- **Edit `llm_raw`'s brief instead** — drop the "that is the bar" sentence, remove
  the dummy rungs from the field block. Rejected for now: it changes a rung
  mid-measurement, and `llm_blind` measures the same thing additively. The edit
  belongs to a later increment, with its own start date.
- **One combined control** (no events *and* no field). Rejected: it confounds the
  two removals, which is the exact mistake being corrected.
- **Wait for the observation week to end (2026-08-24).** Rejected on the builder's
  decision: the controls are additive, they disturb nothing already running, and
  every day they do not exist is a day they are not accruing the ~60 they need.

## Revisit trigger

Any of: **(a)** the primary comparison reaches ~60 graded days and its interval
excludes zero in either direction — the event layer has earned its place or has to
go; **(b)** it reaches ~60 days with an interval still spanning zero, at which point
the honest reading is that the feed as constituted carries no measurable signal and
the next move is [L3](../analysis/poc-review-2026-08-18.md)'s relevance filter or a
different feed entirely; **(c)** the event shortlist is replaced or materially
enriched (macro releases, policy-rate changes), which restarts the clock because the
thing being controlled has changed; **(d)** `llm_blind` shows the agent's calibration
is materially the field's, in which case the anchoring defect outranks the thesis.
