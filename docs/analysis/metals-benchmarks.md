# Precious-metals benchmark prices — research brief

**Status:** Research. **No decision has been taken on the basis of this document.**
**Date:** 2026-08-09
**Why it exists:** to test whether auction-set benchmark prices could replace daily close-to-close
returns as the measurement point, before any ADR is written.

> **Provenance and confidence.** Compiled by parallel web research with an adversarial verification
> pass. Three load-bearing claims were then re-checked directly and **confirmed**:
> FRED has deleted its LBMA series (`GOLDAMGBD228NLBM`, `GOLDPMGBD228NLBM`, `SLVPRUSD` all return
> HTTP 404, while control series `SP500` returns 200); the LBMA JSON endpoints do respond keyless
> (HTTP 200); and ICE states that *"a licence from IBA is required in order to **obtain**, use or
> redistribute real-time or historical benchmark data"*, with "Derived Benchmark Licences" a named
> licence type.
>
> **Not independently verified:** the specific fee figures below, which come from a fee-schedule PDF
> read by the research pass and not re-read here. Treat the *structure* as established and the
> *numbers* as needing confirmation from IBA directly. They are the reason to ask, not the answer.

---

# Precious-Metals Benchmark Measurement Points — Decision Brief

**Date:** 2026-08-09 · **Purpose:** decide whether to move from daily close-to-close returns to auction-anchored event windows, and whether that justifies superseding accepted ADRs.

---

## HEADLINE VERDICT

**The core premise is TRUE. The conclusion drawn from it is FALSE as stated.**

1. **TRUE:** precious metals do have discrete, auction-set, economically meaningful benchmark prices at fixed times of day. Verified verbatim from ICE Benchmark Administration's own Benchmark Statement: *"The input data used to calculate the LBMA Precious Metals Prices is the Final Price of the relevant Auction."* These are matched transaction prices from real, regulated, physically-settled auctions — categorically not vendor closes and not futures settlements.
2. **FALSE:** *"would remove any need for a continuous intraday price feed."* The auctions give **7 prints per UK business day across all four metals** — 2 for gold, 1 for silver, 2 for platinum, 2 for palladium — spanning only **5h15m of each 24-hour cycle**, leaving **18h45m dark**. They cannot support 15-minute GDELT alignment. They are a superb measurement *instrument* and a sparse, irregular sampling *grid*.
3. **The correct move is narrower and still worth making:** adopt the auction prints as the **outcome variable and event-window boundary**, not as the intraday sampling mechanism. This roughly doubles observations for Au/Pt/Pd (1/day → 2/day), gives every window an unambiguous open and close instant, and replaces an arbitrary vendor cut with a price the physical supply chain, GLD, and the derivatives market actually settle against.
4. **The gating input is not design, it is licensing.** IBA's Schedule R "Derived Benchmarks" licence is **USD 25,000/yr per benchmark, explicitly unchanged at zero revenue** — USD 100,000/yr for four metals. The project's stated recurring budget is ~USD 16–33/**month**. That is a three-to-four order-of-magnitude collision. **Resolve the licence question in writing with IBA before writing a single ADR or line of ingestion code.** If Schedule R applies to a forecast-evaluation return series, the architecture decision is made for you.
5. **Rhodium and iridium: exclude. No qualification.** No auction, no administrator, no futures contract, no ISO 4217 code, and the only regular timestamped source is one dealer's *offer* quotes whose publisher explicitly prohibits benchmark use.

---

## 1. EVERY BENCHMARK MEASUREMENT POINT IN A 24-HOUR CYCLE

### 1a. Genuine auction-set benchmarks (the complete list — there are exactly seven)

All seven are administered by **ICE Benchmark Administration Limited (IBA)**, FCA-authorised for administering a benchmark, ESMA-recognised for the Gold Price. IP is held by **Precious Metals Prices Limited**, a subsidiary of LBMA (incorporated 1 Dec 2014). Underlying is **Spot Unallocated Loco London** metal, T+2 settlement. Price formation is **USD only**; GBP/EUR are post-hoc FX conversions struck at the final-round instant.

| # | Benchmark | Admin | London local | UTC (winter, GMT) | UTC (summer, BST) | Used for |
|---|---|---|---|---|---|---|
| 1 | **LBMA Platinum Price AM** | IBA | 09:45 | **09:45Z** | **08:45Z** | Physical PGM supply chain, refiner/fabricator contracts, ETF NAV, derivative reference |
| 2 | **LBMA Palladium Price AM** | IBA | *immediately after Pt AM concludes* | **variable, ≥09:45Z** | **variable, ≥08:45Z** | As above, palladium |
| 3 | **LBMA Gold Price AM** | IBA | 10:30 | **10:30Z** | **09:30Z** | Loco-London settlement, central bank / producer contracts, monthly-averaging swaps |
| 4 | **LBMA Silver Price** | IBA | 12:00 | **12:00Z** | **11:00Z** | Miner→refiner→bank physical chain (IBA: *"The actual USD per ounce value of many of the transactions between these market segments is linked to the London Silver Price"*) |
| 5 | **LBMA Platinum Price PM** | IBA | 14:00 | **14:00Z** | **13:00Z** | As #1 |
| 6 | **LBMA Palladium Price PM** | IBA | *immediately after Pt PM concludes* | **variable, ≥14:00Z** | **variable, ≥13:00Z** | As #2 |
| 7 | **LBMA Gold Price PM** | IBA | 15:00 | **15:00Z** | **14:00Z** | **The** global gold reference. SPDR Gold Shares (GLD) NAV since 20 Mar 2015: *"the Trust has been using the LBMA Gold Price PM as the price of gold"* |

**Critical qualifications on this table — all confirmed primary:**

- **"London time" is never resolved to GMT/BST/UTC by any primary source.** I checked ~10 IBA and LBMA primary documents (both Auction Specifications, the Benchmark Statement, both Calculation Methodologies, the ICE developer portal, the ICE Futures US rulebook, the LBMA FAQ and About pages). Every one says only "London time" or "UK time". **The UTC column above is derived arithmetic, not a quoted statement.** It was independently resolved empirically: over 49 BST-only days matched against 15-minute COMEX gold futures, the global argmax over all UTC 15-minute slot pairs was **exactly (09:30Z, 14:00Z)** with corr 0.988 / RMSE $5.46, versus the fixed-GMT-year-round hypothesis at corr 0.900 / RMSE $16.01; two years of hourly bars confirm a clean one-hour shift at each DST boundary. **Implementation: resolve via IANA `Europe/London` per date. Never a hardcoded offset.** A vendor series literally titled *"Gold Fixing Price 15:00 GMT in London Bullion Market"* exists in the wild and is wrong for ~7 months of the year.
- **The start time is fixed; the publication time is not — for any of the seven.** IBA, verbatim: *"Since the LBMA Gold Price and LBMA Silver Price benchmarks are derived from the price of the final round of the auctions, they do not have set publication times."* The identical sentence appears in the PGM methodology and covers platinum as well as palladium. The auction runs 30-second rounds (Au/Ag) or 60-second rounds (Pt/Pd) until the buy/sell imbalance falls inside the threshold. **No maximum round count, no published duration distribution, and no historical end-time series was found in any IBA document.**
- **Correct framing of the seven: 5 have fixed auction *starts*, 2 have event-driven starts, and ZERO have fixed *publication* times.**
- **Palladium has no ex-ante timestamp at all.** IBA Palladium Auction Specification: *"Auction Start Time | Following the conclusion of Platinum auctions."* IBA's own 2026 Palladium holiday calendar asterisks its column headers with note (3): *"The palladium auctions commence immediately after the platinum auctions have ended (start times shown are for platinum auctions)."* Both palladium's start and its print are variable. Two LBMA web pages state a flat "09:45 and 14:00 for platinum and palladium" — **both are wrong; do not key a timestamp off either.**
- **A published price can be amended for 30 minutes after publication** (IBA error policy). A real-time read is not final. This bears directly on the point-in-time harness.
- **Round Zero:** participants queue orders for **30 minutes before** each nominal start, with no price published. Positioning begins at 10:00/14:30 London for gold, 09:15/13:30 for platinum. This matters for the guard-band rule in §3.

### 1b. Points that are NOT auction benchmarks but will be mistaken for them

Included so the designer does not silently substitute one category for another.

| Point | What it actually is | Time | UTC (win / sum) |
|---|---|---|---|
| Johnson Matthey Base Prices (Pt, Pd, Rh, Ir, Ru) | **One dealer's quoted OFFER prices.** JM explicitly disclaims benchmark status | 08:30 & 14:30 HKT; 09:00 London; 09:30 "EST" | 00:30Z & 06:30Z (HK, no DST); 09:00/08:00Z; **US print's offset ambiguous** |
| COMEX gold settlement (GC) | **Futures settlement** — CME staff, Globex activity | 13:29–13:30 **ET** | 18:29–18:30Z / 17:29–17:30Z |
| COMEX silver settlement (SI) | Futures settlement | 13:24–13:25 **ET** | 18:24–18:25Z / 17:24–17:25Z |
| NYMEX Pt/Pd settlement (PL, PA) | Futures settlement — **times NOT verified in this research** | unknown | unknown |
| MCX daily settlement | **Futures settlement.** Rule-based VWAP of last 30 min, min 10 trades | 23:00–23:30 or 23:25–23:55 IST | 17:55–18:25Z (win) / 17:30–18:00Z (sum) |
| Indian polled spot (Ahmedabad 995 Au / 999 Ag) | **Trimmed-mean dealer POLL**, outsourced to Informist. Not an auction | polled 11:30–12:30 & 16:00–17:00 IST; published ~13:00 & ~17:30 IST | 06:00–07:00Z & **10:30–11:30Z** |
| FBIL USD/INR Reference Rate | **Computed VWAP over observed transactions** in a *randomly selected, unpublished* 15-min sub-window; has a polled fallback | measured 11:30–12:30 IST, published ~13:30 IST | measurable only to **06:00–07:00Z**, published 08:00Z |
| Any vendor "XAU spot close" | **Arbitrary cut of a continuous OTC market.** No price-discovery event behind it | vendor-dependent | — |

---

## 2. USABLE POINTS PER DAY, AND THE NATURAL INTERVALS

**Per UK business day: 7 prints across 4 metals. Per metal: Au 2, Ag 1, Pt 2, Pd 2.**

**Within-metal intervals (identical in GMT and BST — the whole ladder shifts together):**

| Metal | Intraday window | Overnight window | Points/yr (approx) |
|---|---|---|---|
| Gold | AM→PM = **4h30m** | PM→next AM = **19h30m** (Fri→Mon ≈ 67h30m) | ~500, minus 2 |
| Silver | **none** | 24h only | ~250 |
| Platinum | AM→PM = **4h15m** | PM→next AM = **19h45m** | ~500 |
| Palladium | ≈4h15m, jittery both edges | ≈19h45m, jittery both edges | ~500 |

**Cross-metal sequence and gaps within a day:** Pt AM → (45m) → Au AM → (1h30m) → Ag → (2h00m) → Pt PM → (1h00m) → Au PM. Palladium AM/PM slot in immediately after each platinum print.
**Full daily span Pt AM → Au PM = 5h15m. Dark period = 18h45m per day.**

**Calendar arithmetic — get this right or the join silently corrupts:**

- **The auction calendar is UK business days.** IBA's definition: participants transact *"on U.K. Business Days."* The composite "a day that is both a U.K. Business Day and a U.S. Business Day" definition governs the **settlement value date only**, not whether an auction runs. Empirically verified against LBMA's own series: gold printed on 2025-07-04, Thanksgiving 2025-11-27, MLK Day, Presidents Day, Veterans Day; and was absent on 2025-05-05, 2025-05-26, 2025-08-25, 2025-04-21 — every absence a UK bank holiday. **Building the calendar on a UK∩US intersection is a real and easy error and would wrongly delete July 4 and Thanksgiving.**
- **Versus US-hours instruments the LBMA calendar has EXTRA days, not fewer.** The pairing hazard points the opposite way from intuition.
- **Gold and silver do not share a calendar.** 2026 gold: 8 full no-auction days **plus 2 half-days** — 24 Dec and 31 Dec are marked "Auction Unaffected" for 10:30 and "No Auction" for 15:00. Same for platinum and palladium. **Silver's single 12:00 auction runs normally on both dates.** This is the mechanism behind the row-count gap (gold_am 14,809 vs gold_pm 14,657). **Join AM and PM on date; never zip them.**
- Ad-hoc UK bank holidays delete all four benchmarks entirely (no auctions on 19 Sep 2022, the Queen's funeral).
- **Derived, and useful:** the gold PM auction lands at **10:00 ET in both aligned regimes** (London GMT + US EST, and London BST + US EDT), and at **11:00 ET during the ~3-week March and ~1-week late-October mismatches**. The PM auction is effectively timed to the US morning ~92% of the year.

---

## 3. AUCTION POINTS vs FIXED CLOCK-TIME INTRADAY SAMPLING

**Verdict: strictly BETTER as measurement points. Strictly WORSE as a sampling grid. They solve a different problem from the one the intraday proposal was trying to solve, and it happens to be the more important problem.**

### Why better (each of these is a real, defensible advantage)

- **There is an actual price-discovery event.** A fixed clock-time sample of a continuous OTC feed is a quote observed at an arbitrary instant with no economic event behind it. The auction print is a matched transaction from committed orders, with an imbalance threshold that has to be satisfied for the price to stand.
- **Liquidity is concentrated by design.** Round Zero pulls 30 minutes of positioning into the auction. The print aggregates information over a defined window rather than sampling one tick — lower microstructure noise than any single-instant sample.
- **It is the number the world actually uses.** GLD's NAV, physical miner→refiner→bank contracts, monthly-averaging swaps, cash-settled derivatives. A forecast of the auction print is a forecast of something economically consumed. A forecast of "XAU spot at 14:15:00" is a forecast of a vendor artefact.
- **Auditable and unambiguous.** Regulated administrator, published methodology, versioned Benchmark Statement. Two vendors' "spot closes" disagree; there is exactly one LBMA Gold Price PM.
- **The event→window assignment is deterministic and leakage-safe.** With auction boundaries you don't "align a price move to a news timestamp" — you **assign each event to the window that contains it**. There is no window-width hyperparameter to tune, and no ambiguity about whether the observation post-dates the event. That is a materially stronger design than a chosen ±N-minute band.

### Why worse (each of these is disqualifying for 15-minute alignment)

- **Coverage: 18h45m dark every day.** An event at 16:00 London has its next gold observation 18h30m later. That is a daily-resolution measurement wearing a precise-looking timestamp.
- **The right edge jitters.** No fixed publication time for any of the seven. The "price at time T" has T unknown to within minutes for gold and unbounded for palladium.
- **Palladium is not timestampable ex ante at all.** Plan for palladium as daily-resolution unless per-round timings can be obtained.
- **Possible endogeneity of the measurement instant.** Mechanically, more contested auctions need more rounds and print later — so on high-news days the print time may drift precisely when you care most. **This is an inference, not an IBA statement, and no IBA document asserts it.** It is testable *if* the Transparency Report is obtainable (see §7).
- **The 30-minute amendment window** means a real-time read is provisional. For a point-in-time harness this must be handled explicitly.
- **DST desynchronisation.** All seven instants shift one hour in UTC on the UK calendar, which mismatches the US calendar for **21 days in March and 7 days around end-October (2026: 8–29 Mar and 25 Oct–1 Nov)**. Cross-market lead/lag relationships are non-constant across those 28 days.
- **The schedule is under active review.** LBMA is publicly consulting on moving the **morning gold auction earlier** to serve Asian price discovery (LBMA CEO, June 2026). No replacement time, no date announced. **Do not hardcode 10:30.**

### Recommended design consequence

**Two-tier, decided explicitly rather than inherited:**

- **Tier 1 (outcome / evaluation):** LBMA auction prints define the return being forecast and the window boundaries. Windows: `[Au AM, Au PM]` intraday and `[Au PM, next Au AM]` overnight, per metal, with silver at one window/day.
- **Tier 2 (intraday resolution, only if required):** a futures or licensed spot series. **This is not a like-for-like substitution** — futures are a different underlying, carry basis, and carry roll discontinuities that in an event-window study register as a large fake event-response with no news behind them. Any use of Tier 2 must be labelled as a different measurement, not a finer-grained version of Tier 1.

**Concrete guard-band rule, derived from the confirmed Round Zero fact:** an event may be attributed to a given auction print only if it lands **at least 30 minutes before that auction's nominal start** (i.e. before Round Zero opens). Events inside `[start − 30min, start + 30min]` are excluded or flagged. For gold this shrinks the clean AM→PM attribution window from 10:30–15:00 to effectively **11:00–14:30 London**. This rule is defensible from primary sources and should be a REQ.

---

## 4. RHODIUM (XRH) AND IRIDIUM (XIR) — SHOULD THEY BE IN SCOPE?

**No. Exclude both. Also exclude ruthenium, which is in the identical category.**

This is not a close call, and every leg of the reasoning is confirmed primary:

1. **There is no benchmark.** LBMA's OTC Guide: *"The LBMA Gold, Silver, Platinum and Palladium price auctions are recognised as the international global benchmarks for precious metals."* Precious Metals Prices Limited holds the IP for **four** benchmarks. IBA administers exactly four. Rhodium, iridium, ruthenium and osmium appear nowhere.
2. **There is no futures or terminal market.** By contrast Pt/Pd have both an auction benchmark and futures (NYMEX, plus new Guangzhou Futures Exchange contracts from late Nov 2025). Extensive search found no Rh or Ir contract anywhere. *(Absence of evidence, but the contrast is stark.)*
3. **The only regular timestamped source is one dealer's offer side.** Johnson Matthey, verbatim: *"the company's quoted offer prices for our customers of wholesale quantities of platinum group metals set by our trading desks."* No orders, no imbalance, no trades, no participants. Not a mid, not a transaction print.
4. **JM prohibits exactly this use.** JM states it does not administer a benchmark and prohibits use of the Prices as a benchmark under Regulation (EU) 2016/1011 without prior written consent. **That is a licensing blocker independent of the data-quality problem.**
5. **Apparent corroboration across sources is an illusion.** Argus carries assessments *titled* "Rhodium min 99.9% du Rotterdam Johnson Matthey prices" and the iridium equivalent. Umicore's published prices carry: *"Prices shown on our websites thus are of pure statistical nature and must be looked at as indications only."* Multiple "independent" feeds trace back to the same dealer.
6. **No ISO 4217 code.** Only XAU (959), XAG (961), XPT (962), XPD (964) exist. **A vendor advertising "XRH" or "XIR" has minted a private pseudo-ticker — treat that as a reliable signal you are being sold a scraped dealer quote.** (LSE's "XRH0" is an ETP ticker, not a currency code.)
7. **Liquidity.** Johnson Matthey, primary: *"The iridium market is by far the smallest and least liquid of the PGMs, so even relatively modest additional buying activity can cause significant volatility."*
8. **The failure mode is specific and damaging to this project.** A dealer offer sheet revised on a schedule produces a step-function series: runs of exact zero returns punctuated by jumps that track **the dealer's revision cadence, not the market**. On such a series, climatology and conditional climatology (ladder rungs 1–2) will score artificially well and the agent rungs will appear to underperform — you would be measuring the dealer's update policy and reporting it as a miscalibration result. *(This mechanism is my inference, not a sourced claim, but it follows directly from the confirmed quote-not-auction structure.)*

**Recommendation:** no new ADR is required to keep them out — ADR-0009 already scopes v1 to indices and metals and Rh/Ir were never in the 11-instrument set (REQ-201). But record this as **considered and declined, with reasons**, so it does not resurface. The defensible PGM set is **platinum and palladium only**. Note that even Pt/Pd carry a live wrinkle: they still have a **USD 0.50/oz seller's premium** on bilateral trades between Direct Participants (excluded from the published benchmark), whereas gold's USD 0.15/oz and silver's USD 0.005/oz premiums were both abolished.

---

## 5. THE MCX OVERLAP QUESTION, IN UTC

**MCX has no auction of any kind.** Trading begins directly at 09:00 IST; the contract specs describe one contiguous session with no call phase. The "pre-open call auction" language in Indian broker material belongs to the **NSE/BSE equity segment**, not commodity derivatives. *(Supported by absence of evidence — MCX's own rulebook page returns HTTP 403 to automated fetch, so there is no positive exchange statement denying a call session.)* **The auction-benchmark argument does not extend to India.**

### Session, in UTC (IST is UTC+5:30 year-round, no DST — the variation is entirely US-driven)

| Regime | Dates (2026) | MCX session (IST) | **MCX session (UTC)** | Settlement VWAP window (UTC) |
|---|---|---|---|---|
| **A** London GMT + US EST | 1 Nov – 8 Mar | 09:00–23:55 | **03:30Z – 18:25Z** | 17:55Z – 18:25Z |
| **B** London GMT + US EDT | 8 Mar – 29 Mar | 09:00–23:30 | **03:30Z – 18:00Z** | 17:30Z – 18:00Z |
| **C** London BST + US EDT | 29 Mar – 25 Oct | 09:00–23:30 | **03:30Z – 18:00Z** | 17:30Z – 18:00Z |
| **D** London GMT + US EDT | 25 Oct – 1 Nov | 09:00–23:30 | **03:30Z – 18:00Z** | 17:30Z – 18:00Z |

Note the counter-intuitive direction: MCX closes **later in IST** during the northern winter (23:55) but its close in US-Eastern terms is **earlier** (13:25 ET vs 14:00 ET) — the US-afternoon overlap **shrinks by 35 minutes** in winter.

### Core answer: every LBMA auction falls inside the MCX session, in all four regimes

| Auction | Regime A (Z / IST) | Regimes B,D (Z / IST) | Regime C (Z / IST) | MCX time remaining after the print |
|---|---|---|---|---|
| Pt AM | 09:45Z / 15:15 | 09:45Z / 15:15 | 08:45Z / 14:15 | 8h15m – 9h15m |
| Au AM | 10:30Z / 16:00 | 10:30Z / 16:00 | 09:30Z / 15:00 | 7h30m – 8h30m |
| Ag | 12:00Z / 17:30 | 12:00Z / 17:30 | 11:00Z / 16:30 | 6h00m – 7h00m |
| Pt PM | 14:00Z / 19:30 | 14:00Z / 19:30 | 13:00Z / 18:30 | 4h00m – 5h00m |
| **Au PM** | **15:00Z / 20:30** | **15:00Z / 20:30** | **14:00Z / 19:30** | **3h00m – 4h00m** |

### What this implies for a cross-market ordering test

**One direction is mechanically contaminated and one is clean. State this in the design, because the contaminated direction is the one that will produce a spuriously impressive result.**

- **London → MCX is NOT a test.** The gold PM auction precedes the MCX close by **3h00m–4h00m in every regime**, and the MCX daily settlement VWAP window is 3h00m–3h30m after it. Any correlation between the LBMA PM print and the same-day MCX settlement is **already-known information propagating**, not predictive skill. Treat it as a **leakage control** — if the pipeline can't reproduce this relationship it has a bug; if it reports it as a result it has a leak.
- **MCX → London IS a clean test.** The MCX open (03:30Z) precedes the first London auction by **5h15m (Pt AM, BST) to 6h15m (Pt AM, GMT)**, and precedes the gold AM print by 6h00m–7h00m. The MCX-open-to-morning move genuinely leads the London auctions. **This is the only defensible ordering direction** — and it is confounded by USD/INR and by the import-duty basis (below).
- **The Indian polled spot post-dates or coincides with the London AM in every regime.** Afternoon poll window is **10:30Z–11:30Z year-round**. In the London-GMT half of the year the gold AM auction (10:30Z) lands **exactly at the poll window's opening instant**; in BST (09:30Z) it lands **one hour before it opens**. Either way the London AM print is inside the Indian afternoon poll's information set. The Indian physical benchmark is anchored to the London AM / Asian session and **never** to the PM auction or the US session.

### Three sharp edges that will silently corrupt an event study

1. **COMEX gold settlement flips inside/outside MCX at the US DST boundary.** Summer: 17:29–17:30Z, **inside** MCX and **exactly contiguous** with the start of MCX's own settlement VWAP window at 17:30:00Z — zero gap. Winter: 18:29–18:30Z, **entirely after** the 18:25Z MCX close. COMEX **silver** in winter (18:24–18:25Z) lands **inside the final minute of MCX's VWAP window**. *(CME primary rule filings confirm the zone is **Eastern**, not Central.)*
2. **MCX essentially never trades an FOMC decision on the same Indian date.** 14:00 ET = **18:00Z in summer — exactly the MCX closing instant** — and **19:00Z in winter, 35 minutes after the close**. Since Fed announcements are one of the project's event classes: **any model that appears to predict the next-day MCX move from an FOMC event is reading a mechanically deferred reaction, not forecasting.** This needs an explicit exclusion or a labelled control.
3. **US 08:30 ET macro releases (CPI, NFP, PPI, claims) ARE cleanly measurable** — 12:30Z summer / 13:30Z winter, always inside MCX with 4h30m–4h55m of trading remaining. **The NYSE close never is** (20:00Z / 21:00Z, always after the MCX close).

### Two MCX-specific structural breaks

- **Import duty, 13 May 2026: 6% → 15%** (10% BCD + 5% AIDC restored; notifications 15–18/2026-Customs). **A single-day dummy will NOT clean this.** Per the World Gold Council, pass-through was **partial and gradual** — domestic prices rose only ~4–6% against a 9pp duty rise, and the domestic discount to landed price widened from ~$14/oz to ~$150/oz over weeks. Handle as a **duty-adjusted basis or a series split with an explicit transition window**. The exact shape/duration of the transition could not be reconstructed.
- **Two roll calendars.** GOLD / GOLDM / SILVER expire on the **5th**; GOLDTEN / GOLDGUINEA / GOLDPETAL / SILVERM / SILVERMIC / SILVER100 expire on the **last calendar day**. GOLDPETAL is also on an **Ex-Mumbai** basis, not Ex-Ahmedabad. Expiry FSP is a **poll of physical spot** (3-day average of last polled prices), not the futures close.

---

## 6. DATA AVAILABILITY AND LICENSING

**This is the item most likely to kill the design. Treat it as the gating decision, not an implementation detail.**

### Technical access — open

LBMA serves **keyless JSON**, all HTTP 200, no auth, re-verified 2026-08-09:

`prices.lbma.org.uk/json/{gold_am, gold_pm, silver, platinum_am, platinum_pm, palladium_am, palladium_pm}.json`

| Series | Rows | From |
|---|---|---|
| gold_am | 14,809 | 1968-01-02 |
| gold_pm | 14,657 | 1968-04-01 |
| silver | 14,820 | 1968-01-02 |
| platinum_am / palladium_am | 9,185 each | 1990-04-02 |
| platinum_pm / palladium_pm | 9,116 / 9,119 | — |

Schema: `[{"is_cms_locked":0, "d":"YYYY-MM-DD", "v":[USD, GBP, EUR]}]`. Free view is **delayed to midnight London time** (so even the free tier's availability instant moves with UK DST). ICE's catalogue gives the intermediate tier: *"intraday data is available 4 hours after original publication time."*

### Legal access — closed, stacked, and expensive

**Technical openness is not a licence.** LBMA, verbatim: *"A licence from IBA is required in order to obtain, use or redistribute real-time or historical benchmark data."* Note **"obtain"** — that wording on its face covers ingestion, not just republication. Two layers must both be satisfied: **LBMA owns the IP and controls access; IBA administers and licenses use and redistribution.**

**IBA MLA Licensing Data Fee Schedule 2026 — verified verbatim from the PDF:**

| Schedule | Scope | Fee |
|---|---|---|
| **R — Derived Benchmarks** | *"derives or maintains an index or benchmark for which any new or historical LBMA [price] information serves directly or indirectly as, or as part of, an input or underlying reference"* | **USD 25,000/yr per benchmark.** *"For the avoidance of doubt, if Customer Group Companies do not receive or generate any Licensed Product Revenue … the fees payable … shall be USD 25,000 per annum."* **Four metals = USD 100,000/yr** |
| **U — Educational Usage** | academic/educational use | **USD 5,000 per benchmark per year.** The **only** concessionary tier in the 28-page document |
| **J — Usage** | valuation/pricing and reference-rate-in-transactions | Gold 31,000 / 17,000 / 8,000; Silver 15,500 / 8,000 / 4,000; **Pt+Pd combined** 6,000 / 5,500 / 5,000 |
| Redistribution | real-time / 4-hour-delayed | Gold 33,000 + $34/user/mo, delayed 9,000; Silver 33,000 + $29, delayed 9,000; **Pt+Pd as a single combined line** 15,000 + $20, delayed 5,000. **Delayed total for all four = USD 23,000/yr** |

**There is no free, non-commercial, evaluation, internal-use or research exemption anywhere in the document.** Being open-source, free and non-revenue-generating provides no relief — the avoidance-of-doubt sentence exists precisely to close that door.

**LBMA's non-commercial portal self-certification is a trap for the skim-reader.** LBMA grants portal **access** on a non-commercial basis by self-certification; IBA charges USD 5,000 per benchmark for an educational **use** licence. Two different parties, two different bases. **Getting into the portal confers no right to publish anything derived from it**, and LBMA cross-checks certifications with the licence provider.

**Enforcement is real, recent, and specifically targets public republishers:**

- **FRED**, 31 Jan 2022: *"FRED will no longer include data from ICE Benchmark Administration Limited (IBA). All series from the datasets below will be deleted"* — LBMA gold and silver daily prices among them.
- **World Gold Council Goldhub:** *"As of 18 March 2025, only limited LBMA Gold Price data is available on our website. Historical LBMA Gold Price data has been removed at the request of the ICE Benchmark Administration."* Only monthly/quarterly/annual averages remain.
- **LBMA** moved its historic tables behind the Members' Portal, w/c 24 Nov 2025.
- **Nasdaq Data Link** `LBMA/GOLD` and `LBMA/SILVER` return HTTP 403 without a key (re-tested 2026-08-09); quandl.com fails DNS.

**Any architecture depending on a third party continuing to republish LBMA history is depending on something that has been systematically withdrawn over the last four years.**

### Can the project publish DERIVED aggregates?

**Probably yes, if scoped tightly — but only IBA can settle it, and the ambiguity is genuine.** Schedule R's trigger is drafted broadly ("directly or indirectly", "as part of"), and the schedule contains an internal drafting artefact — its revenue limb refers to *"the derived interest rate benchmark"*, evidently copied from IBA's rate products — which makes the scope **less** clear, not more.

**Recommended posture (not legal advice):**

1. **Publish only second-order statistics.** Correlation coefficients, skill and error metrics (MAE, pinball, Brier), calibration curves, coefficient tables, and rung-vs-rung gaps. **Never a reconstructible price or return series** — no downloadable CSV at observation granularity, no chart with a readable price-unit y-axis, no committed cache or test fixture containing benchmark values. **Fortunately this is exactly what the product already promises** (the learning curve, the rung 5→6 miscalibration gap per REQ-809), so the constraint is compatible with the design rather than a compromise of it.
2. **The repo is currently PUBLIC.** That materially raises exposure — a committed cache or fixture containing LBMA values *is* republication. The ADR-0014 pre-commit hook should block committed benchmark values on the same footing as it blocks `raw/` paths and scraped payloads.
3. **Get it in writing before writing ingestion code.** `IBA-licensing@ice.com`, +44 (0) 20 3540 7200. Describe the exact use — non-commercial forecasting research, publication of aggregate skill metrics only, open-source code, no republication of benchmark values, no reference-rate use — and request **written scope confirmation**.

### The alternatives are worse, not cheaper

- **Yahoo `v8/finance/chart`:** `GC=F`, `SI=F` (CMX) and `PL=F`, `PA=F` (**NYMEX**, not COMEX) all work keyless. 15-minute bars cap at `range=60d` (5,637 bars; `range=90d` → HTTP 422); `1h` works to `range=2y`; **`interval=1d&range=max` silently downgrades to monthly granularity** (267 bars GC/SI, 297 PL, 288 PA — so 267 is not a universal signature to test against). But Yahoo's own ToS prohibits *"access or collect data … using any automated means"* **and** using content *"to create any database, archive, mobile application, data feed, widget or any other aggregated data source."* This **moves the exposure from IBA to Yahoo** rather than resolving it, on an undocumented endpoint that can change without notice. And futures ≠ auction benchmark: different underlying, basis, and roll jumps that read as large fake event-responses.
- **Stooq: dead for automation.** All endpoints return a **796-byte JS anti-bot challenge** with a Chrome UA, and HTTP **404** with a default Python UA. **A health check testing only for HTTP 200 will wrongly report Stooq as healthy** — the browser-UA "fix" makes it look *more* successful while still returning no data.
- **MCX:** every PDF on mcxindia.com returns HTTP 403 to automated fetch, and a headless browser was also blocked. Contract specs are obtainable but not by naive scraping.

---

## 7. WHAT I COULD NOT CONFIRM — AND WHAT THE DESIGNER MUST VERIFY

### BLOCKING — do not supersede any ADR until these are answered

1. **IBA licence scope, in writing.** Is a forecast-evaluation return series a "derived index" under Schedule R? Does ingesting the free delayed JSON for internal research require a licence (LBMA's wording says "obtain")? Are aggregate skill metrics publishable? **Only IBA can settle this.** Exposure is USD 100,000/yr against a stated budget of USD 16–33/month. **This decides the architecture; the architecture does not decide this.**
2. **Whether IBA's Transparency Report is freely downloadable.** It contains per-round price, aggregated bid/offer volume, participant count **and the timings for each round**. **This is the single most valuable artefact for the entire design** — it is the only thing that converts every auction print from "nominal start time, unknown end" into an actual observed timestamp, and it is the only way to resolve palladium at all. Its existence and contents are confirmed from LBMA's FAQ; **no public download location was found.** Ask IBA directly, in the same email as item 1.
3. **The morning gold auction time change.** LBMA is consulting on moving 10:30 earlier for Asian price discovery. **No replacement time and no date announced.** Treat the auction schedule as configuration read from the IBA Auction Specification documents; re-check before go-live. Do not hardcode.
4. **Current MCX trading hours, verified manually in a real browser.** mcxindia.com returns 403 to automated fetch; the 23:30/23:55 switch and its effective dates rest on secondary reports of circulars MCX/TRD/491/2025 and 068/2026 plus a contract-spec footnote. **Additionally, an untraced reference to "Session 2, 16:35–02:45, from 3 August 2026" alongside MCX could neither be sourced nor ruled out — and today is 9 August 2026.** Verify before this enters a leakage gate.
5. **GDELT's own timestamp semantics.** The entire alignment argument depends on both sides of the join, and **"GDELT is UTC at 15-minute resolution" was assumed by the framing of this research and never verified.** Confirm independently — and specifically confirm whether the timestamp is the **event time, the article publication time, or the GDELT ingestion time.** That distinction alone can invalidate an event-window design regardless of how good the price side is.

### NON-BLOCKING — record as known unknowns, do not assume away

6. **No primary source states GMT/BST/UTC.** Verified negative across ~10 primary documents. Resolved empirically to high confidence (§1). Use `Europe/London`. Written IBA confirmation is belt-and-braces, **not** a blocker.
7. **The exact print time of every one of the seven auctions is unknown.** No maximum round count, no duration distribution, no historical end-time series exists in any IBA document.
8. **The 30-minute amendment window.** The harness must either record both the as-first-published and the final value, or defer ingestion by >30 minutes. This is a point-in-time correctness requirement, not a nicety.
9. **The volatility→more-rounds→later-print hypothesis is unsourced.** Plausible from the imbalance-threshold mechanism; no IBA document asserts it. Testable via item 2. If true, the measurement instant is endogenous to the quantity being measured.
10. **Holiday-calendar structure for years other than 2026.** Only the 2026 gold and silver calendars were verified. The Christmas Eve / New Year's Eve PM-only pattern must be checked per year. **IBA's Platinum and Palladium Holiday Calendars are referenced in the methodology as "[link to be provided]" and are not published there.**
11. **Whether the 1 July 2026 LME→IBA handover changed the Pt/Pd methodology or series construction**, as opposed to only the administering entity. That is **five weeks ago**. Until confirmed, treat the Pt/Pd series as potentially inhomogeneous across 2026-07-01 — which means **there are ~5 weeks of methodologically homogeneous Pt/Pd history, nowhere near enough to calibrate anything.** This is a hard constraint on Lane A numeric calibration for those two instruments.
12. **Whether 09:45/14:00 for platinum are unchanged from the LME era.** lme.com returned HTTP 403.
13. **NYMEX Pt/Pd settlement times were not confirmed.** COMEX gold (13:29–13:30 ET) and silver (13:24–13:25 ET) are confirmed from CME rule filings; Pt/Pd are not. Verify from the CME rulebook if futures are used as the Tier-2 intraday leg.
14. **Historical homogeneity of the LBMA series is much worse than the 1968-start row counts suggest.** Pre-2015 gold and pre-2014 silver were set by **conference call**, not electronic auction. The gold participant panel went **4 → 6 (Mar 2015) → 13 (end-2016) → 15 (today)**. Round duration was **45s at launch, 30s by Dec 2016 — changeover date unknown**. Most importantly: **round prices were set by a human Chairperson until ~Q1 2017** (IBA's Dec 2016 consultation proposed the algorithm "for implementation in Quarter 1, 2017"; no primary go-live confirmation found). **IBA's "no judgement or discretion" statement is therefore FALSE for gold from 2015-03-20 to ~Q1 2017.** Seller's premiums (gold $0.15/oz, silver $0.005/oz) existed and were removed at **unknown dates**. **Recommendation: start any Lane A calibration window no earlier than 2017 for gold and silver.**
15. **Source-quality traps that will poison a scraper.** LBMA's own **platinum/palladium landing page is STALE** and still names the LME as administrator (fetched 9 Aug 2026). LBMA's **"About LBMA Daily Auction Prices"** page is correct on the administrator but **wrong on palladium timing** (states a flat 09:45/14:00). `ice.com/publicdocs/PGM_Methodology.pdf` is a **consultation draft** with unresolved placeholders (`[link to be provided]`, `[***] 2026`). **Anchor on the IBA Auction Specification PDFs and the versioned Precious Metals Benchmark Statement. Neither LBMA page is safe to key a timestamp off.**
16. Silver row counts were not reconciled against its calendar (does silver have any irregular AM-only-analogue days?).
17. Rhodium market-balance figures could not be extracted (chart images only); Argus's assessment methodology is paywalled; the primary SIX/ISO 4217 code list was not obtained (XRH/XIR absence confirmed only via secondary summaries); JM's *"Eastern Standard Time"* remains genuinely ambiguous, so the US Base Price print's UTC offset cannot be pinned down.
18. No MCX rulebook statement positively denying a call/opening/closing auction was located (403). §5's "no auction at MCX" rests on absence of evidence.

---

## 8. WHAT THIS MEANS FOR THE ADRs

**Sequence matters. Do not write ADRs in this order reversed.**

**Step 1 — before any ADR:** send the IBA licensing email (§6, items 1 and 2 of §7). The answer is binary and it determines everything downstream. Budget for the possibility that the answer is "Schedule R applies, USD 100,000/yr," in which case the LBMA-benchmark design is not affordable and the correct outcome is to keep daily close-to-close on a licensable or genuinely open source, and record the auction design as evaluated-and-blocked-on-cost.

**Step 2 — if licensing clears, these are the changes that need superseding ADRs:**

- **Measurement instrument.** Daily close-to-close → auction-anchored windows. New ADR. Must state the three-category taxonomy explicitly (auction benchmark / vendor close / futures settlement) and forbid silent substitution between them.
- **Forecast horizons (REQ-level, affects ADR-0042).** "t+1" and "t+5" must be redefined in **auction count**, not calendar days. Gold/Pt/Pd then have an **alternating window structure** (4h30m intraday, 19h30m overnight); silver does not, so silver's t+1 is 24h while gold's alternates. **Gold and silver horizons are not comparable without explicit handling.** The six-rung ladder must be scored on identical windows per instrument, which is a stricter constraint than "identical live days."
- **Guard band.** New REQ: an event is attributable to an auction print only if it precedes the nominal start by ≥30 minutes (Round Zero opens). Derived from primary sources; cheap to implement; prevents the most obvious leak.
- **Timezone handling.** New REQ + CI assertion: all benchmark instants resolve through IANA `Europe/London` per date; hardcoded offsets are a build failure. Same class of assertion as the ADR-0038 `seeded`/`observed` provenance check. Add a fixture covering the 21-day March and 7-day October US/UK mismatch windows.
- **Calendar.** New REQ: the LBMA calendar is **UK business days**, with gold/Pt/Pd losing the PM print on 24 and 31 December, and silver not. **Explicitly forbid a UK∩US intersection calendar.**

**Step 3 — what does NOT need superseding:**

- **ADR-0037 (forward-only) is untouched.** This changes the measurement instrument and the outcome variable, not the agent's execution mode. History still feeds only Lane A calibration, the wiki seed, and threshold calibration. **But note the new constraint from §7 item 14: Lane A's usable calibration window for gold and silver should start no earlier than 2017, and for Pt/Pd there are only ~5 weeks of homogeneous history.** That is a real, concrete narrowing of what Lane A can be fitted on.
- **ADR-0009 (indices and metals, no individual equities)** is unaffected. Rh/Ir were never in the 11-instrument set and should stay out — record as considered-and-declined.
- **ADR-0041 (no agents)** is unaffected.

**Step 4 — the one thing to be honest about in the ADR:** this change buys you **2 observations/day instead of 1**, with exact window boundaries and an economically meaningful outcome. It does **not** buy you 15-minute GDELT alignment. If the project's real motivation was 15-minute event resolution, **this design does not deliver it and no auction-based design can** — that would require a licensed continuous feed or a futures series, which is a different (and non-like-for-like) measurement and a separate decision.