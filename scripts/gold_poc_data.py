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
