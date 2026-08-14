#!/usr/bin/env python3
"""The daily POC runner: fetch, forecast, seal, score what matured (P5).

Run:  python scripts/run_poc_daily.py [--no-fetch]

One pass, three instruments, in the order a live day needs:

1. **Fetch** — refresh the local CSVs from CBR and FRED (`--no-fetch` skips,
   for offline runs and tests). A fetch failure halts the run: forecasting
   from silently stale data is worse than not forecasting.
2. **Seal** — for each instrument, forecast every rung from the latest print
   and seal it into `ui/data/live.js` before any outcome exists. Gold runs the
   full set **plus the `chronos_rwcov` / `timesfm_rwcov` controls ADR-0056
   makes mandatory**: identical to the covariate rungs except the covariates
   are one seeded random walk (seed = the as-of date, recorded). The FX pairs
   run univariate rungs only, matching the offline evaluation.
3. **Mature** — every previously sealed record whose target session now exists
   is scored against its *sealed* edges (see `poc_live_track`).

Timing is handled by construction rather than by clock: the runner always
forecasts from the last available print, so whether CBR's next-day fix is
already published simply decides which date gets sealed. Scheduling is P6.

Scope: POC scaffolding toward T9.x/REQ-801–806; REQ-501–509 shape the rungs.
Publication boundary: `live.js` carries derived work only (REQ-1106/1107).
"""

from __future__ import annotations

import argparse
import math
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from gold_poc_data import UNIVARIATE_SERIES, load_panel, load_univariate, read_metal  # noqa: E402
from poc_live_track import mature, parse, random_walk, seal, seed_for, serialize  # noqa: E402
from poc_reasoning import read_events, read_results, reasoning_rung  # noqa: E402

from finevents.features.conditional import (  # noqa: E402
    DayFeatures,
    conditional_climatology,
    regime_history,
)
from finevents.features.panel import Series, align  # noqa: E402
from finevents.features.volatility import (  # noqa: E402
    buckets_for,
    climatology_from_buckets,
    historical_buckets,
)
from finevents.numeric import Chronos2Forecaster, TimesFMForecaster  # noqa: E402
from finevents.numeric.buckets import flat_distribution, to_bucket_probabilities  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
LIVE = ROOT / "ui" / "data" / "live.js"
HORIZONS = (1, 5)
CONTEXT = 512

#: The builder's hunch (2026-08-13): gold moves with oil and the FX complex.
#: Daily-return correlation says gold–oil is ~0 while the levels trend together —
#: the exact shape spurious regression feeds on — so the hunch seals as its own
#: rungs and is judged against the *_rwcov control on live days (ADR-0056),
#: not asserted from an offline probe.
OILFX_COVARIATES = ("wti", "usd_rub", "usd_inr", "dollar_index")


def refetch() -> None:
    for fetcher in ("fetch_metals_history.py", "fetch_fred_series.py"):
        print(f"fetching via {fetcher} ...", flush=True)
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / fetcher)], cwd=ROOT, check=False
        )
        if result.returncode != 0:
            raise SystemExit(
                f"{fetcher} failed ({result.returncode}) — refusing to run on stale data"
            )
    # The event shortlist (P8b) refreshes too, but non-fatally: prices are the
    # spine of every seal, events are context until P8c reads them — a news-feed
    # hiccup must not stop the day's forecasts from sealing.
    print("fetching via gdelt_events.py ...", flush=True)
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "gdelt_events.py")], cwd=ROOT, check=False
    )
    if result.returncode != 0:
        print("  gdelt_events.py failed — the event shortlist may be stale; sealing continues")


def sealed_horizons(
    dates,
    closes,
    distributions_for,
) -> dict[str, dict]:
    """Build the per-horizon sealed block: σ, edges (full precision), rungs."""
    out: dict[str, dict] = {}
    for h in HORIZONS:
        edges = buckets_for(closes, h)
        out[str(h)] = {
            "sigma_pct": round((math.exp(edges.sigma) - 1.0) * 100.0, 3),
            "edges": [round(e, 10) for e in edges.edges],
            "edges_pct": [round(p, 2) for p in edges.as_percent()],
            "rungs": {
                rung: [round(p, 4) for p in probs]
                for rung, probs in distributions_for(h, edges).items()
            },
        }
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--no-fetch", action="store_true", help="run offline on the CSVs as they are"
    )
    args = parser.parse_args(argv)

    if not args.no_fetch:
        refetch()

    chronos = Chronos2Forecaster(context_length=CONTEXT)
    timesfm = TimesFMForecaster(context_length=CONTEXT)

    state = parse(LIVE.read_text(encoding="utf-8")) if LIVE.exists() else {"instruments": {}}
    summary: list[str] = []

    # ---- gold: the full rung set, controls included --------------------------
    panel = load_panel()
    dates, closes = panel.dates, panel.target.values
    matrix = panel.covariate_matrix()
    as_of = dates[-1].isoformat()
    rw_seed = seed_for(as_of)

    records = state["instruments"].setdefault("gold", {"records": []})["records"]
    if any(r["as_of"] == as_of for r in records):
        summary.append(f"gold      {as_of} already sealed — maturation only")
    else:
        covariates = {c.name: c for c in panel.covariates}
        oilfx = {name: covariates[name] for name in OILFX_COVARIATES}
        walk = Series("rw", dates, random_walk(rw_seed, len(closes)))
        target = panel.target
        outputs = {
            "chronos_uni": chronos.forecast(target, None, list(HORIZONS)),
            "chronos_cov": chronos.forecast(target, covariates, list(HORIZONS)),
            "chronos_oilfx": chronos.forecast(target, oilfx, list(HORIZONS)),
            "chronos_rwcov": chronos.forecast(target, {"rw": walk}, list(HORIZONS)),
            "timesfm_uni": timesfm.forecast(target, None, list(HORIZONS)),
            "timesfm_cov": timesfm.forecast(target, covariates, list(HORIZONS)),
            "timesfm_oilfx": timesfm.forecast(target, oilfx, list(HORIZONS)),
            "timesfm_rwcov": timesfm.forecast(target, {"rw": walk}, list(HORIZONS)),
        }
        history_buckets = {h: historical_buckets(closes, h) for h in HORIZONS}
        cells = regime_history(matrix["real_10y"], matrix["vix"])
        features = {
            h: [DayFeatures(end, dates[end], b, cells[end]) for end, b in history_buckets[h]]
            for h in HORIZONS
        }

        def gold_distributions(h: int, edges) -> dict:
            rung2 = conditional_climatology(features[h], cells[-1], dates[-1], n_min=20)
            built = {
                "all_flat": flat_distribution(),
                "climatology": climatology_from_buckets([b for _, b in history_buckets[h]]),
                "cond_climatology": rung2.probabilities,
            }
            for rung, out in outputs.items():
                built[rung] = to_bucket_probabilities(out, h, closes[-1], edges)
            return built

        sealed_h = sealed_horizons(dates, closes, gold_distributions)

        # The reasoning rung (P8c, ADR-0057) reads the day's numeric bets, the
        # track record, the offline ladder and the event shortlist — then bets
        # into the SAME seal. Keyless environments skip it visibly; the numeric
        # seals never wait on the reasoning layer.
        llm_addition, llm_meta = reasoning_rung(
            "gold",
            as_of=as_of,
            horizons=sealed_h,
            track_records=records,
            ladder=read_results("gold"),
            events=read_events(),
        )
        if llm_addition is not None:
            for h, extra in llm_addition.items():
                sealed_h[h]["rungs"].update({k: list(v) for k, v in extra.items()})

        records, did = seal(records, as_of=as_of, horizons=sealed_h, rw_seed=rw_seed, llm=llm_meta)
        state["instruments"]["gold"]["records"] = records
        rung_count = len(sealed_h["1"]["rungs"])
        summary.append(f"gold      sealed {as_of}   {rung_count} rungs, rw seed {rw_seed}")

    records, newly = mature(records, [d.isoformat() for d in dates], list(closes))
    state["instruments"]["gold"]["records"] = records
    if newly:
        summary.append(f"gold      matured {newly} horizon(s)")

    # ---- silver: the mirror experiment (covariate = gold, same CBR fix) ------
    spanel = align(read_metal("silver"), [read_metal("gold")])
    dates_s, closes_s = spanel.dates, spanel.target.values
    as_of_s = dates_s[-1].isoformat()
    seed_s = seed_for(as_of_s)

    records = state["instruments"].setdefault("silver", {"records": []})["records"]
    if any(r["as_of"] == as_of_s for r in records):
        summary.append(f"silver    {as_of_s} already sealed — maturation only")
    else:
        gold_cov = {spanel.covariates[0].name: spanel.covariates[0]}
        walk_s = Series("rw", dates_s, random_walk(seed_s, len(closes_s)))
        starget = spanel.target
        outputs_s = {
            "chronos_uni": chronos.forecast(starget, None, list(HORIZONS)),
            "chronos_cov": chronos.forecast(starget, gold_cov, list(HORIZONS)),
            "chronos_rwcov": chronos.forecast(starget, {"rw": walk_s}, list(HORIZONS)),
            "timesfm_uni": timesfm.forecast(starget, None, list(HORIZONS)),
            "timesfm_cov": timesfm.forecast(starget, gold_cov, list(HORIZONS)),
            "timesfm_rwcov": timesfm.forecast(starget, {"rw": walk_s}, list(HORIZONS)),
        }
        history_s = {h: historical_buckets(closes_s, h) for h in HORIZONS}

        def silver_distributions(
            h: int, edges, *, _hist=history_s, _outs=outputs_s, _closes=closes_s
        ) -> dict:
            built = {
                "all_flat": flat_distribution(),
                "climatology": climatology_from_buckets([b for _, b in _hist[h]]),
            }
            for rung, out in _outs.items():
                built[rung] = to_bucket_probabilities(out, h, _closes[-1], edges)
            return built

        records, did = seal(
            records,
            as_of=as_of_s,
            horizons=sealed_horizons(dates_s, closes_s, silver_distributions),
            rw_seed=seed_s,
        )
        state["instruments"]["silver"]["records"] = records
        summary.append(f"silver    sealed {as_of_s}   8 rungs (covariate: gold), rw seed {seed_s}")

    records, newly = mature(records, [d.isoformat() for d in dates_s], list(closes_s))
    state["instruments"]["silver"]["records"] = records
    if newly:
        summary.append(f"silver    matured {newly} horizon(s)")

    # ---- the univariate instruments (FX pairs, WTI) --------------------------
    for instrument in UNIVARIATE_SERIES:
        series = load_univariate(instrument)
        dates_fx, closes_fx = series.dates, series.values
        as_of_fx = dates_fx[-1].isoformat()

        records = state["instruments"].setdefault(instrument, {"records": []})["records"]
        if any(r["as_of"] == as_of_fx for r in records):
            summary.append(f"{instrument:<9} {as_of_fx} already sealed — maturation only")
        else:
            outputs_fx = {
                "chronos_uni": chronos.forecast(series, None, list(HORIZONS)),
                "timesfm_uni": timesfm.forecast(series, None, list(HORIZONS)),
            }
            history_fx = {h: historical_buckets(closes_fx, h) for h in HORIZONS}

            def fx_distributions(
                h: int, edges, *, _hist=history_fx, _outs=outputs_fx, _closes=closes_fx
            ) -> dict:
                # Loop variables bound as defaults on purpose (ruff B023): the
                # closure is called within this iteration, but late binding is
                # exactly the bug class worth making impossible.
                built = {
                    "all_flat": flat_distribution(),
                    "climatology": climatology_from_buckets([b for _, b in _hist[h]]),
                }
                for rung, out in _outs.items():
                    built[rung] = to_bucket_probabilities(out, h, _closes[-1], edges)
                return built

            records, did = seal(
                records,
                as_of=as_of_fx,
                horizons=sealed_horizons(dates_fx, closes_fx, fx_distributions),
                rw_seed=None,
            )
            state["instruments"][instrument]["records"] = records
            summary.append(f"{instrument:<9} sealed {as_of_fx}   4 rungs")

        records, newly = mature(records, [d.isoformat() for d in dates_fx], list(closes_fx))
        state["instruments"][instrument]["records"] = records
        if newly:
            summary.append(f"{instrument:<9} matured {newly} horizon(s)")

    LIVE.parent.mkdir(parents=True, exist_ok=True)
    LIVE.write_text(serialize(state), encoding="utf-8")

    print()
    for line in summary:
        print(f"  {line}")
    total = sum(len(v["records"]) for v in state["instruments"].values())
    scored = sum(len(r["matured"]) for v in state["instruments"].values() for r in v["records"])
    print(f"\ntrack record -> {LIVE}")
    print(
        f"  {total} sealed record(s) across {len(state['instruments'])} instrument(s), "
        f"{scored} horizon(s) scored"
    )
    print("  Sealed before the outcome existed; scored against the edges sealed with it.")
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
