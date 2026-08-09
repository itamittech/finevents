# ADR-0004: Step Functions for daily pipeline orchestration

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Daily pipeline execution, cost control, observability

## Context

The project summary proposes an agent per domain (equities, metals, events) plus a consolidating learner. The open question was whether those agents should coordinate autonomously — talking to each other in a free-running loop — or be orchestrated deterministically.

FinEvents is a **daily batch job**, not a conversational system. It runs on a schedule, executes a known sequence, and produces a dated artefact. That shape favours explicit orchestration: retries, timeouts, per-step visibility, and a hard bound on how much work (and spend) a single run can trigger.

Autonomous multi-agent coordination is where cost escalates unpredictably, because the number of LLM calls becomes an emergent property of agent behaviour rather than a design parameter.

## Decision

We will orchestrate the daily pipeline with AWS Step Functions, with agents as individual steps rather than as autonomous peers.

**The dividing line — LLM calls are for judgement, not for fetching:**

| Deterministic (plain Python, no LLM) | Agentic (LLM) |
|---|---|
| Firecrawl invocation and retry | Event classification and severity scoring |
| Price parsing and ingest validation | Correlation hypothesis generation |
| Storage reads and writes | Prediction with stated reasoning |
| Scoring predictions against outcomes | Wiki consolidation and linting pass |
| Metric computation | |

Using an LLM to fetch a stock price is expensive, non-deterministic, and can hallucinate the number. Arithmetic and I/O are code.

## Alternatives considered

- **Autonomous multi-agent coordination.** Rejected: unbounded cost, hard to reproduce a given day's run, and difficult to attribute a bad prediction to a specific step. Contradicts the cost-efficiency goal (project summary point 10).
- **Single Lambda running the whole pipeline.** Rejected: 15-minute execution limit is tight for a multi-scrape plus multi-agent run, and a failure loses all progress with no partial retry.
- **Airflow / Managed Workflows.** Rejected: heavier operational footprint and standing cost for a once-daily job. Step Functions bills per state transition and idles at zero.
- **EventBridge chaining Lambdas directly.** Rejected: no built-in run visualisation or per-step retry semantics; failure diagnosis becomes log archaeology.

## Consequences

- Every run is reproducible and inspectable — a given day's execution can be replayed step by step, which matters when diagnosing a bad prediction.
- Cost per run is bounded and predictable at design time rather than emergent.
- Retry and error handling are declarative, not hand-rolled in each step.
- Less agent autonomy: adding a genuinely new reasoning behaviour means editing the state machine, not just a prompt. This is a deliberate trade of flexibility for predictability.
- State machine definition becomes an artefact to version and review alongside code.

## Revisit trigger

The pipeline needs sub-minute or event-reactive triggering (for example, reacting to breaking news intraday rather than on a daily schedule), which would make a batch orchestrator the wrong shape.
