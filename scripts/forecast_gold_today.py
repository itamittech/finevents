#!/usr/bin/env python3
"""The latest forecast for every rung, sealed-style and unscored — for the dashboard.

Run:  python scripts/forecast_gold_today.py

This does at the panel's last session exactly what a live day will do (P5):
σ and bucket edges from data through today, every rung forecast at t+1 and t+5,
bucket probabilities written for `ui/index.html`. Nothing is scored — the
outcomes do not exist yet, and the page labels the block accordingly.

Scope: POC scaffolding toward REQ-901/903's page; the production runner is
T9.x/P5. Publication boundary (REQ-1106/1107): derived work only — σ and edges
in percent, probabilities per bucket. **No raw closes, no VIXCLS values.**
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from gold_poc_data import load_panel  # noqa: E402

from finevents.features.conditional import (  # noqa: E402
    DayFeatures,
    conditional_climatology,
    regime_history,
)
from finevents.features.volatility import (  # noqa: E402
    buckets_for,
    climatology_from_buckets,
    historical_buckets,
)
from finevents.numeric import Chronos2Forecaster, TimesFMForecaster  # noqa: E402
from finevents.numeric.buckets import flat_distribution, to_bucket_probabilities  # noqa: E402

HORIZONS = (1, 5)
CONTEXT = 512
OUT = Path(__file__).resolve().parent.parent / "ui" / "data" / "latest.js"


def main() -> int:
    panel = load_panel()
    dates, closes = panel.dates, panel.target.values
    matrix = panel.covariate_matrix()
    today = len(closes) - 1

    print(f"panel      {len(closes)} sessions through {dates[today]}")
    print("fred join  knowledge day (value date +1)\n")

    history_buckets = {h: historical_buckets(closes, h) for h in HORIZONS}
    cells = regime_history(matrix["real_10y"], matrix["vix"])
    features = {
        h: [DayFeatures(end, dates[end], b, cells[end]) for end, b in history_buckets[h]]
        for h in HORIZONS
    }

    target = panel.target
    covariates = {c.name: c for c in panel.covariates}

    chronos = Chronos2Forecaster(context_length=CONTEXT)
    timesfm = TimesFMForecaster(context_length=CONTEXT)

    outputs = {}
    for forecaster in (chronos, timesfm):
        for with_covariates in (False, True):
            passed = covariates if with_covariates else None
            out = forecaster.forecast(target, passed, list(HORIZONS))
            outputs[out.track] = out

    payload: dict = {
        "as_of": dates[today].isoformat(),
        "unscored": True,
        "n_min_provisional": 20,
        "horizons": {},
    }
    for h in HORIZONS:
        edges = buckets_for(closes, h)
        rung2 = conditional_climatology(features[h], cells[today], dates[today], n_min=20)
        distributions = {
            "climatology": climatology_from_buckets([b for _, b in history_buckets[h]]),
            "cond_climatology": rung2.probabilities,
            "all_flat": flat_distribution(),
        }
        for track, out in outputs.items():
            distributions[track] = to_bucket_probabilities(out, h, closes[-1], edges)

        payload["horizons"][str(h)] = {
            "sigma_pct": round((math.exp(edges.sigma) - 1.0) * 100.0, 3),
            "edges_pct": [round(p, 2) for p in edges.as_percent()],
            "rung2_level": rung2.level,
            "rungs": {
                name: [round(p, 4) for p in probabilities]
                for name, probabilities in distributions.items()
            },
        }
        readable = "  ".join(f"{p:.3f}" for p in distributions["chronos_uni"])
        sigma_pct = payload["horizons"][str(h)]["sigma_pct"]
        print(f"t+{h}   sigma {sigma_pct:.3f}%   chronos_uni: {readable}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("window.POC_LATEST = " + json.dumps(payload, indent=1) + ";\n", encoding="utf-8")
    print(f"\nlatest forecast -> {OUT}")
    print("Unscored by design: t+1 matures at the next CBR fix, t+5 five fixes on.")
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
