# ADR-0030: Chronos-2 as the shown baseline and as scoring rivals

- **Status:** Accepted
- **Date:** 2026-08-09
- **Amends:** [ADR-0008](0008-volatility-relative-movement-buckets.md) (baseline set), [ADR-0029](0029-prediction-as-departure-from-baseline.md) (prompt block 3)
- **Detail:** [Prediction Contract](../design/prediction-contract.md)

> **Amendment note (added on review):** **the rung numbers below are this ADR's own and no longer match the ladder.** Here, rung 5 is *Chronos-2 covariate-informed*. In the current six-rung ladder ([ADR-0042](0042-calibration-feedback-and-calibrated-track.md), REQ-806) rung 5 is *the agent, raw* and rung 6 is *the agent, calibrated*. Read literally, this ADR's revisit trigger — "the agent fails to beat rung 5" — now says the agent fails to beat itself. **Read every rung number below as local to this ADR.** Prefer naming the track over citing a rung number anywhere new; the numbering has moved once already.
>
> **A substantive question this exposes, still open.** This ADR made the covariate-informed run "the actual test of the wiki thesis" — the rival handed the same severity signal the agent gets. The current ladder names only "Chronos-2" and "TimesFM 2.5" without saying *which configuration*, while `Design.md` §3 scores four numeric tracks (`chronos_uni`, `chronos_cov`, `timesfm_uni`, `timesfm_cov`). If the reported rungs are the univariate ones, the hardest baseline this ADR argued for has quietly left the ladder, and "the agent beats Chronos" means something materially weaker than intended. **Decide and record which configuration each rung reports** before any skill figure is quoted.

## Context

The baseline set established in ADR-0008 — always-flat, persistence, conditional climatology — is weak. All three are easy to beat, which means beating them demonstrates less than it appears. A system whose entire claim rests on measured skill needs a benchmark that is hard to clear.

**Chronos-2** is a 120M-parameter, encoder-only, zero-shot time-series foundation model producing multi-step **quantile forecasts** — which convert to our σ-bucket distribution through a deterministic transform, so the output shape already fits. It gained **native covariate support**, with its largest reported gains on covariate-informed tasks. It runs on CPU and deploys via SageMaker JumpStart or AutoGluon-Cloud.

It captures momentum, volatility clustering, and seasonality that none of the existing baselines represent.

**More importantly, it supplies a falsification test the design currently lacks.** Nothing in the system as specified can distinguish *"the reasoning layer works"* from *"the reasoning layer is decoration around a severity score."* A Chronos-2 run given event severity as a plain numeric covariate answers that directly.

## Decision

### Baseline ladder — six rungs, each isolating a specific claim

| Rung | Baseline | What clearing it demonstrates |
|---|---|---|
| 1 | Always-flat | Nothing; sanity floor |
| 2 | Persistence | Direction carries information |
| 3 | Conditional climatology (ADR-0017) | Calendar and regime effects are being exploited |
| 4 | **Chronos-2 univariate** | Events add information beyond price history |
| 5 | **Chronos-2 covariate-informed** | Semantic reasoning beats statistical covariate learning |
| 6 | Agent | — |

**Rung 5 is the sharpest test in the project.** If Chronos-2 handed regime covariates and event severity as numbers matches the agent, then the wiki, correlation pages, and consolidation loop are unnecessary machinery around a value a statistical model uses just as well. The design should want that test to exist.

### The univariate forecast is shown; the covariate-informed one is not

**Prompt block 3 holds the Chronos-2 univariate quantile forecast**, converted to bucket probabilities — replacing conditional climatology in that slot. The agent predicts departure from it, exactly as before; only what fills the block changes, so ADR-0029's architecture carries over unchanged.

**The covariate-informed run is a scoring baseline only, never shown.** This preserves a clean division of labour — Chronos handles series dynamics, the agent supplies the event effect — and keeps rung 5 an untainted rival rather than something the agent was handed.

Conditional climatology remains a scoring baseline and continues to condition the analysis; it is simply no longer what the agent sees.

### The delta is evidence, not a training target

An agent that learns to *match* Chronos is learning to be a mediocre time-series model in prose. That is the wrong objective and must not be encoded as one.

Instead: **departing from Chronos and being right is strong confirming evidence** for whichever correlation the agent invoked — stronger than beating climatology, because Chronos already contains everything the price history holds, so beating it means the event carried genuinely new information. Departing and being wrong is disconfirming evidence, recorded on the correlation page as such (ADR-0005).

Chronos therefore improves the **quality of evidence written to the wiki**, not merely the scoreboard.

### Implementation constraints

- **Chronos is not a Bedrock model and is not an LLM.** It is a time-series foundation model: numeric series in, quantile forecasts out. There is no prompt, no text interface, and no Bedrock endpoint — so ADR-0019 does not apply to it. Weights come from Hugging Face (`amazon/chronos-2`); it is called as a **Python library**, not an API.
- **Runs in-process inside AgentCore Runtime**, with weights baked into the container image. At 120M parameters on CPU this is feasible and costs effectively nothing beyond compute time. A SageMaker JumpStart endpoint would carry standing cost, which is wrong for one daily batch; AutoGluon-Cloud serverless is the fallback if in-process proves impractical.
- **It sits on the deterministic side of ADR-0004's line**, alongside σ computation and climatology — not on the agent side. It is invoked by pipeline code, not by an agent, and it is not itself an agent.
- **Fixed seed required.** Probabilistic forecasts come from sampling trajectories, so without a pinned seed truncated replay (ADR-0018) breaks.
- **History and covariates both flow through the as-of gateway.** The covariate variant is the riskier one — more inputs, more places to leak, and severity covariates carry the overlay version hazard (L4) into a new component.
- **Quantile-to-bucket conversion is deterministic** given the trailing-60-session boundaries from ADR-0008.
- One forecast call yields both horizons; Chronos is multi-step ahead natively.

### Timing

**Built in v1, alongside the first backtest.** The first backtest is the moment a result gets interpreted, and without Chronos a weak result is ambiguous between "events don't help" and "our baselines were too easy." Adding it later means re-running the backtest for comparable numbers.

## Alternatives considered

- **Ensemble — blend Chronos and agent numerically.** Likely the best raw forecast accuracy. Rejected: the agent's contribution becomes unmeasurable, blend weights are another estimation problem on scarce data, and the project's central claim stops being testable. Accuracy is not the goal; *measured, attributable* accuracy is.
- **Scoring baseline only, never shown.** Cleanest isolation and zero anchoring risk. Rejected: the agent would forecast from a weaker starting point than available, degrading absolute quality for an experimental purity the baseline-blind control already provides.
- **Univariate only.** Simpler, one configuration. Rejected: leaves rung 5 — the actual test of the wiki thesis — unanswered.
- **Defer to v2, after the loop is proven.** Less to build up front. Rejected: early backtest numbers would be uninterpretable, and there is a real risk of drawing conclusions from them regardless.

## Consequences

- The project gains a genuine falsification test. A null result becomes interpretable rather than merely disappointing.
- Absolute prediction quality should improve — the agent departs from a far stronger starting point than climatology.
- **The anchoring risk becomes more serious, not less.** Chronos is a good forecaster, so an agent that simply echoes it will look competent while contributing nothing. The baseline-blind control (ADR-0029) is now doing much heavier lifting, and the anchoring index is promoted from a diagnostic to a primary metric.
- A second forecasting system to build, validate, and keep point-in-time correct. Real complexity, deliberately accepted.
- The covariate-informed variant extends the overlay-version hazard (ADR-0011) into Chronos: a severity formula change alters that baseline too, so rescoring must cover both.
- Conditional climatology is demoted from shown baseline to scoring baseline. ADR-0017's covariate work is unaffected — the factors still condition everything.
- Chronos model version becomes another stamp on every prediction, alongside model, prompt, filter and overlay versions.

## Revisit trigger

The agent fails to beat **rung 5** (Chronos-2 covariate-informed) out-of-sample after full backtest, while the model A/B harness (ADR-0027) indicates the reasoning model is not the limiting factor — which together would indicate the semantic reasoning layer adds nothing over statistical use of the same inputs, and the architecture should be reconsidered.
