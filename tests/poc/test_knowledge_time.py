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
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

import fetch_fred_series  # noqa: E402
import gold_poc_data  # noqa: E402

#: The harness collapses newline escapes inside heredocs, so this module
#: builds multi-line fixtures by concatenation instead.
NL = chr(10)
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


# --- the 2026-08-20 outage: a ledger row that is not an observation -------------
#
# L4 shipped a ledger with no bootstrap rule. Its FIRST write - on 2026-08-20, the
# first run of the post-L4 fetcher - stamped all eleven years of every series with
# that morning's date. read_fred re-dates each value to its knowledge day, so all
# ~2,900 points per series collapsed onto one day, the panel intersected to a
# single session, and sigma abstained by construction (40 required). Nothing
# sealed, and every later run would have failed identically.
#
# Nothing was corrupted and nothing was lost: the file had never existed before,
# so a fresh clone would have hit this on its first fetch just the same.


def test_a_row_later_than_the_bound_is_not_an_observation() -> None:
    """The poison, in one assertion. A 2015 value cannot become knowable in 2026;
    such a row records our download, not the publisher's release."""
    poisoned = {("dgs10", date(2015, 1, 2)): date(2026, 8, 20)}
    assert fred_knowledge_date("dgs10", date(2015, 1, 2), poisoned) == date(2015, 1, 6)


def test_a_row_inside_the_bound_still_tightens_it() -> None:
    """The ledger keeps its whole purpose - it may still beat the bound."""
    observed = {("dtwexbgs", date(2026, 8, 14)): date(2026, 8, 16)}
    # the bound would say 08-22; the observation says 08-16 and wins
    assert fred_knowledge_date("dtwexbgs", date(2026, 8, 14), observed) == date(2026, 8, 16)


def test_a_poisoned_ledger_cannot_collapse_a_series(tmp_path, monkeypatch) -> None:
    """The regression, in the shape that actually happened: every value date
    stamped today. The series must keep its points, not shrink to one."""
    value_dates = [date(2026, 5, 4) + timedelta(days=n) for n in range(60)]
    _fake_data(
        tmp_path,
        monkeypatch,
        rows={d.isoformat(): float(i) for i, d in enumerate(value_dates)},
        column="dgs10",
    )
    (tmp_path / "fred_first_seen.csv").write_text(
        "series,value_date,first_seen"
        + NL
        + "".join(f"dgs10,{d.isoformat()},2026-08-20" + NL for d in value_dates),
        encoding="utf-8",
    )
    series = read_fred("dgs10", "real_10y")
    assert len(series.dates) == len(value_dates), "the series collapsed - L4's outage is back"


def test_no_knowledge_day_can_absorb_more_than_the_bound(tmp_path, monkeypatch) -> None:
    """The structural guarantee behind the test above: at most `lag + 1`
    consecutive value dates can share a knowledge day, whatever the ledger says.
    This is why the collapse is now impossible rather than merely repaired."""
    value_dates = [date(2026, 5, 4) + timedelta(days=n) for n in range(60)]
    _fake_data(
        tmp_path,
        monkeypatch,
        rows={d.isoformat(): float(i) for i, d in enumerate(value_dates)},
        column="dexinus",
    )
    (tmp_path / "fred_first_seen.csv").write_text(
        "series,value_date,first_seen"
        + NL
        + "".join(f"dexinus,{d.isoformat()},2026-08-20" + NL for d in value_dates),
        encoding="utf-8",
    )
    ledger = gold_poc_data.load_first_seen()
    per_day: dict[date, int] = {}
    for d in value_dates:
        known = fred_knowledge_date("dexinus", d, ledger)
        per_day[known] = per_day.get(known, 0) + 1
    assert max(per_day.values()) <= FRED_PUBLICATION_LAG_DAYS["dexinus"] + 1


# --- the bootstrap: the fetcher must never stamp a backfill ---------------------


def test_the_first_download_stamps_only_what_it_could_have_witnessed(tmp_path, monkeypatch) -> None:
    """The fix at source. A first download returns the whole history; only the
    tail within the series' bound is something today could have published."""
    monkeypatch.setattr(fetch_fred_series, "OUT", tmp_path)
    monkeypatch.setattr(fetch_fred_series, "FIRST_SEEN", tmp_path / "fred_first_seen.csv")
    today = date(2026, 8, 20)
    rows = [{"date": (date(2015, 1, 2) + timedelta(days=n)).isoformat()} for n in range(5000)]
    rows = [r for r in rows if date.fromisoformat(r["date"]) <= today]

    recorded, backfilled = fetch_fred_series.record_first_seen("DGS10", rows, today)

    assert backfilled > 3000, "the history should be recognised as backfill"
    # dgs10 carries a four-day bound: 08-16..08-20 inclusive
    assert recorded == 5, recorded
    written = (tmp_path / "fred_first_seen.csv").read_text(encoding="utf-8").splitlines()
    assert written[1] == "dgs10,2026-08-16,2026-08-20"
    assert all(
        date(2026, 8, 20) - date.fromisoformat(line.split(",")[1]) <= timedelta(days=4)
        for line in written[1:]
    )


def test_a_second_download_adds_only_the_new_day(tmp_path, monkeypatch) -> None:
    """Forward growth is the ledger's one honest mode."""
    monkeypatch.setattr(fetch_fred_series, "OUT", tmp_path)
    monkeypatch.setattr(fetch_fred_series, "FIRST_SEEN", tmp_path / "fred_first_seen.csv")
    rows = [{"date": "2026-08-17"}, {"date": "2026-08-18"}]
    fetch_fred_series.record_first_seen("DGS10", rows, date(2026, 8, 19))

    rows.append({"date": "2026-08-19"})
    recorded, backfilled = fetch_fred_series.record_first_seen("DGS10", rows, date(2026, 8, 20))
    assert (recorded, backfilled) == (1, 0)
    written = (tmp_path / "fred_first_seen.csv").read_text(encoding="utf-8").splitlines()
    assert written[-1] == "dgs10,2026-08-19,2026-08-20"
