# Data sources

Per [ADR-0044](docs/adr/0044-licence-and-publication-policy.md), every source's licence and attribution obligation is recorded here and updated whenever a source is added (REQ-1109).

**No data of any kind is present in this repository yet.** This table is the standing record of obligations that apply once acquisition begins.

## Sources

| Source | Used for | Access | Licence / terms | Attribution required | Status |
|---|---|---|---|---|---|
| [GDELT 2.0](https://www.gdeltproject.org/) | Unscheduled world events, Feb 2015→ | BigQuery free tier / file downloads | **CC BY 4.0** | **Yes** — wherever data or derivatives appear | Granularity of attribution ❓ open |
| [Bank of Russia](https://www.cbr.ru/) | **Daily gold, silver, platinum, palladium** — `xml_metall.asp`, RUB/gram, 2015→present. Plus USD/RUB from the same API | Keyless XML | **Terms not yet verified** | To confirm | ✅ fetches; ⚠ see note |
| [Bank of England](https://www.bankofengland.co.uk/boeapps/database/) | Gold USD/oz daily, series `XUDLGPD`, 1979→2017 | Keyless CSV | BoE IADB terms | To confirm | ⚠ **discontinued 2017-05-26** — cross-check only |
| [NBP](https://api.nbp.pl/) | Gold PLN/gram daily, 2013→present | Keyless JSON | NBP open API | To confirm | ✅ fetches; independent cross-check |
| [jugaad-data](https://github.com/jugaad-py/jugaad-data) | NSE index history | Python library | Library MIT; data is NSE's | To confirm | ❓ open |
| [FRED](https://fred.stlouisfed.org/) | **S&P 500, Nasdaq 100, Dow** (`SP500`, `NASDAQ100`, `DJIA`) + regime covariates — nominal 10Y (`DGS10`), real 10Y (`DFII10`), dollar index (`DTWEXBGS`), VIX (`VIXCLS`), WTI (`DCOILWTICO`) | Keyless CSV | St. Louis Fed terms; most series are public domain, some are third-party | Varies by series | Terms for derived series ❓ open |
| [Firecrawl](https://www.firecrawl.dev/) | SENSEX, the four spot metals, MCX prices, economic calendars, news articles | API, key in Secrets Manager | Firecrawl ToS; **retrieved content belongs to its publishers** | n/a — content is never redistributed | ✅ policy set |
| MCX | Indian domestic metal prices | via Firecrawl | Exchange terms | n/a — never redistributed | ✅ policy set |
| Market calendars (NSE, BSE, NASDAQ, NYSE, MCX) | Session instants in UTC, DST (ADR-0049) | Maintained in this repo | Ours | — | ✅ |
| Festival / holiday table | Calendar-deterministic factors | Maintained in this repo | Ours | — | ✅ |


## Note on metals price sources (verified 2026-08-09)

Daily historical metals data **does exist** free and keyless, contrary to an earlier conclusion here. Bank of
Russia carries all four metals daily from 2015 to the present. `scripts/fetch_metals_history.py` retrieves it.

**But reconstructing USD spot from it is not viable at daily resolution.** CBR quotes RUB/gram; converting via
CBR's own USD/RUB and cross-checking against Bank of England's USD gold over 464 overlapping days gives:

- mean error **+0.04%** — essentially unbiased, so the *level* is right
- standard deviation **1.09%**, worst case 4.64%; only 68% of days land within 1%

Gold's own daily move has a standard deviation of about 1.14%. **The conversion error is the same size as the
signal.** Bucket boundaries sit at ±0.5σ and ±1.5σ (ADR-0008), so a ~1σ error would make bucket assignment close
to random.

The cause is not a defect in either source. It is that two daily fixes struck at different instants differ by
roughly the intraday move — the same timing problem that made auction timestamps interesting earlier. Any series
is only as good as its timing convention, and **mixing two conventions injects intraday noise**.

**What follows:** use one source with one convention consistently, or find a native-USD daily series. CBR's
RUB returns are internally coherent (same fix, same time, same source); it is only the conversion that breaks.
The untested remaining candidate for native USD is Alpha Vantage `GOLD_SILVER_HISTORY` (free key, daily,
from 2011). This is an open decision, not a settled one.

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
