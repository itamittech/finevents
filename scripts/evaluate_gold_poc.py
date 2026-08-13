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

from gold_poc_data import load_panel, load_univariate  # noqa: E402

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
from finevents.numeric.base import QUANTILE_LEVELS  # noqa: E402
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

#: The instruments this harness can score. Gold gets the full seven rungs.
#: The others are scored **univariate only**: their covariate rungs would
#: need their own covariate design plus ADR-0056 controls, and rung 2's
#: real-yield × VIX regime is a gold story — extending either silently would
#: manufacture rungs nobody designed. `decimals` sizes the price rounding.
#: Loading (files, columns, start trims) lives in gold_poc_data.UNIVARIATE_SERIES.
INSTRUMENT_CONFIGS = {
    "gold": {"label": "gold, RUB/gram, CBR daily fix", "decimals": 2},
    "usd_rub": {
        "label": "USD/RUB, CBR official rate (the same fix that prices the gold series)",
        "decimals": 4,
    },
    "usd_inr": {
        "label": "USD/INR, FRED DEXINUS (Federal Reserve H.10 reference rate)",
        "decimals": 4,
    },
    "wti": {
        "label": "WTI crude, USD/barrel, FRED DCOILWTICO (EIA) — series from 2020-07",
        "decimals": 2,
    },
}

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


def registry_text(instrument: str, kind: str, payload: dict) -> str:
    """One emitted file = one merge into `window.POC_REGISTRY[instrument]`.

    Order-independent on the page: every file re-creates the registry if it is
    first, then merges its own slice, so any subset of files in any order works.
    Gold keeps its original bare globals (`POC_DATA` / `POC_PRICES`) so files
    already committed keep loading; the page reads registry first, then falls
    back.
    """
    key = json.dumps(instrument)
    return (
        "window.POC_REGISTRY = window.POC_REGISTRY || {};\n"
        + f"window.POC_REGISTRY[{key}] = Object.assign(window.POC_REGISTRY[{key}] || {{}}, "
        + json.dumps({kind: payload}, indent=1)
        + ");\n"
    )


def emit_ui_data(
    path: Path,
    *,
    instrument: str,
    target_label: str,
    dates: tuple[date, ...],
    cut_offs: list[int],
    scores: dict[tuple[str, int], list[float]],
    outcomes: dict[int, list],
    probabilities: dict[int, list[dict[str, list[float]]]],
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
        record: dict = {"date": dates[i].isoformat(), "outcome": {}, "rps": {}, "probs": {}}
        for h in HORIZONS:
            record["outcome"][str(h)] = int(outcomes[h][position])
            record["rps"][str(h)] = {
                track: round(scores[(track, h)][position], 6) for track in ordered
            }
            # The full five-bucket distribution each rung committed to that day —
            # what the day-by-day view draws. Derived work, like everything here.
            record["probs"][str(h)] = probabilities[h][position]
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
        "instrument": instrument,
        "target": target_label,
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
    if instrument == "gold":
        text = "window.POC_DATA = " + json.dumps(payload, indent=1) + ";\n"
    else:
        text = registry_text(instrument, "results", payload)
    path.write_text(text, encoding="utf-8")
    print(f"dashboard data -> {path}")


def emit_prices(
    path: Path,
    *,
    instrument: str,
    currency_label: str,
    decimals: int,
    dates: tuple[date, ...],
    cut_offs: list[int],
    closes: tuple[float, ...],
    quantile_rows: dict[int, dict[str, list[list[float]]]],
    flat_zones: dict[int, list[tuple[float, float]]],
) -> None:
    """Persist the price layer for the dashboard's fan chart. **LOCAL ONLY.**

    Unlike `emit_ui_data`, this file contains CBR-derived price values — the
    close series and the models' price-space quantiles. DATA_SOURCES.md's CBR
    terms question is still open, the repository is public, and committing a
    price series is republication (ADR-0044, ADR-0050). So `.gitignore` admits
    the derived files by name and deliberately leaves this one out; the page
    degrades gracefully when it is absent. If the CBR question is ever answered
    in favour, admitting this file is a one-line, recorded decision.
    """
    first = cut_offs[0]
    payload = {
        "currency": currency_label,
        "local_only": True,
        "levels": list(QUANTILE_LEVELS),
        "series": {
            "dates": [d.isoformat() for d in dates[first:]],
            "close": [round(c, decimals) for c in closes[first:]],
        },
        "horizons": {
            str(h): {
                "dates": [dates[i + h].isoformat() for i in cut_offs],
                "flat_lo": [z[0] for z in flat_zones[h]],
                "flat_hi": [z[1] for z in flat_zones[h]],
                "bands": quantile_rows[h],
            }
            for h in HORIZONS
        },
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    if instrument == "gold":
        text = "window.POC_PRICES = " + json.dumps(payload, indent=1) + ";\n"
    else:
        text = registry_text(instrument, "prices", payload)
    path.write_text(text, encoding="utf-8")
    print(f"price layer    -> {path}   (local only — never committed; see docstring)")


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
    parser.add_argument(
        "--prices",
        type=Path,
        default=None,
        metavar="PATH",
        help="also persist the LOCAL-ONLY price layer (ui/data/prices.js — gitignored,"
        " contains CBR-derived values; see emit_prices)",
    )
    parser.add_argument(
        "--instrument",
        choices=sorted(INSTRUMENT_CONFIGS),
        default="gold",
        help="what to forecast. Gold runs all seven rungs; the FX pairs run"
        " univariate only (see INSTRUMENT_CONFIGS for why)",
    )
    args = parser.parse_args(argv)
    config = INSTRUMENT_CONFIGS[args.instrument]
    decimals = config["decimals"]

    if args.instrument == "gold":
        panel = load_panel()
        dates, closes = panel.dates, panel.target.values
        matrix = panel.covariate_matrix()
        target_name = panel.target.name
    else:
        series = load_univariate(args.instrument)
        dates, closes = series.dates, series.values
        matrix = None
        target_name = args.instrument

    last = len(closes) - max(HORIZONS) - 1
    cut_offs = [i for i in range(len(closes)) if i <= last and dates[i] >= args.start]
    if args.limit:
        cut_offs = cut_offs[: args.limit]
    if not cut_offs:
        print("no cut-offs in range", file=sys.stderr)
        return 1

    print(f"instrument {args.instrument} — {config['label']}")
    if matrix is not None:
        print(f"panel      {len(closes)} sessions, {len(panel.covariates)} covariates")
        print("fred join  knowledge day (value date +1) — a US close postdates the CBR fix")
    else:
        print(f"series     {len(closes)} sessions, univariate (no covariate rungs, no rung 2)")
    print(f"cut-offs   {len(cut_offs)}   {dates[cut_offs[0]]} -> {dates[cut_offs[-1]]}")
    print(f"context    {args.context} sessions\n")

    chronos = Chronos2Forecaster(context_length=args.context)
    timesfm = TimesFMForecaster(context_length=args.context)
    if matrix is not None:
        forecasters = [(chronos, False), (chronos, True), (timesfm, False), (timesfm, True)]
    else:
        forecasters = [(chronos, False), (timesfm, False)]

    # Computed once over the full series and sliced per cut-off. Each entry
    # depends only on data up to its own index, so the prefix at cut-off i is
    # exactly what recomputing there would give — at O(n) instead of O(n²).
    print("precomputing the climatology bucket history...", flush=True)
    history_buckets = {h: historical_buckets(closes, h) for h in HORIZONS}

    # Rung 2's conditioning. Point-in-time, so this is a stable prefix too.
    # Gold only: the real-yield × VIX regime is a gold hypothesis (ADR-0017),
    # not a generic one — silently reusing it for FX would manufacture a rung
    # nobody designed.
    features: dict[int, list[DayFeatures]] = {}
    cells: list = []
    if matrix is not None:
        cells = regime_history(matrix["real_10y"], matrix["vix"])
        features = {
            h: [
                DayFeatures(end, dates[end], bucket, cells[end])
                for end, bucket in history_buckets[h]
            ]
            for h in HORIZONS
        }
    levels_used: dict[tuple[int, int], int] = {}

    scores: dict[tuple[str, int], list[float]] = {}
    outcomes: dict[int, list] = {h: [] for h in HORIZONS}
    probabilities_by_day: dict[int, list[dict[str, list[float]]]] = {h: [] for h in HORIZONS}
    quantile_rows: dict[int, dict[str, list[list[float]]]] = {h: {} for h in HORIZONS}
    flat_zones: dict[int, list[tuple[float, float]]] = {h: [] for h in HORIZONS}
    started = time.perf_counter()

    for n, i in enumerate(cut_offs, 1):
        history = closes[: i + 1]
        target_slice = Series(target_name, dates[: i + 1], history)
        covariate_slices = (
            {name: Series(name, dates[: i + 1], values[: i + 1]) for name, values in matrix.items()}
            if matrix is not None
            else None
        )

        # One call per configuration: a forecast carries every horizon at once,
        # so calling inside the horizon loop was doing identical work twice
        # (REQ-507 makes the repeat byte-identical, hence merely wasteful).
        # The quantiles feed both the bucket conversion and the price-space
        # bands the dashboard's fan chart draws.
        model_outputs = []
        for forecaster, with_covariates in forecasters:
            out = forecaster.forecast(
                target_slice,
                covariate_slices if with_covariates else None,
                list(HORIZONS),
            )
            model_outputs.append(out)

        for horizon in HORIZONS:
            edges = buckets_for(history, horizon)
            realised = edges.assign(math.log(closes[i + horizon] / closes[i]))
            outcomes[horizon].append(realised)
            flat_zones[horizon].append(
                (
                    round(history[-1] * math.exp(edges.edges[1]), decimals),
                    round(history[-1] * math.exp(edges.edges[2]), decimals),
                )
            )

            distributions = {
                "all_flat": flat_distribution(),
                "climatology": climatology_from_buckets(
                    [b for end, b in history_buckets[horizon] if end <= i]
                ),
            }
            past = [f for f in features[horizon] if f.index <= i] if features else []
            if past:
                rung2 = conditional_climatology(past, cells[i], dates[i], n_min=args.n_min)
                distributions["cond_climatology"] = rung2.probabilities
                key = (horizon, rung2.level)
                levels_used[key] = levels_used.get(key, 0) + 1

            for out in model_outputs:
                distributions[out.track] = to_bucket_probabilities(out, horizon, history[-1], edges)
                quantile_rows[horizon].setdefault(out.track, []).append(
                    [round(v, decimals) for v in out.values[horizon]]
                )

            probabilities_by_day[horizon].append(
                {track: [round(p, 4) for p in dist] for track, dist in distributions.items()}
            )
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

    if levels_used:
        print("rung 2 backoff levels used  (Design §4.10; level 0 means it collapsed to rung 1)")
        for horizon in HORIZONS:
            used = {lvl: n for (h, lvl), n in sorted(levels_used.items()) if h == horizon}
            total = sum(used.values()) or 1
            detail = "  ".join(
                f"level {lvl}: {n} ({n / total:.0%})" for lvl, n in sorted(used.items())
            )
            print(f"  t+{horizon}   {detail}")
        print(f"  N_min = {args.n_min} — PROVISIONAL. REQ-408 calibrates it against the seed")
        print("  join, which does not exist yet, so this is a placeholder and not a decision.")
        print()

    print("The paired column is the sharper test: every rung sees identical days, so")
    print("the day-to-day outcome noise cancels instead of swamping the difference.")
    print("`days won` counts days the rung scored strictly better than climatology.")
    print("Errors are Newey-West with lag = horizon-1: t+5 is scored daily while each")
    print("outcome spans five sessions, so adjacent differences overlap by construction.")

    if args.json:
        emit_ui_data(
            args.json,
            instrument=args.instrument,
            target_label=config["label"],
            dates=dates,
            cut_offs=cut_offs,
            scores=scores,
            outcomes=outcomes,
            probabilities=probabilities_by_day,
            levels_used=levels_used,
            context=args.context,
            n_min=args.n_min,
        )
    if args.prices:
        emit_prices(
            args.prices,
            instrument=args.instrument,
            currency_label=config["label"],
            decimals=decimals,
            dates=dates,
            cut_offs=cut_offs,
            closes=closes,
            quantile_rows=quantile_rows,
            flat_zones=flat_zones,
        )
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
