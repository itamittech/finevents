# ADR-0001: Spec-driven development with ADRs

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Process foundation for all requirements

## Context

FinEvents is a learning system whose behaviour changes over time by design. That creates a specific problem: when accuracy degrades six months in, we need to distinguish "the agent learned something wrong" from "we changed the system." Without a written record of intent and decisions, those are indistinguishable, and the eval framework (project summary point 12) becomes unfalsifiable.

The project summary specifies spec-driven development and names the document set. This ADR fixes how that actually operates day to day.

## Decision

We will drive all implementation from specification documents, and record architectural decisions as immutable ADRs.

**Document set and roles:**

| Document | Answers | Changes when |
|---|---|---|
| `Product.md` | Who is this for and why does it exist | Rarely — vision level |
| `Requirement.md` | What must it do (numbered REQ-xxx, testable) | Scope changes |
| `SystemDesign.md` | How do the pieces fit together | Architecture changes |
| `Design.md` | How does a given feature work internally | Per feature |
| `AgentDesign.md` | Agent roles, prompts, memory, tool access | Agent behaviour changes |
| `Tasks.md` | What is being built now, in what order | Continuously |
| `docs/adr/` | Why a decision was made, and what was rejected | Append-only |
| `README.md` | How to run it | Setup changes |
| `Contributing.md` | How to work on it | Process changes |

**The rule that makes it real:** no code is written for a feature until the requirement exists and is numbered. Every requirement is testable — if it cannot be evaluated as pass/fail, it is a goal, not a requirement, and belongs in `Product.md`.

**Requirements are traceable:** REQ-xxx → design section → ADR → task → test. Traceability is what allows us to answer "why does the system behave this way" without archaeology.

## Alternatives considered

- **Code-first, document after.** Rejected: for a system whose core claim is measurable self-improvement, undocumented intent makes the central claim untestable.
- **ADRs only, no requirement numbering.** Rejected: ADRs capture *why* but not *what must be true*. Without testable requirements the eval framework has nothing to anchor to.
- **Heavyweight upfront specification.** Rejected: scope is explicitly unfrozen (see project summary). Specs are written per-slice, just ahead of implementation.

## Consequences

- Slower to first line of code; substantially faster to correct behaviour and to diagnose regressions.
- The docs become a dependency: stale docs are worse than none, so documentation currency needs enforcement (open decision — pre-commit vs. CI gate).
- ADR immutability means reversals are visible rather than silently rewritten, which is the point.
- The `Requirement.md` numbering scheme must exist before feature work starts.

## Revisit trigger

Documentation overhead demonstrably slows delivery — specifically, if time spent writing specs exceeds implementation time across two consecutive slices without a corresponding drop in rework.
