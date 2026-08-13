#!/usr/bin/env python3
"""Score every ladder rung on gold, over a rolling window of cut-offs.

Run:  python scripts/evaluate_gold_poc.py [--from 2026-01-01] [--limit N]

At each cut-off the pipeline is exactly what a live run would do: compute σ and
the bucket edges from data up to the cut-off, forecast, convert to bucket
probabilities, and only then look up what actually happened. The realised return
is read *after* the forecast exists, never before.

Six rungs, all scored on identical days:

    all_flat        the trivial baseline ADR-0008 says ±5% would have flattered
    climatology     the honest bar — "a result that does not beat climatology
                    out-of-sample is not a result"
    chronos_uni     gold alone
    chronos_cov     gold + 10 covariates, past-only
    timesfm_uni     gold alone
    timesfm_cov     gold + 10 covariates, future values held flat (ADR-0055)

Scope: POC scaffolding. The production path is T9.x and reads through
`AsOfRepository`; this reads the CSVs. REQ-407 still holds structurally, because
every window comes from a series already truncated by `Series.as_of`.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
import time
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from finevents.features.panel import Panel, Series, align  # noqa: E402
from finevents.features.volatility import (  # noqa: E402
    Bucket,
    buckets_for,
    climatology_from_buckets,
    historical_buckets,
)
from finevents.numeric import Chronos2Forecaster, TimesFMForecaster  # noqa: E402
from finevents.numeric.buckets import flat_distribution, to_bucket_probabilities  # noqa: E402
from finevents.score.rps import (  # noqa: E402
    by_outcome,
    compare_paired,
    ranked_probability_score,
    summarise,
)

DATA = Path(__file__).resolve().parent.parent / "data"
HORIZONS = (1, 5)
CLEAN_FROM = date(2026, 1, 1)
CONTEXT = 512


def read_metal(metal: str) -> Series:
    rows = {
        date.fromisoformat(r["date"]): float(r["sell_rub_g"])
        for r in csv.DictReader((DATA / "metals_cbr_rub.csv").open(encoding="utf-8"))
        if r["metal"] == metal
    }
    return Series.of(f"{metal}_rub_g", rows)


def read_simple(filename: str, column: str, name: str) -> Series:
    rows = {
        date.fromisoformat(r["date"]): float(r[column])
        for r in csv.DictReader((DATA / filename).open(encoding="utf-8"))
    }
    return Series.of(name, rows)


def load_panel() -> Panel:
    gold = read_metal("gold")
    covariates = [
        read_metal("silver"),
        read_metal("platinum"),
        read_metal("palladium"),
        read_simple("fx_usdrub_cbr.csv", "usd_rub", "usd_rub"),
        read_simple("fred_dgs10.csv", "dgs10", "nominal_10y"),
        read_simple("fred_dfii10.csv", "dfii10", "real_10y"),
        read_simple("fred_dtwexbgs.csv", "dtwexbgs", "dollar_index"),
        read_simple("fred_dcoilwtico.csv", "dcoilwtico", "wti"),
        read_simple("fred_vixcls.csv", "vixcls", "vix"),
        read_simple("fred_dexinus.csv", "dexinus", "usd_inr"),
    ]
    return align(gold, covariates)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from", dest="start", type=date.fromisoformat, default=CLEAN_FROM)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--context", type=int, default=CONTEXT)
    args = parser.parse_args(argv)

    panel = load_panel()
    dates, closes = panel.dates, panel.target.values
    matrix = panel.covariate_matrix()

    last = len(closes) - max(HORIZONS) - 1
    cut_offs = [i for i in range(len(closes)) if i <= last and dates[i] >= args.start]
    if args.limit:
        cut_offs = cut_offs[: args.limit]
    if not cut_offs:
        print("no cut-offs in range", file=sys.stderr)
        return 1

    print(f"panel      {len(closes)} sessions, {len(panel.covariates)} covariates")
    print(f"cut-offs   {len(cut_offs)}   {dates[cut_offs[0]]} -> {dates[cut_offs[-1]]}")
    print(f"context    {args.context} sessions\n")

    chronos = Chronos2Forecaster(context_length=args.context)
    timesfm = TimesFMForecaster(context_length=args.context)
    forecasters = [(chronos, False), (chronos, True), (timesfm, False), (timesfm, True)]

    # Computed once over the full series and sliced per cut-off. Each entry
    # depends only on data up to its own index, so the prefix at cut-off i is
    # exactly what recomputing there would give — at O(n) instead of O(n²).
    print("precomputing the climatology bucket history...", flush=True)
    history_buckets = {h: historical_buckets(closes, h) for h in HORIZONS}

    scores: dict[tuple[str, int], list[float]] = {}
    outcomes: dict[int, list] = {h: [] for h in HORIZONS}
    started = time.perf_counter()

    for n, i in enumerate(cut_offs, 1):
        history = closes[: i + 1]
        target_slice = Series(panel.target.name, dates[: i + 1], history)
        covariate_slices = {
            name: Series(name, dates[: i + 1], values[: i + 1]) for name, values in matrix.items()
        }

        for horizon in HORIZONS:
            edges = buckets_for(history, horizon)
            realised = edges.assign(math.log(closes[i + horizon] / closes[i]))
            outcomes[horizon].append(realised)

            distributions = {
                "all_flat": flat_distribution(),
                "climatology": climatology_from_buckets(
                    [b for end, b in history_buckets[horizon] if end <= i]
                ),
            }
            for forecaster, with_covariates in forecasters:
                out = forecaster.forecast(
                    target_slice,
                    covariate_slices if with_covariates else None,
                    list(HORIZONS),
                )
                distributions[out.track] = to_bucket_probabilities(out, horizon, history[-1], edges)

            for track, probabilities in distributions.items():
                scores.setdefault((track, horizon), []).append(
                    ranked_probability_score(probabilities, realised)
                )

        if n % 10 == 0 or n == len(cut_offs):
            rate = (time.perf_counter() - started) / n
            print(f"  {n}/{len(cut_offs)} cut-offs   {rate:.1f} s each", flush=True)

    elapsed = time.perf_counter() - started
    print(f"\nscored in {elapsed / 60:.1f} min\n")

    for horizon in HORIZONS:
        rows = sorted(
            (summarise(track, h, values) for (track, h), values in scores.items() if h == horizon),
            key=lambda s: s.mean,
        )
        baseline = scores[("climatology", horizon)]

        print(f"t+{horizon}   {rows[0].n} unseen days   RPS, lower is better\n")
        head = "vs climatology, PAIRED per day"
        print(f"  {'rung':<14}{'mean':>8}    {head:<34}{'days won':>10}")
        for r in rows:
            if r.track == "climatology":
                print(f"  {r.track:<14}{r.mean:>8.4f}    {'— the bar':<34}{'':>10}")
                continue
            c = compare_paired(
                r.track, "climatology", horizon, scores[(r.track, horizon)], baseline
            )
            lo, hi = c.interval95
            cell = f"{c.mean_difference:+.4f} [{lo:+.4f}, {hi:+.4f}] {c.verdict}"
            print(f"  {r.track:<14}{r.mean:>8.4f}    {cell:<34}{c.wins}/{c.n:>4}")

        print("\n  by what actually happened  (mean RPS; ~60% of days are flat)")
        buckets_seen = sorted(by_outcome(baseline, outcomes[horizon]))
        header = "".join(f"{Bucket(b).label:>14}" for b in buckets_seen)
        print(f"  {'rung':<14}{header}")
        for r in rows:
            split = by_outcome(scores[(r.track, horizon)], outcomes[horizon])
            cells = "".join(f"{sum(split[b]) / len(split[b]):>14.4f}" for b in buckets_seen)
            print(f"  {r.track:<14}{cells}")
        seen = by_outcome(baseline, outcomes[horizon])
        counts = "".join(f"{len(seen[b]):>14}" for b in buckets_seen)
        print(f"  {'n days':<14}{counts}\n")

    print("The paired column is the sharper test: every rung sees identical days, so")
    print("the day-to-day outcome noise cancels instead of swamping the difference.")
    print("`days won` counts days the rung scored strictly better than climatology.")
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
