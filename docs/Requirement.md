# FinEvents — Requirements

**Status:** Baseline v1
**Date:** 2026-08-09
**Governed by:** [ADR-0001](adr/0001-spec-driven-development-with-adrs.md) — no code for a feature until its requirement exists and is numbered
**Traces to:** [Product.md](Product.md), [SystemDesign.md](SystemDesign.md), [ADRs 0001–0053](adr/README.md)

## How to read this

Every requirement is atomic, testable, and traceable. The chain is:

```
Requirement.md (REQ-xxx) → Design.md / SystemDesign.md → ADR → Tasks.md → test
```

**Verification codes:**

| Code | Means |
|---|---|
| `U` | Unit test |
| `P` | Property-based test (Hypothesis) |
| `I` | Integration test against real or recorded services |
| `CI` | Asserted in CI as a build gate |
| `C` | Calibration procedure — the requirement fixes the *method*, the value is set during build |
| `R` | Manual review against a documented checklist |

**A requirement with no verification code is not a requirement.** If one appears without one, it is a defect in this document.

### Open thresholds

**Ten** requirements specify a **method** rather than a value, marked `C` — REQ-302, REQ-307, REQ-310, REQ-311, REQ-408, REQ-612, REQ-719, REQ-813, REQ-921, REQ-1213. This is deliberate: each value must be fitted against data that does not exist yet, and inventing numbers now would be false precision. Each states what it is calibrated against, and what happens if calibration fails.

> All ten must appear in the go-live freeze step (Tasks.md T13.3). Two were added after review: REQ-408 (conditional-climatology cell size and the coherence floor, previously deferred by ADR-0017 to a backtest that ADR-0037 removed) and REQ-1213 (the too-good-to-be-true ceiling, previously a `CI` build gate with no value and no method anywhere).

---

## REQ-0xx — Governance and process

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-001 | No feature is implemented before a numbered requirement for it exists in this document. | ADR-0001 | `R` |
| REQ-002 | Every accepted ADR is immutable. Changing a decision requires a new superseding ADR; only status lines and amendment notes may be added to an accepted ADR. | ADR-0001 | `R` |
| REQ-003 | Every ADR carries a revisit trigger stating a concrete observable condition. | ADR-0001 | `CI` |
| REQ-004 | A commit that changes behaviour must update the corresponding spec in the same commit. | ADR-0014 | `CI` |
| REQ-005 | Git commits are authored as `itamittech@gmail.com`. A commit from any other identity is rejected. | Brief | `CI` |
| REQ-006 | Every document states the ADRs it derives from, and every ADR states the requirements it serves. Orphans on either side fail the check. | ADR-0001 | `CI` |

---

## REQ-1xx — Data foundation

### Bitemporal model

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-101 | Every record in every store carries `event_time` (when it happened) and `knowledge_time` (earliest we could have known it). | ADR-0016 | `CI`, `P` |
| REQ-102 | Revisions are appended as new records. No record is ever updated in place. | ADR-0016 | `P` |
| REQ-103 | `knowledge_time` derivation is documented per source, including the conservative fallback where a source publishes no ingestion timestamp. | ADR-0016 | `R` |
| REQ-104 | All reads outside `ingest/` go through `AsOfRepository`. No storage client is imported outside `ingest/` and `repository/`. | ADR-0016 | `CI` |
| REQ-105 | `AsOfRepository(as_of)` returns no record with `knowledge_time > as_of`. | ADR-0016 | `P` |
| REQ-106 | Querying at `as_of = T` returns a subset of querying at `as_of = T + Δ` for all positive Δ. | ADR-0016 | `P` |
| REQ-107 | Records with `knowledge_time` exactly equal to `as_of` are included. The boundary is tested explicitly. | ADR-0016 | `P` |
| REQ-108 | Empty history returns an empty result, never an error and never a default value. | ADR-0016 | `P` |
| REQ-109 | In Lane A calibration mode, wall-clock access raises. `datetime.now()`, `date.today()` and equivalents are unavailable; the only time is the injected `as_of`. | ADR-0016 | `U`, `CI` |

### Storage

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-110 | Raw payloads are written unmodified to S3 `raw/`, stamped with fetch time at the moment of ingest. | ADR-0016, 0044 | `I` |
| REQ-111 | The wiki lives in a versioned S3 prefix with deletion protection enabled in Prod. | ADR-0026, 0024 | `CI` |
| REQ-112 | Predictions, scores, run state and steering actions are stored in DynamoDB on-demand. | ADR-0024 | `I` |
| REQ-113 | Price and covariate history is stored as Parquet for Athena range scans. | ADR-0024 | `I` |

---

## REQ-2xx — Ingest

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-201 | The system acquires prices for 11 instruments: NIFTY 50, SENSEX, S&P 500, Nasdaq, Dow, gold spot USD/oz, silver, platinum, palladium, MCX gold INR, MCX silver INR. | ADR-0009, 0003 | `I` |
| REQ-202 | Gold is tracked at both USD/oz spot and MCX INR as separate series. | ADR-0003 | `I` |
| REQ-203 | Individual equities are **not** ingested in v1. | ADR-0009 | `R` |
| REQ-204 | Prices are acquired from **FRED** (`SP500`, `NASDAQ100`, `DJIA` — keyless), **jugaad-data** (NIFTY 50), and **Firecrawl** (SENSEX, the four spot metals, MCX gold and silver). Sources are chosen for permissive terms, never for a scraper's ability to reach them. | ADR-0053, 0010 | `I` |
| REQ-205 | **Five** regime covariates are acquired from FRED, keyless: nominal 10Y yield (`DGS10`), 10Y TIPS real yield (`DFII10`), trade-weighted dollar index (`DTWEXBGS`), VIX (`VIXCLS`), WTI crude (`DCOILWTICO`). The set and its order are fixed — REQ-406 makes the regime block byte-identical across all 11 prompts, so the field count is a wire shape baked into every prompt snapshot and both numeric covariate arrays. | ADR-0017 | `I` |
| REQ-206 | Events are acquired from GDELT 2.0 (Feb 2015→present). | ADR-0007 | `I` |
| REQ-207 | MCX prices, economic-calendar consensus and actuals, and news articles are acquired through Firecrawl using JSON-schema extraction. | ADR-0002, 0012 | `I` |
| REQ-208 | Every acquired record passes ingest validation before write: schema conformance, range plausibility, and continuity against the prior session. | ADR-0002, 0010 | `U`, `I` |
| REQ-209 | A validation failure is a hard failure. The run halts and alerts. No substituted, interpolated or judged value is ever written. | ADR-0002 | `U` |
| REQ-210 | A festival and market-holiday table for NSE and NYSE is maintained in the repository, with forward coverage of at least 12 months asserted in CI. | ADR-0017 | `CI` |
| REQ-211 | Market calendars are held in UTC instants — session open and close, DST transitions, per-venue holidays — for **every venue in the instrument set: NSE, BSE, NASDAQ, NYSE and MCX** (both MCX sessions; the evening close overlaps the US session). OTC spot metals have no venue and take the ADR-0049 synthetic convention: reference close 17:00 America/New_York, weekends excluded, **no exchange holidays**. The convention lives in the calendar table, never derived in code. **A missing or inapplicable calendar entry is a hard CI failure, never a skipped assertion.** | ADR-0049, 0037 | `CI` |
| REQ-212 | Firecrawl credentials are held in Secrets Manager and never appear in code, config or logs. | ADR-0014 | `CI` |
| REQ-213 | Corporate actions and futures contract rolls are handled at ingest via adjusted series and explicit roll dates in instrument config — never at scoring. | ADR-0037 | `U` |

---

## REQ-3xx — Event processing

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-301 | A deterministic pre-filter reduces raw GDELT records to candidates before any model call, using CAMEO code, actor, geography and Goldstein scale. | ADR-0021 | `U` |
| REQ-302 | **Method:** the pre-filter's recall floor is calibrated against a hand-labelled GDELT sample. Sample size is chosen so the recall estimate has a half-width below 5 points at 90% confidence. If the floor cannot be met, the filter is loosened and classification cost rises — the floor is not lowered to fit. | ADR-0021 | `C` |
| REQ-303 | Candidate events are classified and assigned a financial-severity score by the configured classification model. | ADR-0011, 0022 | `I` |
| REQ-304 | The severity overlay is **stateless** — an event's severity depends only on that event and the overlay formula, never on other dates or on wiki state. | ADR-0035, 0011 | `U`, `CI` |
| REQ-305 | Every event record is stamped with the overlay version used to score it. | ADR-0011 | `CI` |
| REQ-306 | An overlay version change triggers a rescore that writes new records. It never edits existing records in place. | ADR-0011 | `U` |
| REQ-307 | **Method:** classification quality is verified by spot-checking a fixed sample against a stronger model. The disagreement threshold is set from the observed distribution on the first labelled sample. **This check gates the wiki seed** — the seed is not built until it passes. | ADR-0022, 0038 | `C` |
| REQ-308 | Scheduled economic releases carry a standardised surprise: `(actual − consensus) / historical σ of surprises` for that release. | ADR-0012 | `U` |
| REQ-309 | Consensus values are snapshotted at fetch time and never re-read for a prediction already made. | ADR-0012, 0037 | `P` |
| REQ-310 | **Method:** the event-day severity bar is set at the top 20% of post-filter days, calibrated against the seed join of severity versus realised σ move. | ADR-0037 | `C` |
| REQ-311 | **Method:** the severity threshold above which the agent may not abstain is calibrated against the same seed join, and is a **distinct parameter** from REQ-310. | ADR-0013 | `C` |

---

## REQ-4xx — Features and baselines

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-401 | Movement is expressed in five ordinal buckets defined in standard deviations over the trailing 60 sessions, at horizons t+1 and t+5. | ADR-0008 | `U` |
| REQ-402 | Bucket boundaries are computed at prediction time and **stored with the prediction**. Scoring never recomputes them. | ADR-0008, 0037 | `U`, `P` |
| REQ-403 | Horizons count **trading days** from the market calendar, not calendar days. | ADR-0037 | `U` |
| REQ-404 | Climatology is the unconditional bucket frequency over all available history to date. | ADR-0008 | `U` |
| REQ-405 | Conditional climatology conditions on calendar factors (festival, expiry, month, weekday) and regime state, using the five-level backoff ladder of Design §4.10. **The ladder level actually used is stored with the prediction** — without it, a backoff to level 0 is invisible and rung 2 silently degrades to rung 1. | ADR-0017 | `U` |
| REQ-408 | **Method:** the conditional-climatology minimum cell size `N_min` (Design §4.10) and the coherence floor `τ_floor` (Design §4.12) are calibrated against the seed join. Too low and rung 2 fits noise and beats the agent for the wrong reason; too high and it collapses to unconditional climatology, so the confounding check passes by not running. | ADR-0017, 0029 | `C` |
| REQ-406 | Regime state is expressed as σ-relative moves of the five FRED covariates and is **byte-identical across all 11 prediction prompts** on a given day. | ADR-0017, 0029 | `U` |
| REQ-407 | All feature normalisation uses only data with `knowledge_time` at or before the run's cut-off. | ADR-0016 | `P` |

---

## REQ-5xx — Numeric tracks

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-501 | Chronos-2 and TimesFM 2.5 run **in-process** from local weights. No SageMaker endpoint, no Bedrock call. | ADR-0030, 0031 | `I` |
| REQ-502 | Each model receives a fixed-length rolling context window, sized to the model's maximum context. The full archive is never sent. | ADR-0030 | `U` |
| REQ-503 | Covariates are passed as **time series aligned to the context window**, not as scalars. | ADR-0030 | `U` |
| REQ-504 | Each model runs in two configurations — univariate and covariate-informed — over 11 instruments, giving 44 forecasts per day. | ADR-0030, 0031 | `I` |
| REQ-505 | Only the **univariate** forecasts are shown to the predictor. Covariate-informed runs are scoring rivals and are never placed in a prompt. | ADR-0029 | `CI` |
| REQ-506 | Both models forecast **one series at a time**. Chronos-2's native multivariate mode is not used, so the comparison against the agent is like-for-like. | ADR-0030 | `R` |
| REQ-507 | Both models are deterministically seeded. Identical input produces identical output. | ADR-0030 | `P` |
| REQ-508 | Quantile output is converted to the five-bucket distribution using the same boundaries the agent receives. | ADR-0008 | `U` |
| REQ-509 | The context window is **not** restricted to post-pre-training-cutoff data. Contaminated context is not leakage; only contaminated targets are. | ADR-0037 | `R` |

---

## REQ-6xx — Prediction

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-601 | **The agent never executes against a historical date.** There is no replay path, at any scope. | ADR-0037 | `CI` |
| REQ-602 | One prediction call is made per instrument per day — 11 calls. | ADR-0029 | `I` |
| REQ-603 | The prompt comprises blocks 1–7 plus 6b as specified in [prediction-contract.md](design/prediction-contract.md). | ADR-0029, 0042 | `U` |
| REQ-604 | The prediction is a **departure from a shown baseline**, never an absolute outcome and never a price. | ADR-0029 | `R` |
| REQ-605 | Output is a probability distribution over five buckets at each of t+1 and t+5. Probabilities sum to 1 within floating-point tolerance. | ADR-0008 | `U` |
| REQ-606 | Output includes cited wiki pages as `path@version_id`. A citation to a page that did not exist at the cut-off fails validation and is recorded as a leakage signal. | ADR-0026, 0016 | `U`, `CI` |
| REQ-607 | Output includes `model_id`, `prompt_version`, `filter_version`, `overlay_version`, and the calibration map version. | ADR-0027, 0042 | `CI` |
| REQ-608 | The agent may abstain **per instrument per horizon**, expressed inside the `horizons` object. `abstain: true` requires `buckets: null`. An abstained instrument-horizon is **scored at the shown baseline** for that instrument and horizon — not skipped, not scored as a miss — so every rung stays on identical live days (REQ-806) and ADR-0046's pairing stays complete. | ADR-0048 | `U`, `CI` |
| REQ-609 | Abstention is rejected when severity exceeds the REQ-311 threshold. | ADR-0048, 0013 | `U` |
| REQ-615 | Abstained horizons are excluded from the calibration-map **fit** (REQ-812) while still counting in the **score**. The map describes the agent's own forecasts; the ladder describes the whole record. | ADR-0048, 0042 | `U` |
| REQ-610 | Coverage and missed moves — large realised moves on abstained days — are tracked separately. | ADR-0013 | `U` |
| REQ-611 | A baseline-blind control runs on sampled days, on the **same model** as the primary predictor, with baselines withheld. The anchoring index is computed from the difference. | ADR-0029 | `U`, `CI` |
| REQ-612 | **Method:** the control's sampling rate is chosen so the anchoring index reaches a stated precision within the tuning window, traded against cost. | ADR-0029 | `C` |
| REQ-613 | A post-hoc coherence check computes structurally impossible cross-instrument combinations. NIFTY versus SENSEX divergence is the primary tripwire. The same metric is computed for Chronos as a control. | ADR-0029 | `U` |
| REQ-614 | Predictions are written to immutable, timestamped storage **before the next market open** and are never revised. | ADR-0033 | `CI` |

---

## REQ-7xx — Wiki and knowledge

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-701 | The wiki holds correlation pages (event category × instrument), instrument pages, and regime pages. | ADR-0005 | `R` |
| REQ-702 | Page selection is a deterministic key lookup against the run manifest. No vector store, no managed knowledge base. | ADR-0025 | `CI` |
| REQ-703 | The manifest is regenerated on the write path and its consistency with the page set is asserted in CI. | ADR-0025 | `CI` |
| REQ-704 | Each correlation page carries a hypothesis, an evidence table, computed statistics, a contradictions section, and links. | ADR-0034 | `U` |
| REQ-705 | **All statistics are computed in code.** No model writes a hit rate, an observation count, or a confidence value. | ADR-0034 | `CI` |
| REQ-706 | Confidence is a Beta-Binomial posterior over the evidence list, reported as a credible interval. | ADR-0034 | `U` |
| REQ-707 | Statistics are computed **three ways** — seeded-only, observed-only, combined — and all three are stored and displayed. | ADR-0038 | `U`, `CI` |
| REQ-708 | Every evidence row carries `source: seeded | observed`. A row with no tag fails validation. | ADR-0038 | `CI` |
| REQ-709 | Every evidence consumer is tag-aware. A consumer that ignores provenance fails a CI assertion. | ADR-0038 | `CI` |
| REQ-710 | Pages must record disconfirming evidence. A page with confirmations only fails review. | ADR-0011, 0005 | `R` |
| REQ-711 | The wiki seed is a deterministic join over classified historical events and realised movements. It involves **no model call**. | ADR-0038 | `U` |
| REQ-712 | Seeding is controlled by `/finevents/{env}/wiki/seed_enabled`. Both arms must be runnable. | ADR-0038 | `I` |
| REQ-713 | Wiki version control is S3 object versioning plus a per-run manifest recording each page's `version_id`. | ADR-0026 | `I` |
| REQ-714 | **The run manifest is written last.** A crash before that point leaves the previous manifest and its wiki state intact. | ADR-0026 | `I` |
| REQ-715 | Manifest chain integrity is asserted in CI — every manifest references a resolvable predecessor. | ADR-0026 | `CI` |
| REQ-716 | Consolidation runs once per day, after scoring and before prediction. | ADR-0037 | `I` |
| REQ-717 | The consolidation prompt includes the affected pages' **1-hop link neighbours** from the manifest graph, capped at N by link order. | ADR-0041 | `U` |
| REQ-718 | A nightly correlation sweep walks the full event × instrument × horizon grid and surfaces cells whose credible interval excludes 0.5 but which have no page, or whose page contradicts the statistics. | ADR-0041 | `U` |
| REQ-719 | **Method:** the sweep's ranking rule is calibrated against the seed join. Too loose floods the curator; too tight surfaces nothing. Candidate volume per run is the tuning target. | ADR-0041 | `C` |
| REQ-720 | The curator summarises source material. It never quotes article text at length, because quoted content would leak through the published derived channel. | ADR-0044 | `CI`, `R` |
| REQ-721 | Seeded/observed divergence — whether the agent's own observations ever contradict the seed — is tracked from the first scored prediction. | ADR-0038 | `U` |

---

## REQ-8xx — Scoring, evaluation and calibration

### Scoring

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-801 | **Scoring contains no model call.** Every input was fixed at prediction time. | ADR-0033 | `CI` |
| REQ-802 | Matured predictions are scored daily — t+1 from D−1 and t+5 from D−5 — for every track. | ADR-0033 | `I` |
| REQ-803 | The metric is Ranked Probability Score, appropriate to ordinal buckets. | ADR-0008 | `U` |
| REQ-804 | A close revised after a prediction matured does **not** overwrite the score. A revision that changes the bucket is written as a second, separate scored record; the original counts toward the skill record. | ADR-0037 | `U` |
| REQ-805 | A missing close is a hard failure. No judged or substituted value is scored. | ADR-0037 | `U` |

### The ladder

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-806 | Six rungs are scored on **identical live days**: climatology, conditional climatology, **`chronos_cov`**, **`timesfm_cov`**, agent raw, agent calibrated. Rungs 3 and 4 are the **covariate-informed** configurations (ADR-0047) — the rival handed the same severity signal the agent reasons about. The univariate tracks are scored and published as secondary series; they are what the predictor is shown (REQ-505), so beating them measures anchoring, not event reasoning. | ADR-0033, 0042, 0047 | `I` |
| REQ-807 | The three tracks are never ensembled. Each is reported independently. | ADR-0032 | `R` |
| REQ-808 | Lane A historical output is labelled **calibration** everywhere it surfaces and is never compared against the agent. | ADR-0037 | `CI`, `R` |
| REQ-809 | Rung 6 is never presented as the agent's skill. The rung 5 → 6 gap is reported as the miscalibration measurement. | ADR-0042 | `CI` |

### Calibration feedback

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-810 | Prompt block 6b carries the predictor's own track record: reliability by confidence band, directional balance, departure discipline, and RPS by severity. | ADR-0042 | `U` |
| REQ-811 | Every line of block 6b is computed from the scored record. **No model writes any part of it.** | ADR-0042 | `CI` |
| REQ-812 | A calibration map (isotonic, predicted probability → observed frequency) is refit nightly, pooled across instruments and split by horizon, using cross-validated fitting. | ADR-0042 | `U` |
| REQ-813 | **Method:** below a minimum-sample gate no calibration is applied and rung 6 equals rung 5, reported as ungated. The gate is set from the variance of the fitted map on early data. | ADR-0042 | `C` |
| REQ-814 | The calibration map is versioned per run and stored with the manifest, so any calibrated prediction is exactly reproducible. | ADR-0042 | `I` |

### Measurement periods

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-815 | The first **60 trading days** from go-live are a tuning window. | ADR-0045 | `CI` |
| REQ-816 | Tuning-window predictions are made, scored and **published labelled `tuning`**, but excluded from headline skill and from the learning-curve trend. | ADR-0045 | `CI` |
| REQ-817 | The wiki learns normally throughout the tuning window. Only the skill claim is suspended. | ADR-0045 | `R` |
| REQ-818 | The tuning window does not extend. Incomplete calibration at day 60 is reported as a finding. | ADR-0045 | `R` |
| REQ-819 | Any configuration change after the window — model, prompt, filter or overlay version — begins a new versioned measurement period. Every reported figure names the periods it covers. | ADR-0045 | `CI` |

### The model A/B

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-820 | Nova Premier runs as a shadow of the Nova Pro predictor for 60 trading days over the four ADR-0036 instruments. | ADR-0039 | `I` |
| REQ-821 | Shadow output is scored but **never** written to the wiki, the dashboard's live prediction surface, or any consolidation call. | ADR-0039 | `CI` |
| REQ-822 | The shadow is scored on RPS **and** anchoring index. Equal RPS with differing anchoring is not equal performance. | ADR-0039 | `U` |
| REQ-823 | No agent skill figure is quoted — internally or publicly — before the leakage harness gates (REQ-12xx) are green. | ADR-0033 | `R` |

---

## REQ-9xx — Frontend and steering

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-901 | The frontend is a static SPA served from S3 behind CloudFront. | ADR-0020 | `I` |
| REQ-902 | Reads and steering writes go through API Gateway, authenticated by a Cognito user pool. | ADR-0023 | `I` |
| REQ-903 | The dashboard shows the learning curve — agent RPS minus the **pre-specified comparator's** RPS over elapsed days — computed on `observed` evidence only, **always with its interval**. The comparator is fixed by ADR-0046 and is never a per-day minimum over tracks: a per-day minimum is an oracle that selects the winning track after the outcome is known, and biases the figure against the agent by roughly ten times a realistic effect. | ADR-0033, 0038, 0046 | `U` |
| REQ-922 | A **pooled forecast** is computed each run by logarithmic pooling of every available track, equally weighted, deterministically and with no model call. It is stored and scored as a track, reported as the **product output**, and never reported as the agent's skill. | ADR-0051 | `U`, `CI` |
| REQ-923 | The primary skill endpoint is the agent's **leave-one-out contribution** to the pool — `pool(all)` minus `pool(all except agent)` on identical days. The same subtraction is computed and reported for **every** track. ADR-0046's head-to-head becomes secondary. | ADR-0052 | `U`, `CI` |
| REQ-919 | Every reported skill figure carries a **block-bootstrap interval** and names the effect size the record is powered to detect. A point estimate without an interval fails review. | ADR-0046 | `CI` |
| REQ-920 | **An inconclusive result is never reported as a null.** No claim that event reasoning does not help may be made until the interval excludes the smallest effect the project considers meaningful. | ADR-0046 | `R` |
| REQ-921 | **Method:** κ — the share of the predictor's forecast error common across instruments — is estimated from the live record once ~60 scored days exist, and the power analysis re-run with the measured value. The revised timeline is published whichever way it moves. | ADR-0046 | `C` |
| REQ-904 | The dashboard shows all six ladder rungs, per instrument and per horizon. | ADR-0033 | `R` |
| REQ-905 | Every prediction is auditable to its prompt snapshot, its cited pages at their `version_id`, its reasoning, and its outcome. | ADR-0033 | `I` |
| REQ-906 | **Two skill series are always shown together** — agent-authored pages versus human-touched pages. Reporting only the aggregate fails a CI assertion. | ADR-0043 | `CI` |
| REQ-907 | The tuning-window boundary is visible, and every figure names the measurement periods it covers. | ADR-0045 | `R` |
| REQ-908 | Coverage, abstention rate and missed moves are displayed. | ADR-0013 | `R` |
| REQ-909 | Steering supports four verbs: **flag**, **propose**, **edit**, **correct**. | ADR-0043 | `I` |
| REQ-910 | `flag` marks a page or evidence row suspect with a note, changes no content, and enters the curator's next prompt as a disputed item. | ADR-0043 | `U` |
| REQ-911 | `propose` submits a hypothesis into the sweep's candidate queue with `origin: human`. The curator must accept it, reject it with reasoning, or open a page. | ADR-0043 | `U` |
| REQ-912 | `edit` writes to a page's hypothesis or narrative and sets `author: agent \| human \| mixed`. | ADR-0043 | `U` |
| REQ-913 | `correct` fixes an event's category or severity, keeps the evidence row's original `source` tag, and adds a `corrected_by` audit field. | ADR-0043 | `U` |
| REQ-914 | A human never writes an evidence row. Evidence provenance is `seeded` or `observed` only. | ADR-0043 | `CI` |
| REQ-915 | A correction affecting more than N historical events is refused through the UI. Bulk change is a versioned overlay pass, not steering. | ADR-0043 | `U` |
| REQ-916 | Every steering action records timestamp, actor, target, before/after state, and the run in which it took effect. | ADR-0043 | `I` |
| REQ-917 | The steering audit trail is published with the rest of the evaluation record. | ADR-0043, 0044 | `CI` |
| REQ-918 | Live parameter changes are **not** available through the steering interface in v1. | ADR-0043 | `R` |

---

## REQ-10xx — Infrastructure and operations

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-1001 | The stack deploys via AWS SAM in one command. | ADR-0015 | `I` |
| REQ-1002 | Three per-environment stacks — dev, uat, prod — in a single account in `us-east-1`. | ADR-0024 | `I` |
| REQ-1003 | Resource names are environment-prefixed; IAM is prefix-scoped with **explicit denies** on production resources. | ADR-0024 | `CI` |
| REQ-1004 | The daily run is orchestrated by Step Functions, fired by EventBridge Scheduler after the US close, trading-day aware. | ADR-0004 | `I` |
| REQ-1005 | Ingest, validation, filtering, feature computation, scoring, statistics, the sweep and calibration run on Lambda. No model call occurs in any of them. | ADR-0004 | `CI` |
| REQ-1006 | Model calls and the two numeric models run on AgentCore Runtime. | ADR-0028, 0041 | `I` |
| REQ-1007 | Model IDs are SSM parameters per role — `model/classify`, `model/reason/predict`, `model/reason/curate`. **No model ID appears in application code.** | ADR-0027, 0040 | `CI` |
| REQ-1008 | All three configured models are asserted available with access granted at deploy time, not discovered at runtime. | ADR-0027 | `CI` |
| REQ-1009 | The baseline-blind control always uses the same model as the primary predictor. A mismatch fails deployment. | ADR-0040 | `CI` |
| REQ-1010 | Per-stage token usage, latency and error rates are emitted to CloudWatch via AgentCore Observability. | ADR-0028 | `I` |
| REQ-1011 | The daily run completes within 60 minutes of the declared cut-off. | ADR-0004 | `I` |
| REQ-1012 | Step ordering 10 → 11 → 12 → 12a/12b → 16 is enforced by the state machine. Step 16 reads what step 12 wrote. | ADR-0037 | `I` |
| REQ-1013 | Local development runs the pipeline against Docker-based service stand-ins. | Brief | `I` |
| REQ-1014 | Prompt caching economics are re-derived on every model change, never carried across. | ADR-0027 | `R` |
| REQ-1015 | Recurring cost stays within $16–33/month at the configured defaults. A sustained breach raises an alarm. **The band widens to $25–42 while the ADR-0039 shadow window runs** (+$9/month for ~2 months); the alarm must know about the window or it fires by design on day 1 of go-live. | ADR-0040, 0042 | `I` |

---

## REQ-11xx — Security, licence and publication

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-1101 | A pre-commit hook runs a security scan and blocks commits containing credentials or environment files. | ADR-0014 | `CI` |
| REQ-1102 | The same hook blocks any commit touching a `raw/` path or adding content matching the scraped-payload signature. | ADR-0044 | `CI` |
| REQ-1103 | **Documentation currency is checked in CI on the pull request**, not post-commit — a post-commit hook fires after the commit exists and can only warn (ADR-0014). Changes under mapped source paths require corresponding documentation changes; the path→doc mapping lives in config, never hardcoded. | ADR-0014 | `CI` |
| REQ-1104 | CI runs the same validation as the hooks, and verifies the hooks ran. Hooks are a convenience and are bypassable by design; CI is the gate. | ADR-0014 | `CI` |
| REQ-1113 | The pre-commit hook runs Python SAST (bandit) and blocks on high-severity findings. | ADR-0014 | `CI` |
| REQ-1114 | The pre-commit hook runs a dependency vulnerability scan (pip-audit) and blocks on known CVEs. | ADR-0014 | `CI` |
| REQ-1115 | CI blocks merge unless the pull request references at least one REQ-id or ADR, enforcing ADR-0001's traceability chain. | ADR-0014, 0001 | `CI` |
| REQ-1116 | A `docs: n/a — <reason>` marker in the PR body satisfies REQ-1103 for genuinely doc-free changes. The exemption is recorded and its rate is reviewable — without a sanctioned escape, contributors reach for `--no-verify`, which disables every check rather than the one that did not apply. | ADR-0014 | `CI` |
| REQ-1117 | Pre-commit hooks stay fast enough that bypassing them is not tempting. Anything slow belongs in CI. Speed is a security property here, not a convenience. | ADR-0014 | `R` |
| REQ-1105 | Code is licensed Apache 2.0, with a NOTICE file. | ADR-0044 | `R` |
| REQ-1106 | Published: the prediction record, scores, all ladder rungs, wiki pages, run manifests, event classifications, severity scores, the steering audit, and calibration maps. | ADR-0044 | `CI` |
| REQ-1107 | Never published: anything under `raw/`, scraped article text in whole or excerpt, MCX or calendar page content, and Firecrawl payloads. | ADR-0044 | `CI` |
| REQ-1108 | Source URLs and fetch timestamps are published so a third party can re-acquire material under their own terms. | ADR-0044 | `R` |
| REQ-1109 | `DATA_SOURCES.md` records every source's licence and attribution obligation, updated whenever a source is added. | ADR-0044 | `CI` |
| REQ-1110 | GDELT attribution appears wherever its data or derivatives are published. | ADR-0044 | `R` |
| REQ-1111 | **Three** data-terms questions clear before **whichever comes first**: the first commit adding a fetcher for the affected source (Phase 3), or the first publication of derived artefacts (T12.16). Asserted in CI — an open question in `DATA_SOURCES.md` blocks both. The questions: FRED terms for derived series, GDELT attribution granularity, and whether model-derived severity scores constitute a derivative work of the source article. **Repository visibility is not the gate** (ADR-0050); the risk is in the data, and none is present. | ADR-0050, 0044 | `CI` |
| REQ-1113b | Until question 4 is answered by someone qualified, severity scores are published **only as aggregates joined to event categories** — never row-joined to an article identifier, URL or headline. Stricter than ADR-0044 permits, deliberately, so a legal question does not block the build. | ADR-0050 | `CI` |
| REQ-1112 | Publication of the derived record is a standing obligation, not a one-off release. | ADR-0044 | `R` |

---

## REQ-12xx — Point-in-time test harness

**These are build gates, not test coverage.** [ADR-0033](adr/0033-evaluation-harness-as-first-class-deliverable.md) makes the harness a first-class deliverable.

| ID | Requirement | Traces to | Verify |
|---|---|---|---|
| REQ-1201 | **Snapshot integrity:** every record entering a prompt has `knowledge_time` at or before the run's declared cut-off, with **no exceptions list**. | Harness L2a | `CI` |
| REQ-1202 | The assembled prompt rebuilds byte-identically from its stored snapshot, so what was scored is what was sent. | Harness L2a | `CI` |
| REQ-1203 | **Cross-market ordering (L9):** for every source/target market pair, the source session close used as input closed strictly before the target session opened, compared as **UTC instants, not calendar dates**. | Harness L2b | `CI` |
| REQ-1204 | REQ-1203's test is table-driven over asymmetric holidays and DST transitions. A calendar-date comparison must fail it. | Harness L2b | `CI` |
| REQ-1205 | A canary exists for each surviving vector — L4, L5, L6, L8, L9 — injecting a future-dated sentinel that must appear nowhere in output, context, reasoning or citations. | Harness L3 | `CI` |
| REQ-1206 | A deliberately leaky pipeline variant exists that the canaries **must** catch. A test that cannot fail is not a test. | Harness L3 | `CI` |
| REQ-1207 | **Truncated replay** runs for Lane A only: identical output against the full store and against a store truncated to the as-of date, across at least three market regimes. | Harness L4 | `CI` |
| REQ-1208 | **Shuffle test:** randomly reassigning events to dates collapses skill to baseline. | Harness L5 | `I` |
| REQ-1209 | **Too-good-to-be-true trip:** skill above a configured ceiling **fails the build**. It must not be possible to ship an unexplained excellent result. | Harness L5 | `CI` |
| REQ-1213 | **Method:** the REQ-1209 ceiling is set from the null distribution of the skill statistic — the upper tail of paired RPS differences under the shuffle test (REQ-1208), at a stated exceedance probability. Too low and it fires constantly; too high and it never fires. It cannot be set before the statistic itself is defined, so it depends on the pre-registered comparison. | Harness L5 | `C` |
| REQ-1210 | Model responses are recorded and replayed by cassette. A cache miss in replay mode is a hard failure, never a silent live call. | ADR-0018 | `CI` |
| REQ-1211 | The cassette cache key includes the model ID, so a model change invalidates cassettes and forces a re-record. | ADR-0018 | `U` |
| REQ-1212 | **The agent makes no scored prediction until REQ-1201 through REQ-1206 are green.** Under forward-only a leaked prediction cannot be re-run — there is no second attempt at a live day. | ADR-0037 | `R` |

---

## Requirements deliberately excluded from v1

Recorded so their absence is a decision rather than an oversight.

| Excluded | Why | ADR |
|---|---|---|
| Individual equities | Instrument × event surface too wide before the loop is proven | 0009 |
| Ensembling the tracks | Disagreement between them is signal; averaging destroys it | 0032 |
| Multivariate Chronos | Deliberate handicap so a loss is attributable to event reasoning | 0030 |
| Agent replay / backtest | Contaminated and unnecessary; forward-only is cleaner and free | 0037 |
| Any agent, tool use, or agent loop | Examined and declined; replaced by link pre-loading and the sweep | 0041 |
| Managed knowledge base or vector store | Cannot be queried as-of a past date | 0025 |
| AgentCore Memory, Gateway, Identity | Adopted piecewise; these three do not fit | 0028 |
| Runtime model escalation by severity | Makes behaviour non-reproducible across runs | 0027 |
| Live parameter steering | Fragments the measurement record | 0043 |
| Claims of tradeable alpha, profitability, or investment advice | Out of scope and, in India, regulated | Product.md |

---

## Traceability status

| Check | State |
|---|---|
| Every REQ has a verification code | ✅ |
| Every REQ traces to at least one ADR or Product.md | ✅ |
| Every ADR is referenced by at least one REQ | To assert in CI (REQ-006) |
| Every REQ is reachable from a task | See [Tasks.md](Tasks.md) |
| Every REQ is reachable from a test | Established during build |
