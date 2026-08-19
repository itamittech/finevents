"""The runner's persistence step (P5/R1, scripts/run_poc_daily.py).

Written after `save_progress` shipped on 2026-08-19 as a call to itself and
crashed the live run with a RecursionError before a single record was sealed.
Import, lint and a green test suite all passed that day: nothing exercised the
function. This does, with real files in a temporary directory.

The runner imports the numeric stack at module level, so this is skipped where
that stack is deliberately absent (CI) - it runs where the pipeline itself
runs, which is the machine that matters for this class of failure.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

pytest.importorskip("torch", reason="run_poc_daily imports the numeric stack")

import poc_wiki  # noqa: E402
import run_poc_daily  # noqa: E402
from poc_live_track import parse  # noqa: E402


def test_save_progress_writes_the_record_the_wiki_and_the_sidecar(tmp_path, monkeypatch) -> None:
    live, prices, wiki_file = (
        tmp_path / "live.js",
        tmp_path / "live_prices.js",
        tmp_path / "wiki.js",
    )
    monkeypatch.setattr(run_poc_daily, "LIVE", live)
    monkeypatch.setattr(run_poc_daily, "LIVE_PRICES", prices)
    monkeypatch.setattr(poc_wiki, "WIKI", wiki_file)

    state = {"instruments": {"gold": {"records": [{"as_of": "2026-08-19", "horizons": {}}]}}}
    wiki = {"instruments": {"gold": {"versions": [{"version": 1, "as_of": "2026-08-19"}]}}}

    run_poc_daily.save_progress(state, wiki, {"gold": {"2026-08-19": 12000.0}})

    assert parse(live.read_text(encoding="utf-8")) == state
    assert wiki_file.exists() and "versions" in wiki_file.read_text(encoding="utf-8")
    body = prices.read_text(encoding="utf-8")
    assert body.startswith("window.POC_LIVE_PRICES = ") and body.endswith(";" + chr(10))
    assert json.loads(
        body.removeprefix("window.POC_LIVE_PRICES = ").removesuffix(";" + chr(10))
    ) == {"gold": {"2026-08-19": 12000.0}}


def test_save_progress_is_callable_twice_and_is_not_self_recursive(tmp_path, monkeypatch) -> None:
    """The regression itself: a body that only calls itself passes import and
    lint, and dies on the first call."""
    monkeypatch.setattr(run_poc_daily, "LIVE", tmp_path / "live.js")
    monkeypatch.setattr(run_poc_daily, "LIVE_PRICES", tmp_path / "p.js")
    monkeypatch.setattr(poc_wiki, "WIKI", tmp_path / "w.js")
    state = {"instruments": {}}
    run_poc_daily.save_progress(state, {"instruments": {}}, {})
    run_poc_daily.save_progress(state, {"instruments": {}}, {})  # idempotent, no recursion
    assert (tmp_path / "live.js").exists()
