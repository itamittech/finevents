# ADR-0039: Model A/B runs live as a shadow, not offline on replayed dates

- **Status:** Accepted — **scope narrowed to the predictor role by [ADR-0040](0040-split-reasoning-model-by-role.md)**
- **Date:** 2026-08-09
- **Amends:** [ADR-0027](0027-model-selection-as-configuration.md) — the A/B mechanism, not the requirement
- **Caused by:** [ADR-0037](0037-forward-only-agent-learning.md) — the offline mechanism no longer exists

> **Amendment note (2026-08-09):** [ADR-0040](0040-split-reasoning-model-by-role.md) assigns Nova Premier to the wiki curator outright, so **the "curator is measured separately" section below is cancelled** — there is no longer a curator comparison to run. The reasoning in that section is *why* the curator was assigned to Premier rather than tested into it: curation quality has no daily score, so its failure surfaces months later as a degraded wiki, by which point the damage is the measurement.
>
> **The predictor arm is unchanged and its cost is unchanged at ~$18.** The primary predictor remains Nova Pro and the rival remains Premier, so the arm is the same size as specified. Everything else below stands.

## Context

ADR-0027 requires a model A/B before any backtest result is trusted, and states the reason plainly: a reasoning model that is too weak produces a result that is *uninterpretable* rather than merely worse. A flat backtest would be indistinguishable between "events do not help" and "Nova Pro could not find the help."

That requirement stands, and [ADR-0037](0037-forward-only-agent-learning.md) makes it more urgent, not less — with no offline result to fall back on, the live record is the only evidence the project will ever have about the agent.

But ADR-0036 specified the A/B as *30 replayed dates run under both models*, and [ADR-0037](0037-forward-only-agent-learning.md) withdraws replay. The mechanism is gone; the requirement is not.

## Decision

**Nova Premier runs as a shadow alongside the live Nova Pro predictor**, on the same days, against the same prompt, for a bounded evaluation window.

| Parameter | Value |
|---|---|
| Primary | `amazon.nova-pro-v1` — the live predictor, ADR-0027 default per ADR-0036 |
| Shadow | `amazon.nova-premier-v1` |
| Instruments | The four of ADR-0036 — gold spot, NIFTY 50, S&P 500, MCX gold |
| Window | 60 consecutive trading days |
| Cost | ~$18 total, ~$9/month for two months, then off |
| Scored on | Ranked Probability Score at t+1 and t+5, plus abstention rate and anchoring index |

**The shadow's output is recorded and scored. It never reaches the wiki, the dashboard's live prediction surface, or any consolidation call.** It is an observer with no side effects, so a stronger model running in shadow cannot contaminate the record the primary model is building.

### Why this is better evidence than the offline A/B it replaces

The offline design compared two models on *reconstructed* past days. The shadow compares them on the live task as actually run — same wiki state, same evidence, same unseen target, same information cut-off. Whatever gap appears is a gap on the job the model actually does.

Cost is comparable: ~$18 against the ~$12 the offline A/B would have cost, and only the Premier side is incremental since Pro is running regardless.

### What it is asked to settle

The concern recorded in ADR-0027 and reinforced by published benchmarks — Nova Pro scores 8 on the Artificial Analysis Intelligence Index against Premier's 13, and is not a reasoning model in the extended-chain-of-thought sense — is real but may not bind on *this* task.

The predictor's job is heavily scaffolded. It receives two foundation-model forecasts (ADR-0030, 0031), regime state as computed σ-moves, classified events with computed severity, and correlation evidence whose confidence is computed in code (ADR-0034). It produces no number that is not a bucket probability. Its remaining task is a bounded judgment: *shift this distribution, or don't*.

**That scaffolding also means a weak model fails safe** — it leans on the baselines it was handed and produces near-baseline output, so the system degrades to "as good as two state-of-the-art forecasters" rather than to noise. The floor is high.

**But the same scaffolding makes echoing the path of least resistance**, and an echoing model yields near-zero measured edge that reads identically to "events do not help." That is the failure mode the shadow exists to distinguish, and it is why the **anchoring index (ADR-0029) is scored for both arms** rather than RPS alone. Two models with equal RPS but different anchoring indices are not equally good.

### The curator is measured separately

The predictor is scaffolded; the wiki curator is much less so. Its job — deciding what an observation means for a hypothesis, whether to flag a contradiction — is closer to open judgment, and its errors compound permanently into the wiki rather than being scored and forgotten.

ADR-0034 removed confidence-setting from the curator and page assignment is a manifest key lookup, so the gap is narrower than it first appears. It is not zero.

**Consolidation is therefore A/B'd separately**: re-run consolidation on a fixed sample of scored predictions under both models and compare the resulting page edits for evidence handling and contradiction flagging. Because consolidation runs once per day rather than eleven times, this is cheap, and it can begin as soon as ~30 scored predictions exist.

### Roles may split

The two comparisons are independent and may resolve differently. If the predictor shows no gap and the curator does, the outcome is Nova Pro predicting at 11 calls/day and Nova Premier consolidating at 1 call/day — roughly $155/year against $83 all-Pro and $288 all-Premier.

ADR-0027 already makes this a parameter change: `/finevents/{env}/model/reason` splits into per-role parameters if the evidence calls for it.

## Alternatives considered

- **Skip the A/B; commit to Nova Pro on cost.** Rejected. It is the one decision that determines whether a null result means anything, and $18 is not a meaningful saving against an uninterpretable outcome.
- **Run the shadow permanently.** Rejected: ~$9/month indefinitely to re-answer a settled question. Bounded window, then off, with the revisit trigger to restart it.
- **Shadow all eleven live instruments.** Rejected: the four of ADR-0036 already span the mechanisms — metals, India equity, US equity, currency leg — and eleven would cost ~$50 for a sharper reading of a question that a clear result at four already answers.
- **Promote the shadow's output when it disagrees.** Rejected outright. It would make the live record a mixture of two models, so neither arm's score would mean anything and the wiki would carry provenance no ADR describes.

## Consequences

- The A/B result arrives ~3 months after go-live rather than before it. Predictions made in the interim stand on the primary model, and if the shadow later wins the early record must be labelled as having been made under the losing configuration — not silently rescored.
- Cassette invalidation (ADR-0018) applies to the shadow independently; its cache key already includes the model ID, so no change is needed.
- Prompt-caching economics differ by model family and must be re-derived for Premier rather than carried across from Pro — ADR-0027 already records this, and the shadow is where it first bites.
- Running two models on one prompt requires the prompt layer to already be model-aware (ADR-0027). The shadow is the first real test of that, which is a useful side effect.
- Both models must be available in `us-east-1` with access requested, asserted at deploy rather than discovered at runtime.

## Revisit trigger

The shadow window closes with a material RPS or anchoring-index gap in Premier's favour — or the reasoning model changes for any reason, at which point the shadow restarts against the new primary.
