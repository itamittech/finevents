# ADR-0044: Apache 2.0 for code; derived data published, raw content never

- **Status:** Accepted

> **Amendment note (added on review):** the **Stooq** question in the list below is **void** — [ADR-0053](0053-remove-stooq-as-a-price-source.md) removed the source. Three data-terms questions remain, not four.


> **Amendment note (added on review):** the *timing* of the four-question gate below — "before the repository goes public" — is **superseded by [ADR-0050](0050-publication-gate-scoped-to-data.md)**. The gate now binds before the first commit that acquires data or the first publication of derived artefacts, whichever comes first, and is asserted in CI rather than remembered. Everything else in this ADR, including the published/never-published sets, stands unchanged.
- **Date:** 2026-08-09
- **Serves:** ADR-0033 (evaluation harness as deliverable), ADR-0014 (pre-commit security), `Product.md`
- **Settles:** the licence and data-redistribution open item

## Context

The repository is intended to be open source. Two questions were outstanding, and only one of them is really about licensing.

**The code licence** is nearly settled by `Product.md`, which requires permissive terms so the evaluation harness can be reused. That narrows it to Apache 2.0 or MIT.

**What data ships alongside the code** is the substantive question, and it has a legal edge. The system handles material of three very different kinds:

| Kind | Example | Ours to publish? |
|---|---|---|
| Raw third-party content | Scraped article text, MCX page HTML, Firecrawl payloads | **No.** Copyrighted work belonging to someone else. |
| Licensed source data | GDELT event records | Yes, **with attribution** — CC BY 4.0 |
| Our derived work | Severity scores, wiki pages, predictions, scores, manifests, steering audit | **Yes.** Entirely our own output. |

## Decision

### Apache 2.0 for the code

Over MIT specifically for its **express patent grant** and its explicit contribution terms. `Product.md` positions the harness for reuse, and reuse that might include a corporate context is exactly where MIT's silence on patents becomes a barrier. The extra complexity is a NOTICE file.

### Derived data is published; raw content never leaves the system

**Published**, in the repository or a linked public bucket:

- The full prediction record — every track, every horizon, every day
- Scores, RPS, and all ladder rungs
- Wiki pages and run manifests
- Event classifications and severity scores
- The steering audit trail ([ADR-0043](0043-steering-interface.md))
- Calibration maps and their fit versions ([ADR-0042](0042-calibration-feedback-and-calibrated-track.md))

**Never published:**

- Anything under the S3 `raw/` prefix
- Scraped article text, in whole or in excerpt
- MCX or economic-calendar page content
- Firecrawl request or response payloads

**Why publishing the derived record is the point, not a gesture.** `Product.md` positions this as *"an evaluation-first system that happens to predict,"* and states that a null result must be believable. **A null result nobody can inspect is not believable.** Publishing the prediction and scoring record is what converts that claim from a promise into something a third party can check — and under forward-only there is no backtest whose methodology could be disputed, only a timestamped live record. That record is the project's single strongest asset. Withholding it would discard the main advantage the design was built to earn.

It also makes [ADR-0043](0043-steering-interface.md)'s audit trail meaningful. A published audit means a human cannot quietly steer toward a favourable result and report it as the agent's — a stronger guarantee than any restriction on the steering interface itself.

### Attribution obligations are tracked, not assumed

GDELT is CC BY 4.0 and requires attribution wherever its data or derivatives appear. Stooq and FRED terms are to be confirmed before first publication, and each source's obligation is recorded in a `DATA_SOURCES.md` that is updated whenever a source is added.

**Verification required before the repository goes public**, not after:

- [ ] Stooq redistribution terms for derived aggregates
- [ ] FRED terms for derived series
- [ ] Whether GDELT attribution must appear per-record or per-dataset
- [ ] Whether severity scores derived from article text constitute a derivative work of that text — the one genuinely uncertain case

### Enforcement is mechanical

ADR-0014 already specifies a pre-commit security scan that blocks credentials and environment files. **It is extended to block raw content**: any commit touching a `raw/` path, or adding a file whose content matches the scraped-payload signature, is rejected.

A publication step for the derived-data bucket asserts the same boundary. The rule cannot rely on reviewer discipline, because the failure is silent, permanent once pushed to a public repository, and legally material.

## Alternatives considered

- **MIT, code + derived data.** Same publishing policy, simpler licence. Rejected on the patent grant.
- **Apache 2.0, code only.** Simplest legally — nothing to review before a release. Rejected: it withholds the evaluation record, which is the project's strongest asset and the thing that makes a null result verifiable by anyone else.
- **Publish raw scraped content for reproducibility.** Rejected. It is other people's copyrighted work, and no reproducibility argument overrides that. Source URLs and fetch timestamps are published instead, which lets a third party re-acquire the material under their own terms.
- **AGPL or another copyleft licence.** Rejected: it would discourage the harness reuse that `Product.md` gives as the reason for open-sourcing at all.

## Consequences

- **Every published artefact must be checked for embedded raw content.** A wiki page quoting an article at length would leak content through the derived channel — so the curator's output is subject to the same scan, and the prompt instructs it to summarise rather than quote.
- **Publishing the prediction record is a standing obligation, not a one-off.** A record published for the first six months and then abandoned is worse than never publishing, because the gap invites the assumption that results turned unfavourable.
- **The repository carries a NOTICE file** and a `DATA_SOURCES.md` with per-source attribution and terms.
- Commits must be authored as `itamittech@gmail.com`, verified before the first commit.
- **A residual risk remains:** severity scores are derived from article text by a model that read that text. Whether that constitutes a derivative work is genuinely unsettled, and it is the item on the verification list most likely to need an actual answer rather than a judgement call.

## Revisit trigger

A source changes its terms in a way that makes an already-published derived artefact non-compliant — at which point the affected artefacts are withdrawn and the boundary redrawn, which is why every published artefact records the source it derives from.
