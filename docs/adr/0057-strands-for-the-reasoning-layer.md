# ADR-0057: Strands for the reasoning layer — a scoped supersession of ADR-0041

- **Status:** Accepted (2026-08-13, the builder's explicit direction in session)
- **Supersedes:** [ADR-0041](0041-no-agents-deterministic-pipeline.md) **in part** — its
  "no agent framework" decision, for the LLM reasoning layer only
- **Serves:** the POC evolution the builder drew on 2026-08-13: numeric rungs + track
  record + recent events → a reasoning model → a sealed, scored prediction
- **Relates to:** ADR-0037 (forward-only — untouched), ADR-0040 (model choice by
  configuration — extended, not changed), ADR-0056 (controls — the pattern the new
  rungs inherit)

## Context

ADR-0041 removed agents and the Strands SDK: scraper agents duplicated Firecrawl, and
the curator's proposed tools were replaceable by pre-loading plus a deterministic
sweep. Those arguments were about *those* agents, and they stand.

The POC has since produced the thing an agent layer needs to be worth building: a
live, sealed, honestly scored numeric ladder (P5) whose consolidated record can be
handed to a reasoning model, and a measured null (nothing beats climatology; the
moving days are open). The builder's diagram adds exactly that layer: an LLM that
reads the numeric rungs' output, the performance record, and the last week's events,
and produces its own prediction — with memory that accretes (the mini-wiki,
`docs/design/poc-mini-wiki.md`).

The builder has directed that this layer be built on the **Strands Agents
framework**, verified current as of 2026-08: open source, Python-first,
provider-agnostic with a first-class OpenAI provider, schema-validated structured
output, tools and MCP built in. Strands is AWS-published but nothing in it requires
AWS — the layer runs locally against any provider.

## Decision

**The reasoning layer is built on Strands. Everything else keeps ADR-0041's shape.**

1. **Scope.** The Strands agent exists in exactly one place: the reasoning rung(s)
   (`llm_raw`, `llm_mem`) and their curator. Ingest, validation, features, the
   numeric lane, scoring, seal/mature — all remain deterministic code with no
   framework and no agency. ADR-0041's rejection of scraper agents and tool-driven
   curation over the *pipeline* stands unamended.
2. **Provider and model are configuration, never code** — ADR-0040's rule, extended
   to this layer: `OPENAI_API_KEY` and a model-name variable (initial default:
   GPT-5.6 Sol) from the environment. The code must run against any Strands
   provider unchanged. No AWS dependency is introduced (builder's decision:
   AWS-independent for now).
3. **Everything is recorded.** Every prompt, tool invocation, and response is
   persisted to a local run log per sealed prediction, with the record's hash in
   the seal. This is the cassette discipline (T2.x) arriving early, and it is what
   makes an agentic run auditable after the fact.
4. **Bounded agency.** A run has a hard cap on turns and tool calls. The first
   implementation (P8c) uses **zero tools and one turn** — Strands as a structured
   single-shot harness; tools (event fetch) are added only as a deliberate later
   step, not as a default.
5. **The output obeys the existing contract.** Whatever the agent reasons, what
   seals is the same five-bucket distribution every rung seals, scored by the same
   maturation against the same sealed edges. An agent that cannot produce the
   contract produces nothing that day, and the gap is visible.
6. **Forward-only is untouched** (ADR-0037). The agent runs against today, only.
   Its memory seeds only from deterministic Lane-A statistics, tagged `seeded`
   (ADR-0038's split); its prose accrues only from live days.

The `strands-agents` dependency lands with the first code that uses it (P8c), not
before.

## Alternatives considered

- **Keep ADR-0041 whole; call the LLM with hand-rolled client code.** Workable —
  P8c's first form is single-shot either way — but the builder explicitly chose the
  framework, structured-output validation with retry is machinery worth not
  rewriting, and the later steps of the drawn design (tool-assisted event fetch)
  are where hand-rolled code grows into an unlicensed agent framework anyway.
- **Supersede ADR-0041 entirely.** Rejected: its pipeline arguments are untouched by
  this decision and remain load-bearing (Firecrawl duplication, deterministic sweep
  completeness, cost).

## Consequences

- ADR-0041's status line gains a "superseded in part" amendment; CLAUDE.md's tech
  stack row changes from "Agent framework: None" to Strands-for-the-reasoning-layer.
- The POC ladder will grow `llm_raw` and `llm_mem` rungs, sealed and scored like
  every other rung — including beside their controls. The anchoring risk of showing
  the agent the numeric forecasts is known (ADR-0029's territory) and deliberately
  deferred, not denied.
- A framework dependency enters the tree for one layer. If Strands is ever
  abandoned, the blast radius is the reasoning layer alone — the seal/mature record
  and every other rung survive it untouched.

## Revisit trigger

The production build reaching increment 12 (the real prediction layer), where this
decision must either generalise or yield to the production design; **or** Strands
proving unable to satisfy guardrail 3 (full recording), which is non-negotiable.
