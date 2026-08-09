# FinEvents

An evaluation-first system that happens to predict.

FinEvents collects financial instrument prices and world events daily, maintains a wiki of event-to-price correlations that it writes itself, and asks one question: **does accumulated event knowledge improve forecasts beyond what time-series models already know?**

A negative answer is a valid and publishable outcome. The design is built so that a null result is believable.

> **Status: pre-implementation.** The design phase is complete — 45 ADRs, requirements, design and a build plan. No code has been written yet. See [Tasks.md](docs/Tasks.md) for the build order.

## What makes this different

**The agent never runs against a historical date.** There is no backtest and no replay ([ADR-0037](docs/adr/0037-forward-only-agent-learning.md)). Every prediction is made in real time against a target that has not happened yet.

This is unusual, and it is the point. It means:

| Standard objection to event-driven backtests | Answer here |
|---|---|
| *"Your baselines were pre-trained on these series"* | The target is always tomorrow. Contamination is structurally impossible, not merely bounded. |
| *"Your point-in-time reconstruction has a leak somewhere"* | Nothing is reconstructed. `as_of` is always *now*. |
| *"You tuned on the test set"* | There is no test set. Thresholds calibrate against a deterministic join that touches no agent output. |
| *"The learning curve is an artefact of how you replayed history"* | The curve is elapsed calendar time. Day 200 is 200 days after day 1. |

The price is patience: no interpretable agent result before roughly month 11–13.

## How it works

Six forecasters compete on the same unseen day, scored by Ranked Probability Score over volatility-relative movement buckets at t+1 and t+5:

1. Climatology
2. Conditional climatology — calendar and regime
3. [Chronos-2](https://github.com/amazon-science/chronos-forecasting) — Amazon
4. [TimesFM 2.5](https://github.com/google-research/timesfm) — Google
5. The agent, reading its accumulated wiki
6. The agent, calibrated

Rung 2 is the honesty check: if Diwali and a rate-hike regime explain the movement, the event narrative is decoration.

Rung 3 and 4 are the real bar. Beating two state-of-the-art time-series foundation models handed the same severity signal is what "event reasoning helps" would actually mean.

### Not an agent

Despite appearances, nothing here has tools or runs its own loop ([ADR-0041](docs/adr/0041-no-agents-deterministic-pipeline.md)). Every model call is single-shot against a prompt assembled by code. Agency was examined and declined — a deterministic correlation sweep covers the whole hypothesis grid more completely than a curious agent would, and costs nothing.

The system is a Step Functions pipeline with three model calls a day: classify, predict, curate.

## Documentation

Start with the [ADR index](docs/adr/README.md).

| Document | Covers |
|---|---|
| [Product.md](docs/Product.md) | Positioning, prior art, explicit non-goals |
| [SystemDesign.md](docs/SystemDesign.md) | End-to-end architecture; §2.1 is the agency boundary |
| [Requirement.md](docs/Requirement.md) | ~110 numbered, testable requirements |
| [Design.md](docs/Design.md) | Modules, interfaces, schemas, algorithms |
| [Tasks.md](docs/Tasks.md) | Build order and gates |
| [Point-in-time test harness](docs/design/point-in-time-test-harness.md) | Leakage threat model |
| [AWS architecture](docs/design/aws-architecture.md) | Topology and cost model |
| [Prediction contract](docs/design/prediction-contract.md) | Prompt blocks, output schema, validation |

## Cost

Roughly **$16–33 per month**, with about **$4 of one-off setup**. Deliberately — this is meant to demonstrate that a system of this kind does not require institutional budgets.

## Non-goals

- Tradeable alpha. Public news impact at daily horizons is heavily arbitraged.
- Profitability. "Predicts direction" and "makes money" are separated by transaction-cost drag.
- Investment advice. In India this requires SEBI registration. This is a research and engineering artifact.

## Licence

[Apache 2.0](LICENSE). Derived data — predictions, scores, wiki pages, the steering audit — is published so a null result is verifiable by someone other than its author. Raw acquired content is never redistributed. See [NOTICE](NOTICE) and [ADR-0044](docs/adr/0044-licence-and-publication-policy.md).
