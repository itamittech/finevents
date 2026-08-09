# ADR-0035: Backfill execution — bulk phase then sequential replay

- **Status:** **Phase 1 accepted and retained; Phase 2 removed by [ADR-0037](0037-forward-only-agent-learning.md)**
- **Date:** 2026-08-09
- **Serves:** ADR-0007 (backfill), ADR-0016 (point-in-time)

> **Amendment note (2026-08-09):** [ADR-0037](0037-forward-only-agent-learning.md) removes Phase 2 sequential replay entirely — the agent never runs against a historical date, at any scope. The open question this ADR left ("replay scope") is therefore closed by withdrawal rather than by selection.
>
> **Phase 1 is retained and now carries more weight than when it was written.** It was framed here as a precursor to replay; with replay gone it stands on its own, because historical event classification is what makes [ADR-0038](0038-wiki-seeding-tagged-and-toggleable.md)'s deterministic wiki seed possible, and Chronos/TimesFM historical forecasts are what calibrate Lane A. **The stateless-overlay constraint below binds exactly as recorded** — the seed is a join over classified events, so any cross-date dependency in the overlay would corrupt it just as it would have corrupted batched classification.
>
> The Phase 2 cost analysis below (~$1,580 full replay) is retained as the record of why replay was abandoned. Original text preserved unedited.

## Context

Eleven years must be replayed through a pipeline built to process one day. The naive options are both wrong: full sequential replay is needlessly slow, and bulk-building the wiki bakes hindsight into the foundation every later result rests on.

The correct split follows from **which stages have cross-date dependencies**.

## Decision

### Two phases

**Phase 1 — bulk, batched, order-independent:**

| Stage | Why it is safe to batch |
|---|---|
| Event classification and severity scoring | An event's CAMEO code, actors, geography and severity depend **only on that event** and the overlay formula. No other date's data, no wiki state. |
| Chronos-2 and TimesFM forecasts | Each depends only on the price window as of its own date. No wiki dependency. |

Both run through Bedrock Batch Inference and batched local inference respectively, in any order, at 50% of on-demand rates.

**Phase 2 — sequential, date by date, in order:**

Assemble prompt (reading the wiki as of that date) → predict → score matured predictions → consolidate the wiki → write the run manifest.

**This must be sequential** because day D's wiki state depends on day D−1's consolidation. Breaking that chain means the backtest is not testing the real system — it is testing a system that had a wiki it could never have had.

### The constraint that keeps Phase 1 safe

**Bulk classification is only valid while the severity overlay stays stateless.** If the overlay ever incorporated something like "how unusual is this event relative to recent history", classification would acquire a cross-date dependency and would have to move into Phase 2.

This is a real design constraint on ADR-0011's overlay, recorded here so it is not violated by accident.

### Replay edge cases

- The first five dates have incomplete scoring — no matured predictions to learn from yet.
- The final five predictions never mature within the window and are excluded from scoring, not counted as misses.

## Open: replay scope, and a cost correction

**The backfill cost figure previously recorded (~$1.87) covered only Phase 1.** Phase 2 was not costed, and it is not small.

Sequential replay makes 11 predictor calls plus one consolidation call per date. Over ~2,750 trading days at Nova Premier rates:

| | Tokens | On-demand | Batched (50%) |
|---|---|---|---|
| Input | ~342M | $855 | $428 |
| Output | ~58M | $725 | $363 |
| **Total** | | **~$1,580** | **~$790** |

**Batch Inference may not apply cleanly to Phase 2** — its sequential dependency conflicts with batch submission, since each date's prompt depends on the previous date's consolidation. The realistic figure is therefore closer to the on-demand column.

This is roughly **fifty times the entire rest of the project's cost**, and it changes the shape of the decision. Options are set out for decision rather than chosen here:

- **Replay only the post-contamination-cutoff window.** L11 already requires weighting conclusions toward post-cutoff data, so the expensive replay and the scientifically interpretable window are the same period. Cost scales down proportionally.
- **Sample dates** rather than replaying every one — every *n*th date, or event days only.
- **Seed wiki evidence deterministically.** Event-to-outcome pairing is a plain join requiring no model: "event type X occurred on D, instrument Y moved Z σ". That gives correlation pages an observation base cheaply, with agent-driven learning reserved for the focused replay window. Changes what "the agent learned it" means, and needs thought.
- **Full replay anyway**, accepting the cost as the price of a complete history.

**No backtest number should be quoted until this is settled**, since the scope determines what the number means.

## Alternatives considered

- **Full sequential replay of every stage.** Maximum fidelity — one code path, no special cases. Rejected: sequences classification and numeric forecasting that have no cross-date dependency, for no correctness gain.
- **Bulk-build the wiki, then backtest against it.** Fastest by far. Rejected: the wiki would be built with hindsight across the whole period, a point-in-time violation underneath every subsequent result.

## Consequences

- Phase 1 is cheap, fast, and parallel; Phase 2 is the expensive and slow part, and its scope is the main cost lever in the project.
- The same code path serves live runs and Phase 2 replay, with `as_of` as the only difference — which is what makes the backtest meaningful.
- **A stateless-overlay constraint now binds ADR-0011.** It should be asserted, not assumed.
- Wall-clock: Phase 1 in hours; Phase 2 at 2,750 sequential iterations, each involving 12 model calls, is the long pole and does not fit one AgentCore session — it needs checkpointing and resumption.
- Checkpointing must be manifest-aware: a resumed replay picks up from the last written run manifest (ADR-0026), which already provides exactly the needed marker.

## Revisit trigger

Replay scope is settled — at which point this ADR is amended with the chosen scope and its costed figure.
