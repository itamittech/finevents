# ADR-0017: Calendar, seasonal and regime factors as covariates

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Correlation validity; extends ADR-0008, 0011, 0012

## Context

The design to this point models two things: unscheduled events (ADR-0011) and scheduled macro releases (ADR-0012). That is an incomplete account of what moves these instruments, and the omission is not benign — it actively corrupts the event correlations the system is built to learn.

**The confounding problem.** Indian gold demand rises around Dhanteras and Diwali every year — Dhanteras is the single largest gold-buying day in the Indian calendar. Diwali falls in October or November. If a geopolitical event also occurs in late October, the learner attributes the seasonal rally to the event. Repeated across years, it will confidently conclude that October geopolitical events move gold, when what it has actually learned is when Diwali falls.

**The dominant-driver problem is larger.** Gold's principal drivers are not news at all: they are **real interest rates and the dollar**. Without those as covariates, an event correlation is measuring whatever the dollar did that week. A system that observes "attack in region X → gold up 2%" without knowing the dollar fell 1% that day has learned almost nothing, and will fail the moment those two decouple.

Both problems have the same shape: **unmodelled variables that correlate with time get attributed to whatever event happened to co-occur.**

## Decision

We will model calendar, seasonal, structural and regime factors as **covariates and context — not as events** — and predict the *residual* after conditioning on them.

### Factor categories

**1. Calendar-deterministic** (known years in advance):

| Factor | Relevance |
|---|---|
| Dhanteras, Diwali | Largest gold-buying occasion in India |
| Akshaya Tritiya | Second-largest gold-buying occasion |
| Chinese New Year | Major global physical gold demand |
| Indian wedding seasons (~Oct–Dec, ~Apr–Jun) | Sustained physical gold demand |
| Ramadan / Eid | Middle East demand patterns |
| Christmas / year-end | Thin liquidity, tax-loss selling, window dressing |
| Exchange holidays (NSE/BSE, NYSE/NASDAQ) | Data gaps; the two calendars differ substantially |
| Muhurat trading session | Special short NSE Diwali session |
| Derivative expiry (triple witching, monthly F&O) | Volume and volatility spikes |
| Month-end, quarter-end, fiscal year-end | Rebalancing flows |

**2. Seasonal / cyclical:** monsoon quality (Indian rural income drives rural gold demand), harvest cycles, earnings season.

**3. Regime state variables** — continuous context, sampled daily:

| Series | FRED ID | Why |
|---|---|---|
| US 10Y Treasury yield | `DGS10` | Baseline rate environment |
| US 10Y TIPS real yield | `DFII10` | Arguably *the* dominant gold driver |
| Trade-weighted dollar index | `DTWEXBGS` | Gold's principal inverse relationship |
| VIX | `VIXCLS` | Risk regime |
| WTI crude | `DCOILWTICO` | Inflation input; broad macro transmission |

FRED serves these as keyless CSV (`fredgraph.csv?id=<SERIES>`), verified — so they qualify for direct fetch under ADR-0010 at zero credit cost.

**4. Structural:** index reconstitution dates, central bank gold purchases (published monthly), ETF flow data where freely available.

### How they enter the model

- **Covariates, not events.** They condition the baseline expectation; they are not things the agent "predicts a reaction to".
- **Climatology becomes conditional climatology.** The baseline from ADR-0008 is no longer a flat historical bucket frequency but one conditioned on calendar position and regime state. This is a **harder and more honest baseline to beat** — beating naive climatology by exploiting the Diwali effect is not skill, it is a calendar lookup.
- **Events are scored on the residual**, after the conditional baseline is removed. An event correlation must earn its place beyond what season and regime already explain.
- **Calendar factors are known in advance and carry no leakage risk** — Diwali 2027's date is knowable today. Regime variables do carry leakage risk and are subject to the full bitemporal treatment (ADR-0016).

### Maintenance

Hindu and Islamic festival dates follow lunisolar and lunar calendars and are not trivially computed. They come from a **maintained lookup table**, versioned in the repo, covering the backfill period and several years forward. A stale table silently degrades the baseline, so its coverage horizon is asserted in CI.

## Alternatives considered

- **Treat festivals as events in the event stream.** Rejected: conflates deterministic, known-in-advance recurrence with genuine surprise. The system would "predict" Diwali, which is a calendar lookup dressed up as a forecast.
- **Ignore regime variables; let the wiki learn them implicitly.** Rejected: with ~250 observations a year the system cannot disentangle a dollar move from a co-occurring event through observation alone. The confounder must be measured, not inferred.
- **Full factor model with many covariates.** Rejected for v1: more covariates than the data supports reintroduces overfitting through a different door. Start with the five FRED series and the calendar table; expand only when justified by backtest.

## Consequences

- Event correlations become **interpretable as genuine event effects** rather than seasonal or regime artefacts. This is the main benefit and it is substantial — without it, a large share of learned correlations would be spurious.
- The baseline to beat gets harder, so measured skill will *drop* — correctly. Some of what naive climatology would have credited as skill was calendar effects all along.
- Additional daily ingest: five FRED series (direct, free, no credits) plus the calendar table lookup.
- The festival table needs maintenance and CI-asserted forward coverage.
- Conditional climatology needs enough observations per condition; over-conditioning produces empty cells. Condition granularity is a tunable to calibrate during backtest.
- Regime variables need bitemporal handling — FRED revises some series.
- Some factors (monsoon quality, ETF flows) may prove hard to source freely; they are lower priority than the FRED five and the calendar table.

## Revisit trigger

Conditional climatology fails to outperform naive climatology after backtest (indicating the factors add nothing), **or** conditioning cells become too sparse to estimate reliably — either would mean the conditioning scheme needs redesign.

## Sources

- [FRED — Federal Reserve Economic Data](https://fred.stlouisfed.org/)
- [FRED DGS10 series](https://fred.stlouisfed.org/series/DGS10)
