# `knowledge_time` derivation, per source

**Serves:** REQ-103 · **Decided by:** [ADR-0016](../adr/0016-bitemporal-model-and-as-of-repository.md) · **Implemented in:** `finevents/repository/records.py`, `finevents/ingest/`
**Status:** Baseline. Rows for sources not yet built are marked *pending*, and the fetcher for each must fill its row in the same commit that lands it.

---

## What the field means

`knowledge_time` is **the earliest moment we could have known the fact** — not when we fetched it, and not when it happened.

Those three instants are routinely different, and conflating any two of them is a leakage vector rather than an inaccuracy:

| Instant | What it is | Field |
|---|---|---|
| When it happened | The market close, the announcement, the attack | `event_time` |
| When it became knowable | Publication, release, first availability on the wire | **`knowledge_time`** |
| When we pulled it | Our fetcher's clock | `fetch_ts`, on the raw payload only (REQ-110) |

**Using `fetch_ts` as `knowledge_time` is the tempting error.** It is always available and always defensible-looking. It is also always *late* — often by hours, sometimes by years for a backfill — and lateness in this field is not conservative. A daily bar stamped with a backfill's fetch time is invisible to every as-of query until the backfill date, which silently starves the model of history it was entitled to. The bias runs the other way too: if a fetcher runs before a source's own publication timestamp is exposed, `fetch_ts` can *precede* true knowability, and then the model sees the future.

## The conservative fallback

Where a source publishes no ingestion or release timestamp, `knowledge_time` is **the later of**:

1. the source's stated publication instant, if any; and
2. the venue's or publisher's scheduled availability instant for that datum, taken from the calendar table (REQ-211).

Where neither exists, use **the end of the publication day in the source's own timezone, converted to UTC**. That is deliberately pessimistic: it makes the fact knowable later than it truly was, so an as-of query may miss data it could legitimately have used. The alternative error — claiming knowledge earlier than reality — puts a future observation into a prediction, which is the one failure this project cannot detect after the fact and cannot re-run under forward-only.

**Never interpolate a `knowledge_time`, and never derive one from a neighbouring record.** A gap is recoverable and visible; a fabricated instant is neither.

---

## Per source

| Source | `event_time` | `knowledge_time` | Basis |
|---|---|---|---|
| **FRED** — `SP500`, `NASDAQ100`, `DJIA`, `DGS10`, `DFII10`, `DTWEXBGS`, `VIXCLS`, `DCOILWTICO` | The observation date at the venue's close, as a UTC instant from the calendar table | FRED's series-level **last-updated** timestamp for the vintage containing the observation | FRED publishes vintage metadata via ALFRED; several of these series are revised, so the vintage is the only honest answer. *Pending — lands with T3.3/T3.5.* |
| **jugaad-data** — NIFTY 50 | NSE close for the session, UTC | NSE's own publication instant for the daily bar; falls back to session close + the exchange's stated dissemination lag | The library exposes no publication timestamp, so this is the fallback path. *Pending — lands with T3.4.* |
| **Bank of Russia** — gold, silver, platinum, palladium, USD/RUB | The rate's effective date at 00:00 Moscow, UTC | CBR's stated publication instant for that rate — published the **preceding business day** | The publication lead is why this needs a real derivation: the effective date is *after* the knowable date, so `knowledge_time < event_time` here and that is correct, not a bug. |
| **Bank of England** — `XUDLGPD` | Observation date, UTC | End of the observation day, London, converted to UTC | The IADB exposes no per-observation release timestamp. Fallback path. Discontinued 2017-05-26, so cross-check only. |
| **NBP** — gold PLN/gram | Publication date at 00:00 Warsaw, UTC | The API's own publication date for the table, at Warsaw end of day | NBP tables carry a publication date but no time. Fallback path. |
| **GDELT 2.0** | The event date GDELT assigns | The **15-minute update-file timestamp** the record first appeared in | GDELT's file naming carries the interval directly, so this is exact rather than a fallback — and it matters, because GDELT re-emits records across intervals. *Pending — lands with T3.6.* |
| **Firecrawl** — SENSEX, spot metals, MCX, economic calendars, news | The datum's own timestamp: session close, release time, or article publication | The article's or page's stated publication instant; falls back to end of publication day in the publisher's timezone | Extracted pages vary wildly in what they expose. **The fallback is the common case here, not the exception.** *Pending — lands with T3.7.* |
| **Market calendars, festival table** | The session or holiday date | The instant the entry entered this repository, from git | Maintained by us, so provenance is the commit. |

---

## Consequences worth knowing

**`knowledge_time` earlier than `event_time` is legitimate.** A consensus forecast for an unreleased figure, or a CBR rate published the day before it takes effect, is knowable before it happens. `BitemporalRecord` therefore does not reject it — `is_backdated` exposes the relation without judging it.

**A revision is a new record, never an edit.** The vintage that was current on the day of a prediction must stay answerable forever (REQ-102), which is why `BitemporalStore.append` carries a condition rather than trusting the caller.

**A source that changes its publication semantics invalidates its row here, not just its fetcher.** If FRED alters vintage exposure, or a publisher starts stamping articles differently, the derivation changes and every record written under the old rule keeps the old meaning. Record the change with a dated note in this table rather than editing the row in place — the same reason ADRs are immutable.
