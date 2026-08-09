# ADR-0043: Steering interface — flag, propose, edit, correct, all provenance-tracked

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** `ProjectSummary.txt` point 14, ADR-0023 (auth), ADR-0038 (provenance)
- **Settles:** the last substantive open item from the design phase

## Context

The brief asks that a human be able to *steer* the agent, not merely observe it. Every design document so far has carried that as three verbs in a bullet rather than a specification — the thinnest part of the system.

It stayed thin because of a real tension. **Every human intervention that improves the wiki weakens the claim that the agent learned it.** A system whose central question is *"does accumulated knowledge improve forecasts?"* cannot answer honestly if a human quietly wrote the good pages.

The instinct that follows — restrict steering to protect the claim — is wrong. It trades a real capability for a problem that provenance already solves. [ADR-0038](0038-wiki-seeding-tagged-and-toggleable.md) faced the identical tension over seeded evidence and resolved it by tagging rather than forbidding. The same move works here, and it yields full editing power *and* an honest claim rather than a choice between them.

## Decision

Four steering actions, all authenticated through Cognito (ADR-0023), all audited.

| Verb | What it does | Effect on the pipeline |
|---|---|---|
| **Flag** | Mark a page or an evidence row as suspect, with a note | Enters the curator's next prompt as *"a human disputes this"*. Changes no content. |
| **Propose** | Submit a hypothesis — *"check whether MCX gold reacts to INR independent of spot"* | Enters the correlation sweep's candidate queue (ADR-0041). The curator must address it — accept, reject with reasoning, or open a page. |
| **Edit** | Write directly to a page's hypothesis or narrative | Versioned like any other write. Marks the page's authorship. |
| **Correct** | Fix source data — a misclassified event's category or severity | Triggers a rescore of affected predictions. See propagation below. |

### Provenance is finer-grained than a third tag

The obvious move — add `human` alongside `seeded` and `observed` — is wrong, because those two label *sources of observations* and a human does not generate observations. A human writing evidence rows would be fabricating data, not steering.

The correct model separates the layers:

| Layer | Provenance |
|---|---|
| **Evidence row** | `seeded` or `observed`, **never `human`**. A human-corrected row keeps its original source tag and gains a `corrected_by` audit field. |
| **Page hypothesis / narrative** | `author: agent \| human \| mixed`, with full S3 version history |
| **Sweep candidate** | `origin: sweep \| human` |

**The learning curve is unchanged** — still computed over `observed` rows only. But the dashboard gains a required second series: **skill on pages with agent-authored hypotheses versus pages a human wrote or edited.**

That distinction is the one that matters. A correct prediction citing a human-written hypothesis is not the agent having learned anything, and without the split those two look identical in the aggregate.

### Correction propagation

A correction changes source data, which has consequences forward-only cannot undo cheaply.

- **Predictions already made and scored are not re-scored silently.** The original score stands with its data vintage, exactly as with a revised market close (SystemDesign §8). A corrected rescore is written as a **second, separate record**.
- **The event-day bar and the severity ranking shift** when severity is corrected, which changes evaluation stratification. Corrections are therefore stamped with the run in which they were applied, so any reported figure names the correction state it was computed under.
- **Corrections that would alter more than N historical events at once are refused** through the UI. Bulk changes are a reclassification pass, not steering, and belong in a versioned overlay change (ADR-0011).

### The audit trail is public

Every steering action records timestamp, actor, target, before/after, and the run in which it took effect — and under [ADR-0044](0044-licence-and-publication-policy.md) that audit is **published along with the rest of the evaluation record**.

This is what makes steering self-policing. The failure mode worth fearing is not a human helping; it is a human quietly steering toward a favourable result and reporting the outcome as the agent's. A published audit makes that impossible to do silently, which is a stronger guarantee than any restriction on capability would have provided.

### Declined for v1

- **Force re-consolidation of a page.** It would make wiki state depend on the timing of human intervention, and under forward-only there is no replay to establish what the state would otherwise have been. Revisit if flagging proves too indirect.
- **Live parameter changes** — thresholds, abstention floor, instrument set. These end one measurement period and begin another. Not forbidden, but they belong in versioned configuration with an explicit measurement-period boundary, not in a steering panel where they look like ordinary actions.

## Alternatives considered

- **Flag and propose only, no direct writes.** Keeps the learning claim pristine by construction. Rejected: it means seeing a plainly wrong page and being unable to fix it, and it discards the operator's judgment — which over a multi-year run is a substantial asset — to solve a problem tagging already solves.
- **Full control including live parameters.** Rejected for v1 on the measurement-fragmentation grounds above.
- **Human edits with no provenance.** Rejected outright. It makes the project's central claim unmeasurable while appearing to strengthen the system — the same failure mode ADR-0038 rejected for unlabelled seeding.

## Consequences

- **A required dashboard series is added:** skill on agent-authored versus human-touched pages. A consumer that reports only the aggregate reintroduces the exact confound this ADR exists to prevent, so the split is asserted in CI alongside ADR-0038's tag-awareness check.
- **The operator gains real authority** — able to correct errors, direct attention, and inject hypotheses the model would not have proposed. That last one partially addresses the hypothesis-space risk from the human side, complementing the deterministic sweep's coverage from the data side.
- **Every action is reversible in the record** even where it is not reversible in the wiki, because S3 versioning plus the audit log reconstructs any prior state.
- **Steering is a new leakage surface.** A human can see the future in a way the system cannot, and a hypothesis proposed on 14 November informed by knowing what happened on 15 November would contaminate the record. The audit's timestamp is the only defence, and it is a weak one — this is recorded as an accepted residual risk rather than a solved problem.
- Four verbs, an audit log, and a provenance model are real frontend and backend work that did not exist in any prior estimate. It is the largest single item still unbuilt.

## Revisit trigger

Human-touched pages come to dominate the wiki — at which point the system is being taught rather than learning, the two dashboard series will have visibly diverged, and the honest response is to say so rather than to restrict the interface after the fact.
