# ADR-0038: Wiki bootstrap by deterministic seeding — tagged and toggleable

- **Status:** Accepted
- **Date:** 2026-08-09
- **Amends:** [ADR-0005](0005-llm-wiki-as-knowledge-layer.md) (wiki initial state), [ADR-0035](0035-backfill-execution-model.md) (what backfill now means)
- **Serves:** [ADR-0037](0037-forward-only-agent-learning.md), ADR-0034 (evidence model)

## Context

[ADR-0037](0037-forward-only-agent-learning.md) removes historical replay. That leaves the wiki empty on day 1, and ADR-0037's own consequence table names the resulting bottleneck: a specific correlation pairing may occur only a handful of times a year, so the computed confidence intervals of ADR-0034 stay too wide to act on for two to three years.

Two things were being conflated in the decision to drop history, and they have very different price tags:

| | What it produces | Cost | Contaminated? |
|---|---|---|---|
| **Replay** | The agent's *judgment* about past dates — interpretation, hypotheses, revisions | $24–1,584 in model calls | Yes — L11 across the pre-cutoff majority |
| **Seeding** | Historical *statistics* — event-to-outcome pairs | **$0.** A SQL join. No model call. | No — arithmetic has no training set |

Only the first is expensive and only the first carries contamination. Dropping replay does not require dropping the seed.

## Decision

### The seed is a deterministic join

For every classified historical event (available from ADR-0035 Phase 1, retained), join to the realised movement of each instrument:

> *event type X, severity S, occurred on date D → instrument Y moved Z σ over the following 1 and 5 sessions*

Written to the relevant correlation page as observation records. No model is involved at any point. The join is reproducible from the raw tables, so it needs no versioning of its own beyond the overlay version already stamped on each event (ADR-0011).

### Every observation carries a provenance tag

```
source: seeded    # deterministic join over pre-golive history
source: observed  # the agent predicted, the prediction matured, it was scored
```

The tag is mandatory on every observation record and is propagated into every downstream computation.

**Why this is the load-bearing part of the decision.** ADR-0034 computes confidence from a Beta posterior over the evidence list. Without provenance, a page showing high confidence would be indistinguishable between "the agent learned this" and "arithmetic already knew this" — which is precisely the claim the project exists to test. With the tag:

- Hit rate and confidence are computed **three ways** — seeded-only, observed-only, and combined — and the dashboard shows all three.
- The learning curve plots the observed-only series. It starts at zero on day 1 regardless of seeding, so the knowledge-accretion claim is measured on the agent's own record and nothing else.
- The agent's prompt (block 6, [prediction contract](../design/prediction-contract.md)) receives evidence with tags intact, so it can see that a hit rate rests on statistics rather than on the system's own track record.

### Seeding is a configuration flag, not a baked-in choice

```
/finevents/{env}/wiki/seed_enabled   →  true | false
```

The seed costs nothing to build and nothing to withhold, so there is no reason to resolve "seeded vs empty" by argument. Building it and gating it converts the question into an experiment.

**The empty-wiki arm is retained deliberately.** It is the purest demonstration of the WikiLLM claim — day 1 empty, day 200 populated, nothing else supplied — and it is the control that answers whether a statistical prior helps the agent or merely anchors it.

### The ablation this makes available

Run two agent instances over the same live days, identical in every respect except the flag:

| Arm | Wiki at go-live | Answers |
|---|---|---|
| `seed_enabled = true` | Pre-populated with historical statistics | Does a prior accelerate the agent? |
| `seed_enabled = false` | Empty | Or does it just anchor it to what climatology already knew? |

That second question is not rhetorical. A seeded page reporting *"geopolitical conflict → gold, 64% up-bias over 47 observations"* may cause the agent to reproduce a correlation that conditional climatology (ADR-0017) already captures — inflating apparent agreement while adding nothing over the ladder's second rung. The empty arm is the only way to detect that.

The ablation is not required at go-live. The flag and the tags are, because retro-fitting provenance onto an unlabelled wiki is not possible.

### Threshold calibration runs on the seed, at zero cost

The seed also settles a problem ADR-0037 created. The open thresholds were slated for calibration during backtest:

| Threshold | Calibrated against |
|---|---|
| Event-day severity bar (ADR-0037, top 20%) | Seed join — severity vs realised σ move. No model. |
| Severity floor for mandatory prediction (ADR-0013) | Seed join, same data |
| Pre-filter recall floor (ADR-0021) | Labelled sample, unchanged |
| Abstention rate and coverage floor (ADR-0013) | **Live only** — depends on agent behaviour, which no join can produce |

Three of four are recoverable from arithmetic. Only the fourth genuinely requires live running, and it is correctly identified in ADR-0037 as belonging to the tuning period.

## Alternatives considered

- **Empty wiki, no seed built at all.** Rejected as the sole design: it discards a free asset and forfeits the ablation permanently, since the comparison needs both arms to exist. Retained as one arm.
- **Seed without provenance tags.** Rejected outright. It makes the project's central claim unmeasurable while looking like it strengthens it — the worst available failure mode, because the resulting dashboard would be confidently wrong rather than visibly empty.
- **Seed with agent-generated interpretation** (a model call per historical pairing to write the narrative). Rejected: this is replay wearing a different name — it costs model calls and reintroduces contamination for no gain the join does not already provide.
- **Seed only the post-cutoff window.** Rejected: contamination applies to *models*, and the join uses none. There is nothing to protect against.

## Consequences

- **The cold-start problem is substantially mitigated at zero marginal cost.** Correlation pages have a statistical base from day 1; the agent's own record accrues on top of it, separately counted.
- **Three confidence figures per page instead of one**, which is more UI surface and more explaining. Accepted — the alternative is one figure that means two different things.
- **Every evidence consumer must be tag-aware**: the Beta posterior computation, the prompt assembly, the dashboard, and the learning-curve series. A consumer that ignores the tag silently reintroduces the exact confound this ADR exists to prevent, so tag-awareness is asserted in CI rather than left to review.
- **ADR-0035 Phase 1 is retained and now carries more weight** than when it was merely a precursor to replay. Historical event classification is what makes the join possible, and it remains the stateless-overlay constraint's justification.
- The seed's `as_of` boundary is the go-live date, trivially — every seeded observation predates day 1, so no point-in-time question arises within Lane B.
- **Anchoring risk gains a second face.** ADR-0029 tracks the agent anchoring to the *shown numeric baseline*. Seeding introduces the possibility of anchoring to *seeded statistics*, which the existing anchoring index does not measure. The seeded/observed divergence — whether the agent's own observations ever contradict the seed — is the metric that would reveal it, and it should be tracked from the first scored prediction.

## Revisit trigger

The ablation shows the seeded arm performing no better than the empty arm after twelve months of live running — at which point the seed is anchoring rather than informing, and `seed_enabled` should default to `false`.
