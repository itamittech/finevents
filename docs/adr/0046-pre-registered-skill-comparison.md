# ADR-0046: The pre-registered skill comparison

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** REQ-903, REQ-806, REQ-809, REQ-1208, REQ-1209, REQ-1213
- **Amends:** [ADR-0032](0032-no-ensembling-three-independent-tracks.md) (the "best-performing rung" reporting rule), [ADR-0045](0045-tuning-window.md) (what the post-window record can claim)
- **Evidence:** [Power analysis](../analysis/power/results.md)

## Context

The project's stated success criterion is that **a null result is believable** (`Product.md`). Every other decision serves it — forward-only removes contamination, the ladder makes the claim falsifiable, scoring has no model in it so nothing can grade its own homework.

But no document defines the statistic. `REQ-903` specifies "agent RPS minus best-baseline RPS over elapsed days" and stops there: no interval, no test, no aggregation unit, no correction for taking a minimum over correlated tracks, and no statement of what effect the design is powered to detect. `ADR-0037:71` acknowledges that cross-instrument correlation puts effective sample size "well below the raw figure" and asserts "the direction holds" without computing it. `ADR-0032:78` names the hazard in "best baseline" and assigns it to nobody.

**An underpowered test cannot produce a believable null.** At low power, failing to detect an effect says nothing about whether one exists. So the missing calculation is not a reporting detail — it is load-bearing for the project's central claim.

The [power analysis](../analysis/power/results.md) now supplies it. Three findings force this ADR:

1. **At the design's own milestone (~190 post-tuning days), power to detect a strong-for-finance edge (ρ = 0.05, R² = 0.25%) is 9%.** A 5% test rejects 5% of the time under the null. The minimum detectable effect at month 13 is R² ≈ 4%, which for next-day moves from public event data is not a plausible effect size.
2. **`best baseline`, resolved per day, is biased against the agent by roughly ten times a realistic edge.** The per-day minimum over four similar tracks is an oracle that picks the winner after the outcome is known. Simulated, a genuinely better agent is reported as *losing* by 0.0025 RPS while genuinely beating the best single track by 0.0002. This is bias, not variance; no amount of data fixes it.
3. **The binding constraint is κ** — the share of the agent's forecast error common across instruments — not the instrument count. Widening from 11 to 100 instruments barely moves the timeline, because a common error component is irreducible by any weighted average.

## Decision

**The skill comparison is pre-registered here, before go-live, and not changed afterwards** — for the same reason [ADR-0045](0045-tuning-window.md) fixes the tuning window in advance: choosing the statistic after seeing the data is indistinguishable from choosing a favourable one.

### The primary endpoint

| Element | Decision |
|---|---|
| **Statistic** | Paired RPS difference, agent-raw minus comparator, on identical live days |
| **Comparator** | **One pre-specified track: the better of Chronos-2 and TimesFM 2.5 in their covariate-informed configuration, fixed once at the end of the tuning window and never re-chosen.** Not a per-day minimum |
| **Aggregation unit** | The **day**. Instruments are averaged within a day first; the day is the independent unit |
| **Horizon** | **t+1 only.** t+5 is a secondary endpoint |
| **Interval** | Stationary block bootstrap over days, block length 10, 10,000 resamples |
| **Test** | One-sided at α = 0.05. The hypothesis is directional — event reasoning helps or it does not |
| **Reported** | Point estimate **and interval, always together.** A point estimate alone is not a result |

The comparator is the *covariate-informed* configuration deliberately: [ADR-0030](0030-chronos-as-baseline-and-shown-forecast.md) called it "the actual test of the wiki thesis" — the rival handed the same severity signal the agent gets. Comparing against the univariate track instead would make "the agent beats Chronos" a materially weaker claim than the one this project exists to make.

### Secondary endpoints, reported but never headline

t+5; each ladder rung individually; event-day subsets; per-instrument breakdowns. All carry intervals. None is promoted to primary if the primary disappoints.

### What may be claimed, and when

**Month 11–13 does not produce a verdict.** It produces an interval. The pre-registered reporting language is:

> After N scored days, the agent's RPS differs from the comparator by X, 90% CI [L, U]. The design is powered to detect an effect of ρ ≥ R at this sample size; effects smaller than that are not distinguishable from zero with this record.

**A null may not be claimed until the interval excludes the smallest effect the project considers meaningful.** Until then the honest statement is *inconclusive*, and inconclusive must not be reported as null. This is the single most important line in this ADR: the failure mode it prevents is announcing "event reasoning does not help" on the strength of a test that could not have detected it.

### κ is measured, not assumed

The power analysis' central input is an assumption. **Once ~60 scored days exist, κ is estimated from the live record** — the realised correlation of the per-instrument RPS differences — and the analysis re-run with the measured value. The revised timeline is published, whichever way it moves.

### The too-good-to-be-true ceiling

REQ-1213's ceiling is set from the shuffle test's (REQ-1208) null distribution of this exact statistic, at a stated exceedance probability. That could not be specified before the statistic was.

## Consequences

- **The headline metric changes.** REQ-903's "best baseline" becomes one pre-specified comparator. `ADR-0032`'s "beat the best-performing rung" survives as *reporting* — every rung is still shown — but not as the inferential comparison.
- **The advertised timeline is wrong and must be restated.** "First interpretable aggregate skill figure ~month 11–13" is true only for an implausibly large effect. What arrives at month 13 is a first *interval*. Every document quoting month 11–13 needs that qualification.
- **Coherence and statistical power are in direct tension, and this is newly visible.** REQ-406's byte-identical regime block exists so eleven independent calls reason from one view of market state. That shared context is exactly what makes the agent's errors correlated, which is what caps effective sample size. Reducing κ means giving the predictor more instrument-specific context — weakening the mechanism REQ-406 exists to provide. **Not resolved here.** It is the most valuable open question the analysis surfaced.
- **ADR-0009's scope tension is quantified but not settled.** Widening the instrument set helps far less than expected once κ is realistic, so "add equities for power" is not the answer it first appeared to be. ADR-0009 stands.
- **A slower result is not a worse one.** Nothing here changes the architecture. Forward-only, the ladder, the leakage harness and the provenance model are all untouched and all still correct. What changes is the claim attached to the calendar.

## Alternatives considered

- **Report the point difference with no interval, as REQ-903 does today.** Rejected: it is what makes an underpowered result look like a finding, and it is the specific failure this project was built to avoid.
- **Keep `best baseline` as a per-day minimum.** Rejected on the simulation: it reports an oracle's advantage as the agent's deficit, at ten times the magnitude of the effect being measured.
- **Extend the tuning window until power is adequate.** Rejected: ADR-0045 forbids extension, and the required extension is measured in years rather than weeks.
- **Widen the instrument set to buy power** (reopening ADR-0009). Rejected on the evidence: 11 → 100 instruments barely moves the timeline once κ is realistic. It would add spurious-correlation surface for almost no statistical return.
- **Drop the skill claim and ship only the harness.** Rejected, but it is closer to reasonable than it sounds — `Product.md` already calls the harness a first-class deliverable, and it is shippable on day 1 while the skill claim is not.

## Revisit trigger

The measured κ from the first 60 scored days differs materially from 0.5, **or** the realised RPS variance differs materially from the simulated value — either changes the required sample size and therefore what may be claimed and when.
