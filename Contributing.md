# Contributing to FinEvents

FinEvents is spec-driven. Work flows from documents to code, and the chain is traceable in both directions:

```
Requirement.md (REQ-xxx) → Design.md / SystemDesign.md → ADR → Tasks.md → test
```

If you take one thing from this file: **no code is written for a feature before a numbered requirement for it exists** ([ADR-0001](docs/adr/0001-spec-driven-development-with-adrs.md), REQ-001). That is a hard precondition, not a preference. If you find yourself building something with no REQ-id, stop and write the requirement first — or discover, as often happens, that the thing does not need building.

## Setup

```bash
pre-commit install
```

**Do this before your first commit.** The hooks do nothing until installed, and the checks they run are the ones that cannot be recovered from after the fact — a credential that reaches history is compromised whether or not it is later removed, and this repository is intended to be public.

The toolchain (Python version, packaging, test runner, CI platform) is chosen in Tasks.md T0.13 and recorded in `CLAUDE.md` once it lands. Until then there is nothing else to install.

## What runs where, and why

Per [ADR-0014](docs/adr/0014-security-pre-commit-docs-in-ci.md), security checks run **pre-commit** where they can block, and documentation checks run **in CI on the pull request** where they have full-diff context.

| Stage | Checks |
|---|---|
| Pre-commit (local, blocking) | Credential detection; environment files; Python SAST (bandit); dependency CVEs (pip-audit); `raw/` paths and the scraped-payload signature (Design §9) |
| CI on pull request (blocking merge) | Documentation currency; the PR references a REQ-id or ADR; full test suite, lint, type checks; the leakage harness's Layer 2 |

**Pre-commit hooks are bypassable by design and CI re-runs them.** Hooks are convenience; CI is the gate (REQ-1104). Do not treat a green local commit as a green change.

Hooks are kept fast deliberately. Anything slow enough to tempt you into `--no-verify` belongs in CI — speed is a security property here, not a comfort.

## Documentation currency, and the escape hatch

Changes under mapped source paths require a corresponding documentation change in the same pull request (REQ-1103). When a change genuinely needs no docs, put this in the PR body:

```
docs: n/a — <reason>
```

Use it honestly. It exists because without a sanctioned exemption people reach for `--no-verify` or a force-merge, which disables *every* check rather than the one that did not apply. Exemptions are visible in PR history and are reviewed for patterns; if they exceed roughly 20% of PRs, the path mapping is wrong and ADR-0014 gets revisited.

## ADRs are immutable once accepted

To change an accepted decision, write a **new ADR that supersedes it** and set the old one's status to `Superseded by ADR-XXXX`. Never edit an accepted ADR's Decision section.

The sanctioned exceptions are status-line updates and amendment notes at the top of the file. Everything else — including "just fixing an obvious mistake" — needs a superseding ADR. The point is that the reasoning behind decisions we later reverse stays recoverable.

Every ADR carries a **revisit trigger**: a concrete, observable condition that means the decision should be reopened (REQ-003). An ADR without one is either genuinely permanent or not thought through.

Use [`docs/adr/TEMPLATE.md`](docs/adr/TEMPLATE.md).

## Three things that are easy to get wrong

**1. The agent never runs against a historical date.** [ADR-0037](docs/adr/0037-forward-only-agent-learning.md) removed replay entirely — no backtest, at any scope. History feeds exactly three things: Lane A numeric calibration, the deterministic wiki seed, and threshold calibration. A change that replays the agent through past dates contradicts an accepted ADR and needs a superseding one, not an exception. There is a lint for this (T0.9a).

**2. Nothing here is an agent.** [ADR-0041](docs/adr/0041-no-agents-deterministic-pipeline.md): every model call is single-shot against a prompt assembled by code. No tools, no loops. "AgentCore" is the name of a container host and implies nothing about agents. Don't reintroduce the agentic framing, and don't add the Strands SDK back.

**3. Models do judgment only; every number that can be computed, is computed.** No model writes a hit rate, an observation count, or a confidence value (REQ-705). Scoring contains no model call at all (REQ-801) — a model that scores can grade its own homework, and the project's central claim is that a *null* result is believable.

## Data and publication

**Raw acquired content never enters this repository.** Not article text, not excerpts, not Firecrawl payloads, not cassettes ([ADR-0044](docs/adr/0044-licence-and-publication-policy.md), REQ-1107). `.gitignore` is the first line of defence and the pre-commit hook is the enforced one; both are backed by CI.

Derived artefacts — predictions, scores, ladder rungs, wiki pages, run manifests, classifications, the steering audit — **are** published, along with source URLs and fetch timestamps so a third party can re-acquire the material under their own terms (REQ-1106, REQ-1108). That publication is a standing obligation, not a one-off release: a record that starts and stops invites the assumption that results turned unfavourable.

Adding a source means updating [`DATA_SOURCES.md`](DATA_SOURCES.md) with its licence and attribution in the same change (REQ-1109).

## Commits

Commits must be authored as `itamittech@gmail.com` (REQ-005). Check before your first one:

```bash
git config user.email
```

Reference the REQ-id or ADR your change serves in the PR — CI enforces it (REQ-1115), and it is what keeps the traceability chain real rather than aspirational.

## Licence

Apache 2.0. By contributing you agree your contributions are licensed under it. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
