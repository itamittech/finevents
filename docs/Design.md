# FinEvents — Design

**Status:** Baseline v1
**Date:** 2026-08-09
**Sits between:** [Requirement.md](Requirement.md) and [Tasks.md](Tasks.md)
**Architecture:** [SystemDesign.md](SystemDesign.md) — read that first; this document is the component level

Where SystemDesign describes *what the machine does*, this describes *how it is built*: module boundaries, interfaces, schemas, and the algorithms specified precisely enough to implement without further decisions.

---

## 1. Module layout

```
finevents/
  config/        SSM parameter resolution, environment binding
  repository/    AsOfRepository, bitemporal read/write, manifest access
  ingest/        per-source fetchers, validation, bitemporal write
  events/        pre-filter, classification client, severity overlay
  features/      sigma, buckets, climatology, covariates, surprise
  numeric/       Chronos-2 and TimesFM 2.5 wrappers
  predict/       prompt assembly, model client, output validation
  score/         maturity detection, RPS, revision handling
  wiki/          page model, manifest, seed, consolidation, statistics, sweep
  calibrate/     block 6b computation, isotonic map fit and apply
  eval/          ladder, anchoring index, coherence, controls
  steering/      four verbs, audit log
  api/           API Gateway handlers
  harness/       leakage tests, canaries, cassette record/replay
```

**Two import rules are enforced in CI, not by review** (REQ-104, REQ-1005):

- No module outside `ingest/` and `repository/` imports a storage client.
- No module outside `events/`, `predict/` and `wiki/` imports a model client. This is ADR-0004's dividing line expressed as a lint.

## 2. Core interfaces

Protocols, so cassette and test doubles substitute cleanly.

```python
class AsOfRepository(Protocol):
    """The single temporal gateway. as_of is always `now` in Lane B."""
    def prices(self, instrument: str, window: int) -> Series: ...
    def events(self, since: datetime) -> list[Event]: ...
    def covariates(self, names: list[str], window: int) -> dict[str, Series]: ...
    def page(self, path: str) -> Page | None: ...
    def manifest(self, run_id: str | None = None) -> Manifest: ...

class Forecaster(Protocol):
    """Chronos-2 and TimesFM 2.5 both implement this."""
    name: str
    def forecast(self, context: Series, covariates: dict[str, Series] | None,
                 horizons: list[int]) -> QuantileForecast: ...

class ModelClient(Protocol):
    """Bedrock in production, cassette replay in tests."""
    def invoke(self, role: Role, prompt: Prompt) -> ModelResponse: ...
```

`Role` is an enum of `CLASSIFY | PREDICT | CURATE`, resolved to a model ID through `config/` (REQ-1007). **No call site names a model.**

## 3. Data schemas

### DynamoDB

| Table | PK | SK | Notes |
|---|---|---|---|
| `predictions` | `{env}#{instrument}` | `{as_of}#{track}#{horizon}` | `track` ∈ climatology, cond_climatology, chronos_uni, chronos_cov, timesfm_uni, timesfm_cov, agent_raw, agent_cal, agent_blind, shadow |
| `scores` | `{env}#{instrument}` | `{matured_on}#{track}#{horizon}#{revision}` | `revision` = 0 for the original; ≥1 for revised-close records (REQ-804) |
| `runs` | `{env}` | `{run_id}` | cut-off, step timings, token usage, manifest pointer, config version |
| `steering` | `{env}` | `{ts}#{actor}#{verb}` | target, before, after, applied-in run (REQ-916) |

Every prediction item stores its **bucket boundaries** inline (REQ-402). Scoring never recomputes them, so a later change to the σ window cannot retroactively alter a past score.

### S3

```
raw/{source}/{date}/{fetch_ts}.json        never published (REQ-1107)
wiki/pages/{type}/{key}.md                 versioning on
wiki/manifests/{run_id}.json               written last (REQ-714)
parquet/prices/{instrument}/{year}.parquet
parquet/covariates/{name}/{year}.parquet
cassettes/{model_id}/{prompt_hash}.json
calibration/{run_id}/map.json
published/{date}/…                          the derived-data mirror (REQ-1106)
```

### Page format

Markdown with a YAML front-matter block for machine-read fields, body for human-read content. Statistics live in front matter because they are computed (REQ-705) and must never be hand-edited into prose.

```yaml
---
key: central-bank-surprise__gold-spot-usd
type: correlation
author: agent            # agent | human | mixed   (REQ-912)
overlay_version: 1
stats:
  t+1:
    seeded:   {n: 31, hits: 19, mean: 0.613, ci90: [0.44, 0.76]}
    observed: {n: 4,  hits: 3,  mean: 0.750, ci90: [0.36, 0.96]}
    combined: {n: 35, hits: 22, mean: 0.629, ci90: [0.47, 0.76]}
  t+5: {…}
links: [central-bank-surprise__nifty-50, regimes/real-yields-rising]
---
```

Evidence rows are a Markdown table in the body, each carrying `source: seeded|observed` and an optional `corrected_by` (REQ-708, REQ-913).

## 4. Algorithms

Specified to remove implementation ambiguity. Each is pure, deterministic, and unit-testable.

### 4.1 Volatility and buckets (REQ-401)

σ_h is the standard deviation of **overlapping h-day log returns** over the trailing 60 sessions.

> *Overlapping windows make the estimator autocorrelated, which understates its own standard error. That affects the precision of the σ estimate, not the bucket definition — and 60 sessions yields only 12 non-overlapping 5-day returns, which is too thin to use instead. The choice is documented rather than hidden.*

Boundaries, with `r` the realised log return over the horizon:

| Bucket | Condition |
|---|---|
| large down | `r < −1.5 σ_h` |
| small down | `−1.5 σ_h ≤ r < −0.5 σ_h` |
| flat | `−0.5 σ_h ≤ r < 0.5 σ_h` |
| small up | `0.5 σ_h ≤ r < 1.5 σ_h` |
| large up | `r ≥ 1.5 σ_h` |

### 4.2 Ranked Probability Score (REQ-803)

With K = 5 buckets, `F_k` the cumulative predicted probability through bucket k, and `O_k` the cumulative observed indicator:

```
RPS = (1 / (K − 1)) · Σ_{k=1}^{K−1} (F_k − O_k)²
```

Lower is better. Being wrong by one bucket costs less than being wrong by four — which is the entire reason RPS is used rather than log loss or accuracy.

### 4.3 Beta-Binomial confidence (REQ-706)

Jeffreys prior `Beta(0.5, 0.5)`; with `h` hits and `m` misses the posterior is `Beta(0.5 + h, 0.5 + m)`. Reported confidence is the equal-tailed 90% credible interval from the Beta quantile function.

**Jeffreys rather than uniform** because it is the reference prior for a binomial proportion and stays well-behaved at the extremes — a page with 4 hits and 0 misses gets an honest interval rather than a point estimate of 1.0.

This is also what bounds recency swing mathematically: a single new observation moves a 35-observation posterior very little, with no clamp parameter to tune.

### 4.4 Standardised surprise (REQ-308)

```
surprise = (actual − consensus) / σ_surprise
```

where `σ_surprise` is the standard deviation of `(actual − consensus)` over that release series' available history. Consensus is the value snapshotted before the release (REQ-309), never a later revision.

### 4.5 Isotonic calibration (REQ-812)

Each `(prediction, bucket)` pair is one binary observation: predicted probability `p`, outcome indicator `y`. Isotonic regression is fitted on all such pairs, **pooled across instruments, split by horizon**, cross-validated.

Applying the map to a distribution breaks its normalisation, so:

```
p'_k = map(p_k)                    for each bucket k
p''_k = p'_k / Σ_j p'_j            renormalise
```

Below the REQ-813 sample gate the map is the identity and rung 6 equals rung 5.

### 4.6 Anchoring index (REQ-611)

With `d` the total variation distance, `B` the shown baseline, `P_shown` the prediction with baselines visible and `P_blind` without:

```
A = clip( 1 − d(P_shown, B) / d(P_blind, B) , 0, 1 )
```

`A = 1` means the prediction reproduced the baseline exactly — full anchoring. `A = 0` means showing the baseline changed nothing. Undefined when `d(P_blind, B) = 0`; those cases are excluded and counted.

### 4.7 Cross-market ordering (REQ-1203)

For a close from market `S` used as input to a prediction for market `T` targeting session `s_T`:

```
assert close_utc(S, last_session_at_or_before(cutoff)) < open_utc(T, s_T)
```

**Compared as UTC instants, never as calendar dates.** A date comparison passes the common case and fails every asymmetric-holiday and DST case, which is precisely why L9 is the top remaining leakage risk.

### 4.8 Sweep ranking (REQ-718, REQ-719)

For each grid cell with 90% credible interval `[l, u]`:

```
notability = max(l − 0.5, 0.5 − u, 0)
```

Cells whose entire interval sits away from 0.5 rank highest; cells straddling 0.5 score zero and are never surfaced. Ranked descending, filtered to cells with no page or whose page's stated direction contradicts the interval, then cut at the REQ-719 candidate volume.

### 4.9 Seeded/observed divergence (REQ-721)

Flagged when the seeded and observed 90% credible intervals for the same cell **do not overlap**. Non-overlap means the agent's own record disagrees with the historical statistics — which is either genuine regime change or a defect, and either way is the thing to look at.

## 5. Prompt assembly

One assembler builds all three prompt types. It is the **only** place a prompt is constructed (REQ-1202).

```python
def assemble(role: Role, ctx: RunContext) -> Prompt:
    blocks = [...]
    snapshot = Snapshot(blocks, cutoff=ctx.cutoff)
    snapshot.assert_no_record_after_cutoff()   # REQ-1201, no exceptions list
    snapshot.persist()                          # REQ-1202
    return snapshot.to_prompt()
```

`assert_no_record_after_cutoff` walks every record that contributed to any block and checks `knowledge_time ≤ cutoff`. **It takes no allowlist parameter** — an exceptions mechanism is exactly how this check erodes.

Cache breakpoint after block 2. Nova caps cached content near 20k tokens, so only part of the prefix caches; the economics are re-derived per model (REQ-1014).

## 6. Configuration

All configuration is SSM Parameter Store, per environment.

| Parameter | Purpose |
|---|---|
| `model/classify` | `amazon.nova-lite-v1` |
| `model/reason/predict` | `amazon.nova-pro-v1` |
| `model/reason/curate` | `amazon.nova-premier-v1` |
| `wiki/seed_enabled` | seed vs empty arm (REQ-712) |
| `thresholds/*` | the six calibrated values |
| `shadow/enabled`, `shadow/instruments` | ADR-0039 window |
| `measurement/period_id` | increments on any config change (REQ-819) |

Deploy asserts every parameter resolves, that all three models are available with access granted (REQ-1008), and that `model/reason/predict` equals the model used for the baseline-blind control (REQ-1009).

**A configuration change bumps `measurement/period_id`.** That is the mechanism behind REQ-819 — the skill record is partitioned by it, so a changed system cannot silently continue an old series.

## 7. Error handling

| Failure | Behaviour |
|---|---|
| Source fetch fails | Retry with exponential backoff, 3 attempts, then halt the run and alert. No partial write. |
| Ingest validation fails | Hard halt (REQ-209). Never substitute or interpolate. |
| Model call fails | Retry 3 times with backoff; then halt. A partial prediction set is never scored. |
| Cassette miss in replay mode | Hard failure, never a live call (REQ-1210) |
| Crash mid-consolidation | Manifest unwritten, so the previous wiki state stands (REQ-714). The next run resumes from the last manifest. |
| Run exceeds the time budget | Alert; the run continues. A slow run is not a wrong run. |

**Halting is preferred to degrading throughout.** Under forward-only a missing day is a gap in the record — recoverable and visible. A day built on substituted data is a silent corruption of the only evidence the project will ever have.

## 8. Local development

Docker Compose provides DynamoDB Local, MinIO for S3, and a cassette-backed `ModelClient`. The pipeline runs end to end with no AWS account and no model spend, which is what makes the harness runnable in CI.

Numeric model weights are baked into the container image (~1.3GB) rather than downloaded at start, so local runs and AgentCore runs execute identical code paths.

## 9. Open at the design level

| Item | Resolved by |
|---|---|
| N for 1-hop link-neighbour cap (REQ-717) | Prompt-size budget against the 20k cache ceiling |
| N for the bulk-correction refusal limit (REQ-915) | Operational judgement during steering build |
| Chronos-2 maximum context length | Pre-build verification (`aws-architecture.md`) |
| Whether Chronos/TimesFM accept known-future covariates | Pre-build verification — if so, calendar factors fit that slot naturally |
