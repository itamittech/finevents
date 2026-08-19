"""The live track record: seal-once forecasts, matured against sealed edges.

This is the P5 core, kept pure so it can be tested without models or network:

**Seal once.** A record for (instrument, as_of) is written exactly once, before
its outcomes exist. If the runner meets a date it has already sealed, the
existing record wins — re-running a day must never rewrite history. That is
the same append-only discipline ADR-0016 gives the production store, enforced
here at merge time.

**Mature against sealed edges.** When the target session finally exists, the
realised move is bucketed by the σ-edges *sealed with the forecast* — never by
edges recomputed today. Recomputing would let a data revision (or a bug fix)
silently move the goalposts after the bet was placed.

**No wall clock.** `as_of` is the last data date, the random-walk seed derives
from it, and maturation is data-driven — so a re-run over the same files is
byte-identical (the runner inherits REQ-507's property), and REQ-109's
wall-clock ban holds.

Publication boundary (REQ-1106/1107): records carry probabilities, σ, edges,
outcomes and scores — derived work only. **No raw closes enter the record**;
maturation recomputes returns from the local CSVs each run. Consequence, named
rather than hidden: if a source revises history (FRED occasionally does; CBR
does not), a not-yet-matured outcome can shift with it.
"""

from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from finevents.features.volatility import Bucket  # noqa: E402
from finevents.score.rps import ranked_probability_score  # noqa: E402

HORIZONS = (1, 5)
PREFIX = "window.POC_LIVE = "

#: Matches the round-1/round-2 diagnosis convention: steps at gold's own daily
#: log-σ, exponentiated so the walk looks like a price (ADR-0056).
RW_STEP_SIGMA = 0.011


def random_walk(seed: int, length: int) -> tuple[float, ...]:
    """The ADR-0056 control covariate — seeded, recorded, reproducible."""
    rng = random.Random(seed)
    walk, x = [], 0.0
    for _ in range(length):
        x += rng.gauss(0.0, RW_STEP_SIGMA)
        walk.append(100.0 * math.exp(x))
    return tuple(walk)


def seed_for(as_of: str) -> int:
    """`2026-08-13` -> 20260813. Deterministic per day, recorded in the record."""
    return int(as_of.replace("-", ""))


def round_distribution(probs: tuple[float, ...] | list[float], dp: int = 4) -> list[float]:
    """Round to `dp` places AND repair the residual onto the largest bucket.

    Found on the first live maturation (2026-08-13): plain rounding sealed rows
    summing to 0.9999, which the RPS scorer rightly refuses. A sealed record
    must be a proper distribution as stored, so the rounding error goes to the
    bucket best able to absorb it, deterministically.
    """
    rounded = [round(p, dp) for p in probs]
    residual = round(1.0 - sum(rounded), dp + 2)
    if residual:
        rounded[rounded.index(max(rounded))] = round(max(rounded) + residual, dp)
    return rounded


def _normalised(probs: tuple[float, ...]) -> tuple[float, ...]:
    """Legacy defence: records sealed before round_distribution existed carry
    ≤5e-4 rounding residue, and seal-once forbids rewriting them. Scoring
    normalises deterministically instead — a change to RPS far below any
    reported precision."""
    total = sum(probs)
    return probs if abs(total - 1.0) < 1e-9 else tuple(p / total for p in probs)


def bucket_from_edges(edges: list[float], log_return: float) -> int:
    """`Bucket` assignment from *sealed* edges.

    Mirrors `volatility.BucketEdges.assign` exactly (a test pins the two
    together): bucket k is the first threshold the return is below, else 4.
    """
    for k, threshold in enumerate(edges):
        if log_return < threshold:
            return k
    return len(edges)


def seal(
    records: list[dict],
    *,
    as_of: str,
    horizons: dict[str, dict],
    rw_seed: int | None,
    llm: dict | None = None,
) -> tuple[list[dict], bool]:
    """Add a new sealed record, unless one for `as_of` already exists.

    Returns the (possibly unchanged) list and whether a seal happened. The
    existing record always wins — see the module docstring.

    `llm` is the reasoning rung's audit metadata (REQ-1302): model id plus the
    SHA-256 of the recorded brief and response. The transcript itself stays
    local; only the hashes enter the published record.
    """
    if any(r["as_of"] == as_of for r in records):
        return records, False
    record = {"as_of": as_of, "rw_seed": rw_seed, "horizons": horizons, "matured": {}}
    if llm is not None:
        record["llm"] = llm
    updated = sorted([*records, record], key=lambda r: r["as_of"])
    return updated, True


def guard_forward(records: list[dict], as_of: str, instrument: str) -> None:
    """Refuse to seal a date older than one already sealed (defect D3).

    A partial or corrupt fetch can shorten a source series — the metals fetcher
    used to swallow a failed chunk and rewrite the CSV with whatever survived.
    The runner then takes `as_of = dates[-1]`, finds no record with that date,
    and seals a **backdated** row into a seal-once ledger, calling the model
    "as of" a date long past. The ledger only ever moves forward, so a series
    that goes backwards is a fetch failure, not a day's data.
    """
    if not records:
        return
    newest = max(record["as_of"] for record in records)
    if as_of < newest:
        raise SystemExit(
            f"{instrument}: the series now ends {as_of} but {newest} is already sealed — "
            "the source data went backwards. Refusing to seal or to call the model; "
            "check the fetch before re-running."
        )


def mature(
    records: list[dict],
    dates: list[str],
    closes: list[float],
) -> tuple[list[dict], int]:
    """Score every sealed record whose target session now exists.

    Idempotent: an already-matured horizon is left untouched, so a revision in
    the source series cannot rewrite a score that was already taken.
    """
    position = {d: i for i, d in enumerate(dates)}
    newly = 0
    for record in records:
        anchor = position.get(record["as_of"])
        if anchor is None:
            continue  # source gap or revision; leave sealed, never guess
        for h_key, sealed in record["horizons"].items():
            if h_key in record["matured"]:
                continue
            target = anchor + int(h_key)
            if target >= len(dates):
                continue  # not matured yet
            log_return = math.log(closes[target] / closes[anchor])
            outcome = bucket_from_edges(sealed["edges"], log_return)
            scores = {
                rung: round(ranked_probability_score(_normalised(tuple(probs)), Bucket(outcome)), 6)
                for rung, probs in sealed["rungs"].items()
            }
            record["matured"][h_key] = {
                "target_date": dates[target],
                "outcome": outcome,
                "rps": scores,
            }
            newly += 1
    return records, newly


def parse(text: str) -> dict:
    """Read a live.js payload back; an absent or foreign file starts fresh."""
    if not text.startswith(PREFIX):
        return {"instruments": {}}
    return json.loads(text.removeprefix(PREFIX).removesuffix(";\n"))


def serialize(payload: dict) -> str:
    return PREFIX + json.dumps(payload, indent=1) + ";\n"
