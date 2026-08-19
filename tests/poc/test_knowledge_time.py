"""Publication lag: nothing enters a computation before it was published (L4).

The 2026-08-18 review found that a single `+1 day` rule covered every FRED
series, and measurement against `data/runner_logs/` showed it was too small for
all six: the dailies land two *business* days later at the 07:15 GMT run, and
the H.10 pair is released weekly, so a Monday value waits until the following
Tuesday. A lag that is too small is a leak — the same defect class as D1, one
layer down.

Two mechanisms, tested here: a conservative per-series bound for history, and a
first-seen ledger that replaces the bound with an observation going forward.
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

import gold_poc_data  # noqa: E402
from gold_poc_data import (  # noqa: E402
    DEFAULT_FRED_LAG_DAYS,
    FRED_PUBLICATION_LAG_DAYS,
    fred_knowledge_date,
    read_fred,
    read_fred_known_by,
    read_simple,
)


def _fake_data(tmp_path, monkeypatch, *, rows: dict[str, float], column: str = "dexinus"):
    """A one-column FRED file in a temporary data directory."""
    lines = ["date," + column] + [f"{d},{v}" for d, v in sorted(rows.items())]
    (tmp_path / f"fred_{column}.csv").write_text("\n".join(lines) + "\n", encoding="utf-8")
    monkeypatch.setattr(gold_poc_data, "DATA", tmp_path)
    monkeypatch.setattr(gold_poc_data, "FIRST_SEEN", tmp_path / "fred_first_seen.csv")
    return tmp_path


# --- the measured bounds --------------------------------------------------------


def test_every_series_carries_a_measured_bound_and_none_is_the_old_one() -> None:
    for column, lag in FRED_PUBLICATION_LAG_DAYS.items():
        assert lag > 1, f"{column} still uses the superseded one-day assumption"
    # the dailies are cheaper than the weekly releases, as measured
    assert FRED_PUBLICATION_LAG_DAYS["dgs10"] < FRED_PUBLICATION_LAG_DAYS["dexinus"]
    assert max(FRED_PUBLICATION_LAG_DAYS.values()) - 1 <= DEFAULT_FRED_LAG_DAYS


def test_an_unmeasured_series_is_treated_as_weekly_until_it_is_measured() -> None:
    unmeasured = fred_knowledge_date("brand_new_series", date(2026, 8, 10), {})
    assert (unmeasured - date(2026, 8, 10)).days == DEFAULT_FRED_LAG_DAYS


def test_the_ledger_replaces_the_bound_with_an_observation(tmp_path, monkeypatch) -> None:
    _fake_data(tmp_path, monkeypatch, rows={"2026-08-10": 87.0})
    (tmp_path / "fred_first_seen.csv").write_text(
        "series,value_date,first_seen\ndexinus,2026-08-10,2026-08-11\n", encoding="utf-8"
    )
    ledger = gold_poc_data.load_first_seen()
    # observed the very next day, far tighter than the conservative eight
    assert fred_knowledge_date("dexinus", date(2026, 8, 10), ledger) == date(2026, 8, 11)
    # a value the ledger has never seen still falls back to the bound
    assert fred_knowledge_date("dexinus", date(2026, 8, 17), ledger) == date(2026, 8, 25)


# --- the two readers ------------------------------------------------------------


def test_known_by_keeps_value_dates_and_drops_what_was_not_published(tmp_path, monkeypatch) -> None:
    """The brief quotes 1- and 5-session moves, so the series' shape has to
    survive the cut; re-dating a weekly release would turn five sessions into
    five weeks."""
    _fake_data(
        tmp_path,
        monkeypatch,
        rows={"2026-08-03": 1.0, "2026-08-04": 2.0, "2026-08-05": 3.0},
    )
    # dexinus carries an eight-day bound: 08-03 is knowable 08-11, 08-04 on 08-12
    series = read_fred_known_by("dexinus", "usd_inr", date(2026, 8, 11))
    assert [d.isoformat() for d in series.dates] == ["2026-08-03"]
    assert series.values == (1.0,)

    later = read_fred_known_by("dexinus", "usd_inr", date(2026, 8, 13))
    assert [d.isoformat() for d in later.dates] == ["2026-08-03", "2026-08-04", "2026-08-05"]

    everything = read_fred_known_by("dexinus", "usd_inr", None)
    assert len(everything.dates) == 3  # no anchor, no cut - inspection only


def test_the_as_of_reader_redates_and_keeps_the_freshest_of_a_batch(tmp_path, monkeypatch) -> None:
    """A weekly release publishes several value dates at once. On the day they
    land, an as-of query should return the freshest of them."""
    _fake_data(tmp_path, monkeypatch, rows={"2026-08-03": 1.0, "2026-08-04": 2.0})
    (tmp_path / "fred_first_seen.csv").write_text(
        "series,value_date,first_seen\n"
        "dexinus,2026-08-03,2026-08-10\n"
        "dexinus,2026-08-04,2026-08-10\n",
        encoding="utf-8",
    )
    series = read_fred("dexinus", "usd_inr")
    assert [d.isoformat() for d in series.dates] == ["2026-08-10"]
    assert series.values == (2.0,)  # the later value date wins on the shared day


def test_cbr_series_are_never_shifted(tmp_path, monkeypatch) -> None:
    """They share the target's own fix, so their value date IS their knowledge
    date. Shifting them would be a fabricated lag."""
    (tmp_path / "fx.csv").write_text("date,usd_rub\n2026-08-10,84.5\n", encoding="utf-8")
    monkeypatch.setattr(gold_poc_data, "DATA", tmp_path)
    series = read_simple("fx.csv", "usd_rub", "usd_rub")
    assert [d.isoformat() for d in series.dates] == ["2026-08-10"]
