# ADR-0019: Amazon Bedrock as the model provider

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** All model calls (ADR-0004, 0005, 0011, 0013)

> **Amendment note (2026-08-09):** this ADR's reasoning rests partly on Strands SDK targeting Bedrock natively. **[ADR-0041](0041-no-agents-deterministic-pipeline.md) removed Strands from the stack** — there are no agents to build, so the framework had nothing to do. The Bedrock choice stands on its remaining grounds (one IAM boundary, one billing relationship, no separate API key to rotate), but the Strands argument below is void, and Strands must not be re-added on the strength of it. The Claude Platform on AWS alternative was "set aside because Strands targets Bedrock natively" — that reason is now gone, leaving only "the gaps proved immaterial". Original text preserved unedited.
- **Detail:** [AWS Architecture and Cost Model](../design/aws-architecture.md)

## Context

The model provider had not been recorded. The stack is already AWS (ADR-0004 Step Functions, ADR-0015 SAM) and the agent framework is Strands, which is AWS-native and treats Bedrock as its natural model provider. Keeping inference inside AWS means one IAM boundary, one billing relationship, one VPC story, and no separate API key to rotate through Secrets Manager.

Bedrock is **partner-operated**, not Anthropic-operated, which has concrete consequences: model IDs differ, pricing is published separately by AWS, and a defined subset of first-party API features is unavailable. Those gaps needed checking against what this project actually uses before committing.

## Decision

We will use Amazon Bedrock as the model provider for all agent steps, accessed via the Mantle client.

**Model IDs carry an `anthropic.` prefix** — `anthropic.claude-opus-5`. A bare first-party ID returns 400. Use `AnthropicBedrockMantle` rather than the legacy `bedrock-runtime` InvokeModel path.

**Default model is Claude Opus 5** for all stages. Model tiering is available as a cost lever but is an explicit decision, not an assumption — see the open decision below.

**Four capability gaps, checked against our usage:**

| Capability | Bedrock | Impact here |
|---|---|---|
| Anthropic Batches API | Unavailable | Use **Bedrock Batch Inference** — S3 JSONL, ≤24h, 50% of on-demand. Different mechanism, same discount; suits a daily pipeline. |
| Automatic prompt caching | Unavailable | Cache breakpoints placed **manually** via `cache_control`. Caching itself works normally (1.25× write, 0.1× read). |
| Web search / fetch / code execution | Unavailable | None — acquisition is Firecrawl and direct fetch (ADR-0002, ADR-0010). |
| Files API, Models API | Unavailable | None — unused. |

**Two operational traps recorded so they are not rediscovered:**

- **The prompt-cache minimum is model-dependent and not monotonic** — 512 tokens on Opus 5 but **4,096 on Haiku 4.5**. A prompt that caches on Opus can silently fail to cache on Haiku, with no error and no warning, only `cache_creation_input_tokens: 0`. Any tiering decision must re-check caching behaviour rather than assuming it transfers.
- **Caching pays within a run, not across days.** With one run per day the cache is always cold at start. Budget one write per run, and keep classification, prediction, and consolidation close enough together to stay inside the TTL.

## Alternatives considered

- **Anthropic API directly.** Rejected: same-day feature parity and no capability gaps, but adds a second billing relationship, an API key to manage in Secrets Manager, and egress from AWS — for features this project does not use.
- **Claude Platform on AWS.** Anthropic-operated with same-day parity, bare model IDs, SigV4 auth, and AWS Marketplace billing — genuinely attractive, and it closes every gap in the table above. Set aside because Strands targets Bedrock natively and the gaps proved immaterial. **This is the first migration target if a gap starts to bite.**
- **Google Vertex AI.** Rejected: a second cloud for inference while the stack is on AWS, for no compensating benefit.

## Consequences

- One IAM boundary, one bill, no inference API key to rotate.
- Strands works against its native provider.
- **Cost is dominated by two things** — daily inference (~$33–41/month batched) and, far larger, one-off backfill classification of eleven years of GDELT history (~$39 to ~$390 depending on model). The backfill is easy to overlook because it appears in no monthly figure.
- Manual cache placement is a small ongoing burden and a silent-failure surface: a moved breakpoint degrades cost with no error. Cache-hit rate should be monitored, not assumed.
- Bedrock model availability is **per-region and lags first-party launches** — region choice constrains model choice, and model access must be explicitly requested in the account.
- Bedrock pricing is published by AWS and can diverge from first-party rates; budgets must be verified against the console, not against Anthropic's published rates.

## Revisit trigger

A first-party capability we need becomes unavailable or materially delayed on Bedrock — **Claude Platform on AWS is the migration target**, since it keeps AWS-native IAM and billing while restoring same-day parity and bare model IDs.
