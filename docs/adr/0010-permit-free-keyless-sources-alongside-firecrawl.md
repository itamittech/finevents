# ADR-0010: Permit free keyless sources alongside Firecrawl

- **Status:** Accepted

> **Amendment note (added on review):** **Stooq is removed** by [ADR-0053](0053-remove-stooq-as-a-price-source.md) — it now returns a JavaScript bot challenge rather than CSV. Its role passes to FRED (US indices), jugaad-data (NIFTY) and Firecrawl (SENSEX, metals, MCX). The reasoning below stands except where it names Stooq.

- **Date:** 2026-08-09
- **Amends:** ADR-0002 (which declared Firecrawl the *sole* acquisition layer)
- **Serves:** Historical backfill (ADR-0007), daily price ingest

## Context

ADR-0002 established Firecrawl as the only data acquisition mechanism, driven by the constraint that **no paid market-data API** be integrated. ADR-0007 then required eleven years of historical backfill across eleven series.

Routing that backfill through page scraping is impractical: eleven years of daily history is on the order of tens of thousands of rows, and page-by-page scraping would consume a large share of the credit budget for data that is available as a single CSV download.

The clarifying distinction: the constraint is on **paid, account-bound commercial APIs**, not on free public data. Stooq CSV endpoints and GDELT's BigQuery dataset require no API key, no account, and no billing relationship. A Stooq CSV fetch is closer to downloading a public file than to integrating a data vendor.

## Decision

We will permit direct fetch of **free, keyless, public data sources**, with Firecrawl handling everything else.

**Direct fetch — structured, free, keyless:**

| Source | Use |
|---|---|
| Stooq CSV | Historical and daily OHLCV for world indices and metals |
| GDELT 2.0 (BigQuery / raw files) | Historical and ongoing event data |
| `jugaad-data` | NSE index history direct from the exchange |

**Firecrawl — everything unstructured or without a free structured feed:**

| Target | Use |
|---|---|
| News articles | Event detail and narrative |
| MCX prices | No free structured feed available |
| Economic calendars | Consensus expectations (ADR-0012) |
| Event discovery search | Surfacing candidate events |

**Qualifying test for direct fetch.** A source qualifies only if it requires no API key, no account registration, and no billing relationship, *and* publishes in a structured machine-readable format. Anything failing any clause goes through Firecrawl or is not used.

**Both paths converge on one schema.** Direct-fetch and Firecrawl ingest produce identical records, and downstream code cannot tell which path a record came from. Ingest validation from ADR-0002 applies equally to both — a free CSV can be stale or malformed just as an LLM extraction can be plausibly wrong.

## Alternatives considered

- **Everything through Firecrawl, no exceptions.** Rejected: single failure domain is genuinely attractive, but backfill cost is prohibitive and the credit spend buys nothing that a free CSV does not already provide.
- **Free sources for backfill only, Firecrawl for all live data.** Rejected, though it was close. It creates two code paths for the same series — CSV historically, scrape live — which means the daily path is never exercised against the historical path's data, and a divergence between them would surface as a mysterious discontinuity at the backfill boundary. Using the same source for both history and live keeps the series internally consistent.

## Consequences

- Backfill becomes tractable: a bulk download rather than a large scrape campaign.
- Credit budget drops further, extending free-tier viability.
- **Two acquisition paths now exist**, so the ingest layer needs a clean source abstraction and both paths need validation coverage. This is the cost of the decision.
- Adds a GCP dependency (BigQuery) alongside AWS. Free tier is ample; the operational surface grows slightly.
- Stooq and GDELT availability become dependencies. Neither offers an uptime guarantee, being free services. Ingest failures must degrade gracefully rather than break the daily run.
- Source provenance must be recorded per record, so a data-quality problem can be traced to its origin.

## Revisit trigger

A free source becomes unavailable, rate-limited, or starts requiring registration — at which point that series either moves to Firecrawl or the ADR is reopened.
