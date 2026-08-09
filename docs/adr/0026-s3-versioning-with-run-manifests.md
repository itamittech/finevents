# ADR-0026: S3 object versioning with per-run manifests as the wiki's version control

- **Status:** Accepted
- **Date:** 2026-08-09
- **Amends:** [ADR-0005](0005-llm-wiki-as-knowledge-layer.md), [ADR-0016](0016-bitemporal-data-model-with-as-of-gateway.md) — both specified "git commit"
- **Serves:** Point-in-time reads, dashboard diffs, revert

## Context

"Versioned" was doing ambiguous work across the design. ADR-0005 and ADR-0016 both specified that wiki reads resolve to "the git commit as of the requested time"; the architecture document specified S3 with versioning enabled. Those are different mechanisms, and the difference is load-bearing because point-in-time correctness depends on it.

Four requirements were established across earlier ADRs:

| Requirement | Source |
|---|---|
| Read the wiki as it stood at any past timestamp | ADR-0016 |
| Readable diffs — "what did the agent learn this week" | ADR-0005, ADR-0020 |
| Revert a bad learning episode | ADR-0005 |
| Atomicity — one run touching five pages is one logical unit | Implied by all three |

**Git is one way to satisfy these, not the only way.** Diffs do not require git; they require two versions of the same text. Point-in-time does not require git; it requires timestamped versions. What git uniquely contributes is atomic multi-file commits and familiar tooling — and the first of those is solvable with a manifest.

Against that, git needs somewhere to live. CodeCommit is closed to new customers, so a real git store of record realistically means GitHub — putting an external service and a rotating token in the daily pipeline's critical path, for a system whose defining asset is a knowledge history that must not become unreadable.

## Decision

**S3 object versioning is the store of record.** Each pipeline run writes a manifest recording every object version it created, giving commit-like atomicity without git.

### Manifest

Each run writes, as its final action:

```
wiki/_runs/{run_id}.json
  { run_id, run_timestamp, parent_run_id,
    entries: [ { path, version_id, operation } ] }
```

**The manifest is written last, after every page write has succeeded.** This is what makes a run atomic: a run that fails midway leaves object versions that no manifest references, and readers never see them. A partial run is invisible rather than half-applied — no rollback logic required.

**Orphaned versions are reported, not ignored.** An object version referenced by no manifest means a run failed after writing pages; that should surface as an alert, since silently discarding it would hide a broken run.

### Reading as of a timestamp

The manifest chain *is* the commit log. `AsOfRepository(as_of)` folds every manifest with `run_timestamp <= as_of` in order, later runs overriding earlier ones per path, and resolves each page to its recorded `version_id`.

**Periodic snapshot manifests** — full state rather than incremental — bound the fold. Reading as of T becomes the latest snapshot ≤ T plus the incremental manifests after it. This is the same idea as a packfile checkpoint, and it keeps read cost flat as history grows.

This is more efficient than listing object versions per page: manifests are small and few, and one read of the chain resolves the whole wiki.

### Diffs and revert

**Diffs:** two `version_id`s for a path, fetched and diffed as text. The dashboard (ADR-0020) renders them; no git required.

**Revert:** write the older content back as a *new* version, recorded in a new manifest. History is append-only — a revert is a forward operation, never a deletion.

### Immutability

**Object versions are never deleted.** Production buckets carry a policy denying `DeleteObjectVersion`. Per ADR-0024, the learning history is the one asset in this system that cannot be reconstructed — code can be rewritten and scraped data re-fetched, but months of accumulated agent knowledge and dated prediction records cannot.

**Manifests are as critical as the pages themselves.** A lost or corrupted manifest makes history unreadable even though every object version still exists. They get the same protection as wiki content, and manifest-chain integrity should be asserted in CI.

## Alternatives considered

- **Git as the store of record.** What ADR-0005 and ADR-0016 originally specified. Genuine atomic commits and the richest tooling. Rejected: realistically requires GitHub, placing an external service and a token in the daily pipeline's critical path, for capabilities the manifest approach already provides.
- **S3 store of record plus a nightly GitHub mirror.** Attractive — pipeline reliability never depends on GitHub, but humans get real git history to explore. Rejected for v1 as two representations to keep in sync for an ergonomic benefit a small CLI can deliver more cheaply. **This is the natural first addition if hand-inspection proves painful.**

## Consequences

- No external dependency; the pipeline stays entirely within AWS, consistent with ADR-0024's single-account model.
- Point-in-time resolution is exact, cheap, and deterministic — so it replays identically under truncated replay (ADR-0018), which a git-over-network read would complicate.
- Atomicity comes from write ordering rather than a transaction, which is simpler and has no failure mode beyond an alertable orphan.
- **It reimplements a slice of git.** The manifest fold, snapshot compaction, and diff rendering are all code we own and must test — modest, but real, and a bug in the fold silently returns the wrong historical state.
- **No familiar CLI for poking at history by hand.** A small helper (`wiki log` / `show` / `diff`) restores most of the ergonomics cheaply and is worth building early — debugging a bad prediction means reading historical wiki state, and doing that through the dashboard alone will be painful.
- Snapshot cadence is a tunable: too rare and reads slow as the chain grows, too frequent and storage grows unnecessarily.
- Manifests must be written even for no-op runs, or "nothing changed" becomes indistinguishable from "the run failed before writing".

## Revisit trigger

Manifest-fold read latency becomes a bottleneck at backtest scale despite snapshots, **or** hand-inspection of wiki history proves painful enough to justify the GitHub mirror.
