# ADR-0016: Bitemporal data model with an as-of gateway

- **Status:** Accepted — **amended by [ADR-0026](0026-s3-versioning-with-run-manifests.md)**
- **Date:** 2026-08-09
- **Serves:** Point-in-time correctness across ADR-0005, 0007, 0008, 0011, 0012

> **Amendment note (2026-08-09):** Where this ADR says wiki reads resolve "to the git commit as of the requested time", ADR-0026 substitutes **the manifest-folded state as of that time** — every per-run manifest with `run_timestamp <= as_of`, folded in order, resolving each page to its recorded S3 `version_id`. The requirement is unchanged: wiki reads go through the gateway and never see state written after `as_of`. The original decision text is preserved unedited.
- **Detail:** [Point-in-Time Leakage: Threat Model and Test Harness](../design/point-in-time-test-harness.md)

## Context

Point-in-time leakage is the highest-severity risk on this project. It fails silently, its symptom is *improved* backtest results, and it is typically discovered only when live performance collapses to baseline.

Ten distinct leakage vectors are catalogued in the threat model — wiki state, volatility windows, climatology baselines, severity overlay tuning, consensus revisions, data vintages, index composition, event timestamps, cross-market timing, and feature normalisation. They share one root cause: **a single timestamp per record cannot distinguish when something happened from when we could have known it.**

Those are routinely different. A GDP figure for Q2 is revised in September. A price bar for a 15:30 close is published minutes later. A GDELT event dated Tuesday may enter the database Wednesday. With one timestamp, every one of those gaps is a place to accidentally read the future.

Testing alone cannot solve this. A correct query and a leaking query differ by a `WHERE` clause, and the leaking one runs fine and produces better numbers.

## Decision

We will adopt a bitemporal data model and route all backtest reads through a single as-of gateway.

**Every record carries two timestamps:**

- **`event_time`** — when the thing happened in the world.
- **`knowledge_time`** — the earliest moment we could have known it.

**Revisions append; they never overwrite.** Every vintage of a revised figure is retained. "What did we believe about Q2 GDP on 15 August" must be answerable, and an updated row makes it unanswerable forever.

**All reads go through `AsOfRepository(as_of)`**, which returns only records where `knowledge_time <= as_of`. No component reads a store directly; ingest writes, everything else reads through the gateway. This is enforced by an architecture test asserting no storage client is imported outside `ingest/` and `repository/`.

**Wiki reads resolve through the gateway too**, to the git commit as of the requested time rather than the working tree.

**Wall-clock access raises in backtest mode.** `datetime.now()` and equivalents are unavailable; the only time is the injected `as_of`. A rolling window that silently anchors on "now" rather than the simulated date is a large real class of bug that this makes impossible rather than merely unlikely.

## Alternatives considered

- **Single timestamp plus careful queries.** Rejected: correctness depends on every developer remembering, on every query, forever. The failure mode is silent and rewarding.
- **Snapshot the database daily and backtest against snapshots.** Rejected: storage cost scales with history, wiki git state is awkward to align, and it cannot represent revisions that arrive between snapshots.
- **Bitemporal for prices only.** Rejected: events, consensus forecasts and wiki state carry the same hazard. Consensus revision (L5) and wiki state (L1) are among the most likely vectors.

## Consequences

- Leakage becomes structurally difficult rather than a matter of discipline, and the surface where it can hide reduces to one auditable module.
- **Every store's schema is affected.** This must be in place from the first ingest code — retrofitting bitemporality onto populated stores means reconstructing `knowledge_time` for historical records, which for some sources is impossible after the fact.
- Backfill (ADR-0007) must derive `knowledge_time` per source at ingest. GDELT supplies database insertion time; Stooq CSV requires inferring publication lag from close. Where it cannot be determined, a documented conservative estimate is used and flagged.
- Query complexity rises modestly; the gateway absorbs it.
- Storage grows because revisions accumulate. Negligible at this volume.
- The as-of gateway is a single point of failure for correctness — which is the intent. One module to audit, one place a bug can hide, one place to test exhaustively.

## Revisit trigger

Truncated-replay testing (Layer 2 of the harness) reveals leakage the gateway should have prevented, indicating the abstraction is incomplete or is being bypassed.
