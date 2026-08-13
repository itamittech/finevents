# Tech stack — reference notes

**Status: non-normative.** Nothing in this folder is specification.

That line is the reason the folder has a README. Everything else under `docs/` sits on a
traceable chain — `Requirement.md` (REQ-xxx) → `Design.md` / `SystemDesign.md` → ADR →
`Tasks.md` → test — and ADR-0001 makes that chain a hard precondition for writing code.
These notes sit **outside** it. They explain how the chosen tools work; they never decide
anything.

If a note here disagrees with an ADR, **the ADR wins and the note is stale.** Fix the note.

## Why the folder exists

The toolchain was chosen across several ADRs, each recording *what* was decided and *why*,
in the compressed form an ADR demands. None of them explains the mechanics well enough to
operate the thing. These notes fill that gap, so the ADRs stay decision records rather than
drifting into tutorials.

## What is here

| Note | Covers | Written against |
|---|---|---|
| [`sam-deploy-flow.html`](sam-deploy-flow.html) | Where SAM becomes CloudFormation (server-side, not locally); a side-by-side of both dialects on three real cases; whether SAM is portable to other clouds | [ADR-0015](../adr/0015-aws-sam-for-infrastructure.md), [ADR-0024](../adr/0024-single-account-per-environment-stacks.md), [ADR-0054](../adr/0054-toolchain.md) · 2026-08-10 |
| [`gold-poc-approach.html`](gold-poc-approach.html) | What Chronos-2 and TimesFM are, why 120M/200M-parameter models run on a laptop, and the gold POC's cut-off → buckets → RPS mechanism | [ADR-0008](../adr/0008-volatility-relative-movement-buckets.md), [ADR-0030](../adr/0030-chronos-as-baseline-and-shown-forecast.md), [ADR-0031](../adr/0031-timesfm-third-track-and-ensemble-baselines.md) · Design §4.1, §4.2, §4.13 · 2026-08-13 |

## Conventions

**Every note is a dated snapshot** and names the ADRs it was written against — see the
footer of each page. A decision that supersedes one of those ADRs makes the note suspect
until someone checks it. This has already happened once: ADR-0015 stated that the frontend
sat outside SAM's scope because Streamlit needed a container, and ADR-0020 replaced
Streamlit with a static SPA that CloudFormation models natively. The consequence was
withdrawn by amendment note on 2026-08-10.

**Notes are self-contained HTML** — inline CSS, inline SVG, no build step, no external
requests. Open one in a browser directly from the working tree. They theme to light and
dark from the viewer's OS preference.

**Verify claims against the tree, not from memory.** The SAM note's central claim — that
`sam build` leaves `Type: AWS::Serverless::Function` untouched — was checked against
`.aws-sam/build/template.yaml` before it was written down.

> **A size ceiling worth knowing.** [Design §9](../Design.md) blocks any staged file over
> 50 KB whose content is more than 30% HTML tags, as part of the scraped-payload signature
> (REQ-1102). A hand-written reference page sits close to that tag ratio — the SAM note
> measures 33 KB at 32.8%. It passes only on the size floor. **A note that grows past 50 KB
> will be blocked by the pre-commit hook**, and the fix is to split the note, not to weaken
> the rule.
