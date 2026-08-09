# ADR-0006: Streamlit frontend, with defined exit criteria

- **Status:** **Superseded by [ADR-0020](0020-static-spa-frontend.md)**
- **Date:** 2026-08-09
- **Serves:** Learning-curve visibility, agent steering (project summary point 14)

> **Superseded 2026-08-09.** ADR-0020 replaces Streamlit with a static SPA on S3 + CloudFront before any Streamlit code was written. The reasoning: this ADR's own exit criteria predicted Streamlit would fail on wiki diff rendering and steering state — the two features point 14 depends on most — so building Streamlit first meant building the dashboard twice. The stateless-frontend rule below carries over to ADR-0020 unchanged. Original decision text preserved unedited.

## Context

The project summary specifies Streamlit. The stated instruction is to use it unless it does not solve the purpose, in which case use a lightweight framework that does.

What point 14 actually demands is more than a dashboard:

1. Rolling accuracy over time, against baseline, per instrument.
2. A calibration plot — stated confidence versus realised frequency.
3. The knowledge wiki, browsable, **with diffs** — what the agent learned this week.
4. Today's predictions with reasoning and cited wiki pages.
5. **Steering controls** — approve, reject, or edit a learned correlation; flag a bad rule; force-forget.

Items 1, 2 and 4 are ordinary chart-and-table work and Streamlit is well suited to them. Items 3 and 5 are where the risk sits: Streamlit's execution model re-runs the whole script on every interaction, which makes rich editing UI and diff views awkward, though not impossible.

One deployment note: **Streamlit does not run on Lambda.** It needs a container or small instance — App Runner, Fargate, or a small EC2 — while the rest of the stack is serverless. This is a known wrinkle, not a blocker.

## Decision

We will build the frontend in Streamlit, and treat the following as **explicit exit criteria**. If any is hit, we migrate to a lightweight alternative rather than fighting the framework.

**Exit criteria:**

- Wiki diff rendering cannot be made readable within Streamlit's re-run model.
- Steering controls require interaction state that Streamlit's model makes fragile (edits lost on re-run, race conditions on concurrent edits).
- A page interaction takes more than ~2 seconds because of full-script re-execution.
- Hosting cost for the container exceeds the entire rest of the stack.

**Migration target if triggered:** FastAPI serving a small HTMX or plain-React frontend. Chosen over a heavier SPA framework because the app is read-mostly with a handful of write actions; a full frontend build pipeline is not warranted.

The frontend reads from the same stores as the pipeline and must be **stateless with respect to learning** — it never writes to the wiki directly. Steering actions are recorded as explicit, audited instructions that the next pipeline run applies. This keeps the wiki's git history a clean record of agent-and-human intent rather than a mix of UI side effects.

## Alternatives considered

- **Streamlit unconditionally.** Rejected: risks discovering the limits only after significant investment, with no pre-agreed decision point.
- **Start with FastAPI + HTMX immediately.** Rejected: slower to first useful dashboard, and items 1, 2 and 4 — the majority of the value — are exactly Streamlit's strength.
- **Gradio.** Rejected: strong for model demos, weaker for the multi-view dashboard with navigation that this needs.
- **Static site regenerated daily.** Rejected: fails the steering requirement entirely, which is a hard requirement of point 14.

## Consequences

- Fastest path to a usable dashboard, with a pre-agreed off-ramp instead of a sunk-cost argument later.
- Requires a container host, so the stack is not purely serverless. Accepted.
- The stateless-frontend rule adds a small indirection for steering actions, and buys a clean audit trail of who changed what belief and why.
- If migration triggers, chart and metric logic should port with modest rework; the layout will not.

## Revisit trigger

Any exit criterion above is hit. Review at the first working dashboard and again once steering controls are implemented.
