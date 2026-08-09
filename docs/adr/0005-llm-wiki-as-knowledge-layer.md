# ADR-0005: Karpathy LLM Wiki pattern as the knowledge layer

- **Status:** Accepted — **amended by [ADR-0026](0026-s3-versioning-with-run-manifests.md)**
- **Date:** 2026-08-09
- **Serves:** Compounding learning, human steerability, prediction reasoning

> **Amendment note (2026-08-09):** ADR-0026 replaces the *mechanism* referred to below as "version control" and "a `git diff`". The wiki is versioned by **S3 object versioning with per-run manifests**, not a git repository — chosen to keep an external service out of the daily pipeline's critical path. Every requirement stated below is unchanged and still met: point-in-time reads, readable diffs, revert, and atomic multi-page updates. The original decision text is preserved unedited.

## Context

Project summary points 6, 7, 11 and 14 together require: knowledge that compounds without re-teaching, inspired by Karpathy's LLM Wiki, producing predictions, with the learning visible and steerable by a human.

Karpathy published the LLM Wiki pattern as a GitHub Gist in April 2026. Its structure:

- A `raw/` directory of source material the agent reads but humans do not hand-edit.
- A `wiki/` directory the agent writes, containing markdown **entity pages — one concept per page**.
- Pages interlink with `[[wiki-link]]` syntax, forming a navigable graph.
- Contradictions between sources are **explicitly flagged on the page** rather than silently resolved.
- A periodic **linting pass** (roughly every 20 new pages) where the agent audits its own wiki for accuracy — described as self-healing, and the mechanism that stops small errors compounding into organised misinformation.

The distinction from RAG is the decisive one for this project: RAG re-searches raw documents on every query, so knowledge never accumulates. The wiki pre-compiles into interlinked pages, so it compounds — which is precisely what point 6 asks for.

## Decision

We will implement the knowledge layer as an LLM Wiki following Karpathy's pattern, stored as version-controlled markdown.

**Structure:**

```
knowledge/
├── raw/          # scraped articles, price snapshots — agent reads, humans don't edit
└── wiki/
    ├── instruments/     # one page per instrument
    ├── events/          # one page per event type
    ├── correlations/    # one page per hypothesised event→instrument relationship
    └── predictions/     # dated, immutable prediction records
```

**Adaptations for this domain:**

- **Correlation pages carry evidence and confidence**, not just prose: observation count, hit rate, and the dated predictions that tested them. A correlation page is a falsifiable claim, not a note.
- **Contradiction flagging maps directly onto disconfirming evidence.** When an event produces the opposite of the predicted move, that is recorded on the correlation page rather than quietly averaged away. This is the mechanism that prevents the wiki from becoming a record of only its own successes.
- **The linting pass runs on a fixed cadence** and additionally re-scores correlation confidence against accumulated outcomes.
- **Version control is load-bearing**, not incidental. Diffing the wiki is how point 14's "show the agent improving" is answered concretely: what the agent believed about gold and Middle East conflict in March, versus now, is a `git diff`.

**Storage is markdown, not fine-tuned weights.** Fine-tuning is rejected: expensive, needs far more data than a daily-cadence system will accumulate, cannot be inspected, and cannot be steered by a human — which point 14 explicitly requires.

## Alternatives considered

- **Fine-tuning on accumulated data.** Rejected on all four counts above; the steerability requirement alone is disqualifying.
- **Vector store / conventional RAG over raw articles.** Rejected: knowledge does not compound, and retrieved chunks are not human-editable.
- **Structured database of correlation coefficients.** Rejected: captures the numbers but not the reasoning, and a human cannot correct a belief by editing a float. Note that we still store numbers — on the pages, as evidence.
- **Append-everything agent memory.** Rejected: degrades through context bloat, accumulated contradiction, and recency bias. The linting pass exists precisely to counter this.

## Consequences

- Knowledge is human-readable and human-editable, which makes the steering requirement (point 14) straightforward rather than a bespoke UI problem.
- Git history gives the learning curve for free, and allows reverting a bad learning episode.
- Prediction reasoning can cite specific wiki pages, making every forecast auditable.
- **Point-in-time discipline becomes critical and non-obvious.** When backtesting, the agent must read the wiki *as of* the prediction date, not its current state. Git makes this possible but it must be deliberately enforced — otherwise the system reads knowledge derived from the future and scores itself brilliantly on data it already knew. This is the single most likely way this project fools itself.
- Wiki size will grow; retrieval strategy needs revisiting as it does.
- Prompt caching over stable wiki context is a significant cost lever (project summary point 10).

## Revisit trigger

The wiki exceeds roughly 500 pages, **or** retrieval quality degrades such that the agent cites irrelevant pages in more than 10% of predictions — either indicates the flat-file-plus-links approach needs an index layer.

## Sources

- [Karpathy's LLM Wiki tutorial — Data Science Dojo](https://datasciencedojo.com/blog/llm-wiki-tutorial/)
- [Karpathy's LLM Wiki: A Knowledge Base That Compounds](https://www.aibuilderclub.com/blog/karpathy-llm-wiki)
