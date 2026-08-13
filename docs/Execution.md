# FinEvents — Execution

**Status:** Increments 0–1 built. **A gold POC track is now running ahead of the ladder** — the builder's decision, recorded below.
**Governs:** how work is sequenced and handed over. Read with [Tasks.md](Tasks.md), which holds the full task detail.

---

## ▶ WHERE WE ARE

```
CURRENT TRACK:      GOLD POC  (a resequencing, chosen 2026-08-13 — see "The POC track")
CURRENT STEP:       P5 — the daily runner. DONE. `scripts/run_poc_daily.py`:
                    fetch → seal → mature, three instruments, gold carrying the
                    ADR-0056 rwcov controls (seed = the as-of date, recorded).
                    Seal-once and sealed-edge scoring are pinned by 8 tests.
                    First live seals taken 2026-08-13; ui/data/live.js is the
                    record and the dashboard shows it.
NEXT STEP:          The P8 series — the builder's 2026-08-13 evolution: P8a (WTI,
                    silver mirror, oil+FX hunch rungs) and P8b (deterministic
                    GDELT event feed) are DONE. Next: P8c — the Strands reasoning
                    rung (ADR-0057, REQ-1301–1303; OpenAI GPT-5.6 via env vars,
                    key pending from the builder) → P8d the mini-wiki memory
                    (docs/design/poc-mini-wiki.md). P6 (scheduling) follows P8.

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
                    ADR-0056 accepted 2026-08-13 — the random-walk covariate control
                    is binding: covariate rungs carry a *_rwcov control from P5 on.
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
| **P4** | **Quantile → bucket (REQ-508), RPS vs climatology** | ✅ **done, then re-scored after a same-day review pass** — seven rungs on 143 unseen days. **The result is a null; see below** |
| **P5** | **The daily runner** | ✅ **done** — `scripts/run_poc_daily.py`: fetch (halts on failure) → seal every rung from the latest print → mature what closed. Gold seals 9 rungs including the **`chronos_rwcov` / `timesfm_rwcov` controls ADR-0056 requires** (one seeded random walk, seed = as-of date, recorded per record); FX pairs seal univariate. **Seal-once** (a re-run is byte-identical — verified by hash) and **sealed-edge scoring** (a source revision can never move a taken score) are pinned by `tests/poc/`. `ui/data/live.js` is the record; the dashboard's "live track record" section reads it. No wall clock anywhere: as-of, seed and maturation all derive from the data |
| P6 | Schedule it locally | follows P8 — H.10's weekly USD/INR lag and CBR's next-day fix are handled by construction |
| **P8a** | **WTI ("petrol") joins the board** | ✅ done — 4th instrument, univariate ladder + daily seals. Series starts 2020-07 on principle: WTI's −$37 print (2020-04-20) has no log-return. Loading unified in `gold_poc_data.UNIVARIATE_SERIES`. **Follow-up at the builder's direction:** the oil+FX hunch seals as its own gold rungs (`*_oilfx` — WTI + USD/RUB + USD/INR + dollar index) from the next print, judged live against the `*_rwcov` control per ADR-0056. Measured context: gold–oil daily-return correlation ≈ 0 (the connection is a levels trend — spurious-regression territory); oil was already inside the 10-covariate `*_cov` set. Exploratory probe (both models, 40 spread 2026 cut-offs, labelled exploratory): `wti only` and `oil+fx` are **worse than univariate** on 5 of 8 model×horizon cells with intervals excluding zero — TimesFM `oil+fx` t+5 worst at +0.0456 — while `silver only` (the return-correlated covariate) stays harmless. The live `*_oilfx` vs `*_rwcov` record is the confirmatory judge |
| **P8a″** | **Silver — the mirror experiment** (builder's direction) | ✅ done — 5th instrument. Correction of the premise it started from: covariates never *added* skill anywhere; silver-as-covariate was merely the one that did gold **no harm** (returns co-move at 0.68 — the set's only co-integrated pair). The mirror: silver forecast with **gold as sole covariate** (same CBR fix — no re-dating), `*_cov` + `*_rwcov` sealed daily, offline ladder on the same 143 days. Tests whether harmlessness is symmetric and whether return co-movement can ever add skill |
| **P8b** | **Deterministic event feed** (GDELT, code-only filter — increment 5 pulled forward) | ✅ done — the T0.12 gate cleared first: DATA_SOURCES question 2 answered from GDELT's own terms (dataset-level attribution, recorded 2026-08-13), which unblocks the fetcher. `scripts/gdelt_events.py`: one cached daily file per day, a filter whose every threshold is a named constant (7 conflict-side CAMEO roots, ≥50 mentions, best per type × country, ≤12/day), 6 tests. `ui/data/events.js` publishes metadata + source URLs only (REQ-1107/1108) with attribution embedded; the dashboard shows the week (84 events over 7 days at first run) and the daily runner refreshes it non-fatally — prices seal even when the news feed hiccups |
| P8c | The reasoning rung — Strands (ADR-0057), OpenAI GPT-5.6 from env, `llm_raw` + `llm_mem` sealed like every rung | blocked on the builder's API key |
| P8d | The mini-wiki memory — [design agreed](design/poc-mini-wiki.md): code computes numbers, model writes cited lessons, both provenance-tagged | after P8c |
| **P7** | **The dashboard** | ✅ **done — resequenced ahead of P5/P6** (builder's decision, 2026-08-13) so the page fixes the data contract the runner writes to. One self-contained `ui/index.html` — no CDN, opens from disk, ships to S3 unchanged (ADR-0020). Reads `ui/data/results.js` (per-day scores, distributions, NW intervals, verdicts) + `ui/data/latest.js` (sealed unscored forecast). Same-day friendliness pass at the builder's direction: the page now opens with a **fan chart** — the gold price with each method's 10–90% decile ribbon, escape days ringed, promised-vs-delivered coverage, and horizon/method/window/flat-zone filters — followed by a day-by-day predicted-vs-actual view with hit-and-direction scoreboard vs climatology and the moving-day framing of what the agent is being built to win. Committed emitters write derived work only (REQ-1106/1107); the fan chart's price layers (`ui/data/prices*.js`, source-derived values) are generated locally and deliberately never committed while the CBR terms question stays open. Second builder pass the same day: instrument identity cards (the series is XAU/**RUB** per gram — said plainly), an on-chart legend and plain-language how-to-read, friendly method names everywhere, and **USD/RUB + USD/INR forecast in their own right** (univariate rungs only — covariate rungs would need their own design plus ADR-0056 controls) behind an instrument switcher. The FX result is itself informative: Chronos-2 ties the base rates on USD/RUB and both models are detectably *worse* on USD/INR |

### The first result — 2026-08-13, after four methodology corrections

Seven rungs, 143 unseen days in the contamination-free window. RPS, lower is better.
**Paired per-day differences** against climatology (T13.9's day-level aggregation), with
**Newey–West errors at lag = horizon−1** because t+5 is scored daily while each outcome
spans five sessions. Covariates join in **knowledge time** (`scripts/gold_poc_data.py`).

| rung | t+1 | vs climatology | t+5 | vs climatology | t+5 days won |
|---|---|---|---|---|---|
| **`climatology`** | **0.1368** | — the bar | 0.1443 | — the bar | — |
| `cond_climatology` | 0.1390 | +0.0022 n.d. | 0.1467 | +0.0024 n.d. | 57/143 |
| `timesfm_uni` | 0.1392 | +0.0024 n.d. | 0.1455 | +0.0012 n.d. | 69/143 |
| `chronos_uni` | 0.1401 | +0.0033 n.d. | **0.1407** | **−0.0036 n.d.** | **96/143** |
| `timesfm_cov` | 0.1453 | **+0.0085 worse** | 0.1646 | +0.0203 n.d. | 70/143 |
| `chronos_cov` | 0.1488 | +0.0120 n.d. | 0.1568 | +0.0125 n.d. | 78/143 |
| `all_flat` | 0.1783 | **+0.0415 worse** | 0.1871 | **+0.0428 worse** | 63/143 |

*n.d. = the 95% interval of the per-day difference includes zero.*

**Climatology leads at t+1 and nothing beats it anywhere.** Every covariate rung's point
estimate is worse than its univariate sibling at both horizons; under honest errors one of
those deficits (`timesfm_cov` t+1) is still individually detectable, and `all_flat` stays
detectably worse at both horizons — the test keeps its teeth.

**The one thing close to a signal is `chronos_uni` at t+5:** −0.0036, winning **96 of 143
days (67%)**, better on `large down`, `small down` and `flat`, worse on both up buckets.
The overlap-aware interval is [−0.0104, +0.0032] — wider than the iid one that nearly
excluded zero. Winning two days in three while the mean stays inside noise means it wins
often by a little and loses occasionally by a lot. Worth watching; not yet a finding.

#### Four corrections that changed the answer

**1. Climatology was miscalibrated.** It bucketed all history against *today's* σ, so the
bar moved with the volatility regime — 0.595, 0.753 and 0.620 on `flat` at three cut-offs
in one year, against a realised rate of 0.448. Buckets are σ-relative *at the time*
(REQ-401), so each historical return must be bucketed by its own contemporaneous σ. Fixed;
the scale-free version gives 0.445 at all three, and there is now a property test for it.

**2. The comparison was unpaired.** Two independent intervals checked for overlap is the
weakest available test when every rung is scored on identical days. Paired, the intervals
tightened roughly fourfold and three verdicts moved from "indistinguishable" to "worse".

**3. The covariate join leaked one session.** A FRED value dated D is that day's US close —
10–14 hours *after* CBR had already fixed the next day's price (the CBR fix dated D is set
the working day before D; 13 Aug's was public on 12 Aug). Joined by value date, every
cut-off saw a US close postdating the t+1 outcome it predicted. The join now runs on
knowledge days (FRED value date +1) — REQ-407 applied *across* sources, the rule ADR-0016
builds into the store and the POC panel was silently breaking. Removing the leak left the
four covariate-free rungs **byte-identical** and made the covariate rungs *worse*
(`timesfm_cov` t+5: 0.1593 → 0.1646): the leak had been helping them, TimesFM's XReg most,
since it regresses on contemporaneous covariates.

**4. The standard errors ignored horizon overlap.** t+5 differences share four of five
outcome sessions with their neighbours; the iid error is too small by construction. With
Newey–West at lag = horizon−1, three borderline "worse" verdicts (both covariate rungs at
t+5, `chronos_cov` at t+1 — whose iid lower bound was +0.0004) honestly widen to "no
detectable difference".

Every correction moved the answer against the models or widened the claimed certainty. An
earlier write-up here claimed the models beat climatology on every category of moving day;
that was an artifact of correction 1 and is withdrawn.

#### Rung 2 built — and it does not help

Conditional climatology (Design §4.10) now runs at levels 2/1/0. It sits on **level 2 for
100% of cut-offs** at the provisional `N_min = 20`, so it is genuinely conditioning rather
than silently collapsing to rung 1.

| | t+1 | t+5 |
|---|---|---|
| `climatology` (rung 1) | **0.1368** | **0.1443** |
| `cond_climatology` (rung 2) | 0.1390 (+0.0022) | 0.1467 (+0.0024) |

**Conditioning on the real-yield × VIX regime makes it slightly worse at both horizons** —
not detectably, but the point estimate moves the wrong way. So the regime cell carries no
usable information about gold's next bucket distribution at this granularity, and
**unconditional climatology remains the bar**.

That is a finding in its own right: ADR-0017 called the real 10Y yield arguably *the*
dominant gold driver, and terciling it against VIX still adds nothing at daily resolution.
Levels 4 and 3 remain unbuilt — they need T3.2's festival/expiry calendar.

#### Why the covariates hurt — diagnosed in two rounds, 2026-08-13

Both covariate rungs came out consistently worse, so it was diagnosed rather than
reported. **The wiring is fine** — arrays align, and Chronos-2 normalises internally
(scaling a covariate by 1,000 moves the forecast by 1e-7 relative).

**Round 1**, mean RPS on 40 consecutive 2026 cut-offs against a univariate baseline of
0.1688 / 0.1527:

| covariate passed | t+1 | t+5 |
|---|---|---|
| `silver` — same source, genuinely co-moving | **−0.0015** | +0.0025 |
| white noise | +0.0065 | +0.0149 |
| **an unrelated random walk** | **+0.0216** | **+0.0389** |
| `usd_rub` — a real macro covariate | +0.0222 | +0.0321 |

**A meaningless random walk does as much damage as a real covariate**, across four
independent draws. White noise does markedly less — which is the tell: white noise offers no
structure to latch onto, while two integrated series *appear* related over any finite window.
This is Granger–Newbold spurious regression happening inside in-context learning.

It is not one library's quirk: TimesFM's covariate rung degrades by a similar margin through
a completely different mechanism (XReg regression).

**Round 2 — the same configurations on 40 cut-offs spread across 2025 — found no damage
from anything.** All-10-levels under round 1's exact setup: +0.0015 at t+1 against 2026's
+0.0209; the random walk: −0.0014 / +0.0036 against 2026's +0.0216 / +0.0389. Every
interval includes zero. The damage manifests **only where the models are out of their
training data** — and since the full 143-day window shows it across Jan–Aug 2026, a
regime explanation does not survive; memorisation of the pre-2026 series is the plausible
mechanism. A partly memorised continuation barely reacts to covariates.

Two conclusions follow. **The contamination boundary is now demonstrated, not assumed** —
the same experiment answers differently on the two sides of 2026-01-01, which is direct
evidence that `CLEAN_FROM` is load-bearing and that nothing scored before 2026 supports a
claim. And **no offline probe can price a covariate**, because every permissible probe
window sits in the wrong regime — the argument for
[ADR-0056](adr/0056-random-walk-covariate-control.md)'s control rung, which is scored on
the same live days as the rung it accompanies. Whether *stationary* covariates (1-day
changes) escape the damage could not be adjudicated on 2025 — nothing damages there — and
stays open for live days; the ADR records why its original "differencing rejected" line
overclaimed.

**The retrospective consequence matters most.** ADR-0047 makes the covariate-informed
configurations rungs 3 and 4 — the bar the agent is measured against. If that bar is
handicapped by spurious regression, the agent beating it means less than it appears.
ADR-0056 — **accepted 2026-08-13** — turns that from an unknown into a number: a
`*_rwcov` control rung ships beside each `*_cov` rung from P5 onward, and no covariate
set is called informative unless it beats its control on a paired comparison.

**What is green locally.** `uv run pytest` — **213 tests** (200 without the model weights;
CI additionally skips the 10 wrapper-contract cases whose fakes speak torch/numpy, the
stack ci.yml deliberately omits — so CI's view is 190 run, 10 skipped, 13 deselected).
`uv run pre-commit run --all-files` — 10 hooks. `sam validate --lint` and `sam build`.
Gate G0's checks pass locally **and on CI** (the author hook previously crashed on
runners with no configured git identity; it now checks HEAD's author there instead).
Gate G1's T1.4 is green; REQ-507 holds on all four numeric tracks.

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
