#!/usr/bin/env python3
"""The GDELT event feed: fetch, filter deterministically, publish the shortlist (P8b).

Run:  python scripts/gdelt_events.py [--days 7]

This is increment 5 pulled forward onto the POC: REQ-301's shape — reduce the
event firehose with **pure code, no model**, to a shortlist small enough that a
human can read all of it and judge whether the filter is sane. Every threshold
is a named constant below; nothing is learned, nothing is prompted.

**Cache.** One GDELT v1 daily export per day lands in `data/gdelt/` (gitignored —
raw acquired data, ADR-0044). A day's file is fetched once; the daily run then
downloads only the day it is missing. GDELT publishes day X's file at **07:00 GMT
on X+1** (measured from Last-Modified headers, 2026-08-17: 07:00:11, 07:00:06,
07:00:07 on consecutive days), so "today" is never there and "yesterday" only
after 07:00 GMT — a skip, not an error. The window is the newest `--days`
published days found within a bounded look-back; unpublished head days do not
shorten it. Before 2026-08-17 three consecutive misses ended the walk, which
would have written an EMPTY shortlist on any morning GDELT ran late — found on
review, fixed the same day.

**Filter.** Keep rows whose CAMEO root code is in HIGH_IMPACT (military posture,
threats, protests, coercion, assaults, fights, mass violence) with at least
MIN_MENTIONS mentions; rank by mentions; keep the most-mentioned row per
(root code, country) per day; cap at DAILY_CAP per day. The 10–20 events/day
target comes from the project brief.

**Publication boundary.** `ui/data/events.js` carries event *metadata* and
source URLs only — never article text (REQ-1107/1108) — with GDELT's
dataset-level attribution embedded (DATA_SOURCES.md question 2, answered
2026-08-13).
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import urllib.error
import urllib.request
import zipfile
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "gdelt"
OUT = ROOT / "ui" / "data" / "events.js"
BASE_URL = "http://data.gdeltproject.org/events/{stamp}.export.CSV.zip"

#: CAMEO root codes kept — the kinds of events the brief's "10–20 high-impact
#: events" describes. Codes are the CAMEO taxonomy's conflict end.
HIGH_IMPACT = {
    "13": "Threat",
    "14": "Protest",
    "15": "Military posture",
    "17": "Coercion",
    "18": "Assault",
    "19": "Fighting",
    "20": "Mass violence",
}
MIN_MENTIONS = 50
DAILY_CAP = 12
#: How many calendar days back the walk may look for `--days` published days.
#: Bounded so a long GDELT outage degrades to a shorter window rather than an
#: unbounded crawl; cached days cost nothing to revisit.
LOOKBACK_DAYS = 14

#: GDELT v1 daily export column positions (58 tab-separated columns, no header).
COL_DATE = 1
COL_ACTOR1_NAME = 6
COL_ACTOR2_NAME = 16
COL_ROOT_CODE = 28
COL_GOLDSTEIN = 30
COL_MENTIONS = 31
COL_TONE = 34
COL_ACTION_NAME = 50
COL_ACTION_COUNTRY = 51
COL_SOURCE_URL = 57
COLUMNS = 58

ATTRIBUTION = (
    "Event data: The GDELT Project (gdeltproject.org) — open data, unrestricted use, "
    "dataset-level attribution per DATA_SOURCES.md"
)


@dataclass(frozen=True, slots=True)
class Event:
    day: str
    code: str
    label: str
    actors: str
    place: str
    country: str
    goldstein: float
    mentions: int
    tone: float
    url: str


def parse_row(columns: list[str]) -> Event | None:
    """One raw GDELT row → an Event, or None if the filter drops it."""
    if len(columns) < COLUMNS:
        return None
    code = columns[COL_ROOT_CODE]
    if code not in HIGH_IMPACT:
        return None
    try:
        mentions = int(columns[COL_MENTIONS])
        goldstein = float(columns[COL_GOLDSTEIN] or 0.0)
        tone = float(columns[COL_TONE] or 0.0)
    except ValueError:
        return None
    if mentions < MIN_MENTIONS:
        return None
    raw_day = columns[COL_DATE]
    actors = " / ".join(a for a in (columns[COL_ACTOR1_NAME], columns[COL_ACTOR2_NAME]) if a)
    return Event(
        day=f"{raw_day[:4]}-{raw_day[4:6]}-{raw_day[6:8]}",
        code=code,
        label=HIGH_IMPACT[code],
        actors=actors or "(unnamed actors)",
        place=columns[COL_ACTION_NAME] or "",
        country=columns[COL_ACTION_COUNTRY] or "",
        goldstein=goldstein,
        mentions=mentions,
        tone=round(tone, 1),
        url=columns[COL_SOURCE_URL],
    )


def shortlist(events: list[Event], cap: int = DAILY_CAP) -> list[Event]:
    """The most-mentioned event per (root, country), capped — deterministically.

    Ties break by URL so identical inputs always give identical output; a
    shortlist that reshuffles on re-run would make the sealed record unstable.
    """
    best: dict[tuple[str, str], Event] = {}
    for event in events:
        key = (event.code, event.country)
        current = best.get(key)
        if current is None or (event.mentions, event.url) > (current.mentions, current.url):
            best[key] = event
    ranked = sorted(best.values(), key=lambda e: (-e.mentions, e.code, e.url))
    return ranked[:cap]


def to_payload(days: dict[str, list[Event]]) -> dict:
    return {
        "attribution": ATTRIBUTION,
        "filter": {
            "roots": {code: label for code, label in sorted(HIGH_IMPACT.items())},
            "min_mentions": MIN_MENTIONS,
            "cap_per_day": DAILY_CAP,
        },
        "days": [
            {
                "date": day,
                "events": [
                    {
                        "label": e.label,
                        "code": e.code,
                        "actors": e.actors,
                        "place": e.place,
                        "country": e.country,
                        "goldstein": e.goldstein,
                        "mentions": e.mentions,
                        "tone": e.tone,
                        "url": e.url,
                    }
                    for e in events
                ],
            }
            for day, events in sorted(days.items(), reverse=True)
        ],
    }


def fetch_day(day: date) -> bytes | None:
    """The day's zip from cache or the wire; None when GDELT has not published it."""
    CACHE.mkdir(parents=True, exist_ok=True)
    stamp = day.strftime("%Y%m%d")
    cached = CACHE / f"{stamp}.export.CSV.zip"
    if cached.exists():
        return cached.read_bytes()
    try:
        with urllib.request.urlopen(BASE_URL.format(stamp=stamp), timeout=60) as response:
            content = response.read()
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None  # not published yet — normal for today, sometimes yesterday
        raise
    cached.write_bytes(content)
    return content


def events_from_zip(content: bytes) -> list[Event]:
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        name = archive.namelist()[0]
        text = archive.read(name).decode("utf-8", errors="replace")
    reader = csv.reader(io.StringIO(text), delimiter="\t")
    return [event for row in reader if (event := parse_row(row)) is not None]


def collect_window(
    fetch, today: date, wanted: int, lookback: int = LOOKBACK_DAYS
) -> tuple[dict[str, list[Event]], list[str]]:
    """The newest `wanted` published days within `lookback` calendar days.

    Walks back from `today`; a day `fetch` cannot supply is skipped, not counted
    against the window — GDELT's head days are unpublished by construction, and
    a late morning must never blank the shortlist. Returns (days, skipped) so
    the caller can print what was not there.
    """
    days: dict[str, list[Event]] = {}
    skipped: list[str] = []
    for back in range(lookback + 1):
        if len(days) == wanted:
            break
        probe = today - timedelta(days=back)
        content = fetch(probe)
        if content is None:
            skipped.append(probe.isoformat())
            continue
        days[probe.isoformat()] = shortlist(events_from_zip(content))
    return days, skipped


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=7)
    args = parser.parse_args(argv)

    days, skipped = collect_window(fetch_day, date.today(), args.days)
    for day, selected in days.items():
        print(f"  {day}  {len(selected):>2} events kept")
    if skipped:
        print(f"  not yet published: {', '.join(skipped)}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "window.POC_EVENTS = " + json.dumps(to_payload(days), indent=1) + ";\n",
        encoding="utf-8",
    )
    total = sum(len(v) for v in days.values())
    print(f"\nevent shortlist -> {OUT}   ({total} events over {len(days)} day(s))")
    print(f"  {ATTRIBUTION}")
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
