# ADR-0020: Static SPA on S3 + CloudFront for the frontend

- **Status:** Accepted
- **Date:** 2026-08-09
- **Supersedes:** [ADR-0006](0006-streamlit-frontend-with-exit-criteria.md)
- **Serves:** Learning-curve visibility, agent steering (project summary point 14)

## Context

ADR-0006 chose Streamlit and recorded four exit criteria. Two of them were the substantive ones:

- Wiki diff rendering proving unreadable within Streamlit's whole-script re-run model.
- Steering controls requiring interaction state that the re-run model makes fragile — edits lost on re-run, races on concurrent edits.

Those are precisely the two features that point 14 depends on most. ADR-0006 was, in effect, predicting that Streamlit would fail on the hardest and most valuable part of the dashboard, and pre-agreeing a migration.

A static single-page application does not have that failure mode. It holds client-side state naturally, renders diffs as ordinary DOM, and treats steering controls as normal form interactions. Building Streamlit first and migrating later means building the dashboard twice.

Two further factors:

- **Cost:** ~$1–3/month for S3 + CloudFront versus $10–15/month for an always-on App Runner container — which was the single largest infrastructure line in the cost model.
- **Stack coherence:** ADR-0015 noted that the Streamlit container sits outside SAM's scope, splitting deployment into two paths. A static SPA removes that seam — the whole stack becomes serverless and SAM-managed.

## Decision

We will build the frontend as a static single-page application served from S3 behind CloudFront, with API Gateway and Lambda providing reads and steering writes.

- **Static assets:** S3 bucket, CloudFront distribution, TLS via ACM.
- **Read API:** API Gateway → Lambda → DynamoDB / S3 / Athena.
- **Steering writes:** API Gateway → Lambda → DynamoDB, recorded as explicit audited actions.

**The stateless-frontend rule from ADR-0006 carries over unchanged and remains binding:** the frontend never writes to the wiki directly. Steering actions are recorded as instructions that the next pipeline run applies, keeping the wiki's git history a clean record of agent-and-human intent rather than a mix of UI side effects.

**Views to build**, unchanged from ADR-0006: rolling accuracy versus baseline per instrument; calibration curve (stated confidence versus realised frequency); browsable wiki with diffs; today's predictions with reasoning and cited pages; steering controls to approve, reject, edit, or force-forget a learned correlation.

## Alternatives considered

- **Streamlit on App Runner (ADR-0006).** Superseded. Fastest path to a first metrics dashboard and no second toolchain — genuinely attractive early. Rejected because its documented exit criteria target the two features that matter most, and hitting them means rebuilding.
- **Streamlit for metrics, static SPA for steering.** Rejected: each tool plays to its strength, but it means two frontends, two deploy paths, and a seam the user has to cross mid-task.
- **ECS Fargate / small EC2 for the Streamlit container.** Rejected along with Streamlit itself; these only addressed hosting cost, not the interaction-model problem.

## Consequences

- **The stack becomes fully serverless**, and SAM covers all of it — the ADR-0015 deployment boundary closes. Deployment really is one command per environment.
- Infrastructure cost drops by roughly $10/month; the largest remaining line becomes CloudWatch.
- Wiki diffs and steering controls are built on their natural substrate rather than against the framework.
- **Adds a JavaScript toolchain to a Python project** — a second language, a build pipeline, and its own dependency and security surface. This is the real cost.
- **Slower to a first working dashboard** — weeks rather than days. Metrics views that would have been a few lines of Streamlit now need building properly.
- The read API is new surface that did not exist under the Streamlit design: API Gateway routes, Lambda handlers, and authentication all need designing.
- Authentication for steering actions must be decided — the dashboard is no longer behind a single container with its own access story.

## Revisit trigger

Frontend build effort materially delays the learning loop — specifically, if the dashboard is still blocking evaluation of predictions a month after the pipeline produces them.
