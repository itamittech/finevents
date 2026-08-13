# The POC dashboard

One self-contained page: `index.html`. No build step, no dependencies, no server
required — double-click it, or serve the folder. It ships unchanged to
S3 + CloudFront when the time comes (ADR-0020).

Three instruments, switchable at the top: **gold (₽/gram, the full seven
rungs)** and, at the builder's request for a side-by-side finance view,
**USD/RUB and USD/INR — univariate rungs only** (their covariate rungs would
need their own design plus ADR-0056 controls, and rung 2's regime is a gold
hypothesis). Every method appears under a friendly name — "Chronos-2",
"Base rates (climatology)" — with the internal rung key on hover.

**Built before the daily runner on purpose** (resequenced 2026-08-13, builder's
decision): the page fixes the data contract, so P5's runner writes files the
dashboard already reads instead of the reverse.

## Regenerate the data

```bash
uv run python scripts/evaluate_gold_poc.py --json ui/data/results.js --prices ui/data/prices.js
uv run python scripts/evaluate_gold_poc.py --instrument usd_rub --json ui/data/results_usd_rub.js --prices ui/data/prices_usd_rub.js
uv run python scripts/evaluate_gold_poc.py --instrument usd_inr --json ui/data/results_usd_inr.js --prices ui/data/prices_usd_inr.js
uv run python scripts/forecast_gold_today.py
```

Gold re-scores in ~5 min (model weights needed), each FX pair in ~3; the last
command seals gold's unscored latest forecast. Reload the page after any of
them. Per-instrument files merge into `window.POC_REGISTRY`, so any subset in
any order works and missing instruments simply do not appear in the switcher.

## What is in `ui/data/`

| File | Written by | Committed? | Contents |
|---|---|---|---|
| `results.js` | `evaluate_gold_poc.py --json` | yes | Gold's ladder: means, paired Newey–West intervals, verdicts, per-day RPS, outcomes **and each rung's full five-bucket distribution per day** (the day-by-day view), by-outcome splits, rung-2 backoff levels |
| `results_usd_rub.js`, `results_usd_inr.js` | `--instrument … --json` | yes | The same record for the FX pairs, univariate rungs only, merged into `POC_REGISTRY` |
| `latest.js` | `forecast_gold_today.py` | yes | Every gold rung's bucket probabilities at the last session, σ and edges in percent — sealed, unscored |
| `live.js` | `run_poc_daily.py` (P5) | yes | The live track record: one sealed record per instrument per day — every rung's probabilities, σ, edges, the ADR-0056 random-walk seed — plus matured outcomes and RPS, scored against the **sealed** edges. Seal-once: re-running a day is a byte-identical no-op |
| `prices*.js` | `--prices` | **no — local only** | The fan chart's price layer per instrument: the close series, each model's price-space deciles per day, the daily flat zone. These carry source-derived price values; the CBR terms question in DATA_SOURCES.md is open, so `.gitignore` admits the results files by name and deliberately none of these |

The page degrades gracefully when a file is missing or stale: the fan chart
shows how to generate `prices.js`, and an older `results.js` without per-day
distributions turns the day-by-day view into a regenerate note instead of a break.

Both are **derived work only** — scores, probabilities, verdicts (REQ-1106).
No raw price series and no VIXCLS values are ever written (REQ-1107); the
emitters say so in their docstrings, and `.gitignore` admits exactly `ui/data/*.js`
through the `**/data/` acquired-data ignore for this reason.

Data loads as `<script>` globals, not fetch — so the page works from `file://`,
where browsers block fetch.

## Serving it (optional)

```bash
uv run python -m http.server 8765 --directory ui
```

`.claude/launch.json` carries the same command as the `poc-ui` preview config.

## Scope

POC scaffolding toward REQ-901/903/908. Read-only by design — steering verbs
(REQ-909+) belong to the production dashboard, increment 15. When P5 lands, the
runner appends to the same files and the cumulative chart becomes the learning
curve.
