# Product

## What this is

**An evaluation-first system that happens to predict.**

FinEvents scrapes financial instruments and world events daily, and learns how events relate to price movements through a knowledge base that compounds over time. It also ships an **evaluation harness** designed to be extracted and reused against someone else's predictor.

Both are first-class deliverables (ADR-0033).

## Who it's for

**Primarily its author** — as a learning and demonstration artifact. Evaluation rigour under adversarial conditions, point-in-time discipline, and cost engineering on a real problem.

**Secondarily, other builders** — as a reusable, contamination-aware evaluation harness for LLM-based forecasting systems, which the current literature says is missing.

**It is not for traders, and it does not offer investment advice.**

## What already exists, and why this is still worth building

The idea is not novel and the architecture is not either. Event-driven market analytics is a mature commercial category: RavenPack holds roughly 22% of the financial sentiment niche across 40,000+ sources; S&P Global acquired Kensho to compete there. Compounding agent memory for trading is published research (FinMem's layered episodic and semantic memory). Multi-agent role decomposition is published (TradingAgents).

**What the field's own critics say is missing is rigorous evaluation.** The 2026 literature names four recurring failure modes:

| Failure mode | Where it's handled here |
|---|---|
| Memory contamination — backtests overlapping model knowledge cutoffs, so memorised prices substitute for reasoning | L11; contamination splitting (ADR-0031) |
| Oracle fallacy — retrieving a past episode containing a post-hoc narrative | Bitemporal model and as-of gateway (ADR-0016) |
| Attribution — raw returns as a noisy proxy for skill | RPS and calibration against a six-rung baseline ladder, never returns |
| Unmodelled transaction costs | Not applicable — the system forecasts, it does not trade |

The papers note most published systems handle none of these. **That, not the prediction idea, is the differentiated part.**

## What success looks like

Success is **a trustworthy answer**, not a favourable one.

- The harness is credible enough that a *null* result is believable. Most published work cannot make that claim.
- The learning thesis is directly observable: the agent's edge over the best baseline, plotted over time. If the wiki compounds, that line trends up. If it is flat, the wiki is not contributing — and that is a finding.
- Every prediction is auditable back to human-readable evidence, including disconfirming cases.

**A negative result is a valid and publishable outcome.** If event reasoning does not beat two time-series foundation models handed the same severity number, that is worth knowing and rarely demonstrated rigorously.

### Forward-only is what makes that claim defensible

[ADR-0037](adr/0037-forward-only-agent-learning.md) removed historical replay: **the agent never runs against a past date.** Every result it ever produces is generated in real time against a target that had not happened yet.

This is the single strongest thing about the project's evidence, and it is worth stating plainly because it is the criticism most published work in this area cannot answer:

| Standard objection to event-driven backtests | Answer here |
|---|---|
| *"Your baselines were pre-trained on these series"* | The target is always tomorrow. Contamination is structurally impossible, not merely bounded. |
| *"Your point-in-time reconstruction has a leak somewhere"* | Nothing is reconstructed. `as_of` is always *now*. |
| *"You tuned on the test set"* | There is no test set. Thresholds are calibrated on a deterministic join that touches no agent output. |
| *"The learning curve is an artefact of how you replayed history"* | The curve is elapsed calendar time. Day 200 is 200 days after day 1. |

The price is patience, and it is a real price. The numeric ladder is calibrated and running on day 1, but:

| Milestone | When |
|---|---|
| Tuning window closes, configuration freezes ([ADR-0045](adr/0045-tuning-window.md)) | ~month 3 |
| **Aggregate agent-versus-ladder skill measurable** | **~month 11–13** |
| Individual correlation pages at actionable confidence | Year 2–3 |

Nothing about the agent is known at launch, by construction. The first three months are a tuning period whose results are published but excluded from the skill record — the boundary fixed in advance, because choosing it afterwards is indistinguishable from selecting a favourable start date.

That trade is deliberate. A contaminated result available in month 1 would have to be defended for the life of the project; a clean one available in month 9 does not.

## Explicit non-goals

- **Tradeable alpha.** Public news impact at daily horizon is heavily arbitraged. Nothing here claims otherwise.
- **Profitability.** "Predicts direction" and "makes money" are separated by transaction-cost drag — 10–20bps round-trip compounds to 25–50 percentage points annually for daily systems. This design does not address it, and the claim must never be made.
- **Investment advice or research-analyst services.** In India these require SEBI registration. This is a research and engineering artifact.
- **Competing with incumbents on data breadth.** They have 40,000 sources and twenty years of history. We have free-tier sources and eleven years of GDELT.

## Where the structural advantages actually are

**Explainability.** Incumbents face regulatory pressure toward explainable AI and are retrofitting it onto opaque models. Every forecast here cites human-readable wiki pages carrying evidence, hit rates, and contradictions — explainable by construction, not by addition.

**Evaluation discipline.** Point-in-time bitemporal reads, snapshot integrity and cross-market ordering tests, a baseline ladder including two foundation models scored on identical live days, anchoring controls, abstention with missed-move tracking — and, underneath all of it, **forward-only execution**, which removes the failure mode the rest of the harness exists to detect rather than detecting it.

**Cost.** Roughly **$16–33/month** end to end, with **one-off setup around $4**. The design is a demonstration that this class of system does not require institutional budgets — and forward-only is why: the single largest line item in every earlier design was replaying history through a model, which turned out to be both the most expensive component and the least trustworthy one.

## Open

- Licence: permissive (Apache 2.0 or MIT) for harness reusability; data-redistribution policy separate.
- Whether the pattern is later applied to a less adversarial domain — operations, incidents, supply chain — where events-to-outcomes holds but the field is not arbitraged.
- How the project is presented publicly during the ~9 months before it has an agent result. The harness, the ladder, the ADR record and the live dashboard are all shippable and interesting on day 1; the skill claim is not, and must not be implied by a dashboard that looks like it is making one.
