#!/usr/bin/env python3
"""Score every ladder rung on gold, over a rolling window of cut-offs.

Run:  python scripts/evaluate_gold_poc.py [--from 2026-01-01] [--limit N]

At each cut-off the pipeline is exactly what a live run would do: compute σ and
the bucket edges from data up to the cut-off, forecast, convert to bucket
probabilities, and only then look up what actually happened. The realised return
is read *after* the forecast exists, never before.

Seven rungs, all scored on identical days:

    all_flat          the trivial baseline ADR-0008 says ±5% would have flattered
    climatology       the honest bar — "a result that does not beat climatology
                      out-of-sample is not a result"
    cond_climatology  rung 2 — conditioned on the real-yield × VIX regime (§4.10)
    chronos_uni       gold alone
    chronos_cov       gold + 10 covariates, past-only
    timesfm_uni       gold alone
    timesfm_cov       gold + 10 covariates, future values held flat (ADR-0055)

Covariates join in **knowledge time** (`gold_poc_data` — FRED value date +1 day;
a US close postdates the CBR fix it used to sit beside). Paired standard errors
are Newey–West with lag = horizon−1, because t+5 is scored daily while each
outcome spans five sessions, so adjacent differences overlap by construction.

Scope: POC scaffolding. The production path is T9.x and reads through
`AsOfRepository`; this reads the CSVs. REQ-407 still holds structurally, because
every window comes from a series already truncated by `Series.as_of` — and, per
the same rule, the cross-source join runs on knowledge days, not value days.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from gold_poc_data import load_panel  # noqa: E402

from finevents.features.conditional import (  # noqa: E402
    DayFeatures,
    conditional_climatology,
    regime_history,
)
from finevents.features.panel import Series  # noqa: E402
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

HORIZONS = (1, 5)
CLEAN_FROM = date(2026, 1, 1)
CONTEXT = 512

#: Display order for the dashboard — baselines, then models, then the floor.
RUNG_ORDER = (
    "climatology",
    "cond_climatology",
    "chronos_uni",
    "timesfm_uni",
    "chronos_cov",
    "timesfm_cov",
    "all_flat",
)


def emit_ui_data(
    path: Path,
    *,
    dates: tuple[date, ...],
    cut_offs: list[int],
    scores: dict[tuple[str, int], list[float]],
    outcomes: dict[int, list],
    levels_used: dict[tuple[int, int], int],
    context: int,
    n_min: int,
) -> None:
    """Persist the run for the dashboard (`ui/index.html`) as a JS global.

    A `<script src>` global rather than fetch-able JSON, because the POC page
    must open from `file://` with no server — browsers block fetch on local
    files — and must work unchanged from S3 later (ADR-0020).

    Publication boundary (REQ-1106/1107): everything emitted is derived work —
    scores, probabilities, verdicts, dates. **No raw closes and no VIXCLS
    values.** The regime cell's numeric inputs would be the tempting leak and
    are omitted; only backoff-level counts appear. `generated` is the panel's
    last session rather than wall clock, so a re-run over the same data is
    byte-identical (the same property REQ-507 demands of the forecasts).
    """
    tracks = sorted({track for track, _ in scores})
    ordered = [r for r in RUNG_ORDER if r in tracks] + [t for t in tracks if t not in RUNG_ORDER]

    ladder: dict[str, list[dict]] = {}
    for h in HORIZONS:
        baseline = scores[("climatology", h)]
        rows: list[dict] = []
        for track in ordered:
            values = scores[(track, h)]
            row: dict = {"rung": track, "mean": round(sum(values) / len(values), 6)}
            if track == "climatology":
                row["baseline"] = True
            else:
                c = compare_paired(track, "climatology", h, values, baseline, hac_lag=h - 1)
                lo, hi = c.interval95
                row.update(
                    diff=round(c.mean_difference, 6),
                    lo=round(lo, 6),
                    hi=round(hi, 6),
                    verdict=c.verdict,
                    wins=c.wins,
                    n=c.n,
                )
            rows.append(row)
        rows.sort(key=lambda r: r["mean"])
        ladder[str(h)] = rows

    daily = []
    for position, i in enumerate(cut_offs):
        record: dict = {"date": dates[i].isoformat(), "outcome": {}, "rps": {}}
        for h in HORIZONS:
            record["outcome"][str(h)] = int(outcomes[h][position])
            record["rps"][str(h)] = {
                track: round(scores[(track, h)][position], 6) for track in ordered
            }
        daily.append(record)

    by_bucket: dict[str, dict] = {}
    for h in HORIZONS:
        per_track = {}
        for track in ordered:
            split = by_outcome(scores[(track, h)], outcomes[h])
            per_track[track] = {
                str(int(bucket)): round(sum(v) / len(v), 6) for bucket, v in sorted(split.items())
            }
        by_bucket[str(h)] = per_track

    payload = {
        "generated": dates[-1].isoformat(),
        "target": "gold, RUB/gram, CBR daily fix",
        "window": {
            "from": dates[cut_offs[0]].isoformat(),
            "to": dates[cut_offs[-1]].isoformat(),
            "days": len(cut_offs),
            "clean_from": CLEAN_FROM.isoformat(),
        },
        "context": context,
        "n_min_provisional": n_min,
        "fred_join": "knowledge day (value date +1)",
        "errors": "paired per day, Newey-West lag = horizon-1",
        "horizons": [str(h) for h in HORIZONS],
        "buckets": [Bucket(i).label for i in range(len(Bucket))],
        "rungs": ordered,
        "ladder": ladder,
        "daily": daily,
        "by_outcome": by_bucket,
        "rung2_levels": {
            str(h): {
                str(level): count for (hh, level), count in sorted(levels_used.items()) if hh == h
            }
            for h in HORIZONS
        },
    }

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("window.POC_DATA = " + json.dumps(payload, indent=1) + ";\n", encoding="utf-8")
    print(f"dashboard data -> {path}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from", dest="start", type=date.fromisoformat, default=CLEAN_FROM)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--context", type=int, default=CONTEXT)
    # REQ-408 is a calibration METHOD, not a value: N_min fits against the seed
    # join, which does not exist. This is provisional and labelled as such.
    parser.add_argument("--n-min", type=int, default=20)
    parser.add_argument(
        "--json",
        type=Path,
        default=None,
        metavar="PATH",
        help="also persist the run for ui/index.html (e.g. ui/data/results.js)",
    )
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
    print("fred join  knowledge day (value date +1) — a US close postdates the CBR fix")
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

    # Rung 2's conditioning. Point-in-time, so this is a stable prefix too.
    cells = regime_history(matrix["real_10y"], matrix["vix"])
    features = {
        h: [DayFeatures(end, dates[end], bucket, cells[end]) for end, bucket in history_buckets[h]]
        for h in HORIZONS
    }
    levels_used: dict[tuple[int, int], int] = {}

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
            past = [f for f in features[horizon] if f.index <= i]
            if past:
                rung2 = conditional_climatology(past, cells[i], dates[i], n_min=args.n_min)
                distributions["cond_climatology"] = rung2.probabilities
                key = (horizon, rung2.level)
                levels_used[key] = levels_used.get(key, 0) + 1

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
                r.track,
                "climatology",
                horizon,
                scores[(r.track, horizon)],
                baseline,
                hac_lag=horizon - 1,
            )
            lo, hi = c.interval95
            cell = f"{c.mean_difference:+.4f} [{lo:+.4f}, {hi:+.4f}] {c.verdict}"
            print(f"  {r.track:<14}{r.mean:>8.4f}    {cell:<34}{c.wins}/{c.n:>4}")

        print("\n  by what actually happened  (mean RPS; ~45% of days are flat)")
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

    print("rung 2 backoff levels used  (Design §4.10; level 0 means it collapsed to rung 1)")
    for horizon in HORIZONS:
        used = {lvl: n for (h, lvl), n in sorted(levels_used.items()) if h == horizon}
        total = sum(used.values()) or 1
        detail = "  ".join(f"level {lvl}: {n} ({n / total:.0%})" for lvl, n in sorted(used.items()))
        print(f"  t+{horizon}   {detail}")
    print(f"  N_min = {args.n_min} — PROVISIONAL. REQ-408 calibrates it against the seed join,")
    print("  which does not exist yet, so this number is a placeholder and not a decision.")
    print()

    print("The paired column is the sharper test: every rung sees identical days, so")
    print("the day-to-day outcome noise cancels instead of swamping the difference.")
    print("`days won` counts days the rung scored strictly better than climatology.")
    print("Errors are Newey-West with lag = horizon-1: t+5 is scored daily while each")
    print("outcome spans five sessions, so adjacent differences overlap by construction.")

    if args.json:
        emit_ui_data(
            args.json,
            dates=dates,
            cut_offs=cut_offs,
            scores=scores,
            outcomes=outcomes,
            levels_used=levels_used,
            context=args.context,
            n_min=args.n_min,
        )
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
