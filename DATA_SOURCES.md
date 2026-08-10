# Data sources

Per [ADR-0044](docs/adr/0044-licence-and-publication-policy.md), every source's licence and attribution obligation is recorded here and updated whenever a source is added (REQ-1109).

**No data of any kind is present in this repository yet.** This table is the standing record of obligations that apply once acquisition begins.

## Sources

| Source | Used for | Access | Licence / terms | Attribution required | Status |
|---|---|---|---|---|---|
| [GDELT 2.0](https://www.gdeltproject.org/) | Unscheduled world events, Feb 2015→ | BigQuery free tier / file downloads | **CC BY 4.0** | **Yes** — wherever data or derivatives appear | Granularity of attribution ❓ open |
| [jugaad-data](https://github.com/jugaad-py/jugaad-data) | NSE index history | Python library | Library MIT; data is NSE's | To confirm | ❓ open |
| [FRED](https://fred.stlouisfed.org/) | **S&P 500, Nasdaq 100, Dow** (`SP500`, `NASDAQ100`, `DJIA`) + regime covariates — nominal 10Y (`DGS10`), real 10Y (`DFII10`), dollar index (`DTWEXBGS`), VIX (`VIXCLS`), WTI (`DCOILWTICO`) | Keyless CSV | St. Louis Fed terms; most series are public domain, some are third-party | Varies by series | Terms for derived series ❓ open |
| [Firecrawl](https://www.firecrawl.dev/) | SENSEX, the four spot metals, MCX prices, economic calendars, news articles | API, key in Secrets Manager | Firecrawl ToS; **retrieved content belongs to its publishers** | n/a — content is never redistributed | ✅ policy set |
| MCX | Indian domestic metal prices | via Firecrawl | Exchange terms | n/a — never redistributed | ✅ policy set |
| Market calendars (NSE, BSE, NASDAQ, NYSE, MCX) | Session instants in UTC, DST (ADR-0049) | Maintained in this repo | Ours | — | ✅ |
| Festival / holiday table | Calendar-deterministic factors | Maintained in this repo | Ours | — | ✅ |

## The publication boundary

**Never published** (REQ-1107):

- Anything under `raw/`
- Scraped article text, in whole or in excerpt
- MCX or economic-calendar page content
- Firecrawl request or response payloads

**Published** (REQ-1106) — all of it our own derived work:

- The prediction record, scores, and all ladder rungs
- Wiki pages and run manifests
- Event classifications and severity scores
- The steering audit trail
- Calibration maps and their fit versions
- **Source URLs and fetch timestamps**, so a third party can re-acquire source material under their own terms (REQ-1108)

## Open questions — must clear before any derived dataset is published

Tracked as REQ-1111. These are not resolvable by judgement and need actual answers.

> Stooq's question is **void** — [ADR-0053](docs/adr/0053-remove-stooq-as-a-price-source.md) removed the source, which now serves a bot challenge instead of CSV. Three remain.

1. **FRED** — terms for derived series; which FRED series carry third-party restrictions?
2. **GDELT** — must CC BY 4.0 attribution appear per-record or per-dataset?
3. **Severity scores** — a model read an article and produced a number. Does that number constitute a derivative work of the article? *This is the genuinely uncertain one.*
