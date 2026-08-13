# The gold POC dashboard

One self-contained page: `index.html`. No build step, no dependencies, no server
required — double-click it, or serve the folder. It ships unchanged to
S3 + CloudFront when the time comes (ADR-0020).

**Built before the daily runner on purpose** (resequenced 2026-08-13, builder's
decision): the page fixes the data contract, so P5's runner writes files the
dashboard already reads instead of the reverse.

## Regenerate the data

```bash
uv run python scripts/evaluate_gold_poc.py --json ui/data/results.js --prices ui/data/prices.js
uv run python scripts/forecast_gold_today.py
```

The first re-scores the full clean window (~5 min, model weights needed) and
persists it; the second seals an unscored latest forecast (~2 min). Reload the
page after either.

## What is in `ui/data/`

| File | Written by | Committed? | Contents |
|---|---|---|---|
| `results.js` | `evaluate_gold_poc.py --json` | yes | Ladder means, paired Newey–West intervals, verdicts, per-day RPS, outcomes **and each rung's full five-bucket distribution per day** (the day-by-day view), by-outcome splits, rung-2 backoff levels |
| `latest.js` | `forecast_gold_today.py` | yes | Every rung's bucket probabilities at the last session, σ and edges in percent — sealed, unscored |
| `prices.js` | `evaluate_gold_poc.py --prices` | **no — local only** | The fan chart's price layer: the close series, each model's price-space deciles per day, the daily flat zone. Carries CBR-derived values, and the CBR terms question in DATA_SOURCES.md is open — `.gitignore` admits the other two by name and deliberately not this one |

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
