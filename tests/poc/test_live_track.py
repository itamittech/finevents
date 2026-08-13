"""The live track record's discipline (P5, scripts/poc_live_track.py).

What these tests pin is not arithmetic but *rules*: a sealed record is never
rewritten, an outcome is bucketed by the edges sealed with the forecast rather
than anything recomputed later, and the whole thing is deterministic enough to
re-run byte-identically. Break any of these and the live track record stops
being evidence.
"""

from __future__ import annotations

import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

from poc_live_track import (  # noqa: E402
    bucket_from_edges,
    mature,
    parse,
    random_walk,
    seal,
    seed_for,
    serialize,
)

from finevents.features.volatility import buckets_for  # noqa: E402


def synthetic_closes(n: int = 80, seed: int = 7) -> list[float]:
    rng = random.Random(seed)
    closes, x = [], 0.0
    for _ in range(n):
        x += rng.gauss(0.0, 0.012)
        closes.append(1000.0 * math.exp(x))
    return closes


def sealed_record(as_of: str, edges: list[float], probs: dict[str, list[float]]) -> dict:
    return {
        "as_of": as_of,
        "rw_seed": seed_for(as_of),
        "horizons": {"1": {"sigma_pct": 1.0, "edges": edges, "edges_pct": [], "rungs": probs}},
        "matured": {},
    }


# --- bucket assignment must equal the estimator's own -------------------------


def test_bucket_from_sealed_edges_matches_the_volatility_estimator() -> None:
    """One implementation of "which bucket" already exists (Design §4.1). The
    sealed-edge version must agree everywhere, boundaries included — an
    off-by-one here misgrades every live day."""
    closes = synthetic_closes()
    b = buckets_for(closes, 1)
    probes = [e for e in b.edges] + [e + 1e-12 for e in b.edges] + [e - 1e-12 for e in b.edges]
    probes += [-0.2, -0.01, 0.0, 0.01, 0.2]
    for log_return in probes:
        assert bucket_from_edges(list(b.edges), log_return) == int(b.assign(log_return))


# --- seal once ---------------------------------------------------------------


def test_a_second_seal_for_the_same_date_changes_nothing() -> None:
    first = sealed_record("2026-08-13", [-0.1, -0.05, 0.05, 0.1], {"climatology": [0.2] * 5})
    records, did = seal(
        [], as_of="2026-08-13", horizons=first["horizons"], rw_seed=first["rw_seed"]
    )
    assert did

    rewritten = {"1": {"sigma_pct": 9.9, "edges": [0, 0, 0, 0], "edges_pct": [], "rungs": {}}}
    records2, did2 = seal(records, as_of="2026-08-13", horizons=rewritten, rw_seed=1)
    assert not did2
    assert records2[0]["horizons"]["1"]["sigma_pct"] == 1.0  # the original, untouched


def test_seals_stay_sorted_by_date() -> None:
    records, _ = seal([], as_of="2026-08-14", horizons={}, rw_seed=None)
    records, _ = seal(records, as_of="2026-08-12", horizons={}, rw_seed=None)
    assert [r["as_of"] for r in records] == ["2026-08-12", "2026-08-14"]


# --- maturation --------------------------------------------------------------


def test_maturation_uses_the_sealed_edges_not_todays() -> None:
    """The return below is +0.07. Against the sealed edges that is bucket 3
    (small up). Any recomputation from the series itself would give different
    edges — the point is that it must not matter."""
    record = sealed_record("2026-08-12", [-0.1, -0.05, 0.05, 0.1], {"m": [0.1, 0.2, 0.3, 0.3, 0.1]})
    dates = ["2026-08-12", "2026-08-13"]
    closes = [100.0, 100.0 * math.exp(0.07)]

    records, newly = mature([record], dates, closes)
    assert newly == 1
    matured = records[0]["matured"]["1"]
    assert matured["outcome"] == 3
    assert matured["target_date"] == "2026-08-13"
    assert 0.0 < matured["rps"]["m"] < 1.0


def test_no_target_session_means_no_maturation() -> None:
    record = sealed_record("2026-08-13", [-0.1, -0.05, 0.05, 0.1], {"m": [0.2] * 5})
    records, newly = mature([record], ["2026-08-13"], [100.0])
    assert newly == 0
    assert records[0]["matured"] == {}


def test_an_already_matured_score_survives_a_source_revision() -> None:
    record = sealed_record("2026-08-12", [-0.1, -0.05, 0.05, 0.1], {"m": [0.2] * 5})
    dates = ["2026-08-12", "2026-08-13"]
    records, _ = mature([record], dates, [100.0, 107.25])
    first = dict(records[0]["matured"]["1"])

    # The source "revises" the target close. The taken score must not move.
    records, newly = mature(records, dates, [100.0, 93.0])
    assert newly == 0
    assert records[0]["matured"]["1"] == first


# --- determinism and the file round trip -------------------------------------


def test_the_control_walk_is_reproducible_and_date_keyed() -> None:
    assert seed_for("2026-08-13") == 20260813
    assert random_walk(20260813, 50) == random_walk(20260813, 50)
    assert random_walk(20260813, 50) != random_walk(20260814, 50)


def test_serialize_parse_round_trip_and_fresh_start() -> None:
    payload = {"instruments": {"gold": {"records": []}}}
    assert parse(serialize(payload)) == payload
    assert parse("not a live file") == {"instruments": {}}
    # Idempotence at the byte level: what the runner re-writes is what it read.
    assert serialize(parse(serialize(payload))) == serialize(payload)
