# The macro arm — scope

**Status:** scope for the builder's decision, 2026-08-19. No code, no ADR yet.
**Origin:** the builder's proposal — *"observe federal rates of big institutions… USA, RBI,
Russia, Germany, Japan, Switzerland… you are not seeing all macro indicators for gold and
passing to the LLM. If you pass these as series it can be a better judgement."*
**Governed by:** [ADR-0058](../adr/0058-controls-for-the-reasoning-rung.md) (the arm is
measured, not assumed), [ADR-0037](../adr/0037-forward-only-agent-learning.md) (forward
only), the D1 knowledge-time rule from the [2026-08-18 review](../analysis/poc-review-2026-08-18.md).

---

## 1. The proposal, and one correction

The premise is right: the event feed is the weakest input the reasoning rung has. Its rows
are CAMEO conflict codes dominated by US domestic crime and sport — the review's finding L3,
and every recorded rationale calls the feed noisy.

The correction is about *what carries information*. **A policy rate level barely moves** —
the builder said so directly ("they change very less"), and the data agrees: `DFEDTARU` has
printed 3.75 every day since its last change. A constant column predicts nothing. Three
things around it do:

1. **The decision calendar.** "An FOMC decision lands in two sessions" is a genuine
   volatility signal, and the bucket contract is σ-relative, so a volatility shift moves the
   whole bet, not just its centre.
2. **The change itself** — a hike or cut, and how long the rate has stood.
3. **Market-implied expectations** — the real prize, and not free. Out of scope.

## 2. What the brief already carries (do not duplicate)

Two of the canonical gold drivers are already in every brief, with 1- and 5-session moves:

| Already sent | Series | Why it matters for gold |
|---|---|---|
| `real_10y` | `DFII10` | 10-year TIPS real yield — the single most-cited driver of the gold price |
| `dollar_index` | `DTWEXBGS` | the dollar leg |
| `vix` | `VIXCLS` | risk appetite |
| `wti`, `silver`, `usd_rub`, `usd_inr` | — | the complex the builder asked about |

So the gap is **not** "no macro". It is **no scheduled-event awareness** and **no policy
frame**.

## 3. What the arm adds — three blocks

### 3a. Rates that actually move (daily, verified keyless on 2026-08-19)

| Series | What | Cadence | Verified |
|---|---|---|---|
| `T10YIE` | 10-year breakeven inflation | daily | ✅ 2.40 on 2026-06-01 |
| `DFEDTARU` | Fed funds target, upper | daily | ✅ 3.75 |
| `DFF` | Fed funds effective | daily | ✅ 3.62 |
| `ECBDFR` | ECB deposit facility rate | daily | ✅ 2.00 |

`T10YIE` is the one genuine addition to the *moving* set: real yield and breakeven together
decompose the nominal yield, which is the textbook gold frame. The three policy rates are
sent as **level + sessions since it last changed**, not as a moving series.

### 3b. Rates that do not fit, and what to do instead

| Central bank | Finding | Proposal |
|---|---|---|
| **RBI (India)** | **Not available on FRED** — `INTDSRINM193N` is discontinued and returns 1968 data | RBI's own site, or drop. Its relevance is to USD/INR, not gold in roubles |
| **Bank of Japan** | `IRSTCI01JPM156N` exists but is **monthly** | Include as a level with an explicit publication lag, or drop |
| **SNB (Switzerland)** | `IR3TIB01CHM156N` monthly, currently negative | Same |
| **CBR (Russia)** | Not on FRED; CBR has its own API, already used for metals and FX | Worth adding — the target is priced in roubles, so the rouble's policy rate is not a foreign macro row, it is part of the instrument |

### 3c. The decision calendar — a maintained table, not a scrape

The repo already has this pattern: **REQ-210** keeps a festival and market-holiday table in
the repository with forward coverage asserted in CI. A policy-meeting calendar is the same
artefact — small, public, low-churn, verifiable by hand, no licence question, no new runtime
dependency.

```
data/policy_calendar.csv   (committed, unlike acquired data)
bank,decision_date,announce_utc,scope
FOMC,2026-09-17,18:00,US
ECB,2026-09-10,12:15,EA
CBR,2026-09-12,10:30,RU
RBI,2026-10-01,04:30,IN
```

Rejected alternative: FRED's `releases/dates` API. It would work, but it needs an API key —
and the whole FRED integration is deliberately **keyless** today (`fredgraph.csv`). Adding a
credential for a table that changes eight times a year is a bad trade.

## 4. Knowledge time — the part that must not be got wrong

D1 was exactly this class of bug. Every element of the macro block passes through the same
`as_of` cut as the rest of the brief, plus two rules the cut alone will not give:

- **Per-series publication lag.** Daily FRED series land ~2 calendar days behind at the
  07:15 GMT run (measured in the runner logs); monthly series land *weeks* behind. A monthly
  series carried at its value date is a leak. This is the review's L4, and the macro arm
  cannot ship before it.
- **Announcement time, not decision date.** The FOMC announces at 18:00 GMT — **after** the
  12:45 IST (07:15 GMT) run. So on a decision day the brief may say *"an FOMC decision is due
  today; the outcome is not yet known"* and nothing more; the change appears the next day.
  The RBI announces ~04:30 GMT, **before** the run, so its outcome is same-day knowable.
  This asymmetry is per-bank and belongs in the table.

Forward meeting *dates* are a published schedule, so quoting them is not lookahead. Forward
*outcomes* never appear.

## 5. How it is measured

The arm is `llm_macro`: `llm_raw`'s brief **plus** the macro block, nothing else changed.

- **Its control already exists — it is `llm_raw`.** The pair `llm_macro − llm_raw` isolates
  the macro block exactly as `llm_raw − llm_noevents` isolates events. No extra arm needed.
- Pre-registered before the first seal, per ADR-0058: paired per day, Newey–West at lag h−1,
  day-clustered, **~60 graded days before anything is called**.
- Forward-only: the arm starts its own clock; no backfill.

**Cost:** +1 model call per instrument per day — roughly 15/day, up from ~12 after L1.

## 6. Risks, stated before building

- **More inputs is not obviously better.** The offline finding on this project is that
  covariates *hurt* the numeric models via spurious regression, and a random walk did as much
  damage as a real macro series. An LLM given more columns has more surface on which to build
  a plausible story. The honest prior is that this changes nothing detectable — which is why
  it is an arm and not an enrichment.
- **Near-constant columns invite invented significance.** Sending "policy rate 3.75" daily
  risks the model narrating a constant. Sending "3.75, unchanged for 47 sessions" is honest
  and harder to over-read.
- **The instrument set is rouble-denominated.** For gold in ₽/g the CBR key rate and the
  rouble matter more than the BoJ; a global rate table is mostly decoration for this target.
- **Scope creep into a data-licensing problem.** Everything above is FRED (answered terms),
  CBR (already used) or a table we maintain. Anything requiring a scraped calendar vendor
  reopens a settled question and should be refused.

## 7. Open decisions for the builder

1. **Breadth.** Minimal (T10YIE + Fed + ECB + CBR + the calendar) or wide (add BoJ/SNB
   monthlies and an RBI source)? My recommendation: **minimal** — the monthlies are stale by
   construction and the marginal frame is small.
2. **RBI.** Worth its own source for USD/INR, or drop given USD/INR seals about weekly and
   its agent rows are the ones D1 already contaminated? My recommendation: **drop for now**.
3. **Calendar horizon.** How far ahead to maintain — 12 months (REQ-210's bar) or the next
   two meetings per bank? My recommendation: **12 months, CI-asserted**, matching REQ-210.

## 8. Sequence, if it goes ahead

1. ~~**L4 first** — per-series publication lags.~~ ✅ **done 2026-08-19.** Measured against
   the runner logs rather than assumed: the daily series land **two business days** behind at
   the 07:15 GMT run (2 calendar days mid-week, 4 across a weekend) and H.10 publishes the
   whole week at once, so a Monday value waits until the following Tuesday — up to 8 days.
   The single `+1` became a per-series bound plus a **first-seen ledger**
   (`data/fred_first_seen.csv`, committed) that replaces the bound with an observation for
   everything fetched from now on. The measurement also settled a design question: a weekly
   release publishes five value dates at once, so re-dating would collapse the series and
   turn "five sessions" into five weeks — the panel takes knowledge-dated series (correct for
   an as-of join) and the brief takes value-dated series *filtered* by knowledge (correct for
   quoting moves). The old join differed on **91–100% of report-window sessions**, so the
   offline ladder was re-run under the corrected rule.
2. `data/policy_calendar.csv` + its CI coverage assertion, in the REQ-210 mould.
3. The macro block in the brief, behind a flag like L1's, so `llm_raw` stays byte-identical.
4. `llm_macro` sealed as a fourth model arm; ADR + REQ written before the code, comparison
   pre-registered.
5. Only then consider L3's event-relevance filter — with the arm in place, a better event
   feed becomes measurable rather than assumed.
