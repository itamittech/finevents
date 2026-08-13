# FinEvents — Execution

**Status:** Increments 0–1 built. **A gold POC track is now running ahead of the ladder** — the builder's decision, recorded below.
**Governs:** how work is sequenced and handed over. Read with [Tasks.md](Tasks.md), which holds the full task detail.

---

## ▶ WHERE WE ARE

```
CURRENT TRACK:      GOLD POC  (a resequencing, chosen 2026-08-13 — see "The POC track")
CURRENT STEP:       P3 — the two forecasting models.  DONE, locally verified.
NEXT STEP:          P4 — quantiles to buckets, and RPS against climatology

LADDER POSITION:    increments 0 and 1 built; neither deployed. The ladder resumes
                    after the POC.
BLOCKED ON:         nothing. Deployment is deferred by the builder's decision and
                    the POC needs no AWS.
RESOLVED:           T0.13 Python version — ADR-0054. The intersection does not bind.
                    T0.16 scraped-payload signature — already defined in Design §9.
                    T1.1–T1.5 — bitemporal core, append-only writes, as-of gateway,
                    frozen clock, property tests over REQ-105–108 + REQ-407.
                    DATA_SOURCES.md question 1 (FRED terms) — answered 2026-08-13.
                    TimesFM 2.5 licence (Apache-2.0) — one of the ten pre-build items.
```

### The POC track

**Why it exists.** Increment 10 of the ladder is already marked ★ and already says the
numeric lane *"stands alone"* as a contribution. The POC pulls that milestone forward on
one instrument, drops the event and agent halves, and runs entirely on a laptop.

**It is legal under ADR-0037.** Forward-only binds the *agent*. Lane A numeric calibration
against history is one of three explicitly permitted uses of history (T6.12).

| Step | What | State |
|---|---|---|
| P1 | Collect gold + covariates; answer FRED terms | ✅ 10 series in `data/`, fetchers committed |
| **P2** | **Validate, align as-of, σ and buckets** | ✅ **done — `scripts/prepare_gold_poc.py`** |
| **P3** | **Chronos-2 and TimesFM, univariate + covariate-informed** | ✅ **done** — install measured, both wrappers behind one `Forecaster`, all four tracks byte-identical on repeat (REQ-507) |
| **P4** | **Quantile → bucket (REQ-508), RPS vs climatology** | ✅ **done** — six rungs scored on 143 unseen days. **The result is a null; see below** |
| P5 | The daily runner — fetch, forecast, seal, score what matured | next |
| P6 | Schedule it locally | |
| P7 | The dashboard | |

### The first result — 2026-08-13, revised after switching to a paired test

Six rungs, 143 unseen days in the contamination-free window. RPS, lower is better.

**Aggregate — paired per-day differences against climatology** (the sharper test; every
rung sees identical days, so outcome noise cancels rather than swamping the signal):

| rung | t+1 mean | vs climatology | t+5 mean | vs climatology |
|---|---|---|---|---|
| `chronos_uni` | 0.1401 | −0.0027, n.d. | **0.1407** | −0.0036, n.d. |
| `timesfm_uni` | **0.1392** | −0.0036, n.d. | 0.1455 | +0.0012, n.d. |
| `climatology` | 0.1428 | — the bar | 0.1443 | — the bar |
| `chronos_cov` | 0.1492 | +0.0064, n.d. | 0.1568 | **+0.0125 worse** |
| `timesfm_cov` | 0.1442 | +0.0014, n.d. | 0.1593 | **+0.0150 worse** |
| `all_flat` | 0.1783 | **+0.0355 worse** | 0.1871 | **+0.0428 worse** |

*n.d. = no detectable difference; the 95% interval of the per-day difference includes zero.*

**Conditioned on what actually happened — the aggregate was hiding this** (t+1):

| rung | large down | small down | flat | small up | large up |
|---|---|---|---|---|---|
| `chronos_uni` | **0.333** | **0.153** | 0.048 | **0.163** | **0.369** |
| `timesfm_uni` | **0.325** | **0.144** | 0.051 | **0.163** | **0.370** |
| `climatology` | 0.419 | 0.188 | **0.014** | 0.173 | 0.407 |
| *n days* | 11 | 25 | 64 | 31 | 12 |

**The models beat climatology on every category of day where the price moved, and lose
badly on the 64 days where it did not.** Climatology's flat-day score of 0.014 is nearly
perfect — it says "flat" and is usually right — and that one column drags the mean.

So the aggregate null is a statement about **calibration, not about absence of signal**. The
models spread probability wider than climatology; that costs them on quiet days and pays on
moving ones, and it nets to a wash. They are not noise.

**Two things only the paired test could resolve:** both covariate tracks are *detectably
worse* than climatology at t+5, and `all_flat` is detectably worse at both horizons. The
unpaired overlap test called all three "indistinguishable" — it was simply too blunt.

**What cannot be concluded.** You do not know in advance which days will move, so
"use the model on moving days" is not a strategy. The conditional table is evidence that
the models carry information about movement magnitude, not a trading rule.

**The contamination boundary is the result.** Chronos-2 and TimesFM 2.5 were pre-trained
on corpora closing before 2026 — neither publishes an exact cutoff, which is still an open
pre-build item. Anything scored before 2026 measures partly what the models memorised. The
2026 window is the only part a claim can rest on, and it must be reported separately.

**What is green locally.** `uv run pytest` — **151 tests** (142 without the model weights,
which is CI's view). `uv run pre-commit run --all-files` — 10 hooks. `sam validate --lint`
and `sam build`. Gate G0's checks pass; Gate G1's T1.4 is green; REQ-507 holds on all four
numeric tracks.

**What is not yet proven.** The deploy loop. Nothing has touched AWS, by decision — the
seven tables and the versioned bucket are declared in `template.yaml` and validated, but
no store exists yet. **Nothing has been written to any store, so REQ-101's
non-retrofittable guarantee is still intact and unspent.**

**Update this block whenever an increment lands.** It is the answer to "where are we?" and it is the first thing any session reads.

---

## How this works

The build plan in [Tasks.md](Tasks.md) is organised by *dependency* — 13 phases, each a horizontal layer. That is the right way to record what must be true before what. It is the wrong way to *work*, because a horizontal layer has nothing to show until it is finished, and several of these layers take weeks.

This document reorganises the same tasks into **increments**: small, sequential, and each ending in something you can see and check yourself.

**The rules:**

1. **One increment at a time.** Finishing early is not a reason to start the next one.
2. **Every increment ends in something visible** — rows in a table, a forecast, a page, a scored number, a chart. If a proposed increment has nothing to show, the boundary is wrong: split it differently or fold it into its neighbour.
3. **Every increment ends with a demo, not a changelog.** The exact command, and what you should expect to see. Not "here are the files I changed".
4. **The order is not a convenience.** It encodes irreversible constraints. Resequencing is your decision, not an assistant's.
5. **Verification is yours.** Each increment states how *you* check it without taking anyone's word for it.

**How to keep control without reading everything.** For each increment you only need to answer three questions: does the demo do what it claims, does it do it on real data, and did anything land that I did not ask for? The "Verify" line in each increment is written so you can answer the first two in a few minutes. For the third, `git log --stat` since the last increment should contain nothing surprising.

**How to say stop.** "Not this increment, do X instead" is always a valid answer. So is "that increment is too big, split it". The ladder is a proposal, not a contract — but changing it should be a deliberate act, not drift.

---

## What changes from Tasks.md

Two deliberate departures, both recorded here rather than smuggled in:

**Infrastructure moves to the front.** Tasks.md puts SAM, the environment stacks and IAM in Phase 11 and marks them parallelisable from Phase 6. But nothing can be *demonstrated in dev* until a stack exists, so a minimal SAM template is part of increment 0. The rest of Phase 11 still arrives late; only the deploy loop moves forward.

**Phase 4 is split, as recorded in Tasks.md.** 4a (cross-market ordering) lands early because it needs only the calendars. 4b (snapshot integrity, canaries) lands after the prompt assembler exists, and it is the hard gate — increment 13.

Nothing else is resequenced. The three non-negotiable orderings in Tasks.md are preserved exactly.

### Coverage gaps found by the ordering check

An independent pass over the precedence graph found tasks that this ladder does not place. They are listed here rather than quietly folded in, because two of them change an increment's contents:

| Task | Belongs in | Why it cannot drift later |
|---|---|---|
| **T11.3** prefix-scoped IAM with explicit denies | **0** | ADR-0024 calls it mandatory rather than advisory. A template block in increment 0; a blocker at increment 13, where canary isolation depends on it |
| **T11.10** Docker Compose local stack | **1** | Design §8 makes it what "makes the harness runnable in CI" — needed as the test substrate from increment 6 onward |
| **T5.9** eleven-year classification batch | **7** | Newly added to Tasks.md; it was owned by no task. Without it the seed join has nothing to join **and** the covariate-informed forecasts get an all-zero severity series |
| **T6.12** Lane A historical calibration run | **9** | Increment 14 claims REQ-808 while nothing produces the calibration it labels |
| **T13.9** the ADR-0046 comparison | **14**, not 17 | Tasks.md T13.9: "must exist before the first skill figure is rendered". Increment 15 renders REQ-903 |
| **T4.1 / T4.2** snapshot integrity | consider moving to **12** | `snapshots/` must exist the moment `assemble()` calls `snapshot.persist()`. Leaving them at 13 means a full increment of prompts assembled with no byte-identical rebuild test |

**The G4 scope was also wrong here and is now corrected in Tasks.md.** REQ-1212 scopes the gate to the **agent** path; a Phase 4 header written during the review broadened it to "no scored prediction", which would have made increment 10 — the numeric ladder scoring — illegal under this project's own plan. Lane A has no prompt, so nothing 4b tests applies to it.

---

## The ladder

Sizes are for one person, and are the honest estimate rather than the hopeful one. **Build time is additional to the post-go-live timeline** in [project-deliverables-diagram.svg](design/project-deliverables-diagram.svg) — that clock starts at increment 17, not today.

---

### 0 — Toolchain and walking skeleton
**Goal.** Prove the whole deploy loop works before writing anything that matters.

**You'll see.** `sam deploy` succeeds against the dev stack. You invoke one Lambda, get a payload back, and find its line in CloudWatch. The dev role is *explicitly denied* against a production ARN that does not exist yet. CI runs on a pull request and goes green.

**Deliberately writes to no store.** Increment 1 owns the schema, and `runs` is one of its stores — a skeleton that writes a run record would violate the very rule the next increment exists to establish.

**Verify.**

Locally, no AWS account needed:
```bash
uv sync --group dev && uv run pytest && uv run pre-commit run --all-files
sam validate --lint --template template.yaml --region us-east-1
```

Then the deploy loop itself:
```bash
sam build --parameter-overrides Environment=dev
sam deploy --config-env dev
sam remote invoke HelloFn --stack-name finevents-dev --region us-east-1
aws logs tail /aws/lambda/finevents-dev-HelloFn --since 5m --region us-east-1
```

And prove the IAM boundary exists **before** anything can cross it:
```bash
aws iam simulate-principal-policy --region us-east-1 --action-names dynamodb:PutItem --policy-source-arn "$(aws cloudformation describe-stacks --stack-name finevents-dev --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='HelloFnRoleArn'].OutputValue" --output text)" --resource-arns "arn:aws:dynamodb:us-east-1:$(aws sts get-caller-identity --query Account --output text):table/finevents-prod-predictions" --query 'EvaluationResults[0].EvalDecision'
```
Expect `"explicitDeny"`. The production table named there does not exist, which is the
point — the deny must predate the resource, or there is a window in which a dev role can
reach production data.

> **Note on region.** `samconfig.toml` pins `us-east-1` per ADR-0024. A locally configured
> default region does not apply, so a misconfigured workstation cannot create the stack in
> the wrong place. Pass `--region us-east-1` on the bare `aws` calls above.

**Covers.** T0.4–T0.16, and the minimum of T11.1/T11.2/T11.3 pulled forward.
**Not yet.** Any pipeline logic at all. This increment deliberately does nothing useful.
**Size.** 2–3 days estimated. T0.13 — expected to dominate — took under an hour, because
the intersection turned out not to bind.

> The wheel intersection — Chronos-2 ∩ TimesFM 2.5 ∩ SAM Lambda runtimes ∩ AgentCore base image — is the one irreversible choice in the whole build. Get it wrong and increment 9 forces a rebuild of everything below it.

---

### 1 — Bitemporal foundation
**Goal.** The schema that cannot be retrofitted, and the gateway everything reads through.

**You'll see.** You write a record, query it as-of two different timestamps, and get two different answers. Property tests pass over randomly generated as-of values.

**Verify.**
```bash
uv run pytest tests/repository -q
```

Then read [`tests/repository/test_boundary_equality.py`](../tests/repository/test_boundary_equality.py) specifically — an off-by-one there is the likeliest bug in the project and the least likely to be noticed. The file has a header explaining why, and each test pins one side of the boundary at a fixed instant so a failure names the exact relation that broke.

To see the two-answers property directly rather than through a test:
```bash
uv run pytest tests/repository/test_append_only.py::test_a_revision_is_a_new_vintage_and_both_remain_readable -v
```

**Covers.** T1.1–T1.6 · REQ-101–113, REQ-407.
**Not yet.** Any real data. `prices()`, `covariates()` and `page()` raise `StoreNotYetAvailable` naming the increment that builds their store — an empty result there would be indistinguishable from "no data yet" at every call site downstream.
**Size.** 3–4 days.

> **Nothing may write to any store before this lands.** `knowledge_time` cannot be reconstructed after the fact — for several sources the information is simply gone. This is the one increment where "we'll fix it later" has no meaning.

---

### 2 — One instrument, end to end
**Goal.** The first vertical slice: one source, one instrument, all the way through.

**You'll see.** S&P 500 closes in the store, each stamped with `knowledge_time`, fetched from FRED by a Lambda running in dev. An as-of query against real data returns what was knowable on a past date.

**Verify.** Invoke the ingest function, then query the repository as-of a week ago and confirm it excludes the last week's bars.

**Covers.** T3.3, T3.8–T3.10 · REQ-204, 208, 209, 110. FRED, not Stooq (ADR-0053).
**Not yet.** Other sources, other instruments, calendars, validation beyond the basics.
**Size.** 2–3 days.

> This is the increment that proves the shape. Everything after it is repetition and depth.

---

### 3 — Calendars and the L9 ordering test
**Goal.** Close the top-ranked leakage vector before any code depends on getting it wrong.

**You'll see.** Market calendars for all five venues as UTC instants, plus the OTC spot convention. The cross-market ordering test passing — and a deliberately date-based comparison *failing* the asymmetric-holiday and DST fixtures.

**Verify.** `pytest tests/harness/test_cross_market -q`, then temporarily swap the UTC comparison for a calendar-date one and watch the fixtures fail. If they don't, the fixtures are wrong.

**Covers.** T3.1, T3.2, T4.3, T4.4 (Phase 4a) · REQ-210, 211, 1203, 1204.
**Not yet.** The rest of the leakage harness.
**Size.** 3–4 days.

---

### 4 — All sources ingesting
**Goal.** Gate G3 — the full data foundation.

**You'll see.** All 11 instruments and 5 FRED covariates arriving daily with validation green. A table of yesterday's closes you can check against a public source.

**Verify.** Run the ingest step; compare three instruments against their public quotes by eye. Then break one deliberately — feed an impossible price — and confirm the run halts rather than writing it.

**Covers.** T3.4–T3.7, T3.11, T3.12 · REQ-201–213.
**Blocked on.** T0.12 — the four data-terms questions gate the fetcher for each affected source (ADR-0050).
**Size.** 4–5 days.

---

### 5 — Event pre-filter, no model
**Goal.** Reduce the GDELT firehose deterministically, before any model is involved.

**You'll see.** Roughly 4,100 GDELT records for a day reduced to a handful of candidates — few enough that you can read them all and judge whether the filter is sane.

**Verify.** Run it on three different days, read the survivors, and ask whether anything obviously market-moving was dropped.

**Covers.** T5.1 · REQ-301.
**Not yet.** Classification or severity — the filter is pure code.
**Size.** 2 days.

---

### 6 — Classification, and cassettes
**Goal.** The first model call, and the record/replay layer that keeps every later test deterministic.

**You'll see.** Classified events with severity scores, produced in dev by Nova Lite. Then the same run replayed offline from cassettes with no AWS account and no model spend.

**Verify.** Run once live, once in replay mode, and diff the outputs — they must be identical. Then delete a cassette and confirm replay mode *fails hard* rather than silently calling the model.

**Covers.** T2.0–T2.3, T5.4, T5.6, T5.7 · REQ-303–306, 1007, 1210, 1211.
**Size.** 3–4 days.

> Cassettes have to exist from the *first* model call, not later. Their storage question (T2.3) is still open and blocks this increment.

---

### 7 — Labelled sample and the spot-check
**Goal.** Two calibrated numbers, and the gate that protects eleven years of seeded evidence.

**You'll see.** A hand-labelled GDELT sample, a measured recall floor with a stated confidence half-width, and a disagreement rate against a stronger model.

**Verify.** Read the labelled sample yourself — this one is genuinely manual, and it is meant to be.

**Covers.** T5.2, T5.3, T5.5 · REQ-302, 307.
**Size.** 3 days, mostly labelling.

> **T5.5 gates the wiki seed (increment 11).** A misclassification here propagates into eleven years of seeded observations, and rebuilding the seed invalidates every live observation accrued against the old pages. This is not an increment to rush.

---

### 8 — Features and buckets
**Goal.** Every number the model will later receive, computed in code.

**You'll see.** Today's σ and bucket boundaries for all 11 instruments, in a table you can sanity-check by hand — gold's boundaries should look like gold, not like NIFTY.

**Verify.** Recompute one instrument's σ in a spreadsheet from the same 60 closes and confirm it matches to the last decimal. The estimator is specified exactly in Design §4.1 precisely so this check is possible.

**Covers.** T6.1–T6.5, T5.8 · REQ-401–408.
**Size.** 3 days.

---

### 9 — The numeric lane
**Goal.** Two foundation models producing bucket distributions.

**You'll see.** 44 forecasts a day — 11 instruments × 2 models × 2 configurations — converted to the same five buckets the agent will use. Chronos and TimesFM disagreeing somewhere, which is itself signal.

**Verify.** Run twice with the same input and confirm byte-identical output (REQ-507). Without deterministic seeding, Lane A's truncated replay is meaningless.

**Covers.** T6.6–T6.11 · REQ-501–509.
**Size.** 4–5 days.

---

### 10 — ★ The numeric ladder runs and scores
**Goal.** The first genuinely useful thing this project produces.

**You'll see.** **A scored RPS number for four ladder rungs on a real, unseen day** — climatology, conditional climatology, Chronos-2 covariate-informed, TimesFM covariate-informed. Scored on identical days, from a leak-tested data path.

**Verify.** Pick a day, work out by hand which bucket the realised move fell into, and check the stored score against your own arithmetic. Every input was fixed at prediction time, so this must reconcile exactly.

**Covers.** T9.1–T9.5 · REQ-801–806.
**Size.** 3–4 days.

> **★ This is the first real product milestone, and it stands alone.** If the agent never beats anything — if the whole event-reasoning thesis fails — this is still two state-of-the-art foundation models benchmarked against climatology on live, uncontaminated data with a published record. That is a contribution on its own, and it arrives roughly a third of the way through the build rather than at the end.

---

### 11 — The wiki and its seed
**Goal.** The knowledge layer, and eleven years of history joined into it for free.

**You'll see.** Correlation pages you can read, each with an evidence table, a hypothesis in prose, and computed statistics presented three ways — seeded, observed, combined. The seed built by SQL, with zero model calls.

**Verify.** Open a page. Check that the hit rate in the computed block matches the evidence rows by counting them. Confirm every row carries a `seeded` or `observed` tag — an untagged row must fail validation.

**Covers.** T7.1–T7.11 · REQ-701–721.
**Blocked on.** Increment 7 (T5.5).
**Size.** 5–6 days.

---

### 12 — Prediction, deliberately unscored
**Goal.** The agent produces real predictions. Nothing scores them yet.

**You'll see.** An actual prediction for gold: a distribution over five buckets at two horizons, with reasoning, citing wiki pages by `path@version_id`. Plus the baseline-blind control on sampled days.

**Verify.** Take a cited page version and confirm it existed at the run's cut-off. A citation to a page that did not yet exist is a leakage signal, not a formatting error.

**Covers.** T8.1–T8.12 · REQ-601–615.
**Not yet.** **Scoring. This is the discipline, not an oversight.**
**Size.** 4–5 days.

---

### 13 — ⛔ The leakage harness — GATE G4
**Goal.** Prove leakage is detectable, not merely absent.

**You'll see.** Snapshot integrity green, a canary for each surviving vector, and a **deliberately leaky pipeline variant that the canaries catch**. A test that cannot fail is not a test.

**Verify.** Run the canaries against the leaky variant and watch them fire. Then run them against the real pipeline and watch them stay quiet. Both halves matter.

**Covers.** T4.1, T4.2, T4.5–T4.7 (Phase 4b) · REQ-1201–1206, 1212.
**Size.** 4–5 days.

> **⛔ No scored agent prediction may exist before this is green.** Under forward-only a leaked prediction cannot be re-run — there is no second attempt at a live day. If this gate appears to block you, the sequencing is wrong, not the gate.

---

### 14 — The agent joins the ladder
**Goal.** Six rungs, and the loop closing.

**You'll see.** All six rungs scored on identical days. The curator writing yesterday's outcome into a page, the statistics recomputing, and tomorrow's prompt carrying a different number than today's.

**Verify.** Follow one observation end to end: outcome → evidence row → recomputed posterior → the number in the next day's prompt. That chain is the entire thesis in one trace.

**Covers.** T9.6–T9.11, T10.1–T10.6 · REQ-808–814, 1208, 1209.
**Size.** 3–4 days.

---

### 15 — The dashboard
**Goal.** The learning curve, visible.

**You'll see.** Six rungs per instrument and horizon in a browser, the learning curve with its interval, and per-prediction audit down to the prompt snapshot.

**Verify.** Click into a prediction and confirm you can reach the exact prompt that produced it and the page versions it cited.

**Covers.** T12.1–T12.8 · REQ-901–908, 919.
**Size.** 5–6 days.

---

### 16 — Steering and publication
**Goal.** A human can steer the system, and the record goes public.

**You'll see.** Four verbs working with a full audit trail, two skill series rendering side by side, and derived data published.

**Covers.** T12.9–T12.18 · REQ-909–918, 1106–1112.
**Size.** 5–6 days.

---

### 17 — Go-live
**Goal.** Freeze, start the clock.

**You'll see.** Ten thresholds frozen with recorded evidence, the ADR-0046 comparison implemented, the tuning window open and labelled, the shadow A/B running.

**Covers.** T13.1–T13.10 · REQ-815–823, 921.
**Size.** 2–3 days.

> **The post-go-live timeline starts here**, not at increment 0. Month 3 is three months after *this*.

---

## Progress log

Append one line per landed increment. Keep it terse — the git history holds the detail.

| # | Increment | Landed | Notes |
|---|---|---|---|
| — | — | — | Nothing yet |
