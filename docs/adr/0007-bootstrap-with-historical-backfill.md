# ADR-0007: Bootstrap the learning layer with historical backfill

- **Status:** Accepted

> **Amendment note (added on review):** **Stooq is removed** by [ADR-0053](0053-remove-stooq-as-a-price-source.md) — it now returns a JavaScript bot challenge rather than CSV. Its role passes to FRED (US indices), jugaad-data (NIFTY) and Firecrawl (SENSEX, metals, MCX). The reasoning below stands except where it names Stooq.

- **Date:** 2026-08-09
- **Serves:** Learning viability (project summary points 5, 6, 11)

## Context

The central statistical problem: at daily cadence the system observes **one sample per day**. A year yields ~250 observations, of which perhaps 30–50 are genuinely eventful. Against a taxonomy of ~20 event categories crossed with ~11 instruments, that is far more parameters than data. The system would fit noise, and — worse — would report confident correlations discovered by chance.

Starting fresh means roughly a year before the eval framework shows anything distinguishable from randomness. That delays the feedback loop that the entire project depends on.

Verified free sources (no paid API, consistent with ADR-0002's constraint):

- **GDELT 2.0 Event Database** — February 2015 to present, updated every 15 minutes, 100% free and open. Accessible via Google BigQuery (1TB/month free processing) or raw datafile download. Events are pre-structured with actors, locations, and tone scoring.
  - **Critical distinction:** GDELT *Cloud* is spotty before March 2026. GDELT *2.0 Event Database* is the correct target. Confusing the two yields five months of history instead of eleven years.
- **Stooq** — free keyless CSV downloads, 20+ years OHLCV, covering world indices and commodities. Direct URL pattern: `stooq.com/q/d/l/?s=^spx&i=d`.
- **jugaad-data** — Python library pulling historical NSE index data directly from the exchange.

This converts ~250 first-year observations into roughly **eleven years of event-aligned price history** — thousands of observations, including multiple instances of most event categories and several full volatility regimes.

## Decision

We will bootstrap the knowledge layer with historical backfill before running forward accumulation.

- **Events:** GDELT 2.0 Event Database, Feb 2015 → present.
- **Prices:** Stooq CSV for indices and metals; `jugaad-data` for NSE; MCX history from the best available free source.
- **Backfill is a one-off batch job**, separate from the daily pipeline, producing the same schema so downstream code is identical for historical and live data.
- **Point-in-time discipline is mandatory** (see ADR-0005). Backfilled correlations must be derived only from data available *as of* each simulated prediction date. The wiki must be read at its state on that date, not its current state.
- Backfill runs **before** the first live prediction, so the system launches with priors rather than blank pages.

Note: the acquisition mechanism for these free sources — direct fetch versus routing through Firecrawl — is a pending decision. ADR-0002 constrains *paid* APIs; whether free keyless sources are in scope requires confirmation.

## Alternatives considered

- **Start fresh from today.** Rejected: ~1 year to meaningful signal, and early predictions indistinguishable from noise. The feedback loop is the product; delaying it by a year delays everything.
- **Hybrid — top ~200 events over 2–3 years.** Rejected: hand-selecting which events "count" injects selection bias directly into the correlations being learned. If we choose the events we think mattered, we will discover that those events mattered.
- **Synthetic/simulated event data.** Rejected: teaches the system relationships we invented.

## Consequences

- Several weeks of upfront ingest work before the daily pipeline is useful.
- The system launches with genuine priors, so day-one predictions are testable rather than arbitrary.
- **Backtesting becomes possible**, which means the approach can be falsified early — before significant investment in a method that may not work. This is the main strategic benefit.
- Point-in-time correctness becomes the highest-risk area in the codebase. Getting it wrong produces spectacular backtest results that collapse in live use, and the failure is silent.
- GDELT's schema (CAMEO event coding) may not map cleanly onto a financially-relevant taxonomy — mapping is an open decision.
- Historical MCX data may be the weakest link; domestic Indian metal history is less freely available than international.
- BigQuery access requires a GCP account alongside AWS. The free 1TB/month tier is ample for this volume.

## Revisit trigger

Backfilled correlations show no out-of-sample predictive value beyond the climatology baseline after full backtesting — which would indicate the daily-cadence event-correlation approach itself needs rethinking, not just more data.

## Sources

- [The GDELT Project — Data access](https://www.gdeltproject.org/data.html)
- [GDELT 2.0 Event Database on BigQuery](https://console.cloud.google.com/marketplace/product/the-gdelt-project/gdelt-2-events)
- [Stooq free data download](https://www.chartoasis.com/free-data-download-stooq-help-cop3/)
- [jugaad-data](https://pypi.org/project/jugaad-data)
