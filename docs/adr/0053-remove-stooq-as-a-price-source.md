# ADR-0053: Remove Stooq as a price source

- **Status:** Accepted
- **Date:** 2026-08-09
- **Amends:** [ADR-0007](0007-bootstrap-with-historical-backfill.md) and [ADR-0010](0010-permit-free-keyless-sources-alongside-firecrawl.md), both of which name Stooq
- **Serves:** REQ-201, REQ-204, REQ-1111

## Context

[ADR-0010](0010-permit-free-keyless-sources-alongside-firecrawl.md) admitted Stooq as a keyless CSV source for index and metals OHLCV, and [ADR-0007](0007-bootstrap-with-historical-backfill.md) made it the backbone of the historical backfill. `REQ-204` names it.

**Stooq no longer serves CSV to automated clients.** Requests return a JavaScript proof-of-work challenge — a bot-detection interstitial, not data. This was hit directly while fetching series for the power analysis, not inferred from documentation.

The decision follows from two things rather than one. First, the source does not work. Second, and more important: **the correct response to a bot challenge is to use a different source, not a better scraper.** Engineering around a site's explicit signal that it does not want automated access is not a position this project should take, and it is cheap to avoid now and awkward to unwind later. ADR-0010's own revisit trigger anticipated the shape of this — *"a free source starts requiring registration"* — and a proof-of-work gate is that trigger in a different costume.

## Decision

**Stooq is removed. Price acquisition redistributes across sources already in the design — no new dependency, no new spend.**

| Instruments | Source | Status |
|---|---|---|
| S&P 500, Nasdaq, Dow | **FRED** (`SP500`, `NASDAQ100`, `DJIA`) | Keyless, verified serving |
| NIFTY 50 | **jugaad-data** | Unchanged |
| SENSEX, gold, silver, platinum, palladium, MCX gold, MCX silver | **Firecrawl** | Already the acquisition path for MCX (REQ-207) |

FRED is already a permitted, keyless source carrying the five regime covariates (REQ-205), so this widens an existing dependency rather than adding one. Firecrawl is already budgeted at $0–16/month and already extracts MCX pages.

**Sources are chosen for permissive terms, not for a scraper's ability to reach them.** That rule is the general form of this decision and outlives it.

## Consequences

### The wiki seed loses its metals history, and that is the real cost

Daily running is fully covered: a scraped page gives today's price, which is all forward-only running needs.

**History is a different matter, and it does not survive intact.**

| Series | History available |
|---|---|
| Nasdaq 100 (FRED) | 1986 → · ample |
| S&P 500, Dow (FRED, free tier) | **2016-08 → · ~10 years, ~1.5 short of GDELT's Feb-2015 start** |
| NIFTY 50 (jugaad-data) | Ample |
| **Gold, silver, platinum, palladium, SENSEX, MCX** | **None.** Scraping returns the present, not the past |

FRED no longer carries metals either — its LBMA series were deleted at ICE's request, verified as HTTP 404 against a working control.

So [ADR-0038](0038-wiki-seeding-tagged-and-toggleable.md)'s deterministic seed can cover the US indices and NIFTY, and **cannot cover the metals**. Those correlation pages start empty.

**This is survivable because ADR-0038 already designed for it.** The `seed_enabled` flag exists precisely so an unseeded arm is runnable, and the seeded/observed provenance split (REQ-707, REQ-708) means a page with no seeded rows is a represented state rather than a broken one. Metals simply land in the unseeded arm by necessity rather than by choice — which, incidentally, makes the ADR-0038 ablation partly self-executing.

The honest cost: metals pages accumulate `observed` evidence only, from go-live, at roughly 8 events a year per pairing. Per-page confidence for metals moves from year 2–3 to something later. **Aggregate skill measurement is unaffected** — [ADR-0052](0052-leave-one-out-attribution.md)'s leave-one-out endpoint reads the scored record, not the seed.

### Other consequences

- **One of the four data-terms questions disappears.** "Stooq redistribution of derived aggregates" (ADR-0044, ADR-0050, T0.12) is moot — there is no Stooq. Three remain.
- **`knowledge_time` for Stooq CSV** was an open question in the [threat model](../design/point-in-time-test-harness.md); it closes with the source. Firecrawl-acquired prices take fetch time, which is the conservative and correct choice.
- **Firecrawl carries more of the load**, moving toward ADR-0002's revisit trigger on credit burn. At a few instruments sampled a few times a day this stays inside the free-or-Hobby tier, but it is now worth watching.
- **A single point of failure grows.** Stooq and Firecrawl were partly redundant for indices; they are not now. A Firecrawl outage costs the metals and SENSEX for that day — a recorded gap under ADR-0010's graceful-degradation rule, not a corruption.

## Alternatives considered

- **Keep Stooq and route it through Firecrawl**, which handles JavaScript challenges. Rejected on principle: it is engineering around an explicit signal that automated access is unwelcome. The data is not worth the posture.
- **Yahoo Finance** (`GC=F`, `SI=F`, `PL=F`, `PA=F`) — keyless, intraday, deep history. Rejected: its terms prohibit automated collection and building a derived data source, so it moves the exposure rather than resolving it.
- **LBMA benchmark prices.** Rejected: technically open, legally licensed, with a Derived Benchmark licence category and enforcement against public republishers on record. See the [research brief](../analysis/metals-benchmarks.md).
- **Drop the metals** and keep only instruments with clean history. Rejected: metals have the most direct event linkage of anything in scope (ADR-0009), and losing the seed is a smaller price than losing the instruments.

## Revisit trigger

A free source with permissive terms and daily metals history becomes available — which would let the ADR-0038 seed cover metals after all, and would be worth taking even after go-live, since seeded rows are tagged and additive rather than retroactive.
