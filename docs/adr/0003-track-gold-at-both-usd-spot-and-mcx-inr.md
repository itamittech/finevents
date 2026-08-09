# ADR-0003: Track metals at both USD/oz spot and MCX INR

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Metals price ingest

## Context

International spot gold (USD/oz) and Indian domestic gold (MCX, INR per 10g) do not move identically. The domestic price embeds two additional factors:

- **USD/INR exchange rate** — international gold can fall while INR weakens, leaving domestic gold flat or up.
- **Import duty and local premium** — policy changes move the domestic price with no international counterpart.

Tracking only one loses information. Tracking only spot misses what an India-based user actually experiences; tracking only MCX conflates three different signals into one number and makes event correlation ambiguous — a move could be the event, the currency, or a duty change.

## Decision

We will track metals at both international spot (USD/oz) and Indian domestic (MCX, INR) where both exist, and treat the **spread between them as a first-class derived signal** rather than a discrepancy to reconcile.

- **USD/oz spot:** gold, silver, platinum, palladium.
- **MCX INR:** gold and silver (MCX platinum and palladium contracts are thin or absent; capture only if a reliable aggregate page exists).
- **USD/INR rate** is captured alongside, so domestic moves can be decomposed into international-move plus currency-move plus residual. Without the rate, the decomposition is impossible.

Both come from aggregate pages per ADR-0002 — one page for spot, one for MCX — not one page per metal.

## Alternatives considered

- **USD/oz spot only.** Rejected: ignores the market the user actually cares about, and misses India-specific events (duty changes, import policy) entirely.
- **MCX only.** Rejected: conflates three signals, making event attribution ambiguous.
- **Track both but treat them as independent instruments.** Rejected: wastes the most interesting part. The spread is where India-specific policy and currency effects become observable, and it is not recoverable after the fact if the USD/INR rate was not captured at the same timestamp.

## Consequences

- Two additional scrape targets (~10 credits/day) plus the USD/INR rate.
- Enables decomposition of a domestic move into its international, currency, and residual components — the residual is where local policy events show up.
- Timestamp alignment becomes a real problem: MCX and international spot trade on different hours. The data model must store observation timestamps, not just dates, and correlation logic must respect them.
- Adds a currency dimension to the learning problem, which is more to learn but also more that is genuinely learnable.

## Revisit trigger

No reliable aggregate page for MCX prices can be scraped within budget, **or** the spot/MCX spread shows no correlation with any event category after six months of data.
