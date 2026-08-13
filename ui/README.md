# The gold POC dashboard

One self-contained page: `index.html`. No build step, no dependencies, no server
required — double-click it, or serve the folder. It ships unchanged to
S3 + CloudFront when the time comes (ADR-0020).

**Built before the daily runner on purpose** (resequenced 2026-08-13, builder's
decision): the page fixes the data contract, so P5's runner writes files the
dashboard already reads instead of the reverse.

## Regenerate the data

```bash
uv run python scripts/evaluate_gold_poc.py --json ui/data/results.js
uv run python scripts/forecast_gold_today.py
```

The first re-scores the full clean window (~20 min, model weights needed) and
persists it; the second seals an unscored latest forecast (~2 min). Reload the
page after either.

## What is in `ui/data/`

| File | Written by | Contents |
|---|---|---|
| `results.js` | `evaluate_gold_poc.py --json` | Ladder means, paired Newey–West intervals, verdicts, per-day RPS and outcomes, by-outcome splits, rung-2 backoff levels |
| `latest.js` | `forecast_gold_today.py` | Every rung's bucket probabilities at the last session, σ and edges in percent — sealed, unscored |

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
