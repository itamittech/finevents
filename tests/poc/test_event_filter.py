"""The deterministic event filter (P8b, scripts/gdelt_events.py, REQ-301's shape).

The filter is the whole point: it must be explainable in one sentence, drop what
it says it drops, and never leak article text into the published payload.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

from gdelt_events import (  # noqa: E402
    COLUMNS,
    DAILY_CAP,
    MIN_MENTIONS,
    parse_row,
    shortlist,
    to_payload,
)


def row(
    *,
    root: str = "19",
    mentions: int = 500,
    country: str = "IS",
    url: str = "https://example.com/a",
    actor1: str = "COUNTRY A",
    actor2: str = "COUNTRY B",
) -> list[str]:
    columns = [""] * COLUMNS
    columns[1] = "20260812"
    columns[6] = actor1
    columns[16] = actor2
    columns[28] = root
    columns[30] = "-9.5"
    columns[31] = str(mentions)
    columns[34] = "-7.25"
    columns[50] = "Somewhere"
    columns[51] = country
    columns[57] = url
    return columns


def test_high_impact_roots_pass_and_others_do_not() -> None:
    assert parse_row(row(root="19")) is not None  # fighting
    assert parse_row(row(root="14")) is not None  # protest
    assert parse_row(row(root="04")) is None  # consultations are not market shocks
    assert parse_row(row(root="01")) is None


def test_the_mention_floor_holds() -> None:
    assert parse_row(row(mentions=MIN_MENTIONS)) is not None
    assert parse_row(row(mentions=MIN_MENTIONS - 1)) is None


def test_short_or_corrupt_rows_are_dropped_not_fatal() -> None:
    assert parse_row(["only", "three", "columns"]) is None
    bad = row()
    bad[31] = "not-a-number"
    assert parse_row(bad) is None


def test_dedup_keeps_the_most_mentioned_per_root_and_country() -> None:
    events = [
        parse_row(row(mentions=100, url="https://example.com/small")),
        parse_row(row(mentions=900, url="https://example.com/big")),
        parse_row(row(mentions=400, country="LE", url="https://example.com/other")),
    ]
    kept = shortlist(events)
    assert len(kept) == 2
    assert kept[0].mentions == 900  # ranked by mentions, duplicate dropped


def test_the_daily_cap_holds_and_ordering_is_deterministic() -> None:
    events = [
        parse_row(row(root=root, country=f"C{i}", mentions=100 + i, url=f"https://e.com/{i}"))
        for i, root in enumerate(["13", "14", "15", "17", "18", "19", "20"] * 3)
    ]
    kept = shortlist(events)
    assert len(kept) == DAILY_CAP
    assert kept == shortlist(list(reversed(events)))  # input order must not matter


def test_the_payload_carries_metadata_and_urls_never_article_text() -> None:
    payload = to_payload({"2026-08-12": shortlist([parse_row(row())])})
    assert payload["attribution"].startswith("Event data: The GDELT Project")
    event = payload["days"][0]["events"][0]
    assert set(event) == {
        "label",
        "code",
        "actors",
        "place",
        "country",
        "goldstein",
        "mentions",
        "tone",
        "url",
    }
    assert event["url"].startswith("https://")


# --- the window walk: unpublished head days must never blank the shortlist ------


def _zip_of_one_row(day: str) -> bytes:
    import io
    import zipfile

    columns = row()
    columns[1] = day.replace("-", "")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr(f"{columns[1]}.export.CSV", "\t".join(columns) + "\n")
    return buffer.getvalue()


def test_three_unpublished_head_days_do_not_blank_the_window() -> None:
    """The 2026-08-17 review: the walk used to stop after three misses, so a
    late GDELT morning (today, yesterday, the day before all 404) would have
    written an EMPTY shortlist. Now the head misses are skipped and the window
    is filled from the days that ARE published."""
    from datetime import date

    from gdelt_events import collect_window

    today = date(2026, 8, 17)
    published = {date(2026, 8, d).isoformat() for d in range(3, 15)}  # 08-03..08-14

    def fetch(day: date) -> bytes | None:
        return _zip_of_one_row(day.isoformat()) if day.isoformat() in published else None

    days, skipped = collect_window(fetch, today, wanted=7)
    assert skipped == ["2026-08-17", "2026-08-16", "2026-08-15"]  # three head misses
    assert list(days) == [f"2026-08-{d:02d}" for d in range(14, 7, -1)]  # 08-14..08-08
    assert all(len(v) == 1 for v in days.values())


def test_the_lookback_bounds_the_walk_and_a_full_window_stops_early() -> None:
    from datetime import date

    from gdelt_events import LOOKBACK_DAYS, collect_window

    calls: list[date] = []

    def never(day: date) -> None:
        calls.append(day)
        return None

    days, skipped = collect_window(never, date(2026, 8, 17), wanted=7)
    assert days == {} and len(skipped) == LOOKBACK_DAYS + 1  # bounded, degrades to empty
    assert len(calls) == LOOKBACK_DAYS + 1

    calls.clear()

    def always(day: date) -> bytes:
        calls.append(day)
        return _zip_of_one_row(day.isoformat())

    days, skipped = collect_window(always, date(2026, 8, 17), wanted=3)
    assert len(days) == 3 and skipped == [] and len(calls) == 3  # stops when full
