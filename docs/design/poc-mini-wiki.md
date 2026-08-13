# The POC mini-wiki — accreting memory for the reasoning layer

**Status:** design for P8c/P8d, agreed with the builder 2026-08-13.
**Confirmed lineage:** this is the Karpathy **WikiLLM** idea — the project's stated
learning model (CLAUDE.md: *"the agent's memory grows and is reused day over day
rather than being rebuilt each run"*) — built in miniature on the live track record
P5 already seals. Knowledge lives in text the model reads and cites; the weights
never change.
**Governing ADRs:** 0037 (forward-only), 0038 (provenance split), 0057 (Strands,
recording, bounded agency).

## The one principle

**Numbers are computed by code; the model writes only prose; the two never mix.**
A memory where the model keeps its own score drifts into self-flattery; a memory
that is only numbers never forms a hypothesis.

## Structure — one page per instrument, three layers

| Layer | Written by | Contents | Provenance |
|---|---|---|---|
| **Evidence rows** | code, append-only | Per scored day: events present (ids/URLs only), every rung's distribution, outcome, per-rung RPS. `ui/data/live.js` already is this | `observed` |
| **Computed statistics** | code, recomputed after each maturation | Hit rates and RPS by condition (by rung, by realised bucket, by event presence, moving days vs flat). May be **seeded** from the 143-day offline record — deterministic Lane-A output, a permitted use of history | `seeded` / `observed`, tagged per ADR-0038 |
| **Lessons** | the curator model, capped | ≤ 15 bullets, each **falsifiable** ("when X, expect Y within Z days") and each **citing evidence dates**. Uncited or vague lessons are deleted on sight | `observed` only — starts empty, accrues live |

Page budget ~2–3 KB, so the daily prompt stays small forever.

## The self-evolution loop

predict (reads the page) → outcome lands → code appends the evidence row and
recomputes statistics → **curator** (a second bounded Strands run, separate from
the predictor — production splits these roles on purpose) revises lessons against
the new evidence → tomorrow's prompt is different. Evolution without retraining.

Honesty mechanisms, all mandatory:

- **Falsifiable lessons only** — statable as a prediction the statistics can later
  score. "Markets were volatile" is not a lesson.
- **Retirement** — the curator must drop or revise a lesson the evidence has turned
  against; the statistics table makes this checkable rather than optional.
- **Caps** — the 15-bullet / ~3 KB ceiling forces prioritisation, which *is* the
  learning.
- **Versioning** — every day's page version is kept, append-only, so memory churn
  and the memory's own learning curve are plottable.
- **Measured, not believed** — two rungs seal daily: `llm_raw` (page withheld) and
  `llm_mem` (page included). Their paired per-day difference is the running value
  of memory. If lessons accumulate into noise, the number will say so.

## Daily summarisation — structural, not narrative

1. **Evidence row** — always (code; facts only).
2. **Day note** — model-written, one cited line, *only when notable* (a large miss,
   a moving-day hit, an event that coincided). Quiet days write nothing.
3. **Compaction** — when the lessons cap is hit, the curator merges, generalises,
   prunes. The cap plus citations *is* the summarisation strategy.

## Boundaries

- **Forward-only (ADR-0037):** the reasoning layer runs against today, only. Seeded
  statistics are the sole use of history, and they are deterministic.
- **Publication (REQ-1106/1107):** no article text in any committed file — event
  references are URLs + timestamps (REQ-1108). Prompt snapshots persist locally,
  hash-referenced from the sealed record.
- **Anchoring (ADR-0029's territory):** showing the model the numeric rungs'
  forecasts risks it merely repeating Chronos. Known, deferred, not denied — the
  baseline-blind control arrives with the production build.
