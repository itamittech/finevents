"""The gold POC panel — one loader, one join rule, shared by every POC script.

Until 2026-08-13 `prepare_gold_poc.py` and `evaluate_gold_poc.py` each carried a
private copy of these loaders. That is how a join fix silently misses one copy,
and the join did need fixing:

**Value date is not knowledge date across sources.** The CBR fix dated D is set
and published the working day *before* D — 13 Aug's rate was public on 12 Aug,
checked against the live API. A FRED value dated D is that day's US close,
23:00–24:00 Moscow time, ten to fourteen hours *after* CBR has already fixed
the next day's price. Joined by value date, every cut-off therefore saw a US
close that postdates the t+1 outcome it was asked to predict.

The correction was first made as one day: a FRED observation's **knowledge
day** is the calendar day after its value date, and the panel's as-of join runs
on knowledge days. That is REQ-407 applied across sources — the same rule
ADR-0016 builds into the store, and the one this loader was silently breaking.
CBR-sourced covariates (the sister metals and USD/RUB) share the target's own
fix and are not shifted.

**One day was still too few (2026-08-19, review finding L4).** Measured against
the runner logs, the daily series land two *business* days behind at the 07:15
GMT run and the H.10 pair is published weekly, so a Monday value can wait eight
calendar days. The single constant is replaced by a measured per-series bound,
and by a first-seen ledger that turns the bound into an observation for every
value fetched from now on. The lesson is the same one twice: a modelled lag is
a guess, and a guess that is too small is a leak.
"""

from __future__ import annotations

import bisect
import csv
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from finevents.features.panel import Panel, Series, align  # noqa: E402

DATA = Path(__file__).resolve().parent.parent / "data"

#: A FRED value becomes knowable the day after its value date (US close, MSK).
#: **Superseded 2026-08-19 by the per-series table below (review finding L4).**
#: Kept only so the size of the old, too-small assumption can still be measured.
FRED_KNOWLEDGE_LAG_DAYS = 1

#: How many calendar days after its value date a FRED observation is actually
#: readable at the 07:15 GMT run — **measured**, from the tip of each series
#: across the runs recorded in `data/runner_logs/` (2026-08-14 .. 2026-08-19),
#: not assumed:
#:
#:   DGS10 / DFII10 / VIXCLS   value D appears 2 *business* days later. Wed's
#:                             value first shows on Friday, Thursday's on Monday
#:                             — so 2 calendar days mid-week, 4 across a weekend.
#:   DTWEXBGS / DEXINUS        H.10 is released on Mondays and carries the whole
#:                             week at once, so a Monday value waits until the
#:                             FOLLOWING Tuesday — up to 8 calendar days.
#:   DCOILWTICO                EIA's weekly cadence; the tip sat at 2026-08-11
#:                             through four consecutive runs.
#:
#: These are deliberately **upper bounds**. A lag that is too large only costs
#: freshness; one that is too small is a leak, which is the defect being fixed.
#: The ledger below replaces the guess with an observation wherever it can.
FRED_PUBLICATION_LAG_DAYS: dict[str, int] = {
    "dgs10": 4,
    "dfii10": 4,
    "vixcls": 4,
    "dtwexbgs": 8,
    "dexinus": 8,
    "dcoilwtico": 9,
}
#: Any FRED series without a measured entry is treated as weekly until measured.
DEFAULT_FRED_LAG_DAYS = 8

#: Observed publication: `series,value_date,first_seen`, appended by the fetcher
#: the first time a value date appears in a download. Committed on purpose — it
#: is our own observation, carries no source values, and is the only exact record
#: of when something became knowable (REQ-1106 derived work; ADR-0016's
#: knowledge-time principle, in the POC's small way).
FIRST_SEEN = DATA / "fred_first_seen.csv"


def load_first_seen() -> dict[tuple[str, date], date]:
    """(series, value date) -> the day we first saw it. Empty before the ledger
    exists, which is why the table above still has to be right for history."""
    if not FIRST_SEEN.exists():
        return {}
    out: dict[tuple[str, date], date] = {}
    for row in csv.DictReader(FIRST_SEEN.open(encoding="utf-8")):
        key = (row["series"].lower(), date.fromisoformat(row["value_date"]))
        out[key] = date.fromisoformat(row["first_seen"])
    return out


def fred_knowledge_date(column: str, value_date: date, ledger: dict | None = None) -> date:
    """The day a FRED observation could first have been read: observed if the
    ledger has it, otherwise the conservative per-series bound."""
    seen = (ledger if ledger is not None else load_first_seen()).get((column, value_date))
    if seen is not None:
        return seen
    lag = FRED_PUBLICATION_LAG_DAYS.get(column, DEFAULT_FRED_LAG_DAYS)
    return value_date + timedelta(days=lag)


#: The univariate forecast targets beyond gold: (file, column, series start).
#: One registry, because evaluate and the daily runner both load these and a
#: private copy in each is how a fix misses one of them (the covariate-join
#: lesson). WTI starts 2020-07-01 on principle, not convenience: it printed
#: **negative** on 2020-04-20 (−$36.98), and a non-positive price has no
#: log-return — the σ/bucket machinery is undefined across that print.
UNIVARIATE_SERIES: dict[str, tuple[str, str, date | None]] = {
    "usd_rub": ("fx_usdrub_cbr.csv", "usd_rub", None),
    "usd_inr": ("fred_dexinus.csv", "dexinus", None),
    "wti": ("fred_dcoilwtico.csv", "dcoilwtico", date(2020, 7, 1)),
}


def load_univariate(instrument: str) -> Series:
    """One univariate target series, start-trimmed where the registry says so.

    Deliberately on **value** dates, even for the FRED-sourced targets: a
    target's own dates are the instrument's trading calendar, and shifting them
    would move the day a forecast is made rather than the day it is knowable.
    That USD/INR and WTI are published days after the sessions they describe is
    a real problem — review finding L5 — but it is a sourcing problem, not one
    the knowledge-day rule can fix by re-dating the target.
    """
    filename, column, start = UNIVARIATE_SERIES[instrument]
    series = read_simple(filename, column, instrument)
    if start is None:
        return series
    begin = bisect.bisect_left(series.dates, start)
    return Series(instrument, series.dates[begin:], series.values[begin:])


def read_metal(metal: str) -> Series:
    rows = {
        date.fromisoformat(r["date"]): float(r["sell_rub_g"])
        for r in csv.DictReader((DATA / "metals_cbr_rub.csv").open(encoding="utf-8"))
        if r["metal"] == metal
    }
    return Series.of(f"{metal}_rub_g", rows)


def read_simple(filename: str, column: str, name: str, *, knowledge_lag_days: int = 0) -> Series:
    """Load one CSV column, re-dating each observation to its knowledge day.

    `knowledge_lag_days=0` keeps value dates — correct for CBR series, whose
    dates already postdate their own fix. FRED series pass 1, per the module
    docstring. The pre-correction join (0 for everything) stays reachable so
    the leak's size can be measured, not because it is ever right to use.
    """
    shift = timedelta(days=knowledge_lag_days)
    rows = {
        date.fromisoformat(r["date"]) + shift: float(r[column])
        for r in csv.DictReader((DATA / filename).open(encoding="utf-8"))
    }
    return Series.of(name, rows)


def read_fred(column: str, name: str) -> Series:
    """A FRED column re-dated to its **knowledge** day, for the as-of join.

    A weekly release publishes several value dates at once, so more than one can
    land on the same knowledge day; the freshest wins, which is exactly what an
    as-of query should return for that day. The series therefore gets shorter,
    not wrong — the panel asks "what did we know on this session", and this
    answers it.
    """
    ledger = load_first_seen()
    rows = {
        fred_knowledge_date(column, date.fromisoformat(r["date"]), ledger): float(r[column])
        for r in csv.DictReader((DATA / f"fred_{column}.csv").open(encoding="utf-8"))
    }
    return Series.of(name, rows)


def read_fred_known_by(column: str, name: str, known_by: date | None) -> Series:
    """A FRED column on its own **value** dates, carrying only what was published
    by `known_by`.

    The reasoning brief quotes 1- and 5-session moves, so the series' shape has
    to survive: re-dating a weekly release would turn "five sessions" into five
    weeks. Filtering instead of shifting keeps the calendar and still lets
    nothing unpublished through.
    """
    ledger = load_first_seen()
    rows = {}
    for r in csv.DictReader((DATA / f"fred_{column}.csv").open(encoding="utf-8")):
        value_date = date.fromisoformat(r["date"])
        if known_by is None or fred_knowledge_date(column, value_date, ledger) <= known_by:
            rows[value_date] = float(r[column])
    return Series.of(name, rows)


def load_series() -> tuple[Series, list[Series]]:
    """Gold plus the ten covariates, FRED re-dated to knowledge days (L4)."""
    gold = read_metal("gold")
    covariates = [
        # Sister metals and the FX leg share gold's calendar and fix exactly —
        # same source, same instant, so no re-dating. USD/RUB is a first-class
        # covariate rather than a cross-check: the target is priced in roubles,
        # so part of every move in gold_rub *is* a move in the rouble.
        read_metal("silver"),
        read_metal("platinum"),
        read_metal("palladium"),
        read_simple("fx_usdrub_cbr.csv", "usd_rub", "usd_rub"),
        # US series: different holidays (hence the as-of join) and a different
        # clock (hence knowledge days rather than value days).
        read_fred("dgs10", "nominal_10y"),
        read_fred("dfii10", "real_10y"),
        read_fred("dtwexbgs", "dollar_index"),
        read_fred("dcoilwtico", "wti"),
        read_fred("vixcls", "vix"),
        read_fred("dexinus", "usd_inr"),
    ]
    return gold, covariates


def load_panel() -> Panel:
    gold, covariates = load_series()
    return align(gold, covariates)


#: The related-market roster the reasoning brief quotes (P8e): every series the
#: POC tracks, plus the macro complex. `pct` rows are percent moves; `pp` rows
#: are level deltas in percentage points — a yield's percent-change is noise
#: around zero, so the delta is the honest unit.
CONTEXT_ROSTER: tuple[tuple[str, str], ...] = (
    ("gold", "pct"),
    ("silver", "pct"),
    ("usd_rub", "pct"),
    ("usd_inr", "pct"),
    ("wti", "pct"),
    ("dollar_index", "pct"),
    ("vix", "pct"),
    ("real_10y", "pp"),
)


def pct_move(prev: float, current: float) -> float:
    return (current / prev - 1.0) * 100.0


def recent_moves(dates: list[str], values: list[float], sessions: int) -> list[tuple[str, float]]:
    """The last `sessions` daily percent moves, oldest first, dated by the
    session each move landed on. Pure, so the brief's inputs are testable."""
    out: list[tuple[str, float]] = []
    for i in range(max(1, len(values) - sessions), len(values)):
        out.append((dates[i], pct_move(values[i - 1], values[i])))
    return out


def _context_series(known_by: date | None = None) -> dict[str, Series]:
    """The roster the brief quotes, with every FRED series cut to what had been
    published by `known_by` (L4). CBR series share the target's own fix and are
    knowable on their value date, so they pass through untouched."""
    return {
        "gold": read_metal("gold"),
        "silver": read_metal("silver"),
        "usd_rub": read_simple("fx_usdrub_cbr.csv", "usd_rub", "usd_rub"),
        "usd_inr": read_fred_known_by("dexinus", "usd_inr", known_by),
        "wti": read_fred_known_by("dcoilwtico", "wti", known_by),
        "dollar_index": read_fred_known_by("dtwexbgs", "dollar_index", known_by),
        "vix": read_fred_known_by("vixcls", "vix", known_by),
        "real_10y": read_fred_known_by("dfii10", "real_10y", known_by),
    }


def _cut(series: Series, as_of: date | None) -> tuple[list[str], list[float]]:
    """One series as (iso dates, values), truncated to knowledge dates at or
    before `as_of`.

    The truncation is the whole point (defect D1, found 2026-08-18). Without
    it every roster series was read at *its own* latest date, so for any
    instrument whose own data lags the wall clock — USD/INR on H.10's weekly
    cadence, WTI on EIA's — the brief carried moves and events dated after the
    anchor, sometimes after the very session the bet was being graded against.
    The numeric rungs never had that information; the reasoning rung must not
    either. Series are ascending, so the first date past the cut ends the walk.
    """
    dates: list[str] = []
    values: list[float] = []
    for day, value in zip(series.dates, series.values, strict=True):
        if as_of is not None and day > as_of:
            break
        dates.append(day.isoformat())
        values.append(float(value))
    return dates, values


#: How many recent anchors get a graded horizon move in `horizon_moves`.
GRADED_ANCHORS = 40


def market_context(instrument: str, sessions: int = 10, as_of: str | None = None) -> dict:
    """What the reasoning brief may say about the market itself (P8e).

    Everything leaves here as a MOVE — a percent change, or a pp delta for the
    yield — never a level. The brief travels to a hosted model and is recorded
    locally, and moves are the derived form the publication boundary already
    blesses for committed work (REQ-1106/1107); raw levels enter no prompt.

    `as_of` is the anchor the bet is being placed for. Every series is cut to
    knowledge dates at or before it (D1) — pass it always; the default of None
    exists only for ad-hoc inspection.

    - `recent`: the target's own last daily moves, oldest first.
    - `related`: every other series' 1- and 5-session move at its own latest
      published date **at or before the anchor**.
    - `horizon_moves`: {horizon: {anchor date: percent move over that many
      sessions}} — keyed by the day the bet was placed, so a t+5 bet is graded
      against the five-session move and not, as before defect D2, against the
      single day the horizon happened to land on.
    - `context_through`: the newest knowledge date anything here rests on. It
      rides in the seal so a reader can see the information set a bet had.
    """
    cut = date.fromisoformat(as_of) if as_of else None
    roster = _context_series(known_by=cut)
    target = load_univariate(instrument) if instrument in UNIVARIATE_SERIES else roster[instrument]
    t_dates, t_values = _cut(target, cut)

    related = []
    for name, kind in CONTEXT_ROSTER:
        if name == instrument:
            continue
        dates, values = _cut(roster[name], cut)
        if len(values) < 6:
            continue
        if kind == "pp":
            d1, d5 = values[-1] - values[-2], values[-1] - values[-6]
        else:
            d1, d5 = pct_move(values[-2], values[-1]), pct_move(values[-6], values[-1])
        related.append({"name": name, "kind": kind, "date": dates[-1], "d1": d1, "d5": d5})

    horizon_moves: dict[str, dict[str, float]] = {}
    for h in (1, 5):
        moves: dict[str, float] = {}
        for i in range(max(0, len(t_values) - GRADED_ANCHORS - h), len(t_values) - h):
            moves[t_dates[i]] = pct_move(t_values[i], t_values[i + h])
        horizon_moves[str(h)] = moves

    known = [row["date"] for row in related] + ([t_dates[-1]] if t_dates else [])
    return {
        "recent": recent_moves(t_dates, t_values, sessions),
        "related": related,
        "horizon_moves": horizon_moves,
        "context_through": max(known) if known else None,
    }
