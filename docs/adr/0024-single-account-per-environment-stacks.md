# ADR-0024: Single AWS account with per-environment stacks

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** ADR-0015 (SAM), project summary CI section

## Context

The project summary requires separate configuration for Dev, UAT and Prod. ADR-0015 already established one parameterised SAM template deployed as three stacks — `finevents-dev`, `finevents-uat`, `finevents-prod` — rather than three divergent templates.

The open question was whether those stacks live in one AWS account or three. Separate accounts give a hard blast-radius boundary and clean per-environment billing; a single account is substantially simpler to set up and deploy from.

**Region is us-east-1**, chosen for Bedrock model availability — Bedrock availability is per-region and lags first-party launches, and us-east-1 gets new models first.

## Decision

All three environments run as separate CloudFormation stacks in a **single AWS account**, in **us-east-1**.

**Because IAM is now the only boundary between Dev and the production learning history, three controls are mandatory rather than advisory:**

1. **Environment-prefixed resource names, without exception.** Every bucket, table, function, and state machine carries its environment prefix (`finevents-prod-wiki`, `finevents-dev-wiki`). No shared resources across environments — a resource without a prefix is a bug.
2. **IAM policies scoped to the environment prefix.** A Dev execution role can only address `finevents-dev-*`. Non-prod roles carry an **explicit deny** on production resources; a deny cannot be accidentally widened by a permissive allow elsewhere.
3. **The production wiki and price history are protected independently of IAM.** S3 versioning plus deletion protection on the production wiki bucket and DynamoDB tables. **The learning history is the one irreplaceable asset in the system** — code can be rewritten and scraped data re-fetched, but months of accumulated agent knowledge and dated prediction records cannot be reconstructed.

## Alternatives considered

- **Separate AWS accounts per environment.** The stronger design: a hard boundary, per-environment billing, and no possibility of a misconfigured Dev run touching Prod data. Rejected on setup cost — AWS Organizations, cross-account deploy roles, and per-account bootstrapping are meaningful work for a single-developer project. **This is the migration target if the controls above prove insufficient.**
- **Dev and Prod only, skipping UAT.** Rejected: the summary specifies three, and UAT is where a pipeline change is validated against realistic data before touching the production learning history.

## Consequences

- Simplest setup and deployment; one account to bootstrap, one set of credentials, one console.
- Matches ADR-0015's parameterised-template model directly.
- Per-environment cost attribution requires cost allocation tags rather than being automatic from separate bills.
- **The accepted risk is explicit: one over-broad IAM policy and a test run can corrupt the production learning history.** The three controls above exist specifically to bound it, and the deny-based scoping matters more than the allow-based scoping.
- Service quotas are shared across environments — a runaway Dev backfill can consume Prod's Bedrock throughput.
- Resource-name collisions become possible if the prefix convention slips; this should be enforced by template review, not convention alone.

## Revisit trigger

An environment boundary is crossed in practice — a non-prod run reads or writes production data — **or** shared service quotas cause Dev activity to degrade a production run. Either promotes separate accounts from alternative to requirement.
