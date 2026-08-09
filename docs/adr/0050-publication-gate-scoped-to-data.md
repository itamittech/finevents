# ADR-0050: The data-terms gate binds on data publication, not on repository visibility

- **Status:** Accepted
- **Date:** 2026-08-09
- **Supersedes:** the *timing of the verification gate* in [ADR-0044](0044-licence-and-publication-policy.md). Everything else in ADR-0044 stands unchanged.
- **Serves:** REQ-1111, REQ-1106, REQ-1107, REQ-1112

## Context

[ADR-0044](0044-licence-and-publication-policy.md) states that four data-terms questions must clear **"before the repository goes public, not after"**:

1. Stooq redistribution of derived aggregates
2. FRED terms for derived series
3. GDELT attribution granularity
4. Whether model-derived severity scores constitute a derivative work of the source article

The repository is already public (`github.com/itamittech/finevents`, `isPrivate: false`) and all four remain open in `DATA_SOURCES.md`. So an accepted ADR is being breached right now.

Two facts decide how to resolve it. First, the repository currently contains **62 files: markdown, a licence, and a power-analysis script. No acquired data, no derived data, no code that acquires anything.** None of the four questions is about markdown. The actual exposure today is nil.

Second, `DATA_SOURCES.md:38` already states the gate differently — *"before any derived dataset is published"* — which is a strictly later event. The two documents disagree, and the disagreement was never noticed because neither event had occurred.

The choice is therefore between making the repository private to satisfy a trigger that guards against a risk that is not present, or correcting the trigger to name the risk it actually guards.

## Decision

**The four data-terms questions gate the publication of any acquired or derived data — not repository visibility.** The repository stays public.

Concretely, the gate binds before **whichever comes first**:

- the first commit that acquires data (Phase 3, T3.3 onward), or
- the first publication of derived artefacts (T12.16, REQ-1106).

Until then the repository may be public with the questions open, because nothing in it derives from any source whose terms are in question.

**The gate is made mechanical rather than remembered.** T0.12 becomes a precondition on Phase 3 and on T12.16, asserted in CI: if `DATA_SOURCES.md` still records an open question for a source, no commit may add a fetcher for that source and the publication pipeline refuses to run. The four questions currently sit in a document that nothing reads.

**Question 4 is not answered here and is not answerable by the project.** Whether a model-derived severity score is a derivative work of the article it was derived from is a legal question, and this ADR does not pretend otherwise. The **conservative default applies until it is answered by someone qualified**: severity scores are published only as aggregates joined to event categories, never row-joined to an article identifier, URL or headline, so no published artefact reconstructs anything about an individual article beyond what REQ-1108 already publishes — its URL and fetch time.

That default is stricter than what ADR-0044 permits, and it is deliberately stricter than the eventual answer is likely to require. It costs little and it means question 4 does not block the build.

## Consequences

- **The stated breach of ADR-0044 is closed by correcting the trigger**, not by ignoring it. The correction is recorded in an ADR rather than made silently in the affected document — the alternative would have set the precedent that an inconvenient accepted decision can be edited away, which costs more than the decision is worth.
- **`DATA_SOURCES.md` and ADR-0044 now agree.** The wording drift that hid the conflict is resolved in favour of the version that names the real risk.
- **T0.12 moves from a Phase 0 checklist item to a CI-asserted precondition on Phase 3.** It is no longer possible to build an ingest path for a source whose terms are unresolved.
- **The residual risk is timing.** Phase 3 is weeks away, not months, so the four questions must be answered soon regardless — this ADR removes a false emergency, not the work.
- **No repository setting is changed by this ADR.** Visibility remains as it is; if the questions resolve unfavourably, the response is to not publish the affected artefact, which is what REQ-1107 already requires.

## Alternatives considered

- **Make the repository private until the questions clear.** The conservative reading of ADR-0044 as written. Rejected: it guards against an exposure that does not exist (no data is present), it breaks any existing links, and it works against ADR-0044's own purpose — the published record is what makes a null result verifiable by someone other than its author, and an open ADR trail is part of that.
- **Edit ADR-0044's trigger directly.** Rejected: ADR-0044 is accepted and immutable, and this is a Decision-section change, not a status line or amendment note.
- **Answer all four questions now and keep the original trigger.** The cleanest option, and it remains available — if the four are answered before Phase 3, this ADR simply never binds. It was not chosen as *the* path because question 4 is legal rather than technical and cannot be closed on the project's own authority.
- **Publish nothing until every question is settled.** Rejected: it defers the standing publication obligation (REQ-1112) indefinitely on a question that the conservative default already makes moot.

## Revisit trigger

Any of the four questions resolves unfavourably — in which case the affected artefact is removed from the REQ-1106 published set and this ADR's conservative default is tightened rather than relaxed.
