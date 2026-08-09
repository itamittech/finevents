# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How we work — read this before proposing anything

The builder is one person who wants to stay in control without being overwhelmed. Those pull against each other, and the resolution is **increment size plus a visible demo** — not status reporting.

**[`docs/Execution.md`](docs/Execution.md) is the running order.** It holds the increment ladder and a marker showing which increment is current. It is the answer to "where are we?"

**Session protocol — follow this every time:**

1. **Open `docs/Execution.md` and say which increment is current.** Do this before proposing anything, even if the request seems unrelated.
2. **Scope the work to that increment only.** Finishing early is not licence to start the next one.
3. **End with a demo, not a changelog.** The exact command to run, and what they should expect to see. "Here is what now works and how you check it" — never "here are the files I changed".
4. **Update the position marker** in `docs/Execution.md` when an increment lands.
5. **Stop.** Wait to be asked for the next one.

**If a request spans several increments, say so and propose the first one.** Do not silently deliver three because they are all implied. Do not reorder the ladder to be helpful — the order encodes irreversible constraints (see the three non-negotiables in Tasks.md), and resequencing is a decision for the user, not a convenience.

**Every increment ends in something visible.** If a proposed increment has nothing to show — no rows, no forecast, no page, no scored number — it is the wrong increment boundary. Split it differently or fold it into a neighbour.

## Project status

Pre-implementation, but the design phase has produced a substantial record. The git repository exists (commits authored correctly as `itamittech@gmail.com`, remote `github.com/itamittech/finevents`, **currently public**). There is no source code, no build system and no test suite. There are therefore no build/lint/test commands to document — record the real ones here as soon as the first code lands; do not invent them in the meantime.

The toolchain is **not yet chosen** — no Python version, packaging tool, test runner or CI platform is decided anywhere. Do not assume one; see Tasks.md T0.13 — the Python version must satisfy Chronos-2 wheels ∩ TimesFM 2.5 wheels ∩ SAM Lambda runtimes ∩ AgentCore base image, and that intersection is the one irreversible choice.

**Read these before proposing anything:**

> `docs/Execution.md` is the running order — check it first (see "How we work" above).

| Path | What it is |
|---|---|
| `docs/adr/README.md` | Index of all 52 ADRs, standing risks, open decisions. **Start here.** |
| `docs/Requirement.md` | **188** numbered REQ-ids. **No code for a feature without one.** |
| `docs/Design.md` | Module layout, interfaces, schemas, algorithms |
| `docs/Tasks.md` | Build order, dependencies, and the hard leakage gate |
| `docs/SystemDesign.md` | End-to-end architecture; §2.1 is the agency boundary |
| `docs/adr/0037-forward-only-agent-learning.md` | The largest design decision. Read before any ADR it touches. |
| `docs/design/point-in-time-test-harness.md` | Leakage threat model and test layers |
| `docs/design/aws-architecture.md` | Service topology and the authoritative cost model |
| `docs/design/*.svg` | Four diagrams — deployment (AWS), logical (system design), runtime (daily process), delivery (deliverables + phases). Update the SVG in the same commit as the design it depicts |
| `docs/design/prediction-contract.md` | Prompt blocks, output schema, validation rules |
| `docs/Product.md` | Positioning, prior art, non-goals |
| `README.md` | Public-facing summary — written, and currently the most accurate short description |
| `DATA_SOURCES.md` | Per-source licence and attribution; four data-terms questions still open |
| `LICENSE`, `NOTICE` | Apache 2.0 (ADR-0044) |
| `ProjectSummary.txt` | The original brief, with a status block mapping each point to where it landed |

ADRs are **immutable once accepted**. To change a decision, write a superseding ADR — never edit an accepted one's Decision section. Status-line and amendment-note updates at the top are the sanctioned exception.

## What FinEvents is

A daily pipeline that scrapes financial instruments and world events, then learns the correlation between events and price movements so its forecasts improve over time without being re-taught.

**Terminology note.** `ProjectSummary.txt` describes this as an *agentic system*. Per [ADR-0041](docs/adr/0041-no-agents-deterministic-pipeline.md) it contains **no agents** — nothing has tools or runs its own loop. Every model call is single-shot against a prompt assembled by code. The three-tier boundary is set out in [SystemDesign §2.1](docs/SystemDesign.md). Do not reintroduce the agentic framing in new documents unless that ADR is superseded.

Tracked data — **11 instruments** (REQ-201), indices not individual equities:
- Indices: NIFTY 50, SENSEX, S&P 500, Nasdaq, Dow
- Metals: gold spot USD/oz, silver, platinum, palladium, MCX gold INR, MCX silver INR
- 10–20 high-impact events (geopolitical attacks, disasters, Fed announcements, major financial news)

> `ProjectSummary.txt` asked for "top ~10 stock prices". [ADR-0009](docs/adr/0009-scope-indices-and-metals-first.md) narrowed v1 to **indices and metals, deferring individual equities** — a wider instrument × event surface makes a weak result ambiguous. Do not reintroduce single stocks without superseding it.

The correlation-and-learning layer is the product. Scraping exists to feed it.

## Architecture

Full detail in [SystemDesign.md](docs/SystemDesign.md). In short — a Step Functions pipeline with three single-shot model calls:

| Stage | Model | Calls/day |
|---|---|---|
| Classify events + score severity | Nova Lite | 1 |
| Predict, one call per instrument | Nova Pro | 11 |
| Consolidate the wiki | Nova Premier | 1 |

Everything else — ingest, pre-filter, features, scoring, page statistics, the correlation sweep, and both time-series foundation models (Chronos-2, TimesFM 2.5) — is deterministic code with no model involved.

`ProjectSummary.txt` proposed agent-per-domain (a scraper agent per source plus a consolidating learner agent). That was examined and declined in [ADR-0041](docs/adr/0041-no-agents-deterministic-pipeline.md): Firecrawl's extraction is already LLM-driven so scraper agents would duplicate it, and the curator's proposed tools turned out to be replaceable by link-neighbour pre-loading and a deterministic correlation sweep — both cheaper and more complete.

Constraints that shape implementation choices:

- **The agent runs forward only.** Per `docs/adr/0037-forward-only-agent-learning.md`, the agent never executes against a historical date — no backtest, no replay, at any scope. History feeds three things and only three: Lane A numeric calibration, the deterministic wiki seed, and threshold calibration. **Any proposal that involves replaying the agent through past dates contradicts an accepted ADR** and needs a superseding one, not an exception.
- **Knowledge accretion, not re-prompting.** Modeled on Karpathy's WikiLLM idea — the agent's memory grows and is reused day over day rather than being rebuilt each run. If a design requires re-teaching the system daily, it is the wrong design.
- **Live prices are the eval harness.** Forecast accuracy is measured against actual market movement, in volatility-relative buckets at t+1 and t+5. All **six** ladder rungs are scored on identical live days — climatology, conditional climatology, Chronos-2, TimesFM 2.5, agent raw, agent calibrated (ADR-0042). The rung 5→6 gap is the headline miscalibration measurement (REQ-809), so never drop rung 6.
- **Cost efficiency is a first-class constraint** on model selection and scrape frequency. Current design: ~$16–33/month recurring, ~$4 one-off setup.
- **The reasoning model is split by role** (ADR-0040): Nova Pro predicts, Nova Premier curates the wiki, Nova Lite classifies. Three SSM parameters, no model ID in code. The baseline-blind control must always match the *predictor* model, or the anchoring index measures the wrong thing.
- **The UI must expose the learning curve** — whether the agent is improving or degrading day over day — and let a human steer the agent, not just observe it. Note ADR-0020 superseded Streamlit with a static SPA on S3 + CloudFront.
- **Wiki observations carry a `seeded` / `observed` provenance tag** (ADR-0038). Any consumer that ignores it silently reintroduces the confound the tag exists to prevent, so tag-awareness is a CI assertion, not a review item.

## Tech stack (decided)

| Concern | Choice |
|---|---|
| Language | Python |
| Agent framework | **None.** Strands SDK was removed by ADR-0041 — there are no agents to build. Do not re-add it. |
| Frontend | Static SPA on S3 + CloudFront (ADR-0020 superseded Streamlit) |
| Scraping | Firecrawl |
| Production | AWS serverless |
| Local dev | Docker-based services |
| IaC / deploy | CloudFormation or SAM, one-click deployment |
| Config | Separate per Dev / UAT / Prod |

## Spec-driven development

Work flows from documents to code. **The chain is `Requirement.md` (REQ-xxx) → `Design.md` / `SystemDesign.md` → ADR → `Tasks.md` → test**, and it is traceable in both directions.

| Document | State |
|---|---|
| `docs/Requirement.md` | ✅ **188** numbered REQ-ids, each with a verification code. 20 are reachable from no task — see Tasks.md gap list |
| `docs/Design.md` | ✅ Modules, interfaces, schemas, algorithms |
| `docs/Tasks.md` | ✅ 13 phases in dependency order |
| `docs/SystemDesign.md` | ✅ |
| `docs/Product.md` | ✅ |
| `README.md` | ✅ Written |
| `Contributing.md` | ✅ Written |
| ~~`AgentDesign.md`~~ | **Dropped** — ADR-0041 removed agents; SystemDesign §2.1 covers the agency boundary |

**Before writing code for a feature, confirm its REQ-id exists.** ADR-0001 makes this a hard precondition, not a preference. When behaviour changes, update the spec in the same commit — CI on the pull request enforces it.

**Ten** requirements specify a calibration **method** rather than a value (marked `C`): REQ-302, 307, 310, 311, 408, 612, 719, 813, 921, 1213. That is deliberate — each value must be fitted against data that does not exist yet. Do not invent numbers for them. All nine are frozen at go-live (Tasks.md T13.3).

## Git hooks and CI

Per [ADR-0014](docs/adr/0014-security-pre-commit-docs-in-ci.md) — note this differs from the original brief:

- **Pre-commit** — security scan and vulnerability assessment of staged code; block commits containing environment files, credentials, `raw/` paths or scraped-payload content.
- **CI on pull request** — the documentation-currency check, plus SAST and dependency-CVE gates. **CI is the gate; hooks are convenience.**
- **A post-commit documentation hook was explicitly rejected** by ADR-0014 — it fires after the commit exists, so it can only warn. `REQ-1103` and `T0.6` still specify one and contradict the ADR they cite; they need correcting, not implementing.

## Contribution identity

The repo is intended to be open source. Commits must be authored as `itamittech@gmail.com`, **not** `itamittech@live.com` — verify `git config user.email` before the first commit.

## Scope is not yet frozen

`ProjectSummary.txt` marks the project scope as "to be discussed before finalizing." Treat its numbered list as intent, not settled requirements — confirm with the user before locking those decisions into specs or code. The tech stack above, by contrast, is stated as decided.
