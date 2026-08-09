# ADR-0023: Cognito user pool for dashboard and steering authentication

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** ADR-0020 (static SPA), ADR-0005 (steering attribution)

## Context

Moving to a static SPA (ADR-0020) created a surface that did not exist under the container design: a public CloudFront distribution and an API Gateway that accepts **steering writes** — approving, rejecting, editing, or force-forgetting a learned correlation.

Read access is low-stakes; the data is market prices and public news. Write access is not: a steering action mutates what the agent believes, and ADR-0005 requires the wiki's git history to record *who* changed which belief and why. An unauthenticated or anonymous write endpoint makes that attribution impossible and leaves the learning history open to anyone who finds the URL.

## Decision

Authentication uses an **Amazon Cognito user pool**, with API Gateway authorizers enforcing it on every API route.

- **Read routes:** authenticated. No anonymous access to predictions or wiki content.
- **Steering routes:** authenticated, and the caller's Cognito identity is recorded on the action.
- **Steering actions carry that identity through to the wiki commit**, satisfying ADR-0005's requirement that human corrections are attributable rather than anonymous.
- MFA enabled.
- Static assets behind CloudFront; the SPA obtains tokens from Cognito and presents them to API Gateway.

Cognito's free tier covers single-user usage entirely.

## Alternatives considered

- **CloudFront signed URLs with a single shared secret.** Simplest possible gate and adequate for read-only access. Rejected: no per-user identity, so steering actions cannot be attributed to a person — which directly contradicts ADR-0005's audit requirement. A shared secret also cannot be revoked per user or rotated without breaking every client.
- **VPN or IP allowlist, no application auth.** Strongest network posture and no auth code. Rejected: CloudFront IP allowlisting is coarse and awkward to maintain, it blocks access from arbitrary locations, and it still provides no identity for attribution.

## Consequences

- Steering actions are attributable, which is what makes the wiki's git history a genuine audit trail rather than a log of anonymous edits.
- AWS-native and covered by SAM, so it deploys with the rest of the stack.
- Extends cleanly if anyone else ever gets access — no migration needed to add a second user.
- **Cognito is fiddly to configure for a single user** — user pool, app client, domain, token handling in the SPA, and authorizer wiring are real setup work for one person's dashboard. This is the main cost.
- Token refresh and expiry handling become frontend concerns the container design would have avoided.
- A misconfigured authorizer fails open on a route if the authorizer is simply omitted — route coverage should be asserted by test, not assumed.

## Revisit trigger

Cognito setup or token handling proves disproportionate to a single-user dashboard, **and** steering attribution can be satisfied another way.
