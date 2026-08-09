#!/usr/bin/env bash
# Fetch the FRED series used to measure the instrument correlation structure.
# Keyless public CSV (ADR-0010, REQ-205). Writes to ./fred/, which is gitignored --
# the analysis commits its results, never its inputs (ADR-0044).
set -euo pipefail
mkdir -p fred
for s in SP500 NASDAQ100 DJIA VIXCLS DFII10 DTWEXBGS DCOILWTICO DGS10; do
  echo "fetching $s"
  curl -sS --max-time 30 "https://fred.stlouisfed.org/graph/fredgraph.csv?id=$s" -o "fred/$s.csv"
done
echo "done -- now run: python corr_est.py && python run_analysis.py > results.txt"
