# ADR-0018: Record and replay LLM responses for deterministic testing

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Truncated replay (harness Layer 2), test speed, CI cost
- **Detail:** [Point-in-Time Leakage: Threat Model and Test Harness](../design/point-in-time-test-harness.md)

## Context

Truncated replay — the centrepiece of the leakage harness — runs the pipeline twice and asserts identical output. It only works if the pipeline is deterministic, and LLM steps are not.

Temperature 0 is commonly treated as sufficient. It is not a hard guarantee: output can vary across model versions, serving infrastructure, and batching. For a safety test this is the worst possible failure mode — **spurious failures train people to ignore the test**, and an ignored leakage test is worse than no leakage test, because it carries the appearance of coverage.

There is also a cost dimension. Truncated replay runs on every PR touching pipeline code, over a sample of dates, with two full runs each. Paying live inference for all of that, repeatedly, conflicts directly with the cost-efficiency goal (project summary point 10).

## Decision

All LLM interaction goes through a **record-and-replay caching layer**.

**Modes:**

| Mode | Behaviour |
|---|---|
| `live` | Calls the model. Production. |
| `record` | Calls the model, persists request → response. |
| `replay` | Serves from cache. **A cache miss is a hard failure, never a silent fallthrough to live.** |

A miss that silently called the model would reintroduce nondeterminism precisely when the test believes it has eliminated it.

**Cache key** is a hash over model ID, full prompt, sampling parameters, and tool definitions. The **model ID is part of the key** — a model upgrade must invalidate cassettes rather than silently replaying responses from a different model.

**Storage:** cassettes in S3, with a manifest hash committed to the repo. CI verifies it fetched the expected set. This keeps the repo free of large binary churn while keeping the CI-to-cassette binding verifiable.

**Prompt changes invalidate cassettes**, producing a miss and a CI failure that requires deliberate re-recording. This is intended friction: changing a prompt changes agent behaviour, and re-recording is the moment to notice.

**CI does not exercise the live model path**, so a separate **nightly live smoke test** runs a small end-to-end pass against the real model. Replay tests prove logic correctness; the smoke test proves the integration still works.

## Alternatives considered

- **Temperature 0 with a fixed seed.** Rejected: not a hard determinism guarantee, and spurious failures in a safety test are corrosive — they erode trust in exactly the test that most needs to be trusted.
- **Compare structured fields only, tolerate text variation.** Rejected: leakage that surfaces only in reasoning text — the agent referencing a fact it should not know — is a plausible vector, and this approach is blind to it. Structured-field comparison is still used *within* replay, but as a comparison strategy, not as a substitute for determinism.

## Consequences

- Truncated replay becomes reliable, which makes the entire harness credible.
- **All pipeline tests get fast and free**, not just leakage tests. This is a large secondary benefit: agent-dependent tests become ordinary unit tests.
- **Any historical run can be replayed exactly**, which is valuable well beyond testing — diagnosing why a specific day's prediction was wrong becomes possible rather than approximate.
- Cassette maintenance is real overhead: prompt changes require re-recording, and stale cassettes can mask genuine behaviour changes.
- Cassette storage grows with test surface. Modest, and S3 is cheap.
- The nightly smoke test is now the only guard on live integration, so its failure must alert rather than merely log.
- The caching layer must sit at the boundary of every agent call with no bypass path, or determinism is only partial.

## Revisit trigger

Cassette maintenance overhead exceeds the value of deterministic testing — concretely, if re-recording becomes a routine step in most PRs rather than an occasional one.
