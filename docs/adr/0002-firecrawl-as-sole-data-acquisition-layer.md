# ADR-0002: Firecrawl as the sole data acquisition layer

- **Status:** Accepted — **amended by [ADR-0010](0010-permit-free-keyless-sources-alongside-firecrawl.md)**
- **Date:** 2026-08-09
- **Serves:** Data ingest for prices, metals, and events

> **Amendment note (2026-08-09):** ADR-0010 narrows the word *sole* in this ADR's title and decision. Free, keyless, structured public sources (Stooq CSV, GDELT BigQuery) may be fetched directly; Firecrawl remains the mechanism for everything unstructured or without a free structured feed. The paid-API prohibition, the page-aggregation rule, and the mandatory ingest validation below all remain in force and apply to both acquisition paths. The original decision text is preserved unedited.

## Context

The project summary specifies Firecrawl for scraping. An initial counter-proposal to use market-data APIs for prices (keeping Firecrawl for news only) was rejected: **no paid market-data API integration is wanted.**

The two technical objections to scraping prices were examined and one does not hold:

1. **Fragility (does not hold).** Firecrawl's JSON-schema extraction is LLM-based rather than CSS-selector-based. It is therefore *more* tolerant of site redesigns than a conventional scraper, not less.
2. **Credit cost (holds, but is manageable).** Verified pricing: scrape 1 credit/page, JSON-schema extraction 5 credits/scrape, search 2 credits per 10 results. Free tier 1,000 credits/month at 2 concurrent requests; Hobby $16/month for 5,000 credits at 5 concurrent.

The decisive factor is **page aggregation**. Scraping ten individual stock pages costs 50 credits; scraping one page that lists all ten costs 5. This is a 10× difference and it determines whether the project fits a free tier.

Projected daily consumption with aggregation:

| Job | Credits |
|---|---|
| India top-10 equities — one aggregate page, JSON schema | 5 |
| US top-10 equities — one aggregate page, JSON schema | 5 |
| Metals spot USD/oz, all four — one page, JSON schema | 5 |
| MCX INR metals — one page, JSON schema | 5 |
| Event discovery — 2 searches × 10 results | 4 |
| Article bodies — ~15 pages, markdown only, classified by our own LLM | 15 |
| **Daily total** | **~39** |

Prices run on trading days only (~22/month), news daily (~30/month): **~1,010 credits/month**, at the boundary of the free tier.

## Decision

We will use Firecrawl as the only external data acquisition mechanism, for prices, metals, and news alike. No paid market-data API will be integrated.

Binding implementation constraints:

- **Aggregate pages over per-instrument pages.** One page yielding N instruments, never N pages yielding one each. Any new scrape target must justify its credit cost against this rule.
- **JSON-schema extraction for structured data** (prices), **markdown extraction for prose** (article bodies). Do not pay 5 credits to JSON-extract an article we are going to feed to our own LLM anyway.
- **Validation on ingest is mandatory.** LLM extraction can return a plausible but wrong number, which would silently corrupt the learning history — a worse failure than a visible crash. Every ingested price must pass: timestamp freshness, non-null, and move-versus-previous-close within a configured band. Failures quarantine the record and alert; they never write to the price history.
- Start on the free tier. Upgrade to Hobby ($16/mo) when sustained usage exceeds ~900 credits/month.
- Respect `robots.txt` and target sites' terms; prefer official exchange and public data pages over aggregators where both exist.

## Alternatives considered

- **Market-data APIs for prices, Firecrawl for news only.** Rejected by explicit instruction — no paid API integration.
- **Self-hosted scraper (Playwright/BeautifulSoup).** Rejected: zero marginal cost but high maintenance, and it reintroduces exactly the selector fragility Firecrawl avoids.
- **Firecrawl JSON extraction on every article.** Rejected: 5 credits versus 1, for content we classify with our own LLM regardless. Roughly 60 wasted credits/day.

## Consequences

- Data acquisition has a single, uniform interface and one failure domain to reason about.
- Ingest validation becomes load-bearing rather than defensive — it is the only thing standing between a bad extraction and corrupted learning history.
- Credit budget becomes a real design constraint: adding instruments is not free, and scrape-target selection is an architectural concern, not an implementation detail.
- Free tier's 2 concurrent requests forces sequential or lightly-batched scraping. Acceptable for a daily batch job; would not be for anything interactive.
- We are dependent on Firecrawl availability and pricing. Note that scraped data must never be committed to the public repo.

## Revisit trigger

Sustained credit burn above 4,000/month, **or** ingest validation rejecting more than 1% of extractions over a rolling fortnight (indicating extraction is unreliable enough to threaten data integrity).
