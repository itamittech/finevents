# Architecture Decision Records

Every non-obvious, hard-to-reverse decision on FinEvents gets an ADR. The point is that six months from now the reasoning is recoverable — including the reasoning behind decisions we later reverse.

## Process

1. A decision is proposed as an ADR with status `Proposed`.
2. Discussion happens in the ADR, not in chat history that gets lost.
3. Once agreed it becomes `Accepted` and is dated.
4. ADRs are **immutable once accepted**. To change a decision, write a new ADR that supersedes it and set the old one to `Superseded by ADR-XXXX`. Never edit an accepted ADR's Decision section.

## Revisit triggers

Every ADR carries a **Revisit trigger** — a concrete, observable condition that means the decision should be reopened. This is what makes the decisions monitorable rather than just recorded. A decision with no revisit trigger is either genuinely permanent or not thought through.

Review triggers at each monthly checkpoint.

## Traceability

The chain is: `Requirement.md` (REQ-xxx) → `Design.md` / `SystemDesign.md` → ADR → `Tasks.md` → test.

Each ADR lists the requirements it serves. Each requirement should be reachable from a task and a test. If an ADR serves no requirement, question whether the decision is needed.

## Index

| ADR | Title | Status | Date | Revisit trigger |
|---|---|---|---|---|
| [0001](0001-spec-driven-development-with-adrs.md) | Spec-driven development with ADRs | Accepted | 2026-08-09 | Doc overhead visibly slows delivery |
| [0002](0002-firecrawl-as-sole-data-acquisition-layer.md) | Firecrawl as the sole data acquisition layer | Amended by 0010 | 2026-08-09 | Credit burn >4,000/mo, or extraction accuracy <99% |
| [0003](0003-track-gold-at-both-usd-spot-and-mcx-inr.md) | Track metals at both USD/oz spot and MCX INR | Accepted | 2026-08-09 | MCX page proves unscrapable |
| [0004](0004-step-functions-for-orchestration.md) | Step Functions for daily pipeline orchestration | Accepted | 2026-08-09 | Pipeline needs sub-minute or reactive triggering |
| [0005](0005-llm-wiki-as-knowledge-layer.md) | Karpathy LLM Wiki pattern as the knowledge layer | Amended by 0026 | 2026-08-09 | Wiki exceeds ~500 pages or retrieval degrades |
| [0006](0006-streamlit-frontend-with-exit-criteria.md) | Streamlit frontend, with defined exit criteria | Superseded by 0020 | 2026-08-09 | — |
| [0007](0007-bootstrap-with-historical-backfill.md) | Bootstrap with historical backfill (GDELT 2.0 + free price history) | Amended by 0053 | 2026-08-09 | No out-of-sample value beyond climatology |
| [0008](0008-volatility-relative-movement-buckets.md) | Volatility-relative buckets, 1-day and 5-day horizons | Accepted | 2026-08-09 | RPS never beats climatology, or flat bucket >80% |
| [0009](0009-scope-indices-and-metals-first.md) | Scope v1 to indices and metals; defer equities | Accepted | 2026-08-09 | Loop beats climatology (promote equities to v2) |
| [0010](0010-permit-free-keyless-sources-alongside-firecrawl.md) | Permit free keyless sources alongside Firecrawl (amends 0002) | Amended by 0053 | 2026-08-09 | A free source starts requiring registration |
| [0011](0011-cameo-substrate-with-financial-relevance-overlay.md) | CAMEO substrate with financial relevance overlay | Accepted | 2026-08-09 | Severity uncorrelated with realised volatility |
| [0012](0012-scrape-economic-calendars-for-consensus.md) | Scrape public economic calendars for consensus | Accepted | 2026-08-09 | Consensus history unavailable beyond ~2 years |
| [0013](0013-permit-abstention-with-tracked-coverage.md) | Permit abstention, with coverage tracked | **Superseded by 0048** | 2026-08-09 | — |
| [0014](0014-security-pre-commit-docs-in-ci.md) | Security pre-commit, documentation in CI | Accepted | 2026-08-09 | Secret reaches public repo, or >20% doc exemptions |
| [0015](0015-aws-sam-for-infrastructure.md) | AWS SAM for infrastructure as code | Accepted — one consequence invalidated by 0020 | 2026-08-09 | Template >1,000 lines, or divergence params can't express |
| [0016](0016-bitemporal-data-model-with-as-of-gateway.md) | Bitemporal data model with as-of gateway | Amended by 0026 | 2026-08-09 | Truncated replay finds leakage the gateway should stop |
| [0017](0017-environmental-factors-as-covariates.md) | Calendar, seasonal and regime factors as covariates | Accepted | 2026-08-09 | Conditional climatology no better than naive |
| [0018](0018-record-and-replay-llm-responses.md) | Record and replay LLM responses for deterministic testing | Accepted | 2026-08-09 | Re-recording becomes routine in most PRs |
| [0019](0019-amazon-bedrock-as-model-provider.md) | Amazon Bedrock as the model provider | Accepted | 2026-08-09 | A needed capability lags on Bedrock (→ Claude Platform on AWS) |
| [0020](0020-static-spa-frontend.md) | Static SPA on S3 + CloudFront (supersedes 0006) | Accepted | 2026-08-09 | Frontend build delays the learning loop by a month |
| [0021](0021-deterministic-prefilter-before-classification.md) | Deterministic pre-filter before model classification | Accepted | 2026-08-09 | Recall below floor, or missed moves rise |
| [0022](0022-nova-lite-for-classification.md) | Nova Lite for classification and severity scoring | Amended by 0027 | 2026-08-09 | Spot-check disagreement vs stronger model exceeds threshold |
| [0023](0023-cognito-for-dashboard-authentication.md) | Cognito user pool for dashboard and steering auth | Accepted | 2026-08-09 | Setup disproportionate for a single user |
| [0024](0024-single-account-per-environment-stacks.md) | Single AWS account, per-environment stacks, us-east-1 | Accepted | 2026-08-09 | An environment boundary is crossed in practice |
| [0025](0025-no-managed-knowledge-base.md) | No managed knowledge base; deterministic wiki index | Accepted | 2026-08-09 | Wiki >500 pages **and** key-based selection fails |
| [0026](0026-s3-versioning-with-run-manifests.md) | S3 versioning + run manifests as wiki version control (amends 0005, 0016) | Accepted | 2026-08-09 | Fold latency at backtest scale, or hand-inspection too painful |
| [0027](0027-model-selection-as-configuration.md) | Model selection is configuration, not code (amends 0022) | Accepted | 2026-08-09 | A/B harness shows a material gap vs a stronger model |
| [0028](0028-agentcore-runtime-and-observability.md) | AgentCore Runtime + Observability; Memory declined | Accepted | 2026-08-09 | Runtime cost material, or SAM can't express AgentCore |
| [0029](0029-prediction-as-departure-from-baseline.md) | Prediction as departure from baseline, one call per instrument | Amended by 0030 | 2026-08-09 | Coherence violations rise, or anchoring index high |
| [0030](0030-chronos-as-baseline-and-shown-forecast.md) | Chronos-2 as shown baseline and scoring rivals (amends 0008, 0029) | Amended by 0031, 0047 | 2026-08-09 | Agent fails to beat top rung while model is not the limit |
| [0031](0031-timesfm-third-track-and-ensemble-baselines.md) | TimesFM 2.5 as a third track (ensemble part superseded by 0032) | Accepted in part | 2026-08-09 | Numeric tracks indistinguishable, or backtest window unusable |
| [0032](0032-no-ensembling-three-independent-tracks.md) | No ensembling; three independent tracks (supersedes 0031's ensemble) | Amended by 0051 | 2026-08-09 | Project moves from experiment to product |
| [0033](0033-evaluation-harness-as-first-class-deliverable.md) | Evaluation harness is a first-class deliverable | Accepted | 2026-08-09 | Agent beats top rung on post-cutoff data |
| [0034](0034-correlation-page-evidence-model.md) | Correlation page evidence model — per-horizon, computed confidence | Accepted | 2026-08-09 | Credible intervals never reach actionable confidence |
| [0035](0035-backfill-execution-model.md) | Backfill — bulk phase then sequential replay | Phase 1 accepted; Phase 2 removed by 0037 | 2026-08-09 | — |
| [0036](0036-event-stratified-replay-scope.md) | Event-stratified replay, 4 instruments, Nova Pro | **Superseded by 0037** | 2026-08-09 | — |
| [0037](0037-forward-only-agent-learning.md) | **Forward-only agent learning; no historical replay** (supersedes 0036) | Accepted | 2026-08-09 | 12 months live with no separation, model not the limit |
| [0038](0038-wiki-seeding-tagged-and-toggleable.md) | Wiki bootstrap by deterministic seeding — tagged and toggleable (amends 0005, 0035) | Accepted | 2026-08-09 | Seeded arm no better than empty arm after 12 months |
| [0039](0039-live-shadow-model-ab.md) | Model A/B runs live as a shadow (amends 0027) | Accepted, narrowed by 0040 | 2026-08-09 | Material RPS or anchoring gap, or the primary model changes |
| [0040](0040-split-reasoning-model-by-role.md) | **Split reasoning model by role — Pro predicts, Premier curates** (amends 0027, 0039) | Accepted | 2026-08-09 | Shadow shows a predictor gap, or curation quality proves indistinguishable at 12 months |
| [0041](0041-no-agents-deterministic-pipeline.md) | **The agency boundary — deterministic pipeline, no agents** (amends 0028; drops Strands SDK) | Accepted; superseded in part by 0057 | 2026-08-09 | Bounded context proves the limit — a contradiction needs evidence more than one hop away |
| [0042](0042-calibration-feedback-and-calibrated-track.md) | **Calibration feedback + a calibrated track** — the predictor learns about itself, not just the world | Accepted | 2026-08-09 | Rung 5→6 gap fails to shrink over 12 months |
| [0043](0043-steering-interface.md) | Steering — flag, propose, edit, correct; all provenance-tracked | Accepted | 2026-08-09 | Human-touched pages come to dominate the wiki |
| [0044](0044-licence-and-publication-policy.md) | Apache 2.0; derived data published, raw content never | Accepted | 2026-08-09 | A source changes terms affecting already-published artefacts |
| [0045](0045-tuning-window.md) | Tuning window = 60 trading days, ending when configuration freezes | Accepted | 2026-08-09 | The shadow A/B's duration changes — the two are defined to coincide |
| [0046](0046-pre-registered-skill-comparison.md) | **The pre-registered skill comparison** — statistic, comparator, interval, and what may be claimed when | Accepted | 2026-08-09 | Measured κ or realised RPS variance differs materially from the simulated value |
| [0047](0047-ladder-rung-identity.md) | Ladder rungs 3 and 4 are the **covariate-informed** forecasts (amends 0030, 0031, 0033) | Accepted | 2026-08-09 | The covariate-informed configuration proves unavailable or degenerate |
| [0048](0048-abstention-per-horizon-scored-at-baseline.md) | **Abstention is per-horizon, and abstained days are scored at the baseline** (supersedes 0013) | Accepted | 2026-08-09 | Abstention exceeds the floor **and** missed moves exceed the error predicting would have incurred |
| [0049](0049-market-calendar-scope-and-otc-spot.md) | Market calendars for all five venues; synthetic session for OTC spot (amends 0037, 0003) | Accepted | 2026-08-09 | A venue changes session times, or a spot benchmark makes the synthetic close unnecessary |
| [0050](0050-publication-gate-scoped-to-data.md) | The data-terms gate binds on **data publication, not repository visibility** (supersedes 0044's gate timing) | Accepted | 2026-08-09 | Any of the four data-terms questions resolves unfavourably |
| [0051](0051-pooled-forecast-as-product-output.md) | **A pooled forecast is the product output** (supersedes 0032's no-combination rule) | Accepted | 2026-08-09 | The pool underperforms the best single track over a full measurement period |
| [0052](0052-leave-one-out-attribution.md) | **Leave-one-out contribution is the primary skill endpoint** (amends 0046) | Accepted | 2026-08-09 | The pooled forecast is withdrawn or its composition changes materially |
| [0053](0053-remove-stooq-as-a-price-source.md) | **Remove Stooq as a price source** — it now serves a bot challenge (amends 0007, 0010) | Accepted | 2026-08-09 | A free source with permissive terms and daily metals history appears |
| [0054](0054-toolchain.md) | **Python 3.13, uv, pytest, moto, GitHub Actions** — closes T0.13; the wheel intersection turned out not to bind | Accepted | 2026-08-10 | A dependency ships no `cp313` aarch64 wheel, or Lambda dates the 3.13 runtime |
| [0055](0055-timesfm-covariate-persistence.md) | **TimesFM's future covariates held at their last observed value**, and the policy recorded on every forecast | Accepted | 2026-08-13 | TimesFM gains a past-only covariate mode, or the persistence assumption proves to be doing visible work |
| [0056](0056-random-walk-covariate-control.md) | **A random-walk covariate control** — a meaningless covariate damages the forecast as much as a real one, so covariate rungs need a control scored on the same live days | Accepted | 2026-08-13 | A covariate set beats its random-walk control over 250+ scored days |
| [0057](0057-strands-for-the-reasoning-layer.md) | **Strands for the reasoning layer** — a scoped supersession of 0041: the POC's LLM rungs are a Strands agent (provider from env, everything recorded, bounded turns); the deterministic pipeline stands everywhere else | Accepted | 2026-08-13 | Increment 12 arrives, or Strands cannot satisfy full recording |

## The forward-only turn

[ADR-0037](0037-forward-only-agent-learning.md) is the largest single change to the design so far and is worth reading before the ADRs it touches. In one decision it:

- **Withdrew historical replay entirely** — ADR-0036 superseded, ADR-0035 Phase 2 removed
- **Retired seven of eleven leakage vectors**, including L11, which the threat model had described as unfixable
- **Promoted L9 (cross-market timing) to the top leakage risk**, since it is a within-day ordering problem that forward-only does nothing for
- **Cut one-off setup from ~$38 to ~$4**, with monthly recurring unchanged
- **Moved the model A/B live** (ADR-0039) because the offline mechanism no longer exists
- **Made the wiki seed necessary** (ADR-0038), since replay was what was going to populate it
- **Reopened the reasoning-model choice** (ADR-0040) — ADR-0036 picked Nova Pro on replay economics alone, and with replay gone that justification went with it

The cost of all this is patience: no agent result before roughly **month 11–13** (ADR-0045 adds a 60-trading-day tuning window on the front), and no per-page confidence before year 2–3.

**A pattern worth noticing across 0037–0040:** removing replay did not just delete a line item, it changed which failures are recoverable. Predictions became disposable and wiki pages became permanent, and ADR-0040 is the consequence — the stronger model now sits on the one call a day that cannot be undone, not on the eleven that can.

## Open decisions

**All substantive design decisions are recorded.** What remains is **seven** thresholds, and none is a design question — each is a number to fit against data that does not exist yet. All but one can be calibrated free against the ADR-0038 seed join or an early labelled sample. `Requirement.md` specifies the **method** for each; the values are set during build.

| REQ | Threshold | ADR | Calibrated against |
|---|---|---|---|
| REQ-302 | Pre-filter recall floor, labelled-sample size | 0021 | Hand-labelled GDELT sample |
| REQ-307 | Classification spot-check disagreement | 0022 | Stronger model on the labelled sample — **gates the seed** |
| REQ-310 | Event-day severity bar (top 20% of post-filter days) | 0037 | Seed join: severity vs realised σ move |
| REQ-311 | Severity threshold for mandatory prediction — **distinct from REQ-310** | 0013 | Same seed join |
| REQ-612 | Baseline-blind control sampling rate | 0029 | Cost against anchoring-index precision. **Not free** — costs model calls, and the $0.38 cost line already implies ~9% of days |
| REQ-719 | Correlation sweep ranking rule | 0041 | Seed join — too loose floods the curator, too tight surfaces nothing |
| REQ-813 | Calibration minimum-sample gate | 0042 | Scored record; below the gate rung 6 equals rung 5 |

Two further numbers are open but carry no `C` code and appear in no register: the **too-good-to-be-true ceiling** (REQ-1209, a `CI` build gate with no value — see the harness doc's open questions) and the **coherence-violation review threshold** (REQ-613). Both need owners.

One scheduling choice also remains open, and blocks nothing: whether to run the `seed_enabled` ablation (ADR-0038) at go-live or later. The flag and the provenance tags are required either way.

## Standing risks

Tracked across ADRs, not owned by any single one:

| Risk | Where addressed | Status |
|---|---|---|
| **Cross-market timing leakage (L9) — using a US close to predict an already-closed Indian session** | ADR-0009, 0037; [threat model](../design/point-in-time-test-harness.md) | **Now the highest leakage risk.** A within-day ordering failure, untouched by forward-only. Closed by a UTC-instant ordering test covering asymmetric holidays and DST |
| **Time to first agent result — ~11–13 months, by construction** | ADR-0037, 0045 | **Accepted deliberately.** The price of a clean result: ~8–10 months of accumulation plus a 60-trading-day tuning window. Numeric ladder runs from day 1; seeding (ADR-0038) mitigates page-level cold start |
| **Reasoning model too weak — makes a null result uninterpretable** | ADR-0027, 0039, 0040 | More urgent under forward-only, since the live record is the only evidence there will be. **Curator settled by choosing Premier** (0040); **predictor still open** — live shadow A/B, ~$18 |
| Curation error compounding permanently into the wiki | ADR-0040 | Premier assigned to the curator outright. **No daily score exists for curation quality**, so this is mitigated by model choice rather than detected by measurement |
| Model echoes the baseline it was handed, faking skill | ADR-0029, 0038 | Baseline-blind control; anchoring index. **Second face added:** anchoring to *seeded statistics*, tracked as seeded/observed divergence |
| Confounding: seasonal/regime effects misattributed to events | ADR-0017 | Covariates + conditional climatology |
| Silent bad extraction corrupting learning history | ADR-0002, 0010 | Ingest validation mandatory on both acquisition paths |
| Overlay version change silently rewriting event history (L4) | ADR-0011, 0038 | Version stamped per event. **Now also rewrites the wiki seed** — rebuild invalidates live evidence accrued against old pages |
| Misclassification propagating into the seed | ADR-0022, 0038 | Spot-check against a stronger model required *before* the seed is built, not after |
| Asset-linkage priors becoming self-fulfilling | ADR-0011, 0005 | Correlation pages must record disconfirming evidence |
| Spurious correlations from wide instrument × event surface | ADR-0009 | Mitigated by narrow v1 scope |
| Uneven history depth: events 11yr, consensus possibly ~2yr | ADR-0007, 0012 | Affects the seed's density, not live running |
| Festival/holiday table going stale | ADR-0017 | Forward coverage asserted in CI |
| Stale wiki manifest silently hiding pages | ADR-0025 | Regenerated on the write path; consistency asserted in CI |
| Lost run manifest making history unreadable | ADR-0026 | Manifests protected as page content; chain integrity asserted in CI |
| Hypothesis space is model-generated — unproposed correlations never surface | ADR-0029, 0041 | **Addressed.** Nightly deterministic sweep over the full event × instrument × horizon grid surfaces cells the data supports but no page covers. Exhaustive rather than opportunistic |
| Curator blind to evidence on a related page | ADR-0041 | 1-hop link-neighbour pre-loading. **Bounded at one hop** — deeper chains are the revisit trigger for reopening agency |
| **Systematic predictor error repeating indefinitely** — overconfidence, directional bias, over-departure | ADR-0042 | **The wiki cannot see it** — it is a property of the predictor, not of any correlation. Closed by computed block 6b plus a mechanical calibration layer, with the rung 5→6 gap as the measurement |
| Model overcorrects after reading its own track record — excessive abstention | ADR-0042, 0013 | Abstention rate and coverage floor watched specifically once block 6b carries a non-trivial payload |
| **A human steers toward a favourable result and reports it as the agent's** | ADR-0043, 0044 | Provenance split — skill on agent-authored vs human-touched pages, asserted in CI. **The published audit trail is the real defence**: steering cannot be silent if the record is public |
| Human proposes a hypothesis informed by knowing what happened next | ADR-0043 | **Accepted residual risk.** The audit timestamp is the only defence and it is a weak one |
| Raw scraped content leaking into the public repo via a derived artefact | ADR-0044 | Pre-commit scan extended beyond credentials to raw paths and payload signatures; the curator is prompted to summarise, never quote |
| Wiki degradation as it grows | ADR-0005 | Linting pass; revisit at ~500 pages |
| **The skill test is underpowered on its own timeline — month 13 yields an interval, not a verdict** | ADR-0046; [power analysis](../analysis/power/results.md) | **Quantified.** Power to detect R² = 0.25% at ~190 post-tuning days is **9%**. Closed against *misreporting* by REQ-919/920 (interval mandatory; inconclusive ≠ null), not closed against the underlying limit |
| **Coherence and statistical power are in direct tension** | ADR-0046, REQ-406 | **Newly visible, unresolved.** The byte-identical regime block buys cross-instrument coherence and is precisely what correlates the predictor's errors, capping effective sample size at ~4.4/day regardless of instrument count |

**Retired 2026-08-09 by [ADR-0037](0037-forward-only-agent-learning.md):**

| Retired risk | Why it no longer applies |
|---|---|
| ~~Point-in-time leakage inflating backtest results~~ | Nothing is reconstructed. Seven of eleven vectors have no mechanism in the agent path. Survives in Lane A calibration, which is never quoted as skill |
| ~~Baseline pre-training contamination (L11) biasing toward a false negative~~ | Live targets are always tomorrow — outside any published training set. **Went from "cannot be fixed, only bounded" to "does not apply."** |

## Design documents

| Document | Covers |
|---|---|
| [Requirement.md](../Requirement.md) | **188 numbered REQ-ids**, each testable and traced to an ADR. Ten specify a calibration *method* rather than a value |
| [Design.md](../Design.md) | Module layout, interface protocols, DynamoDB/S3 schemas, nine algorithms specified precisely, config model, error handling |
| [Tasks.md](../Tasks.md) | 13 phases in dependency order, with three non-negotiable orderings and the hard leakage gate |
| [SystemDesign.md](../SystemDesign.md) | End-to-end architecture, the agency boundary, the daily run, the two improvement arms |
| [Point-in-time leakage: threat model and test harness](../design/point-in-time-test-harness.md) | 11 vectors with post-0037 status, the two lanes, 6 test layers, CI integration |
| [AWS architecture and cost model](../design/aws-architecture.md) | Service topology, Bedrock capability gaps, per-line cost model, one-off setup cost |
| [Prediction contract](../design/prediction-contract.md) | Prompt blocks, output schema, validation rules, anchoring control, coherence check |
| [Product](../Product.md) | Positioning, prior art, what forward-only buys, non-goals |

## Data source map

| Source | Path | Covers |
|---|---|---|
| GDELT 2.0 | Direct (BigQuery/files) | Unscheduled geopolitical events, Feb 2015→ |
| FRED | Direct (keyless CSV) | S&P 500, Nasdaq 100, Dow — and the five regime covariates |
| jugaad-data | Direct (library) | NSE index history |
| FRED | Direct (keyless CSV) | Regime covariates: real yields, dollar index, VIX, oil |
| Festival/holiday table | Repo, maintained | Calendar-deterministic factors |
| Market calendars, NSE + NYSE, in UTC | Repo, maintained | L9 cross-market ordering test (ADR-0037) |
| Economic calendars | Firecrawl | Scheduled-event consensus and actuals |
| News articles | Firecrawl | Event detail and narrative |
| MCX | Firecrawl | Indian domestic metal prices |

**History is used in exactly three places now** (ADR-0037): Lane A calibration, the deterministic wiki seed (ADR-0038), and threshold calibration. It is never replayed through the agent.
