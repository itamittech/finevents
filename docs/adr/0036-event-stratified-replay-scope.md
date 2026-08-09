# ADR-0036: Event-stratified replay over four instruments

- **Status:** **Superseded by [ADR-0037](0037-forward-only-agent-learning.md)** — historical replay is withdrawn in full
- **Date:** 2026-08-09
- **Settles:** the open scope in [ADR-0035](0035-backfill-execution-model.md)
- **Implies a change to:** [ADR-0027](0027-model-selection-as-configuration.md) — see "Live model must follow" below

> **Superseded 2026-08-09, same day, by [ADR-0037](0037-forward-only-agent-learning.md).** This ADR asked the right question — *how do we buy a backtest cheaply?* — and answered it well at $24. The better question turned out to be whether to buy one at all. Every replay design, this one included, produces a number contaminated across its pre-cutoff majority (L11) and requires the full as-of reconstruction machinery, which is where seven of eleven leakage vectors live. Running the agent forward only removes both by construction and costs nothing.
>
> **Three things below survive the supersession and are carried into ADR-0037 and [ADR-0039](0039-live-shadow-model-ab.md):**
> - The **four-instrument set** — gold spot, NIFTY 50, S&P 500, MCX gold — chosen for mechanism coverage rather than count. It becomes the shadow A/B's instrument set.
> - The **argument against monthly aggregation**, which is unaffected by forward-only and remains the standing answer to "can we compress history to save money."
> - **Nova Pro as the reasoning default**, and the reasoning that a backtest must measure the system actually run. Under forward-only there is no backtest to mismatch, but the A/B requirement it reinforced is carried forward.
>
> Original text preserved unedited below.

## Context

Sequential replay is the dominant cost in the project — ~$1,584 for a full eleven-year replay at Nova Premier over eleven instruments, roughly fifty times everything else combined. The stated constraint is to stay under about $100.

**Aggregating history into months was considered and rejected.** Events do not aggregate: a geopolitical shock on 12 March and a Fed surprise on 20 March collapse into "March had two events," destroying the event-to-reaction pairing that is the unit of analysis in this entire system. It would also change the product rather than its cost — the system predicts t+1 and t+5, so a monthly backtest could not tell you whether the daily live system works.

**The correct reframe:** eleven years of *data* is already free, because deterministic seeding builds the wiki's observation base at zero model cost (ADR-0035). What costs money is **replayed dates × instruments per date**. Those are the only two dials, and neither has anything to do with how much history informs the wiki.

## Decision

### Event-stratified date selection

Rank all post-filter days by financial severity score (ADR-0011). Replay:

- **~140 highest-severity days**, spanning the full eleven years
- **~140 matched quiet-day controls**, each paired with an event day on **calendar position and regime state**

**This is better science than uniform sampling, not merely cheaper.** Uniformly sampling 300 dates yields perhaps 30–45 event days — too thin to measure an event effect. Stratifying puts the sample where the signal would be, while spanning multiple market regimes rather than one recent window.

**The matched controls are not optional.** Without quiet days the climatology baseline is computed over a non-representative sample, and abstention and coverage behaviour (ADR-0013) cannot be measured at all.

### Four instruments

| Instrument | Mechanism covered |
|---|---|
| Gold spot (USD/oz) | Metals; geopolitical and risk-off |
| NIFTY 50 | India equity |
| S&P 500 | US equity |
| MCX gold (INR) | Domestic and currency leg (ADR-0003) |

Chosen for **mechanism coverage rather than count**. Notably, keeping both NIFTY and S&P preserves the India/US timezone-lag pattern (ADR-0009) as testable — one of the few genuinely non-arbitraged effects available.

### Nova Pro as the replay reasoning model

### Live model must follow — flagged for confirmation

**A backtest measures the system you actually run.** Replaying on Nova Pro while running Nova Premier live would produce a skill estimate that does not transfer.

The coherent consequence is therefore that **Nova Pro becomes the live reasoning model too**, amending ADR-0027's default. This also drops live Bedrock cost from ~$16.90 to ~$5.00/month.

This is recorded as the implied reading; if the intent was to keep Premier live, the replay model must change to match instead.

**ADR-0027's A/B harness becomes more important under this choice, not less** — it is the only thing that would reveal Nova Pro as the limiting factor rather than the approach. At this configuration the A/B costs about **$12** (30 dates × 4 instruments, run under both Pro and Premier), which is cheap insurance against an uninterpretable result.

### Cost

| Line | Figure |
|---|---|
| 280 dates × 4 instruments, Nova Pro | **~$24** |
| Same at Nova Premier, for comparison | ~$85 |
| Model A/B on 30 dates, both models | ~$12 |

## Alternatives considered

- **Monthly aggregation.** Rejected on the grounds above — destroys event-to-reaction pairing and changes the product.
- **Post-cutoff window only, 11 instruments, Premier (~$173).** Cleaner contamination story since every replayed date is interpretable. Rejected on cost, and it covers only one market regime.
- **Full replay, 2,750 dates (~$1,584).** Complete and continuous. Rejected: fifty times the rest of the project, and the pre-cutoff majority buys contaminated results anyway.
- **Event-stratified across all 11 instruments (~$161).** Every live series also backtested. Rejected on cost.

## Consequences

- **~2,240 scored predictions** (280 dates × 4 instruments × 2 horizons). Sufficient for aggregate skill measurement; **thin for per-instrument claims**, which should be reported with that caveat.
- **Seven instruments run live but are never backtested.** The mechanism under test is shared, but their specific behaviour is unvalidated.
- Spanning all eleven years covers multiple regimes — 2020, rate-hike cycles — which a recent-window design would miss entirely.
- **The sample includes contaminated pre-cutoff dates.** L11 reporting still applies: results split by pre- and post-cutoff, two numbers rather than one. Stratification does not replace contamination analysis.
- **Cheap enough to re-run.** At $24 the replay can be repeated whenever the prompt, filter, overlay or model version changes — which matters, because every one of those invalidates prior results. A $1,584 replay would have been run once and defended thereafter.
- Severity ranking must be computed with the **overlay version stamped**, or the sample itself shifts when the formula changes.
- Control matching on calendar and regime is real work and needs its matching criteria specified.

## Revisit trigger

Aggregate results prove too noisy at 2,240 scored predictions to distinguish the agent from baselines — at which point either the date count or the instrument count must rise, and the cost with it.
