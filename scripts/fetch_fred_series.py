#!/usr/bin/env python3
"""Fetch the five FRED regime covariates into the gitignored data/ directory.

**A one-off acquisition helper, not the production ingest path.** The real fetcher
is T3.5 and carries validation, bitemporal stamping and the AsOfRepository write
path. This exists to give the gold POC a covariate set.

Run:  python scripts/fetch_fred_series.py
Out:  data/fred_<series>.csv   (gitignored — the fetcher is committed, not the data)

SERIES, and why these five
--------------------------
REQ-205 fixes the set and its order. For gold specifically the load-bearing two are
DFII10 (real yields — gold's opportunity cost) and DTWEXBGS (the dollar it is priced
against). VIXCLS is a risk proxy and DCOILWTICO an inflation proxy.

TERMS — checked 2026-08-13, per source, from FRED's own series pages
--------------------------------------------------------------------
FRED marks third-party series with the tag `Copyrighted: Citation Required` and a
banner reading "Data in this graph are copyrighted." Four of the five carry neither:

    DGS10       Board of Governors of the Federal Reserve System (US)  — unrestricted
    DFII10      Board of Governors of the Federal Reserve System (US)  — unrestricted
    DTWEXBGS    Board of Governors of the Federal Reserve System (US)  — unrestricted
    DCOILWTICO  U.S. Energy Information Administration                 — unrestricted
    VIXCLS      Chicago Board Options Exchange                         — RESTRICTED

VIXCLS states: "Copyright, 2016, Chicago Board Options Exchange, Inc. Reprinted with
permission."

This script therefore **refuses any series not in RESTRICTIONS below**, so adding a
sixth series is a deliberate act that forces someone to check its terms first. That
is the mechanical form of DATA_SOURCES.md open question 1 — see ADR-0050, which
scopes the gate to *publishing* data rather than using it.

Restricted series are fetched for local model input, which is a use and not a
redistribution. **Publishing the VIXCLS series itself, or any artefact from which it
could be reconstructed, is a separate act and is not cleared by this note.**
"""

from __future__ import annotations

import csv
import io
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data"
UA = {"User-Agent": "FinEvents-research/0.1 (+https://github.com/itamittech/finevents)"}
START = date(2015, 1, 1)  # matches the metals series; GDELT 2.0 begins Feb 2015

# Keyless CSV endpoint. The FRED API needs a key; this does not.
FREDGRAPH = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}&cosd={start}"

# series -> (attribution required?, source organisation)
# Verified from each series page on 2026-08-13. A series absent from this map is
# refused rather than guessed at.
RESTRICTIONS: dict[str, tuple[bool, str]] = {
    "DGS10": (False, "Board of Governors of the Federal Reserve System (US)"),
    "DFII10": (False, "Board of Governors of the Federal Reserve System (US)"),
    "DTWEXBGS": (False, "Board of Governors of the Federal Reserve System (US)"),
    "DCOILWTICO": (False, "U.S. Energy Information Administration"),
    "VIXCLS": (True, "Chicago Board Options Exchange"),
    # INR per USD. Checked 2026-08-13: no copyright banner, no restriction tag.
    # Relevant to the MCX gold INR instrument (REQ-202) rather than to the CBR
    # rouble series — for a RUB-denominated target, USD/RUB is the FX leg that
    # actually sits inside the price.
    "DEXINUS": (False, "Board of Governors of the Federal Reserve System (US)"),
}

CITATIONS = {
    "VIXCLS": (
        "Chicago Board Options Exchange, CBOE Volatility Index: VIX [VIXCLS], "
        "retrieved from FRED, Federal Reserve Bank of St. Louis. "
        "Copyright, 2016, Chicago Board Options Exchange, Inc. Reprinted with permission."
    ),
}


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:  # noqa: S310 - fixed https host
        return r.read().decode("utf-8", errors="replace")


def fetch(series: str) -> list[dict[str, str]]:
    """Daily observations for one series. FRED writes '.' for a missing day."""
    if series not in RESTRICTIONS:
        raise SystemExit(
            f"{series} is not in RESTRICTIONS. Check its FRED page for the tag "
            f"'Copyrighted: Citation Required' and add it deliberately — the point "
            f"of this refusal is that terms get checked before data is acquired "
            f"(DATA_SOURCES.md question 1, ADR-0050)."
        )

    text = get(FREDGRAPH.format(series=series, start=START.isoformat()))
    rows: list[dict[str, str]] = []
    for row in csv.DictReader(io.StringIO(text)):
        fields = list(row.values())
        observation_date, value = fields[0], fields[1]
        if value in (".", "", None):
            continue  # a market holiday. Never interpolated (REQ-209)
        rows.append({"date": observation_date, series.lower(): value})
    return rows


def write(series: str, rows: list[dict[str, str]]) -> Path:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"fred_{series.lower()}.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["date", series.lower()])
        writer.writeheader()
        writer.writerows(rows)
    return path


FIRST_SEEN = OUT / "fred_first_seen.csv"


def record_first_seen(series: str, rows: list[dict], today: date) -> int:
    """Append the value dates we are seeing for the first time, stamped today.

    This is the POC's small version of ADR-0016's knowledge time: a modelled lag
    is a guess that can be too small — and was (review finding L4) — while an
    observation cannot. It only ever grows forward, so history still needs the
    measured bounds in `gold_poc_data.FRED_PUBLICATION_LAG_DAYS`.
    """
    key = series.lower()
    known: set[str] = set()
    if FIRST_SEEN.exists():
        known = {
            r["value_date"]
            for r in csv.DictReader(FIRST_SEEN.open(encoding="utf-8"))
            if r["series"] == key
        }
    fresh = [r["date"] for r in rows if r["date"] not in known]
    if not fresh:
        return 0
    OUT.mkdir(exist_ok=True)
    new_file = not FIRST_SEEN.exists()
    with FIRST_SEEN.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if new_file:
            writer.writerow(["series", "value_date", "first_seen"])
        for value_date in sorted(fresh):
            writer.writerow([key, value_date, today.isoformat()])
    return len(fresh)


def main(argv: list[str]) -> int:
    wanted = argv or list(RESTRICTIONS)
    today = date.today()
    print(f"FRED daily series from {START.isoformat()}\n")

    for series in wanted:
        restricted, source = RESTRICTIONS[series]
        try:
            rows = fetch(series)
        except urllib.error.URLError as exc:
            print(f"  {series:<12} FAILED  {exc}", file=sys.stderr)
            continue

        write(series, rows)
        first = record_first_seen(series, rows, today)
        flag = "RESTRICTED" if restricted else "unrestricted"
        span = f"{rows[0]['date']} -> {rows[-1]['date']}" if rows else "empty"
        seen = f"  +{first} first seen" if first else ""
        print(f"  {series:<12} {len(rows):>5} rows  {span}  [{flag}]  {source}{seen}")
        if restricted:
            print(f"               cite: {CITATIONS[series]}")

    print(f"\nWritten to {OUT} — gitignored. The fetcher is committed, the data is not.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
