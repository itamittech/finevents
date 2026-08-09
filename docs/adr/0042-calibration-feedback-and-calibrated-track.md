# ADR-0042: Closing the self-improvement loop — calibration feedback and a calibrated track

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** ADR-0033 (evaluation harness), ADR-0005 (knowledge accretion), [ADR-0037](0037-forward-only-agent-learning.md)
- **Amends:** the prediction contract (new prompt block), the evaluation ladder (new rung)

## Context

The system has a working improvement loop: outcomes are scored, the curator writes them into correlation pages, statistics recompute, and tomorrow's predictor reads the updated evidence. Over time the evidence base grows and the credible intervals tighten.

**That loop learns about the world. Nothing in it learns about the predictor.**

Consider three failure modes:

| Failure | Would the wiki catch it? |
|---|---|
| *"Central bank surprises don't move gold the way this page claims"* | **Yes.** Hit rate falls, interval excludes the hypothesis, curator revises. |
| *"The model says 0.70 and that bucket occurs 45% of the time"* | **No.** Overconfidence is spread across every page; no page's hit rate reveals it. |
| *"The model departs too far from the baseline on high-severity days"* | **No.** Same reason. |

The second and third are *systematic* errors — properties of the predictor rather than of any correlation. They are the most fixable kind of error and currently the only kind with no feedback path. A system that repeats them indefinitely is not converging on the market, which is the stated goal.

**Neither requires an agent to fix.** Both are measurable by counting, and both have deterministic remedies.

## Decision

Two additions. Both are code. Neither adds a model call.

### Addition 1 — the predictor sees its own track record

A new prompt block, **6b — your own track record**, computed nightly from the scored prediction record and inserted after the accumulated evidence block:

```
Reliability (all instruments, t+1, last 250 predictions)
  you said 0.6–0.7 → outcome occurred 47% of the time   (overconfident by ~18pt)
  you said 0.3–0.4 → outcome occurred 41% of the time   (well calibrated)

Directional balance
  you predicted down on 62% of days; down occurred on 48%

Departure discipline
  departed >1 bucket from baseline:  RPS 0.34   (worse than baseline's 0.29)
  stayed within 1 bucket:            RPS 0.22   (better)

By severity
  severity > 2.0 days: RPS 0.31 vs climatology 0.28  — you are losing on the
  days you are most confident about
```

**Every line is arithmetic over the prediction record.** No model produces any of it, which matters for the same reason scoring has no model in it: a self-assessment the model wrote would be a self-assessment the model could flatter.

This is the wiki pattern applied to the predictor instead of to the world — accumulated, computed, and read back the next day.

### Addition 2 — a post-hoc calibration layer, scored as its own track

Block 6b relies on the model *acting* on what it reads. That is not guaranteed, and a weaker model may not (ADR-0040 notes Nova Pro is not a reasoning model in the extended-chain-of-thought sense).

So the same correction is also applied mechanically. A calibration map — isotonic regression from predicted probability to observed frequency — is refit nightly on the full scored record and applied to the raw agent distribution.

**The calibrated output does not replace the raw output. It is scored as a separate track**, becoming rung 6 of the ladder:

| Rung | Track |
|---|---|
| 1 | Climatology |
| 2 | Conditional climatology |
| 3 | Chronos-2 |
| 4 | TimesFM 2.5 |
| 5 | Agent — raw |
| **6** | **Agent — calibrated** |

Keeping both is the whole point. **The gap between rungs 5 and 6 is a direct measurement of how miscalibrated the model is**, and it is a number that should shrink as block 6b does its job. If it does not shrink, the model is not acting on its own record — which is itself a finding, and one that no other metric would surface.

### Fitting rules

- **Pooled across instruments, split by horizon.** Per-instrument fitting would be far too thin at year-1 volumes.
- **Minimum sample gate.** No calibration is applied below N scored predictions per horizon; below the gate, rung 6 equals rung 5 and is reported as ungated.
- **Cross-validated fit**, so the map is not scored on the data that produced it.
- **Fit on all history to date, applied to tomorrow.** Under forward-only ([ADR-0037](0037-forward-only-agent-learning.md)) that is trivially point-in-time correct — there is no as-of reconstruction to get wrong.
- **The fitted map is versioned per run** and stored with the manifest, so any calibrated prediction can be reproduced exactly.

### Cost

| Line | Cost |
|---|---|
| Block 6b — ~2k extra input tokens × 11 predictor calls | ~$0.50/month |
| Calibration fit + apply — Lambda, nightly | ~$0.00 |
| **System monthly** | **$16–33** |

## Alternatives considered

- **Let the curator write the self-assessment.** Rejected for the reason scoring has no model in it: a model assessing its own calibration can flatter itself, and the assessment is worthless the moment that is possible.
- **Apply calibration silently, replacing the raw output.** Rejected. It would make the agent look better while hiding *why*, and the rung 5 → 6 gap — the actual measurement of miscalibration — would vanish. Skill and post-processing must be separable.
- **Fine-tune the model on the prediction record.** Rejected: expensive, slow, opaque, and it would make every historical result incomparable across model versions. Prompt-level feedback plus a calibration map achieves the tractable part of the same goal for about fifty cents a month.
- **Per-instrument calibration maps.** Rejected at v1 volumes — ~500 predictions per instrument per year is too thin for a stable map. Revisit at year 2.
- **Do nothing; rely on the wiki loop.** Rejected: it is precisely the systematic errors the wiki cannot see that would persist indefinitely.

## Consequences

- **The improvement loop now has two arms**: the wiki accumulates knowledge about the world; block 6b and the calibration map accumulate knowledge about the predictor. Both are computed, both are read back daily.
- **The rung 5 → 6 gap becomes a headline metric.** A shrinking gap means the model is learning from its own record. A persistent gap means it is not, and the mechanical layer is carrying it.
- **Rung 6 must never be presented as the agent's skill.** It is the agent plus a fitted post-processor, and conflating them would overstate what the reasoning contributed.
- **A new tunable:** the minimum-sample gate. Set too low, early calibration fits noise and makes rung 6 worse than rung 5; too high and the mechanism sits idle for months.
- **Block 6b makes the predictor prompt self-referential**, which is a new failure surface: a model told it is overconfident may overcorrect into excessive abstention. The abstention rate and coverage floor (ADR-0013) already track this, and should be watched specifically in the weeks after 6b first carries a non-trivial payload.
- **The calibration map is a fitted artefact in a system that otherwise has none.** It is versioned per run and stored with the manifest so this stays auditable rather than becoming a quiet source of drift.

## Revisit trigger

The rung 5 → 6 gap fails to shrink over twelve months — meaning block 6b is not being acted on, and prompt-level self-knowledge does not work at the configured model. At that point the choice is a stronger predictor (ADR-0039's shadow would already have indicated this) or accepting the mechanical layer as permanent.
