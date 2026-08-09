# ADR-0012: Scrape public economic calendars for consensus expectations

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Scheduled-event handling, surprise computation

## Context

Scheduled events — Fed decisions, CPI prints, employment data, budgets — move markets **only through the surprise component**. The expected outcome is already reflected in prices before the announcement. A rate rise that matches consensus typically produces little movement; a 25bp deviation from consensus can move gold sharply.

Without consensus data, the learner observes "Fed decision → market barely moved" repeatedly and correctly concludes that rate decisions carry no signal. That conclusion would be an artefact of missing data, and it would discard one of the strongest genuine event categories in the domain — particularly for gold, where monetary policy is arguably the dominant driver.

Public economic calendars — Investing.com, ForexFactory, TradingEconomics — publish **Actual / Forecast / Previous** openly, no account required. This is unstructured HTML with no free structured feed, so it falls to Firecrawl under ADR-0010's qualifying test.

## Decision

We will scrape public economic calendars to capture consensus forecasts, and model scheduled events by their surprise term.

**Surprise is standardised, not raw.** Surprise is computed as `(Actual − Forecast)` normalised by the historical standard deviation of surprises for that specific indicator. A 0.2% CPI miss and a 25bp rate surprise are not comparable in raw units; in standardised units they are. This mirrors the σ-relative treatment of price movement in ADR-0008, keeping event magnitude and price magnitude on compatible scales.

**Indicators tracked in v1**, chosen for relevance to the eleven tracked series:

| Region | Indicators |
|---|---|
| US | FOMC rate decision, CPI, Non-Farm Payrolls, PPI, GDP, jobless claims |
| India | RBI repo rate, CPI, WPI, Union Budget |
| Eurozone | ECB rate decision (material for gold) |

**Two capture points per day:** upcoming releases with forecasts (before the event, establishing the expectation on record) and released actuals (after). Recording the forecast *before* the release is not optional — capturing both together after the fact invites the forecast being revised to match the actual, which would produce a phantom zero-surprise. One aggregate calendar page covers both, ~5 credits/day.

**Scheduled and unscheduled events are modelled differently and never pooled.** Unscheduled shocks (ADR-0011, via GDELT) carry their full magnitude as signal; scheduled events carry only their surprise. Averaging the two categories together would dilute both.

**Deduplication against GDELT is required** — a Fed decision appears both as a calendar entry and as GDELT news coverage. The calendar entry is authoritative for the surprise term; GDELT coverage contributes salience.

## Alternatives considered

- **Treat scheduled events as binary occurrence.** Rejected: produces the false null described above, discarding monetary policy.
- **Exclude scheduled events from v1.** Rejected: cleanest signal, but excludes the dominant driver of gold and index moves. A metals-focused system that ignores central banks is missing the main mechanism.
- **Infer surprise from market reaction.** Rejected as circular — it derives the predictor from the outcome, guaranteeing spurious in-sample fit and zero predictive value.

## Consequences

- Monetary policy becomes learnable rather than a systematic false negative.
- Standardised surprise puts event magnitude on a comparable footing with price movement buckets.
- One additional daily scrape target (~5 credits/day) plus a second capture window.
- **Historical consensus coverage is the main risk.** GDELT provides eleven years of unscheduled events, but archived consensus forecasts are likely shallower and may not extend as far back. Scheduled-event backfill may therefore start later than unscheduled, leaving the two categories with different history depths — the backtest must account for this rather than assuming uniform coverage.
- Calendars occasionally revise forecasts close to release. Capturing the forecast at a fixed pre-release cutoff, timestamped, protects against retroactive revision.
- Indicator coverage is a judgement call; adding indicators later means backfilling their history separately.

## Revisit trigger

Historical consensus data proves unavailable beyond ~2 years (reconsider whether scheduled events can be backtested at all), **or** standardised surprise shows no relationship to realised movement after backtest.
