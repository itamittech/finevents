# ADR-0025: No managed knowledge base; deterministic wiki index instead

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** ADR-0005 (LLM Wiki), ADR-0016 (point-in-time), wiki retrieval strategy

## Context

The knowledge layer is a git-versioned markdown wiki in S3 (ADR-0005). The reasonable question is whether Bedrock Knowledge Bases — AWS's managed RAG service — should sit in front of it, chunking and embedding pages into a vector store with managed retrieval.

**Cost is no longer the deciding factor.** OpenSearch Serverless, the default backing store, carries a standing minimum of roughly $172/month at the dev tier and up to ~$700/month for a non-dev collection — which would have dwarfed this system's entire ~$32–50/month budget. But **S3 Vectors**, launched December 2025 at $0.06/GB/month, removes that floor almost entirely. A knowledge base is now affordable here. The decision therefore rests on whether it fits, not what it costs.

It does not, for three reasons — the first of which is disqualifying.

## Decision

**No managed knowledge base.** The wiki is read directly from S3 through the as-of gateway, with a deterministic index maintained by the pipeline.

### 1. A knowledge base cannot satisfy point-in-time correctness

This is decisive on its own. ADR-0016 requires every backtest read to resolve to the knowledge available *as of* the simulated prediction date; wiki reads resolve to the git commit at that timestamp.

**A knowledge base maintains a single current index.** There is no way to query it as it existed on 14 March 2019. A backtest running against it would retrieve knowledge derived from after the prediction date — leakage vector **L1 (wiki state)** — not as a bug to be fixed but as an unavoidable property of the service. Satisfying point-in-time correctness would mean rebuilding and re-indexing the knowledge base at every simulated date across an eleven-year backtest, which is not practical.

The entire validity of this project rests on backtests that are not contaminated. A component that structurally prevents that cannot be in the read path.

### 2. Retrieval here is deterministic, not semantic

Semantic search solves the problem *"I don't know which document contains the answer."* **We always know.**

By the time the agent reasons about an event, it has been classified (ADR-0011) into a CAMEO code plus a financial category, and the instrument is one of eleven. The pages needed are computable by key:

```
instruments/gold.md
events/geopolitical-conflict.md
correlations/geopolitical-conflict__gold.md
```

That is a join on structured keys, not a similarity search. Embedding those pages to retrieve them approximately, when they can be addressed exactly, adds a failure mode (retrieving a near-miss page) in exchange for nothing.

### 3. It reintroduces what the wiki pattern replaced

ADR-0005 chose the LLM Wiki specifically because RAG re-searches raw documents on every query, so knowledge never compounds. Putting a retrieval index in front of the wiki restores the pattern the wiki was adopted to avoid.

### What we build instead

A **deterministic index**, maintained by the pipeline and committed alongside the wiki:

- A manifest mapping `(instrument, event_category)` → page paths.
- Regenerated whenever pages are created, renamed, or removed.
- **Versioned in git with the wiki**, so it resolves through the as-of gateway and is point-in-time correct for free.
- Zero marginal cost, exact rather than approximate, and testable.

This also closes the previously-open question of wiki retrieval strategy as page count grows. At v1 scale the knowledge wiki is roughly 50–150 pages — well inside ADR-0005's ~500-page revisit trigger — and a manifest scales considerably further than that.

## Alternatives considered

- **Bedrock Knowledge Base on S3 Vectors.** Now affordable, and the option to revisit if the need arises. Rejected on point-in-time incompatibility, which cost does not fix.
- **Bedrock Knowledge Base on OpenSearch Serverless.** Rejected on both counts — the same point-in-time problem, plus a standing cost several times the entire system's budget.
- **Self-hosted vector index over the wiki.** Would allow point-in-time indexes to be built per simulated date. Rejected: significant machinery to approximate a lookup we can perform exactly.
- **Knowledge base over `raw/` articles only, not the wiki.** The most defensible variant — raw articles are unstructured and never read during prediction, so point-in-time would not apply. Rejected for v1 as unnecessary: articles are classified once at ingest and distilled into the wiki; nothing queries them afterwards.

## Consequences

- Point-in-time correctness stays achievable, and the leakage harness keeps its guarantees.
- Retrieval is exact and deterministic, so it replays identically under truncated replay (ADR-0018) — an embedding-based retriever would not.
- No vector store, no embedding model, no sync pipeline, no index-staleness window after a steering edit.
- **The manifest is now a maintained artefact.** A stale manifest silently hides pages from the agent — the same failure class as a stale festival table (ADR-0017). Regeneration must be part of the wiki write path, not a separate job, and manifest-versus-filesystem consistency should be asserted in CI.
- Free-text search over the wiki in the dashboard becomes a client-side concern. At 50–150 markdown files this is trivial; at several thousand it would need revisiting.
- If v2 expands to individual equities (ADR-0009), page count grows roughly with the instrument set — the manifest handles this, but the revisit trigger below should be watched.

## Revisit trigger

The wiki exceeds ADR-0005's ~500-page trigger **and** deterministic key-based selection stops returning the right pages — for example if correlation pages fragment into many near-duplicate variants that no single key addresses. At that point a knowledge base over `raw/` articles, or a self-built point-in-time index, becomes the candidate — **not** a managed knowledge base in the prediction read path, which remains incompatible with backtesting regardless of scale.
