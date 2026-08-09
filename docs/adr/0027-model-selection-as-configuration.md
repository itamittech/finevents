# ADR-0027: Model selection is configuration, not code

- **Status:** Accepted — **reasoning default amended by [ADR-0036](0036-event-stratified-replay-scope.md)**
- **Date:** 2026-08-09
- **Amends:** [ADR-0022](0022-nova-lite-for-classification.md) — which assigned Opus 5 to all judgment stages

> **Amendment note (2026-08-09):** ADR-0036 selects **Nova Pro** for sequential replay on cost grounds. Because a backtest measures the system actually run, the live reasoning default (`/finevents/{env}/model/reason`) follows to `amazon.nova-pro-v1`, replacing Nova Premier — dropping live Bedrock from ~$16.90 to ~$5.00/month. Everything else below stands: model selection remains configuration, the A/B harness remains required before any backtest is trusted, and the concern that a weak reasoning model makes a bad result *uninterpretable* applies with more force at Pro than it did at Premier. Original decision text preserved unedited.

> **Second amendment (2026-08-09):** [ADR-0037](0037-forward-only-agent-learning.md) removes historical replay, so the A/B mechanism specified below — *"re-run prediction on a fixed sample of historical days under both"* — no longer has a mechanism. **[ADR-0039](0039-live-shadow-model-ab.md) replaces it with a live shadow arm**: Nova Premier runs alongside the live Nova Pro predictor on the same days, scored but never written back to the wiki.
>
> **Nova Pro remains the default, and the requirement below is unchanged and more urgent.** With no offline result to fall back on, the live record is the only evidence the project will ever have about the agent — so the question of whether the model, rather than the hypothesis, is the limiting factor cannot be deferred. ADR-0039 also records why Nova Pro is defensible on this task despite its benchmark gap: the predictor is heavily scaffolded by ADR-0030/0031's numeric forecasts and ADR-0034's computed confidence, which both raises the floor and makes baseline-echoing the failure mode to watch for.

> **Third amendment (2026-08-09):** [ADR-0040](0040-split-reasoning-model-by-role.md) splits `/finevents/{env}/model/reason` into **two parameters by role** — `…/reason/predict` on `amazon.nova-pro-v1` and `…/reason/curate` on `amazon.nova-premier-v1`.
>
> The trigger was noticing that ADR-0036's move to Nova Pro was justified *entirely* by replay economics, and ADR-0037 deleted replay. Forward-only also made the two roles asymmetric in a way they were not before: a bad prediction is scored and forgotten, while a bad wiki page compounds permanently with no replay machinery left to repair it. The scaffolding argument above protects the predictor and does not protect the curator, so the stronger model goes where both asymmetries point. **Cost: $7.90/month against $4.90 all-Pro and $16.54 all-Premier.**
>
> The "configured stages" table below now has three rows rather than two, and the deploy-time parameter assertion covers all three.
- **Serves:** ADR-0019 (Bedrock), deployability under changing model availability

## Context

Every model choice so far has been recorded as if it were permanent. It is not, for two reasons:

- **Bedrock model availability is per-region and lags first-party launches.** Opus 5 availability in us-east-1 was flagged as unverified in the architecture document and has not been confirmed. Hardcoding a model ID that may not be callable in the target region is a deployment failure waiting to happen.
- **The right model per stage is an empirical question**, and the evidence to answer it does not exist yet. It arrives from backtest results, not from reasoning about it now.

Hardcoding model IDs makes both problems worse: switching becomes a code change and a deploy rather than a configuration change, which discourages exactly the experimentation needed to answer the empirical question.

## Decision

**Model IDs are per-stage configuration**, held in SSM Parameter Store per environment and injected at runtime. No model ID appears in application code.

### Configured stages and current defaults

| Stage | Parameter | Default | Rationale |
|---|---|---|---|
| Event classification, severity scoring | `/finevents/{env}/model/classify` | `amazon.nova-lite-v1` | Mechanical mapping from pre-structured CAMEO records (ADR-0022) |
| Correlation, prediction, wiki consolidation | `/finevents/{env}/model/reason` | `amazon.nova-premier-v1` | The reasoning-oriented Nova model |

**The reasoning default changes from Opus 5 to Nova Premier**, superseding ADR-0022's assignment. Premier rather than Pro specifically because AWS positions Pro as a general multimodal model and **Premier as the Nova model for complex reasoning** — and the reasoning stage is where capability matters most (below). Candidate alternatives, switchable by parameter: `amazon.nova-pro-v1` (cheaper, if Premier proves unnecessary), `anthropic.claude-opus-4-8`, `anthropic.claude-opus-5` when confirmed available.

### The reasoning stage is where model capability matters most

This needs stating plainly, because it is the one place where a weak model produces an *unfalsifiable* result rather than a visibly worse one.

Correlation hypothesis generation, prediction reasoning, and wiki consolidation are the compounding-knowledge core. If the model is too weak there, the wiki degrades slowly and the symptom is "the approach doesn't work" — indistinguishable, from the outside, from "the hypothesis was wrong." That confound would invalidate the project's central claim rather than merely weakening it.

Published positioning is a signal worth heeding: Nova Pro is described as a general multimodal model, while **Nova Premier is the Nova model positioned for complex reasoning**. Nova Pro is a defensible starting point under availability constraints; it should not be assumed adequate.

### Switch criteria are measured, not judged

**A model A/B harness is required before the first backtest is trusted**, following the same pattern as ADR-0022's classification spot-check:

- Re-run **consolidation** on a fixed sample of scored predictions under the configured model and under a stronger candidate; compare the resulting page edits for evidence handling, contradiction flagging, and confidence calibration.
- Re-run **prediction** on a fixed sample of historical days under both; compare Ranked Probability Score.
- Record both results against the model ID and the date.

**A switch is justified by a measured gap, not by a hunch.** Equally, a poor backtest result is not attributable to the approach until this harness shows the model is not the bottleneck.

### Operational consequences of switching

- **The record-replay cache key includes the model ID (ADR-0018)**, so changing a model invalidates cassettes and forces a re-record. This is intended friction — a model change changes agent behaviour, and re-recording is the moment to notice.
- **Prompt caching differs by model family.** Nova models cap cached content at roughly 20k tokens, against a wiki context of ~45k — so the full context cannot be cached on Nova. This barely matters at Nova Pro input rates, but it means **caching economics must be re-derived on every switch**, not carried across.
- Prompt formatting differs between families; the prompt layer must be model-aware rather than assuming one dialect.
- Both configured models must be available in the deployed region, and access explicitly requested — a deploy-time check, not a runtime discovery.

## Alternatives considered

- **Hardcode Opus 5 and wait for availability.** Rejected: blocks deployment on an unconfirmed dependency.
- **One model for every stage.** Rejected: classification and reasoning have genuinely different requirements, and ADR-0022 already established a ~90× cost difference for the mechanical stage.
- **Runtime model selection by heuristic** (e.g. escalate to a stronger model on high-severity events). Rejected for v1: it makes behaviour non-reproducible across runs and complicates the replay harness. Worth revisiting once the A/B harness can quantify the benefit.

## Consequences

- Deployment no longer depends on any single model being available.
- Switching models is a parameter change and a cassette re-record, not a code change — which is what makes the empirical question answerable in practice.
- **Cost drops substantially at the current defaults** — the reasoning stage falls from roughly $25/month on Opus 5 to roughly $3/month on Nova Pro.
- **Reasoning quality is now an open risk rather than a settled assumption**, and the A/B harness is the only thing that converts it into a measurement. Without it, a weak backtest is uninterpretable.
- Prompt templates must be maintained per model family, or switching silently degrades output through formatting mismatch rather than capability.
- Configuration drift between environments becomes possible — Dev and Prod running different models would make Dev results meaningless. Parameter values should be asserted at deploy.

## Revisit trigger

The A/B harness shows a material gap between the configured reasoning model and a stronger candidate on either consolidation quality or Ranked Probability Score — **or** a backtest fails to beat climatology while the harness indicates the model is the limiting factor.
