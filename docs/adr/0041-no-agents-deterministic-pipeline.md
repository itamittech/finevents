# ADR-0041: The agency boundary — a deterministic pipeline, no agents

- **Status:** Accepted
- **Date:** 2026-08-09
- **Records:** a boundary that had emerged from ADRs 0004, 0021, 0025, 0029 and 0034 without ever being decided
- **Amends:** [ADR-0028](0028-agentcore-runtime-and-observability.md) (rationale, not choice); removes Strands SDK from the tech stack

## Context

The project is described as an agentic system. **As designed, it contains no agents** — in the sense of a component with tools that runs its own loop and decides its own next step. Every model call is single-shot against a prompt assembled by code.

This was never decided. It accumulated:

| ADR | Decision | What the model stopped deciding |
|---|---|---|
| 0004 | Orchestration is Step Functions; LLM = judgment only | What to do next |
| 0021 | Deterministic pre-filter before classification | What to look at |
| 0025 | Manifest key lookup, no knowledge base | What to read |
| 0029 | One call per instrument, prompt pre-assembled | What context it needs |
| 0034 | Confidence computed in code | Any number at all |

Five sound decisions, one unrecorded consequence. "AgentCore" appearing throughout the architecture as a *compute host* obscured it further — the hosting was agentic-sounding; nothing running on it was.

The candidate for agency was the **wiki curator**. It is the one component doing genuinely open-ended work, and it was proposed to receive four tools: `read_page`, `list_pages`, `query_history`, `flag_contradiction`.

## Decision

**No component is an agent. The system stays a deterministic pipeline with single-shot model calls.**

Two deterministic capabilities are added to close the gaps that motivated the agent proposal.

### Why the tools did not survive examination

| Proposed tool | Verdict |
|---|---|
| `read_page(path)` | **Replaceable.** The wiki link graph is known from the manifest. Pre-load the 1-hop neighbours of every page being consolidated. Same information, no loop, bounded, testable. |
| `list_pages(prefix)` | **Already available.** The manifest is the page index. Include the relevant slice in the prompt. |
| `flag_contradiction(...)` | **Not a tool.** It is a field in the structured output. |
| `query_history(...)` | **Doesn't fix what it was meant to fix.** See below. |

Three of four collapse into prompt assembly. The fourth deserves its own argument.

### Why `query_history` fails on its own terms

It was proposed to address a standing risk: *"hypothesis space is model-generated — unproposed correlations never surface."* The reasoning was that a curator able to query history could test its own hunches.

**But a model that never thinks of a hypothesis will not query for it either.** Agent curiosity is bounded by the same imagination that produced the gap. Giving the model a query tool searches the space it was already searching, more expensively.

The actual fix is exhaustive and deterministic — see §*Correlation sweep* below. It is better than agent curiosity on every axis that matters: it is complete rather than sampled, free rather than metered, and reproducible rather than path-dependent.

### Why non-determinism is worst precisely here

[ADR-0040](0040-split-reasoning-model-by-role.md) put the more expensive model on the curator **because its errors are unrecoverable** — under forward-only ([ADR-0037](0037-forward-only-agent-learning.md)) a bad wiki page compounds with no replay machinery left to repair it.

Adding a non-deterministic loop to the one component whose mistakes are permanent is backwards. An agent that takes a different path on a re-run makes the wiki's evolution unauditable, and ADR-0018's record-and-replay cassettes — which depend on a deterministic call sequence — would be substantially harder to maintain for exactly the component where regression testing matters most.

### Addition 1 — link-neighbour pre-loading

When consolidating page P, the prompt includes P's 1-hop neighbours from the wiki link graph, resolved from the run manifest.

This is what `read_page` was for. It gives the curator cross-page context — the ability to notice that a contradiction on `geopolitical-conflict__gold` is explained by something on `regimes/real-yields-rising` — without a loop.

**Bounded by construction:** 1 hop, capped at N neighbours by link order, so prompt size is predictable rather than emergent.

**Cost:** curator input grows from ~20k to ~35k tokens per call. About **+$1.15/month**. No additional calls.

### Addition 2 — the correlation sweep

A nightly Lambda, no model involved. For every cell in the (event category × instrument × horizon) grid:

1. Compute hit rate and Beta-Binomial posterior over all evidence, seeded and observed separately (ADR-0034, ADR-0038)
2. Rank cells whose credible interval excludes 0.5 — that is, where the data says something
3. Surface cells that have **no wiki page**, or whose page's stated hypothesis contradicts the statistics
4. Feed the top candidates into the curator's prompt as *"grid cells worth a page"*

**This is what closes the hypothesis-space risk**, and it closes it better than any agent would. It sweeps the entire grid every night rather than the corners a model happens to find interesting, and its output is reproducible from the data.

The curator still supplies the judgment — what the correlation *means*, whether it is plausible or spurious, whether it deserves a page. The sweep supplies the candidates. That division is the same one running through the whole system: code finds, the model interprets.

**Cost:** a Lambda scan. Rounds to zero.

### Consequential changes

**Strands SDK is removed from the tech stack.** It was a decided component with nothing to build. The Bedrock client is the only model interface required.

**AgentCore Runtime is retained, with its rationale amended.** ADR-0028 justified it substantially on the 8-hour execution window that sequential replay needed; [ADR-0037](0037-forward-only-agent-learning.md) deleted replay, and daily runs finish in minutes. It remains the right host for different reasons: warm weights for Chronos-2 and TimesFM 2.5 (~1.3GB, which Lambda would cold-start badly), per-second billing charged on active CPU only — I/O wait is free, which suits a pipeline that mostly waits on Bedrock — and AgentCore Observability's per-stage token metrics, which are what turn the cost model's estimates into measurements.

Hosting zero agents on a service named AgentCore is odd, and at $0.30/month the cost is not what justifies keeping it. **Fargate is the alternative if the naming ever becomes a real problem**; the economics are close enough that it is not worth the engineering time now.

**The project description is corrected.** `ProjectSummary.txt` and `CLAUDE.md` describe an agentic system. What is being built is a deterministic pipeline with three single-shot model calls and a self-maintained knowledge wiki. The wiki is the product; the agency was never load-bearing for it.

### Cost summary

| Line | Before | After |
|---|---|---|
| Curator — Nova Premier | $4.25 | **$5.40** |
| Correlation sweep — Lambda | — | ~$0.02 |
| **System monthly** | $15–31 | **$16–32** |
| *Gated agent alternative, for comparison* | | *$21–37* |

The deterministic additions cost about a fifth of the gated agent and address the gaps more completely.

## Alternatives considered

- **Gated curator agent** — tools only on days with a scored miss or contradiction, capped at 6 turns, ~$21–37/month. Rejected on the analysis above: three tools were replaceable, the fourth did not address its target risk, and the non-determinism lands on the one component whose errors are permanent.
- **Full curator agent loop**, ~$36–52/month. Rejected for the same reasons, more expensively.
- **Predictor as an agent.** Rejected on stronger grounds than cost: an agent that chooses what to fetch can fetch past the run's cut-off, which converts invariant I4 from a structural guarantee into a runtime property requiring per-run verification. Under forward-only a leaked prediction cannot be re-run.
- **Scraper agents per domain**, as the original brief proposed. Rejected: Firecrawl's JSON-schema extraction is itself LLM-driven, so the resilience-to-page-redesign a scraper agent would provide already exists inside Firecrawl. Our own loop around it would duplicate it.
- **Keep the pipeline and change nothing else.** Rejected: it would preserve the cross-page blindness and the hypothesis-space gap that made agency look necessary in the first place. The point of declining agents is that those problems have better solutions, not that they are unimportant.

## Consequences

- **The system is fully deterministic end to end** apart from model sampling. Every run has a fixed call count, a fixed call order, and a replayable cassette sequence — which is what makes ADR-0018's regression testing tractable for the curator specifically.
- **Daily cost is bounded by construction**, not by a turn cap.
- **The hypothesis-space risk moves from Unaddressed to addressed**, by a mechanism that is exhaustive rather than opportunistic.
- **The curator gains cross-page reasoning without a loop**, which was the substantive capability the agent proposal was buying.
- **What is genuinely given up:** the ability to pursue a novel line of inquiry that no pre-computed sweep anticipated. That is real, and it is speculative — the revisit trigger below is how it gets reconsidered on evidence rather than on appeal.
- The sweep's ranking rule is a new tunable. Set too loose it floods the curator with noise; too tight and it surfaces nothing. It needs calibrating against the seed before go-live, which is free.
- **Terminology has to be maintained honestly.** Any future document calling this an agentic system is wrong until this ADR is superseded.

## Revisit trigger

The correlation sweep plus link-neighbour pre-loading prove insufficient — specifically, wiki review finds the curator repeatedly unable to resolve a contradiction because the explanatory evidence sat more than one hop away, **or** the sweep's candidates prove systematically less useful than hypotheses a human proposes through the steering interface. Either would indicate that bounded context is the limit, and that a loop is what removes it.
