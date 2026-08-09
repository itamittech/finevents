# ADR-0040: Split the reasoning model by role — Nova Pro predicts, Nova Premier curates

- **Status:** Accepted
- **Date:** 2026-08-09
- **Amends:** [ADR-0027](0027-model-selection-as-configuration.md) (single reasoning parameter), [ADR-0039](0039-live-shadow-model-ab.md) (shadow scope)
- **Caused by:** [ADR-0037](0037-forward-only-agent-learning.md) — which invalidated the reason the previous default existed

## Context

The live reasoning default was Nova Premier under ADR-0027, then Nova Pro under ADR-0036. **ADR-0036's reason was entirely about replay:** replaying 280 dates cost $24 at Pro against $85 at Premier, and since a backtest must measure the system actually run, the live model had to follow the replay model down.

[ADR-0037](0037-forward-only-agent-learning.md) removed replay. There is no replay cost to optimise and no backtest to keep consistent with, so **the justification for the Nova Pro default no longer exists**. It was carried forward in ADR-0037 unexamined, which this ADR corrects.

What remains is the raw monthly delta — and one thing forward-only genuinely changed.

### Forward-only made the cost of a mistake asymmetric across roles

| Failure | Under replay | Under forward-only |
|---|---|---|
| A bad prediction on day 40 | Re-run the replay for $24 | Scored, then forgotten. One data point of ~5,500. |
| A bad wiki page written on day 40 | Re-run the replay for $24 | **Compounds permanently.** Repairing it means re-consolidating days 41→N, and forward-only deliberately removed the machinery that could do that. |

The two roles were equally recoverable when replay existed. They are not now. Prediction errors are scored and absorbed; curation errors are written into the substrate every later prediction reads.

### The scaffolding protects one role and not the other

The **predictor** is heavily scaffolded. It receives two foundation-model forecasts (ADR-0030, 0031), regime state as computed σ-moves, classified events with computed severity, and correlation evidence whose confidence is computed in code (ADR-0034). It emits no number that is not a bucket probability. Its remaining task is bounded: *shift this distribution, or don't.* **A weak model there fails safe** — it leans on the baselines and the system degrades to "as good as Chronos and TimesFM," which is a high floor.

The **curator** has none of that. Deciding what an observation means for a hypothesis, and whether an outcome contradicts a stated claim, is open judgment with no numeric rail underneath it. ADR-0034 removed confidence-setting from it and page assignment is a manifest key lookup, so the exposure is narrower than it first appears — but it is not zero, and it is exactly where the irrecoverable failure lives.

**The asymmetry in stakes and the asymmetry in scaffolding point the same way**, at the same role. That is what makes a split the precise answer rather than a compromise.

## Decision

The single `/finevents/{env}/model/reason` parameter splits into two:

| Role | Parameter | Model | Calls/day | Why |
|---|---|---|---|---|
| Prediction | `/finevents/{env}/model/reason/predict` | `amazon.nova-pro-v1` | 11 | Heavily scaffolded; fails safe; 11× the volume |
| Wiki consolidation | `/finevents/{env}/model/reason/curate` | `amazon.nova-premier-v1` | 1 | Unscaffolded; errors are permanent under forward-only |
| Classification, severity | `/finevents/{env}/model/classify` | `amazon.nova-lite-v1` | 1 | Unchanged (ADR-0022) |

Everything else in ADR-0027 stands: model IDs remain configuration, no model ID appears in application code, and both models must be available in the deployed region with access requested — asserted at deploy, not discovered at runtime.

### The baseline-blind control stays on Nova Pro

ADR-0029's baseline-blind control exists to compute the anchoring index by running the predictor without the numeric baselines. **It must run on the same model as the primary predictor.** If the control ran on Premier while the primary ran on Pro, the anchoring index would conflate "how much did the baseline move the answer" with "how much did the model change move the answer," and would measure neither.

### There is no scale-consistency problem between the two roles

A prior concern on this project was two models producing severity scores on incompatible scales. It does not recur here. The predictor and curator do not share a numeric output space at all — they communicate through structured page content, and every number in that content is computed in code (ADR-0034) or produced by Nova Lite (ADR-0022). Neither model emits a figure the other consumes.

### Cost

| Line | All Pro | **Split** | All Premier |
|---|---|---|---|
| Predictor, 11 calls/day | $3.77 | $3.77 | $12.82 |
| Wiki curator, 1 call/day | $1.25 | **$4.25** | $4.25 |
| Baseline-blind control | $0.38 | $0.38 | $1.29 |
| Prompt caching credit | −$0.55 | −$0.55 | −$1.87 |
| Nova Lite — classify, severity | $0.05 | $0.05 | $0.05 |
| **Bedrock, monthly** | **$4.90** | **$7.90** | **$16.54** |
| **System total, monthly** | $12–28 | **$15–31** | $24–40 |

**The split costs $3.00/month more than all-Pro — about $36/year — with no offsetting saving.** All-Premier costs a further $8.64/month to upgrade the eleven calls a day where the scaffolding already protects the outcome, which is the part this ADR declines to buy.

## Alternatives considered

- **All Nova Pro (the standing default).** Rejected: cheapest, but leaves the one role whose errors cannot be undone on the weaker model, at the exact moment ADR-0037 made undoing impossible.
- **All Nova Premier.** Defensible as insurance, and the user's initial reading. Rejected on cost: $8.64/month buys a stronger model for the role that fails safe, while the split already covers the role that does not.
- **Keep one parameter and A/B into the answer.** Rejected for the curator specifically. An A/B needs a scored outcome, and curation quality has no daily score — its failure surfaces months later as a degraded wiki, by which point the damage is the thing being measured.
- **Escalate to Premier only on high-severity days.** Rejected for v1, as in ADR-0027: it makes behaviour non-reproducible across runs and complicates the replay harness. Worth revisiting once the shadow can quantify the benefit.

## Consequences

- **The curator question is settled by choice rather than by measurement**, deliberately. The predictor question is not, and remains with [ADR-0039](0039-live-shadow-model-ab.md)'s shadow arm — whose scope narrows to the predictor role only, since there is no longer a curator comparison to run.
- **The shadow's cost is unchanged at ~$18.** The primary predictor is still Nova Pro and the rival is still Premier, so the arm is the same size. What is cancelled is ADR-0039's separate consolidation comparison.
- **Two cassette namespaces instead of one.** ADR-0018's cache key already includes the model ID, so this needs no change — but a model switch now invalidates one role's cassettes without touching the other's, which is a small improvement in re-record friction.
- **Prompt caching economics must be derived per role.** Both models are Nova family so formatting is shared, but Nova caps cached content near 20k tokens and the two roles have very different prompt shapes. The curator's single daily call gets little caching benefit either way.
- **Configuration drift gains a new face:** an environment running Pro for both roles would silently look like a valid Dev environment while producing a wiki built by a different model than Prod's. Parameter values are asserted at deploy (ADR-0027); that assertion now covers three parameters rather than two.
- **If the shadow later shows Premier winning on prediction too**, the change is a parameter update and the system converges on all-Premier at $16.54/month — with the early record labelled as having been made under the losing predictor configuration, not silently rescored.

## Revisit trigger

The shadow arm shows a material RPS or anchoring-index gap in Premier's favour on the predictor role — **or** wiki quality review finds Premier's curation indistinguishable from Pro's after twelve months, at which point the curator drops to Pro and the $3.00/month is returned.
