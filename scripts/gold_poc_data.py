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

The correction is one day: a FRED observation's **knowledge day** is the
calendar day after its value date, and the panel's as-of join runs on knowledge
days. That is REQ-407 applied across sources — the same rule ADR-0016 builds
into the store, and the one this loader was silently breaking. CBR-sourced
covariates (the sister metals and USD/RUB) share the target's own fix and are
not shifted.
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
FRED_KNOWLEDGE_LAG_DAYS = 1

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
    """One univariate target series, start-trimmed where the registry says so."""
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


def load_series(
    fred_knowledge_lag_days: int = FRED_KNOWLEDGE_LAG_DAYS,
) -> tuple[Series, list[Series]]:
    """Gold plus the ten covariates, FRED re-dated to knowledge days."""
    lag = fred_knowledge_lag_days
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
        read_simple("fred_dgs10.csv", "dgs10", "nominal_10y", knowledge_lag_days=lag),
        read_simple("fred_dfii10.csv", "dfii10", "real_10y", knowledge_lag_days=lag),
        read_simple("fred_dtwexbgs.csv", "dtwexbgs", "dollar_index", knowledge_lag_days=lag),
        read_simple("fred_dcoilwtico.csv", "dcoilwtico", "wti", knowledge_lag_days=lag),
        read_simple("fred_vixcls.csv", "vixcls", "vix", knowledge_lag_days=lag),
        read_simple("fred_dexinus.csv", "dexinus", "usd_inr", knowledge_lag_days=lag),
    ]
    return gold, covariates


def load_panel(fred_knowledge_lag_days: int = FRED_KNOWLEDGE_LAG_DAYS) -> Panel:
    gold, covariates = load_series(fred_knowledge_lag_days)
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


def _context_series() -> dict[str, Series]:
    lag = FRED_KNOWLEDGE_LAG_DAYS
    return {
        "gold": read_metal("gold"),
        "silver": read_metal("silver"),
        "usd_rub": read_simple("fx_usdrub_cbr.csv", "usd_rub", "usd_rub"),
        "usd_inr": read_simple("fred_dexinus.csv", "dexinus", "usd_inr", knowledge_lag_days=lag),
        "wti": read_simple("fred_dcoilwtico.csv", "dcoilwtico", "wti", knowledge_lag_days=lag),
        "dollar_index": read_simple(
            "fred_dtwexbgs.csv", "dtwexbgs", "dollar_index", knowledge_lag_days=lag
        ),
        "vix": read_simple("fred_vixcls.csv", "vixcls", "vix", knowledge_lag_days=lag),
        "real_10y": read_simple("fred_dfii10.csv", "dfii10", "real_10y", knowledge_lag_days=lag),
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
    roster = _context_series()
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
