# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Pre-implementation, but the design phase has produced a substantial record. There is no source code, no build system, no test suite, and no git repository yet (`git init` has not been run). There are therefore no build/lint/test commands to document — record the real ones here as soon as the first code lands; do not invent them in the meantime.

**Read these before proposing anything:**

| Path | What it is |
|---|---|
| `docs/adr/README.md` | Index of all 45 ADRs, standing risks, open decisions. **Start here.** |
| `docs/Requirement.md` | ~110 numbered REQ-ids. **No code for a feature without one.** |
| `docs/Design.md` | Module layout, interfaces, schemas, algorithms |
| `docs/Tasks.md` | Build order, dependencies, and the hard leakage gate |
| `docs/SystemDesign.md` | End-to-end architecture; §2.1 is the agency boundary |
| `docs/adr/0037-forward-only-agent-learning.md` | The largest design decision. Read before any ADR it touches. |
| `docs/design/point-in-time-test-harness.md` | Leakage threat model and test layers |
| `docs/design/aws-architecture.md` | Service topology and the authoritative cost model |
| `docs/design/prediction-contract.md` | Prompt blocks, output schema, validation rules |
| `docs/Product.md` | Positioning, prior art, non-goals |
| `ProjectSummary.txt` | The original brief, with a status block mapping each point to where it landed |

ADRs are **immutable once accepted**. To change a decision, write a superseding ADR — never edit an accepted one's Decision section. Status-line and amendment-note updates at the top are the sanctioned exception.

## What FinEvents is

A daily pipeline that scrapes financial instruments and world events, then learns the correlation between events and price movements so its forecasts improve over time without being re-taught.

**Terminology note.** `ProjectSummary.txt` describes this as an *agentic system*. Per [ADR-0041](docs/adr/0041-no-agents-deterministic-pipeline.md) it contains **no agents** — nothing has tools or runs its own loop. Every model call is single-shot against a prompt assembled by code. The three-tier boundary is set out in [SystemDesign §2.1](docs/SystemDesign.md). Do not reintroduce the agentic framing in new documents unless that ADR is superseded.

Tracked data:
- Top ~10 stock market prices, India and USA
- Gold, silver, platinum, palladium prices
- 10–20 high-impact events (geopolitical attacks, disasters, Fed announcements, major financial news)

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
- **Live prices are the eval harness.** Forecast accuracy is measured against actual market movement, in volatility-relative buckets at t+1 and t+5. All five ladder rungs are scored on identical live days.
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
| `docs/Requirement.md` | ✅ ~110 numbered REQ-ids, each with a verification code |
| `docs/Design.md` | ✅ Modules, interfaces, schemas, algorithms |
| `docs/Tasks.md` | ✅ 13 phases in dependency order |
| `docs/SystemDesign.md` | ✅ |
| `docs/Product.md` | ✅ |
| `README.md`, `Contributing.md` | ❌ Not written |
| ~~`AgentDesign.md`~~ | **Dropped** — ADR-0041 removed agents; SystemDesign §2.1 covers the agency boundary |

**Before writing code for a feature, confirm its REQ-id exists.** ADR-0001 makes this a hard precondition, not a preference. When behaviour changes, update the spec in the same commit — the post-commit hook is meant to enforce it.

Six requirements specify a calibration **method** rather than a value (marked `C`). That is deliberate — each value must be fitted against data that does not exist yet. Do not invent numbers for them.

## Git hooks (to be implemented)

- **Pre-commit** — security scan and vulnerability assessment of staged code; block commits containing environment files or credentials.
- **Post-commit** — verify documentation was updated in the relevant places for the committed code.
- **CI** — runs the same validation as workflows.

## Contribution identity

The repo is intended to be open source. Commits must be authored as `itamittech@gmail.com`, **not** `itamittech@live.com` — verify `git config user.email` before the first commit.

## Scope is not yet frozen

`ProjectSummary.txt` marks the project scope as "to be discussed before finalizing." Treat its numbered list as intent, not settled requirements — confirm with the user before locking those decisions into specs or code. The tech stack above, by contrast, is stated as decided.
