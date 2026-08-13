# ADR-0056: A random-walk covariate control, because covariate rungs are vulnerable to spurious regression

- **Status:** Proposed
- **Date:** 2026-08-13 · revised the same day after a review pass found two defects in the round-1 harness (see *What the review corrected*)
- **Serves:** REQ-503, REQ-504, REQ-806
- **Relates to:** ADR-0047 (which makes the covariate-informed rungs the bar the agent is measured against)

## Context

The gold POC scored six rungs on 143 unseen days. Both covariate-informed rungs came out **detectably worse** than the univariate ones, at both horizons — `chronos_cov` +0.0124 and `timesfm_cov` +0.0074 against climatology at t+1, and worse again at t+5. Consistent damage from covariates chosen for a documented mechanism is a symptom, not a result, so it was diagnosed rather than reported.

The wiring is not the problem. Covariate arrays align with the target calendar, and Chronos-2 normalises internally — multiplying a covariate by 1,000 changes the forecast by 1e-7 relative, which is float noise.

**What the round-1 diagnosis found**, on 40 consecutive 2026 cut-offs with Chronos-2, mean RPS against a univariate baseline (measured under the value-date covariate join, since corrected — see below):

| Covariate passed | t+1 | t+5 |
|---|---|---|
| *(none — baseline)* | 0.1688 | 0.1527 |
| `silver` — same source, same fix, genuinely co-moving | **−0.0015** | +0.0025 |
| White noise | +0.0065 | +0.0149 |
| **A random walk, unrelated to gold** | **+0.0216** | **+0.0389** |
| `usd_rub` — a real macro covariate | +0.0222 | +0.0321 |

**A meaningless random walk does as much damage as a real macro covariate.** Repeated across four independent draws: +0.0158, +0.0176, +0.0205, +0.0249 at t+1 and +0.0194, +0.0243, +0.0288, +0.0324 at t+5. The effect is consistent and large.

**White noise does markedly less damage than a random walk.** That is the tell. White noise offers no structure to latch onto; two independent integrated series *do* appear strongly related over any finite window — the Granger–Newbold spurious regression, reproduced inside a foundation model's in-context learning. The model infers a relationship that does not exist and forecasts on it.

`silver` is the one covariate that does no harm, and it is the one genuinely co-integrated with the target rather than merely trending alongside it.

## What the review corrected — and what the corrected probe found

A same-day review of the round-1 harness found two defects:

1. **The covariate join leaked one session.** FRED dates a value by its US close — 10–14
   hours *after* CBR has already fixed the next day's price, because the CBR fix dated D
   is set the working day before D. Joined by value date, every cut-off saw a US close
   postdating the t+1 outcome it predicted. The join now runs on knowledge days (FRED
   value date +1 — `scripts/gold_poc_data.py`), which is REQ-407 applied across sources.
   The leak was in the covariates' favour, so round 1's damage numbers are, if anything,
   understated.
2. **Round 1's standard errors ignored horizon overlap.** t+5 is scored daily while each
   outcome spans five sessions, so adjacent paired differences share four of them. The
   paired comparison now uses Newey–West errors with lag = horizon − 1.

**Round 2 — the same configurations on 40 cut-offs spread across 2025** (a window no
report decision may touch 2026 to answer) found **no damage from anything**: all-10
levels under the leaky join scored +0.0015 at t+1 against 2026's +0.0209, and the random
walk −0.0014 / +0.0036 against 2026's +0.0216 / +0.0389. Every interval includes zero.

**The damage manifests only where the models are out of their training data.** 2025 sits
inside both corpora by any reading; a partly memorised continuation barely reacts to
covariates. The full 143-day 2026 window shows the damage across Jan–Aug — many regimes —
so a regime explanation does not survive, and memorisation is the plausible mechanism.
Two things follow. First, the contamination boundary (`CLEAN_FROM = 2026-01-01`) is now
**demonstrated**, not assumed: the same experiment answers differently on the two sides
of it. Second, no probe window can stand in for the report window — which is an argument
*for* this ADR's decision, because a control rung is scored on the report days themselves.

## Decision

**We will score a random-walk covariate as a permanent control rung, and admit no covariate that fails to beat it.**

Concretely:

1. A `*_rwcov` rung is added beside each `*_cov` rung: identical in every respect except that its covariate is a synthetic random walk with no relationship to the target, seeded per run and recorded.
2. **A covariate set is only reported as informative if the `_cov` rung beats the `_rwcov` rung** on a paired per-day comparison. Beating the univariate rung is not sufficient and beating climatology is not sufficient — both can be satisfied by a covariate contributing nothing.
3. The control is scored and published like any other rung, never hidden as a diagnostic.

This is the covariate analogue of two controls the project already runs: the baseline-blind control (ADR-0029), which measures anchoring rather than skill, and the shuffle test (REQ-1208), which measures what survives destroying the signal.

## Alternatives considered

- **Drop covariates entirely.** Rejected: it discards REQ-504's second configuration and, worse, it would remove the measurement that produced this finding. The covariate rungs are informative *because* they can be compared against a control.
- **Difference the covariates to stationarity**, the standard econometric answer to spurious regression. **Not resolved, and the original rejection here overclaimed.** What was tested on 2026 days was 20-*session* overlapping changes — still near-integrated (lag-1 autocorrelation ≈ 0.95), a straw man for stationarity — and it scored **+0.0351** at t+1, worse than levels at +0.0209. The honest transform, 1-day changes, was then tested in round 2 and was indistinguishable from univariate — but so was *everything* on that window, including the random walk, so the probe had no discriminating power. Differencing therefore remains **unproven as a remedy rather than disproven**. The control rung answers it properly: once live days accumulate, a 1-day-changes configuration can be scored beside its own random-walk control on days no model has trained on.
- **Restrict covariates to co-integrated series only.** Attractive — `silver` is the one that works — but co-integration would have to be tested per pair, per instrument, on a rolling basis, and a test that passes in-sample is exactly what spurious regression defeats. The control rung measures the same thing without requiring the test to be right.
- **Treat the finding as specific to Chronos-2.** Rejected as unsafe: TimesFM's covariate rung is also detectably worse, by a similar margin, through a completely different mechanism (XReg regression). Two independent implementations degrading the same way is evidence about the data, not about one library.

## Consequences

**The most important consequence is retrospective.** [ADR-0047](0047-ladder-rung-identity.md) makes the **covariate-informed** configurations rungs 3 and 4 — *"the rival handed the same severity signal the agent reasons about"* — and therefore the bar the agent is measured against. If that bar is systematically handicapped by spurious regression, **the agent beating it means less than it appears**, and the headline skill figure is inflated by an amount nobody has measured. The control rung is what turns that from an unknown into a number.

**Harder.** Two more rungs to score and report. At POC scale that is seconds; at eleven instruments it is a real cost, and the ladder table gets wider.

**Easier.** Adding a covariate becomes a decision with evidence attached rather than a plausible story. The event-severity series that increments 6–7 produce will face the same test before it is believed.

**A warning that now has a number behind it.** Feeding event severity to the numeric models as a covariate — the plan for rungs 3 and 4 — may degrade them. That is worth knowing before the eleven-year classification batch (T5.9) is run to produce that series.

**Probes cannot substitute for the control.** Round 2 showed the covariate effect is
window-dependent — absent on in-training days, large on out-of-training days. Any
offline probe on permissible (pre-2026) data therefore measures the wrong regime, and
the only honest price for a covariate is a control scored on the same live days as the
rung it accompanies. This closes the tempting shortcut of "we probed it once, covariates
are fine now".

## Revisit trigger

A covariate set beats its random-walk control by a detectable margin on a paired comparison over at least 250 scored days — at which point the control has done its job and the question becomes which covariates earn their place, **or** a Chronos-2 or TimesFM release documents a change to in-context covariate handling.
