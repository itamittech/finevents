# ADR-0028: Bedrock AgentCore for agent runtime and observability; Memory declined

- **Status:** Accepted — **rationale amended by [ADR-0041](0041-no-agents-deterministic-pipeline.md)**
- **Date:** 2026-08-09
- **Serves:** ADR-0004 (orchestration), ADR-0019 (Bedrock), backfill execution

> **Amendment note (2026-08-09):** two of this ADR's premises no longer hold, though the choice it made does.
>
> **The 8-hour execution window is no longer needed.** It was justified largely by sequential backfill replay, which [ADR-0037](0037-forward-only-agent-learning.md) removed. Daily runs finish in minutes.
>
> **There are no agents to host.** [ADR-0041](0041-no-agents-deterministic-pipeline.md) records that nothing in the system is an agent — every model call is single-shot against a code-assembled prompt. This ADR's title is therefore misleading and its framing should be read as *container runtime*, not *agent runtime*.
>
> **AgentCore Runtime is nonetheless retained**, on reasons that survive both changes: warm weights for Chronos-2 and TimesFM 2.5 (~1.3GB, which Lambda would cold-start badly), per-second billing charged on active CPU only — I/O wait is free, which suits a pipeline that mostly waits on Bedrock — and AgentCore Observability's per-stage token metrics, which are what convert the cost model's estimates into measurements. Fargate is the alternative if hosting zero agents on a service named AgentCore becomes a practical problem; at $0.30/month the economics are too close to justify the engineering time now. Original text preserved unedited.

## Context

Amazon Bedrock AgentCore reached general availability in October 2025. It is a modular platform rather than a single service, and its components fit this project very differently — so it is adopted piecewise, not wholesale.

| Component | What it provides |
|---|---|
| **Runtime** | Serverless agent hosting, session isolation, **8-hour execution windows**, framework-agnostic (Strands, LangGraph, CrewAI) |
| **Memory** | Managed short- and long-term agent memory, with a self-managed extraction strategy option |
| **Gateway** | Turns APIs, Lambda functions, and MCP servers into agent-callable tools |
| **Identity** | Agent workload identity against enterprise IdPs (Cognito, Okta, Entra, Auth0) |
| **Observability** | End-to-end agent traces and operational metrics — session count, latency, duration, **token usage**, error rates — via CloudWatch, OTEL-compatible |

Two existing constraints bear on the decision. **Lambda's 15-minute execution ceiling** is tight for a long wiki-consolidation pass and clearly insufficient for the eleven-year backfill. And **ADR-0016's point-in-time requirement** rules out any managed store that cannot be queried as of a past date — the reasoning that already excluded Bedrock Knowledge Bases in ADR-0025.

## Decision

Adopt **AgentCore Runtime** and **AgentCore Observability**. Decline **Memory**, **Gateway**, and **Identity**.

### Runtime — adopted

Agent steps (classification, prediction, consolidation) are hosted on AgentCore Runtime rather than Lambda.

The deciding factor is the **8-hour execution window against Lambda's 15 minutes**. Wiki consolidation over a busy day, and especially the backfill pass over eleven years of history, do not fit a 15-minute ceiling without artificial chunking. Session isolation and framework-agnostic hosting suit Strands directly.

**Step Functions remains the orchestrator. This is not a move toward autonomous agent orchestration.** ADR-0004's decision stands unchanged: control flow is deterministic, agents are steps, and the number of model calls is a design parameter rather than an emergent property. AgentCore Runtime changes *where an agent step executes*, not *what decides it should execute*. Step Functions invokes AgentCore Runtime as it would invoke a Lambda.

Deterministic work — ingest, validation, scoring, metrics — **stays on Lambda**. There is no agent there to host.

### Observability — adopted

AgentCore Observability provides per-run traces plus token usage, latency, duration, and error rates, through CloudWatch and OTEL.

**Token usage per stage is the metric this project specifically needs.** Cost is dominated by model calls (ADR-0027), prompt-cache behaviour is a silent-failure surface — a moved breakpoint degrades cost with no error — and cache-hit rate is otherwise invisible. Being OTEL-compatible means it composes with the pipeline's own instrumentation rather than replacing it.

### Memory — declined

**AgentCore Memory cannot be queried as of a past date.** This is the same disqualifier as Bedrock Knowledge Bases (ADR-0025): a backtest running against a managed memory store would read knowledge derived from after the prediction date, which is leakage vector L1, structurally rather than incidentally.

The self-managed extraction strategy gives control over *how* memories are formed, but not over *reading historical state at an arbitrary timestamp*. Point-in-time is the requirement, and it is unmet.

**The knowledge layer stays exactly as specified**: markdown wiki in S3, versioned by object versioning with per-run manifests (ADR-0026), read through the as-of gateway (ADR-0016). That design already satisfies compounding memory, point-in-time reads, diffs, revert, and human editability — and AgentCore Memory satisfies only the first.

### Gateway and Identity — declined

**Gateway** converts APIs into agent-callable tools. Our agents do not call tools in that sense — pipeline steps are orchestrated by Step Functions, and data acquisition is deterministic ingest (ADR-0002, ADR-0010). There is nothing to expose.

**Identity** manages agent identity against external IdPs so agents can act on behalf of users. Our agents call internal AWS resources under IAM execution roles and act on behalf of no one. Dashboard authentication is a separate concern already settled by Cognito (ADR-0023).

## Alternatives considered

- **All of AgentCore.** Rejected: Memory breaks point-in-time correctness, and Gateway and Identity solve problems this project does not have. Adopting a platform wholesale because parts of it fit is how unused surface area accumulates.
- **Lambda only, no AgentCore.** Simplest and fewest services. Rejected on the 15-minute ceiling — backfill in particular would need chunking and checkpointing that AgentCore Runtime provides directly.
- **AgentCore Runtime as orchestrator, replacing Step Functions.** Rejected: reopens ADR-0004's rejected alternative. Unbounded cost, non-reproducible runs, and no per-step attribution when a prediction goes wrong.

## Consequences

- Long-running consolidation and the backfill pass fit their runtime without artificial chunking.
- Per-stage token usage becomes observable, which is what makes ADR-0027's cost model and cache behaviour verifiable rather than assumed.
- **Two compute models to reason about** — Lambda for deterministic steps, AgentCore Runtime for agent steps. The boundary follows ADR-0004's existing line, so it is a familiar split rather than a new one, but it is still two deployment targets.
- AgentCore Runtime is consumption-priced; at one daily run the cost should be small, but it is **an unverified line in the cost model** and needs measuring rather than estimating.
- Declining Memory means the wiki machinery (manifest fold, snapshot compaction) stays ours to build and test — a cost already accepted in ADR-0026, and the price of point-in-time correctness.
- AgentCore availability is per-region like all Bedrock services; us-east-1 must be confirmed.
- SAM coverage for AgentCore resources needs checking — if incomplete, part of the stack falls outside the single-command deploy that ADR-0020 restored.

## Revisit trigger

AgentCore Runtime cost proves material against a ~$10–30/month budget, **or** SAM cannot express AgentCore resources and the deployment path fragments again.
