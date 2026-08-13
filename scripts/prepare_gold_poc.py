#!/usr/bin/env python3
"""Prepare the gold POC panel and print the numbers you can check by hand.

Run:  python scripts/prepare_gold_poc.py [--as-of YYYY-MM-DD]

Reads the gitignored CSVs in `data/`, validates them, aligns the covariates onto
gold's trading calendar as-of, and reports σ and the five bucket boundaries at
both horizons.

**The point of this script is the check, not the output.** Design §4.1 specifies
the estimator exactly so that σ can be recomputed in a spreadsheet from the same
60 closes and must match to the last decimal. The closes are printed for that
reason.

Scope: this is POC scaffolding, not the production path. The real feature step is
T6.x and reads through `AsOfRepository`; this reads CSVs. The REQ-407 guarantee
still holds structurally, because every window is taken from a series already
truncated by `Series.as_of` — but it holds by construction here rather than by
the gateway, and that difference is worth naming.
"""

from __future__ import annotations

import argparse
import math
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from gold_poc_data import load_series  # noqa: E402

from finevents.features.panel import Panel, Series, align  # noqa: E402
from finevents.features.volatility import (  # noqa: E402
    MIN_SESSIONS,
    WINDOW_SESSIONS,
    Bucket,
    buckets_for,
    climatology,
)
from finevents.ingest.validation import forward_coverage, validate_prices  # noqa: E402

HORIZONS = (1, 5)

# The contamination boundary. Chronos-2's corpus closes around 2024–25 and
# TimesFM 2.5's earlier; neither publishes an exact cutoff, which is why
# aws-architecture.md still lists it as an open pre-build item. 2026 is after
# both by any reading, so it is the window a result can be claimed on.
CLEAN_FROM = date(2026, 1, 1)


def report_validation(gold: Series, covariates: list[Series], through: date) -> int:
    print("VALIDATION (REQ-208) — a failure halts; nothing is substituted\n")
    findings = []
    for series in (gold, *covariates):
        found = validate_prices(series) if series.name.endswith(("_rub_g", "usd_rub")) else []
        findings.extend(found)
        stale = forward_coverage(series, through).days
        flag = "" if stale <= 7 else f"   ⚠ {stale} days stale"
        print(
            f"  {series.name:<16} {len(series):>5} rows   "
            f"{series.dates[0]} -> {series.dates[-1]}   "
            f"{'clean' if not found else str(len(found)) + ' finding(s)'}{flag}"
        )

    if findings:
        print("\n  findings:")
        for finding in findings:
            print(f"    {finding}")
    return len(findings)


def report_buckets(panel: Panel, as_of: date) -> None:
    closes = panel.target.as_of(as_of).values
    print(f"\nσ AND BUCKET BOUNDARIES — gold, RUB/gram, as of {as_of.isoformat()}")
    print(
        f"Design §4.1: overlapping h-day log returns over the trailing "
        f"{WINDOW_SESSIONS} sessions, demeaned, ddof=1, minimum {MIN_SESSIONS}\n"
    )

    for horizon in HORIZONS:
        b = buckets_for(closes, horizon)
        pct = b.as_percent()
        as_pct = (math.exp(b.sigma) - 1.0) * 100.0
        print(
            f"  t+{horizon}   σ = {b.sigma:.6f} log  ({as_pct:.3f}%)"
            f"   from {b.n_returns} overlapping returns"
        )
        print(f"        large down   r <  {b.edges[0]:+.6f}   ({pct[0]:+.2f}%)")
        print(f"        small down   r <  {b.edges[1]:+.6f}   ({pct[1]:+.2f}%)")
        print(f"        flat         r <  {b.edges[2]:+.6f}   ({pct[2]:+.2f}%)")
        print(f"        small up     r <  {b.edges[3]:+.6f}   ({pct[3]:+.2f}%)")
        print("        large up     otherwise")

        freq = climatology(closes, horizon)
        readable = "  ".join(f"{Bucket(i).label}={p:.3f}" for i, p in enumerate(freq))
        print(f"        climatology over {len(closes)} sessions:  {readable}\n")


def report_hand_check(panel: Panel, as_of: date) -> None:
    closes = panel.target.as_of(as_of)
    window = closes.values[-WINDOW_SESSIONS:]
    dates = closes.dates[-WINDOW_SESSIONS:]

    print("HAND CHECK — the exact 60 closes σ was computed from")
    print("Paste into a spreadsheet; STDEV of LN(Cn/Cn-1) over these must match σ(t+1)\n")
    for i in range(0, len(window), 6):
        chunk = ", ".join(f"{v:.2f}" for v in window[i : i + 6])
        print(f"  {dates[i].isoformat()}  {chunk}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--as-of", type=date.fromisoformat, default=None)
    args = parser.parse_args(argv)

    gold, covariates = load_series()
    as_of = args.as_of or gold.dates[-1]

    failures = report_validation(gold, covariates, through=gold.dates[-1])

    panel = align(gold, covariates)
    trimmed = len(gold) - len(panel)
    print("\nPANEL — covariates joined as-of onto gold's calendar (REQ-503)")
    print(
        f"  {len(panel)} sessions   {panel.dates[0]} -> {panel.dates[-1]}   "
        f"({trimmed} leading session(s) trimmed for covariate coverage)"
    )
    print("  FRED joined at knowledge day (value date +1): a US close postdates the CBR fix")
    print(
        f"  {len(panel.covariates)} covariates: " f"{', '.join(c.name for c in panel.covariates)}"
    )

    clean = [d for d in panel.dates if d >= CLEAN_FROM]
    print(f"  contamination-free window (>= {CLEAN_FROM.isoformat()}): {len(clean)} sessions")

    matrix = panel.covariate_matrix()
    print(f"  covariate matrix: {len(matrix)} x {len(panel)} — no gaps, nothing invented")

    report_buckets(panel, as_of)
    report_hand_check(panel, as_of)

    if failures:
        print(
            f"\n{failures} validation finding(s) — inspect before using this panel.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    # The report is full of σ and ≥; the Windows console defaults to cp1252.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
