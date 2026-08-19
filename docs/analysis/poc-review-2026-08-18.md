# POC review — after the first two strict runs (2026-08-18)

**Status:** review, not a decision record. Findings here feed [Execution.md](../Execution.md);
anything that changes the running configuration is a builder decision, and the observation-week
freeze (08-17..22) stands unless the builder lifts it. Every number below was computed read-only
from the committed record and independently recomputed by a second pass; where the two disagreed
the disagreement is stated.

**How it was produced.** A ten-role review: a record analyst and a skeptic (independent recompute
of every number), a methodology auditor and an adversarial refuter (every finding re-derived from
code and data), a commercial strategist, three dashboard designers, a judge, a builder. Transcripts
are local. The refuter upheld all 18 methodology findings and added six the auditor missed.

---

## 1. Performance after two strict runs — gold first

**What the record holds (verified twice):** 15 sealed records, 11 matured horizons — gold 4 seals /
3 grades, silver 4/3, USD/RUB 4/3, USD/INR 2/2 (the only t+5 graded anywhere), WTI 1/0. Integrity:
all 11 outcomes recomputed from the local closes against the *sealed* edges — 11/11 target dates and
11/11 buckets match; every rung's RPS recomputed to a max |diff| of 0.0; every transcript's SHA-256
recomputes and equals the hash in the seal. Seal-once held across three runs (the 15:48 re-fire on
08-18 was a byte-level no-op).

**Gold, the graded days:**

| as-of → target | move | outcome | best rung | climatology | llm_raw | llm_mem |
|---|---|---|---|---|---|---|
| 08-13 → 08-14 (pre-agent) | +1.97% | small up | timesfm_uni 0.134 | 0.142 | — | — |
| 08-14 → 08-15 (loose day) | −0.34% | flat | all_flat 0.000 | 0.040 | 0.050 (4th/13) | 0.055 (5th) |
| **08-15 → 08-18 (strict)** | +0.96% | small up | chronos_uni 0.087 | 0.142 | 0.137 (5th) | **0.127 (3rd)** |

On the two agent-graded days the paired means are **llm_mem 0.0911, climatology 0.0911, llm_raw
0.0934** — a dead heat within 0.0023 RPS; Chronos-2 univariate is the best rung on those days
(0.0777). The agent's exact calls: llm_raw's mean miss **exactly ties "always 0%"** (0.651% vs
0.651% — algebraically forced, it called +0.55% both days and both 0 and 0.55 lie between the two
realised moves); llm_mem is worse (0.826%). Direction right 1 of 2; exact-bucket ticks 1 of 2 —
the always-flat rate.

Cumulative gold live RPS (t+1, n=3) sits *below* every seeded offline mean except the two real-
covariate rungs, which trail their random-walk controls on the same days (chronos_rwcov 0.113 vs
chronos_cov 0.220; timesfm_rwcov 0.135 vs timesfm_cov 0.166) — three easy days, not skill; the
offline "covariates add nothing" picture at n=3. Gold's first t+5 grades land 08-20, 08-21, 08-22 —
all before the review.

**Other instruments, one line each.** USD/RUB: agent beat climatology on both agent days by
0.064–0.080 (three consecutive "small up" after a rouble slide — momentum paid, n=2, not a finding).
Silver: agent lost to climatology both days; all_flat won two flat days. USD/INR: 2 grades from one
seal, agent 0.002–0.009 behind climatology; the next grade (as-of 08-14) cannot land before FRED's
H.10 release ~08-25 — after the review. WTI: one seal, zero grades — DCOILWTICO has ended at 08-11 on
every run since 08-14.

**Memory.** Across all 8 graded raw/mem pairs: mem lower on 5, raw lower on 3, mean difference
−0.00135 RPS, largest 0.0098 — noise. More importantly the comparison has barely tested memory: the
page held **0 lessons** on 5 of the 8 pairs, and holds 0 on every page the 08-18 seals read, because
the guard retired the only lessons ever written (three "≥2 Fighting → flat-or-up" rules from 08-17,
on a window where Fighting appeared 7 of 7 days). Tomorrow's pair measures sampling variation, not
memory. Note for the reader: those lessons were "confirmed" a third time on 08-18 before retirement —
they were retired for a non-discriminating *condition*, not for a miss.

**Verdict, honestly:** two strict runs added one gold grade and one seal; the agent, its memory
variant and the base rates are indistinguishable; the point call carries no information beyond
"no change" yet; nothing learned, nothing lost; every number checks. n = 2–3 per instrument.
This is the expected state on day five, and none of it is a finding either way.

**One caveat from the skeptic:** the two strict runs did *not* run on one configuration. The 08-17
run (11:20 catch-up) pre-dates the coincidence guard and the freeze; only 08-18 has executed on the
frozen configuration. And with Coercion 7/7, Fighting 7/7, Threat 6/7, Assault 5/7 above the 70%
guard, only Military posture and Protest are lesson-eligible this week — **the guard, not the
curator, is now the binding constraint on what can be learned.**

---

## 2. Methodology evaluation — what to fix, and when

Eighteen findings, all upheld under adversarial re-derivation, plus six the refuter added.
Grouped by what they touch. "Lever" = fixing it changes what gets sealed.

### 2a. Defects — recommend fixing now, freeze notwithstanding (each is a correctness bug, not a tuning)

| # | Finding | Why it matters | Fix (effort) |
|---|---|---|---|
| D1 | **Knowledge-time leak for the FRED-lagged instruments.** `market_context()` takes no as-of: for USD/INR and WTI (whose own series lag the wall clock by days) the brief carried related-market moves and events dated *after* the anchor — for USD/INR as-of 08-14, gold moves through 08-18 and events through 08-17, i.e. after its own t+1 target. Gold/silver/USD-RUB are unaffected (their as-of *is* the run day). | Those instruments' agent grades are not honest. Every further seal adds a contaminated row. | Truncate the market context and the events block to knowledge dates ≤ as-of; mark the existing USD/INR 08-07/08-14 and WTI 08-11 agent rows as "brief carried post-anchor context" on the dashboard and exclude them from agent stats. Do not reseal. (hours) |
| D2 | **t+5 point calls graded against the wrong move inside the brief.** `actuals` is a map of *daily* moves keyed by date; the brief looks up `actuals[target_date]` for t+5 too, telling the model "you called +0.16%, it moved −0.01%" when the 5-session move was +0.23%. The dashboard computes t+5 correctly; only the brief is wrong. | Gold's first t+5 grades land 08-20 — from Wednesday the gold brief would grade the model's own calls falsely. | Compute the horizon move as close[target]/close[as-of] in the runner and pass a keyed map; test the h=5 case. (hours) |
| D3 | **A partial CBR fetch could seal a backdated record.** `fetch_metals_history.py` continues past a failed 365-day chunk and rewrites the CSV with whatever survived; if only the newest chunk fails, `as_of = dates[-1]` regresses (e.g. to 2026-01-08), no existing record matches, and the runner seals — and calls the model — "as of" a date months back. Documented as "halts on failure"; the code does the opposite. | A single bad morning could put a fabricated-date seal into a seal-once record. | Runner refuses to seal when the fetched series' last date regresses against the previous file or is older than N days; metals fetcher fails loudly on a short/empty chunk. (hours) |
| D4 | **A mid-run crash loses paid bets and overwrites their only transcript.** `live.js` is written once at the end; the model calls happen per instrument earlier; `record_run()` writes transcripts to a fixed path. Any exception after gold's calls (HF Hub, a malformed FRED CSV, the 2-hour task limit) discards that day's bets, and the re-run re-calls a nondeterministic model and overwrites the transcript — the published hashes then match the second attempt. | Auditability is the whole honesty mechanism of the reasoning rung. | Save the record after each instrument; transcripts never overwrite (attempt suffix); note the attempt in the seal. (hours) |
| D5 | **The curator cannot retire its last lesson.** An explicit `lessons: []` is treated as "proposed nothing — keep existing". On 08-18 the curator *did* propose retiring the Fighting lesson; the code ignored that and the guard did the retiring. Right outcome, wrong reason. | The one path to honest forgetting is closed. | A structured empty proposal is authoritative; reserve "keep existing" for the exception path. Update the test. (hours) |

### 2b. Hygiene — non-lever, additive; recommend now

| # | Finding | Fix |
|---|---|---|
| H1 | Seal metadata lacks `sealed_at_utc`, `brief_version`, `events_through` — a catch-up run seals a different information set than a 12:45 run and the record cannot tell | Add them to the llm meta at seal time |
| H2 | Live-score tables (dashboard, brief, memory page) average unequal day sets and mix horizons — rungs that joined later look better | Per-horizon, common-day paired differences with n per row (`compare_paired` exists); the dashboard part now, the brief/page part with the Monday batch |
| H3 | Curator digest attributes the *anchor day's* events to a bet whose brief never contained them (GDELT publishes X at 07:00 GMT on X+1; the brief carries days ≤ as-of−1) | Record `events_through` (H1) and attribute exactly those days |
| H4 | Docs/tests out of step: brief-length test bounds a fixture at 8 KB while real briefs are 7.6–10.8 KB; "fetch halts on failure" is untrue for FRED (continues, keeps stale CSVs — safer, undocumented); one stray table pipe in Execution.md | Align |
| H5 | The rationale schema cap (600) is binding: 8 of 24 rationales end mid-word or in stray CJK/NBSP characters — constrained decoding against `maxLength`; the glitch characters are published in `live.js` | Loosen the cap and ask for ≤3 sentences; a schema change, so with the Monday batch (ADR-0037 note) |
| H6 | `--show-brief` after a seal is not the exact brief (it rebuilds from horizons that now include the llm rungs); and the brief's "US series lag one knowledge day" sentence is false at the run hour (two business days for the dailies, a week for H.10/EIA) | Docstring; wording (Monday batch, it changes the brief) |
| H7 | Point-call bars: every sealed point call so far is a positive tilt on rising markets — a trend bar (yesterday's move / 10-session mean) is the honest comparison beside "always 0%" | Add to the agent board (dashboard only) |
| H8 | Single-laptop robustness: a missed day is a permanent gap under forward-only and the record has no marker | Retry inside the 2-hour window; a "missed" marker the dashboard shows |

### 2c. Levers — after 08-24, with a pre-registered decision rule (builder's call)

| # | Finding | Proposal |
|---|---|---|
| L1 | **No control for the reasoning rung — the biggest scientific risk.** `llm_raw` differs from every numeric rung in three inputs at once (events, related-market moves, every other method's bet); the recorded rationales are momentum stories, not event stories. Whatever it scores against climatology cannot be read as evidence about the events→prices thesis. | Add sealed ablations: `llm_noevents` (identical brief, events block removed — the direct test), `llm_blind` (no other-method bets, no live record — the anchoring index ADR-0029 asks for), and a free momentum-tilted climatology so the momentum story has a $0 bar. Pre-register: primary = llm_raw − llm_noevents. |
| L2 | Prompt-induced anchoring: "Nothing has beaten the base rates detectably. That is the bar." and "calibrated means staying near the base rates"; all_flat and the rwcov controls shown unlabelled as "other methods" | Drop the bar sentence from the raw brief; label or omit the dummies; keep the calibration language; measure with `llm_blind` |
| L3 | The event shortlist has little market relevance (US crime and sport dominate "Fighting"/"Assault"), and label-level base rates make event-conditioned lessons structurally near-impossible | A code-only relevance filter tied to the five instruments (actor/country/theme lists or GKG themes: oil, sanctions, central banks, RU/UA/IR/IL/SA/CN/IN); base rates over the full cache; structured lesson conditions evaluated in code |
| L4 | Offline FRED knowledge lag (+1 day) understates the real publication lag of the weekly/lagged series (H.10, EIA), and even the dailies at the run hour | Per-series publication lag in the loader; re-run the offline ladder; the rwcov control stays the live judge |
| L5 | USD/INR and WTI on weekly FRED cadence are near-useless live (~4 seals a month, each placed after its t+1 has traded) | Daily sources with a known publication time (e.g. RBI reference rate for USD/INR), or drop their agent rungs |
| L6 | The nowcast (B), when un-parked, must go to *every* rung or carry a deterministic spot-nowcast control, and t+1 becomes a nowcast horizon from that day (restart its clock) | Already in B's prerequisites; recorded here so it is not forgotten |
| L7 | Malformed model distributions are silently repaired (floor + renormalise) though the contract says a failing response fails the step | Record `raw_sum`; reject beyond a small tolerance |

### 2d. Measurement — the honest expectations, to write down before 08-24

From the 143-day offline records (recomputed here for chronos_uni and timesfm_uni vs climatology,
five instruments, both horizons), the Newey–West-effective SD of a paired daily RPS difference is
**0.029–0.062 at t+1 and 0.039–0.134 at t+5**. **Minimum detectable difference (95%): 0.026–0.054
at 5 days, 0.012–0.024 at 25, 0.007–0.016 at 60, 0.005–0.012 at 120** (gold sits at the tight end:
t+1 0.026–0.039 at 5 days, 0.007–0.011 at 60). For scale, all_flat's offline deficit is 0.042; the
covariate rungs' 0.008–0.020; Chronos-2's t+5 edge −0.004. **The
week can certify plumbing only** (outcomes recomputed, no missing seals, hashes match). A verdict
on the agent needs ~60 seals; a verdict on memory needs lessons that exist. Pre-register now: the
primary comparison is llm_raw vs climatology (later llm_raw vs llm_noevents, llm_mem vs llm_raw),
paired per day, NW at lag h−1, pooled across instruments with day-clustered errors, and nothing is
called before ~60 seals unless the interval excludes zero by a margin. Report the raw-vs-mem paired
gap explicitly as the noise floor.

### 2e. What is working well (the audit's words, condensed)

Seal-once and sealed-edge scoring hold in practice, not just in tests. The scoring stack is honest
(scale-free climatology, paired differences, NW errors, a dummy that stays detectably worse,
random-walk controls). The publication boundary is respected end to end. The reasoning layer is
auditable. The memory loop's honesty mechanisms fired correctly on first contact — the coincidence
was caught and made a code guard, and the pages are now honestly empty. Knowledge time for the daily
instruments is right by construction. The freeze itself is good science.

---

## 3. The commercial angle

Three facts bound every idea, and the strategist put them first: **there is nothing to sell on accuracy
and there won't be for a long time** (the offline result is a null; Product.md's own timeline puts a
skill *interval* at month 11–13); **the code is Apache 2.0 and the derived record is published by
design** (ADR-0044) — closing them would destroy the one thing that makes a null believable; and
**Product.md's regulatory line is not decoration** — in India a public buy/sell/hold or price target on
securities (exchange-traded commodity and currency derivatives included) is SEBI research-analyst /
investment-adviser territory. The product that survives that line is one that *measures forecasts*
rather than *issues recommendations* — and, conveniently, the only product whose value does not
depend on the forecasts being good.

**So: the commercial asset is the evaluation discipline, not the prediction.** ADR-0033 already calls the
harness a first-class deliverable "usable against someone else's predictor". The angle is to take that
sentence seriously.

| # | Candidate | Verdict |
|---|---|---|
| 1 | **Forecast audit / trust layer** — the sealed forward-only record + calibration harness applied to *any* forecast source | **The thesis.** Value exists *when the result is null* ("your forecaster is no better than base rates" is a paid answer for the *buyer* of forecasts). Instrument-agnostic by construction. Precedents are small but real (ForecastWatch for weather; TipRanks for analysts; FocusEconomics/Bloomberg forecaster rankings) — none do probabilistic calibration, sealed before the fact, with published controls, including AI models on identical days. That gap is the product. What is proprietary: **calendar time already sealed** (a rival cannot backdate), **the operation** of an independent seal-and-grade service, **third-party trust**, and **customers' private scored streams** and per-customer fitted parameters (the C-coded values) that are never published |
| 2 | **Control-rung methodology** (random-walk covariate control, dummy floors, paired NW, seal-once hashing) | The credibility engine of #1 and a separately packageable tool for any team deploying Chronos/TimesFM — the spurious-regression finding transfers to demand, energy, ops. A feature, not a company; sells bundled |
| 3 | **Sigma-relative bucket contract** | A standard, not a product — publish it deliberately as #1's lingua franca; keep the *adaptors* (point / range / direction → distribution, fairly) as the closed part if open-core is ever chosen (a superseding ADR, the builder's decision) |
| 4 | **Code-guarded LLM memory** | A differentiated story with no evidence yet: "learning you can audit, whose value is measured daily against a no-memory twin, and whose bad lessons are removed by code, not by faith." A component of #1 until a lesson survives and the paired difference moves |
| 5 | **Event-conditioned base rates** | Content, not software; null-heavy by expectation — the sober event-analogue table for publishers. Low priority |
| 6 | **Multi-instrument daily seal as a service** | The delivery form of #1 (audited board), not a thesis; highest regulatory exposure if ever framed as "what gold will do" |
| 7 | **Nowcast** | An accuracy lever, not an asset — and a trap: persistence-from-spot becomes the bar for every rung; moves the output toward a price target |

**Who pays and why:** buyers of forecasts (treasury desks, corporates hedging USD/INR, gold or oil, bullion
dealers, jewellers) — an independent scorecard of *their* providers in *their* instruments plus a
distribution-and-base-rate decision view; a null still saves them a subscription. Sellers of forecasts —
a tamper-evident third-party-sealed record to show clients (SEBI's PaRRVA framework shows the regulator
wants verified performance claims; a calibration seal is adjacent, never a substitute, and must never
present itself as regulatory verification). Enterprises choosing among AI forecasting models — the least
regulated buyer and the most transferable artefact. Publishers — content, reputation. Fintechs — last,
highest legal friction.

**Evidence #1 needs before it can be sold:** (1) a predictor-contract **adaptor** ingesting an *external*
forecast source — first on the 143-day offline window without touching the pipeline, then live: the
smallest visible increment that proves "any forecast source"; (2) **independence of the seal** — today the
builder is forecaster, sealer and grader and pushes at will; publish the daily record hash where the
sealer cannot rewrite it and let a customer recompute (the record already recomputes to zero); (3) a
legal read that the board is measurement, not advice.

**What must not be claimed** (the strategist's list, kept whole in the transcript; the essentials): no
buy/sell/hold or price target to the public; no tradeable alpha; no accuracy from the live record
(n = 2–3); the agent's point calls are not useful (llm_raw ties always-0%); the memory does not learn
(−0.001 RPS over 8 pairs, 0 lessons); the record is tamper-*evident* and recomputable, not
tamper-proof or independently audited; skill does not transfer across instruments — only the contract,
the controls and the process do; no redistribution of price levels or restricted data; not "agentic AI".

---

## 4. The customer dashboard

Built as **`ui/customer.html`** — "the range ledger — sealed before, graded after". Three designs were
proposed (story-first *The Price Diary*, trust-first *The Sealed Ledger*, decision-first *The Sealed
Range*), judged, and synthesised: the Ledger's trust spine with the Range's decision hero and the Diary's
replay. Eight sections: the sealed range as a σ-ruler (the page's signature object, promise-vs-delivered
sentence beneath it); the five instruments at a glance; *better than just history yet?* with a
sample-size meter to the pre-registered ~60; promise vs delivered as a dot grid; a replay scrubber over
the record with the outcome hidden right of the scrubber; the AI's exact call bet by bet beside two
dumb bars; what it currently believes and what it un-learned; how to read this page and what it is not.
Same data globals, palette and instrument identities as the technical page; a link each way.

Verified by the builder in a browser and **re-verified independently**: zero console errors, zero
NaN/undefined in text or SVG attributes; every number matches the record analysis (hero coverage 120/143
offline + 3/3 live; AI board 2/4 exact = always-flat's 2/4, mean miss 0.74% vs 0.65% for "no change",
2/4 closer than history's odds, "4 of 60 graded"); instrument, horizon and challenger switching hold;
the AI as challenger renders forward-only ("no past to replay — live seals only"); at phone width the
page does not overflow (wide SVGs live in their own scroll containers, as on the technical page); with
the local price files absent (`?public=1`) the page says "public build — ranges in percent, the
committed truth" and **no price level leaks**. Honesty is structural: base rates beside every scored
number, the disclaimer verbatim, no buy/sell language outside the negations. Every number is computed
from the data at load; nothing is hard-coded.

---

## 5. Plan

Sequenced as increments, each ending in something visible. The freeze governs which start now.

| Step | What | Lever? | When |
|---|---|---|---|
| **R1** | Defects D1–D5 + hygiene H1, H3, H4, H8; dashboard H2, H7 | D1/D2 change the brief only where it was *wrong*; the rest is additive | **Now, on the builder's go** — recommended: a leak and a false self-grade should not run through the week |
| **R2** | Pre-registered decision rule + MDD table into `docs/design/` and Execution.md | no | Now (a document) |
| **R3** | Customer dashboard `ui/customer.html` (this review's build), linked from the technical page | no | Now |
| **R4** | Monday review of the week's record against R2's rule | — | 08-24 |
| **R5** | Controls for the reasoning rung: `llm_noevents`, `llm_blind`, momentum-tilted climatology; brief wording L2; schema cap H5/H6 | yes | after 08-24, one increment |
| **R6** | Event relevance filter (L3) with structured lesson conditions | yes | after R5 |
| **R7** | Per-series FRED lag (L4), USD/INR + WTI sources or drop (L5) | yes | after R5 |
| **R8** | Nowcast B under its recorded prerequisites (L6) | yes | builder's call, after R5–R7 |
| **C1** | **The commercial proof-of-concept:** a predictor-contract adaptor that ingests one *external* forecast source and seals/scores it beside ours — first on the 143-day offline window (pipeline untouched), then live; plus publishing the daily record hash where the sealer cannot rewrite it | no (a new source, not a change to ours) | after 08-24; the smallest visible increment that proves "any forecast source" |
