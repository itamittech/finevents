# ADR-0009: Scope v1 to indices and metals; defer individual equities

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** v1 instrument scope

## Context

The project summary specifies the top 10 stocks in India and the USA. Two problems with starting there:

- **Idiosyncratic noise.** An individual stock's daily move is dominated by company-specific factors — earnings, analyst actions, sector rotation, single-name flow. Macro event signal is a small component buried in that noise. Indices average the idiosyncratic component away and respond far more cleanly to macro events, which is exactly what this system is trying to learn.
- **Spurious correlation surface.** More instruments crossed with more event types means more relationships that appear significant by chance. Starting wide makes a weak result ambiguous: is the approach wrong, or are the instruments too noisy? Starting narrow makes a null result genuinely informative.

Metals are the strongest starting case — gold as the classic geopolitical and risk-off instrument, silver as monetary-industrial hybrid, platinum and palladium driven by supply concentration and auto demand. Their event linkage is the most direct of anything in scope.

## Decision

We will scope v1 to indices and metals, and defer individual equities until the learning loop is demonstrated.

**v1 instrument set (11 series):**

| Class | Instruments |
|---|---|
| India indices | NIFTY 50, SENSEX |
| US indices | S&P 500, NASDAQ Composite |
| Metals spot (USD/oz) | Gold, silver, platinum, palladium |
| Metals domestic (MCX, INR) | Gold, silver |
| FX | USD/INR |

USD/INR is required, not optional — without it a domestic metal move cannot be decomposed into international, currency, and residual components (ADR-0003).

**Credit impact:** four aggregate JSON scrapes per trading day (India indices, US indices, metals spot, MCX + FX) at 5 credits each = 20 credits/day, versus ~40 under the original per-equity plan. This leaves meaningful headroom in the free tier for event scraping.

**Equities are added in v2**, once the loop demonstrably beats climatology on indices. The same pipeline extends to them without redesign — the deferral is about sequencing and interpretability, not capability.

## Alternatives considered

- **Full scope immediately** (20 equities + indices + metals). Rejected: maximum breadth, but a weak result becomes uninterpretable, and credit cost roughly doubles for the noisiest instruments in the set.
- **Metals only.** Rejected as too narrow: strong event linkage, but excludes equity indices entirely, and the India/US timezone lag — one of the few genuinely learnable non-arbitraged patterns available — only appears with both markets present.

## Consequences

- Cleanest available signal-to-noise for proving or disproving the core hypothesis.
- Lower credit burn, comfortably inside the free tier alongside event scraping.
- Retains the India/US timezone-lag effect: a US event after 15:30 IST reaches Indian markets the following session, which is observable and learnable.
- Fewer instruments means fewer chance correlations to filter.
- Does not satisfy the project summary's stated top-10-stocks scope. This is an explicit sequencing decision, not a scope reduction — equities follow in v2.
- Index-level correlation may not transfer directly to individual equities; v2 will need its own validation rather than assuming transfer.

## Revisit trigger

The learning loop beats climatology on indices and metals (promote equities to v2), **or** index-level signal proves too weak after backtest while individual-equity event linkage looks stronger — for instance if single-name news dominates.
