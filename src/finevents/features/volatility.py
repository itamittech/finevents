"""σ_h and the five movement buckets (REQ-401, REQ-402, Design §4.1).

Design §4.1 specifies this exactly, and says why: *"two conforming-looking
implementations differ by ~1% on n≈56 observations, which flips borderline bucket
assignments, and the Lane A calibration path and the live path are separate code
that can diverge silently."*

So every choice below is the specified one, not a reasonable one:

| Choice | Value |
|---|---|
| Returns | `log(close[t] / close[t−h])` on the adjusted series |
| Sample | the 60 most recent **sessions** ending at the cut-off |
| Demeaning | yes |
| `ddof` | 1 |
| Minimum history | 40 sessions — below that, **abstain**, never a substituted σ |
| Missing sessions | a calendar gap is not a series gap; the window counts sessions present |

**"60 sessions" means 60 closes**, which yields `60 − h` overlapping h-day
returns — 59 at h=1 and 55 at h=5. That reading is what makes Design §4.1's own
"n≈56" arithmetic work, and it is written down here because the alternative
reading (60 *returns*, so 60+h closes) is equally natural and differs by ~1%.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from enum import IntEnum

WINDOW_SESSIONS = 60
MIN_SESSIONS = 40

# ADR-0008. Ordinal, and the order is load-bearing: RPS penalises being wrong by
# one bucket less than by four, which is the entire reason it is used.
BOUNDARIES_IN_SIGMA = (-1.5, -0.5, 0.5, 1.5)


class Bucket(IntEnum):
    LARGE_DOWN = 0
    SMALL_DOWN = 1
    FLAT = 2
    SMALL_UP = 3
    LARGE_UP = 4

    @property
    def label(self) -> str:
        return self.name.lower().replace("_", " ")


class AbstainedByConstruction(Exception):
    """Too little history for σ. Not an error to handle away.

    Design §4.1 makes this explicit: below 40 sessions the instrument is
    *abstained by construction*, not defaulted. A substituted σ would set bucket
    boundaries from nothing and every downstream score would inherit them
    silently.
    """


@dataclass(frozen=True, slots=True)
class Buckets:
    """Bucket boundaries in return space, for one instrument and horizon.

    Stored with the prediction (REQ-402) so scoring never recomputes them — a
    later change to the σ window cannot retroactively alter a past score.
    """

    horizon: int
    sigma: float
    n_returns: int
    edges: tuple[float, float, float, float]

    def assign(self, realised_log_return: float) -> Bucket:
        """Which bucket a realised return fell into.

        Boundaries are lower-inclusive, matching Design §4.1's table:
        `−1.5σ ≤ r < −0.5σ` is small down, and `r ≥ 1.5σ` is large up.
        """
        r = realised_log_return
        if r < self.edges[0]:
            return Bucket.LARGE_DOWN
        if r < self.edges[1]:
            return Bucket.SMALL_DOWN
        if r < self.edges[2]:
            return Bucket.FLAT
        if r < self.edges[3]:
            return Bucket.SMALL_UP
        return Bucket.LARGE_UP

    def as_percent(self) -> tuple[float, ...]:
        """Edges as percentage moves, for human display (ADR-0008).

        The internal representation stays σ-relative; this is the translation
        that lets someone read "moderate up (roughly +1.2% to +3.5%)".
        """
        return tuple((math.exp(edge) - 1.0) * 100.0 for edge in self.edges)


def overlapping_log_returns(closes: tuple[float, ...], horizon: int) -> tuple[float, ...]:
    """`log(close[t] / close[t−h])` for every t where both exist.

    Overlapping by design. Design §4.1 records the cost openly: overlap makes the
    estimator autocorrelated and understates its own standard error — but 60
    sessions yields only 12 non-overlapping 5-day returns, which is too thin to
    use instead.
    """
    if horizon < 1:
        raise ValueError(f"horizon must be >= 1, got {horizon}")
    if any(close <= 0 for close in closes):
        raise ValueError("a non-positive close cannot be log-transformed")

    return tuple(math.log(closes[t] / closes[t - horizon]) for t in range(horizon, len(closes)))


def sigma(closes: tuple[float, ...], horizon: int) -> tuple[float, int]:
    """σ_h over the trailing window. Returns (σ, number of returns used).

    `closes` must already be truncated at the cut-off — `Series.as_of` does that,
    which is what keeps REQ-407 structural rather than remembered.
    """
    if len(closes) < MIN_SESSIONS:
        raise AbstainedByConstruction(
            f"{len(closes)} sessions available, {MIN_SESSIONS} required (Design §4.1). "
            f"Abstained by construction — a substituted σ would set bucket boundaries "
            f"from nothing and every downstream score would inherit them silently."
        )

    window = closes[-WINDOW_SESSIONS:]
    returns = overlapping_log_returns(window, horizon)
    if len(returns) < 2:
        raise AbstainedByConstruction(
            f"horizon {horizon} leaves only {len(returns)} return(s) in a "
            f"{len(window)}-session window"
        )

    mean = sum(returns) / len(returns)  # demeaned, per Design §4.1
    variance = sum((r - mean) ** 2 for r in returns) / (len(returns) - 1)  # ddof = 1
    return math.sqrt(variance), len(returns)


def buckets_for(closes: tuple[float, ...], horizon: int) -> Buckets:
    """Bucket boundaries for one instrument and horizon at the cut-off."""
    value, n_returns = sigma(closes, horizon)
    edges = tuple(multiple * value for multiple in BOUNDARIES_IN_SIGMA)
    return Buckets(horizon=horizon, sigma=value, n_returns=n_returns, edges=edges)  # type: ignore[arg-type]


def historical_buckets(closes: tuple[float, ...], horizon: int) -> list[tuple[int, Bucket]]:
    """`(index, bucket)` for each historical return, **by its own σ at the time**.

    REQ-401 defines a bucket relative to the trailing-60 σ *at that moment*, so a
    2015 return belongs to the bucket 2015's σ gave it. Anything else conflates
    the volatility level with the shape of the return distribution.

    Each entry depends only on `closes[:index + 1]`, so **the result is a stable
    prefix**: computing it once over the full series and slicing gives exactly
    what recomputing at each cut-off would. That turns a rolling evaluation from
    O(n²) into O(n), and the index is returned so a caller can do the slicing
    without re-deriving the offset.
    """
    out: list[tuple[int, Bucket]] = []
    for end in range(MIN_SESSIONS, len(closes)):
        # σ as known at the cut-off, before the move it is bucketing.
        window = closes[: end + 1 - horizon]
        if len(window) < MIN_SESSIONS:
            continue
        edges = buckets_for(window, horizon)
        realised = math.log(closes[end] / closes[end - horizon])
        out.append((end, edges.assign(realised)))
    return out


def climatology_from_buckets(buckets: Sequence[Bucket]) -> tuple[float, ...]:
    """Bucket frequency over an already-computed history."""
    if not buckets:
        raise AbstainedByConstruction("no history available for climatology")
    counts = [0] * len(Bucket)
    for bucket in buckets:
        counts[bucket] += 1
    return tuple(count / len(buckets) for count in counts)


def climatology(closes: tuple[float, ...], horizon: int) -> tuple[float, ...]:
    """Unconditional bucket frequency over all available history (REQ-404).

    The honest baseline, and per ADR-0008 the hardest to beat: *"a result that
    does not beat climatology out-of-sample is not a result."* So it has to be the
    real one.

    **It must be scale-free.** Bucketing every historical return against *today's*
    σ answers a different question — "how often did past returns exceed 1.5× the
    volatility we happen to have now" — and the answer swings with the current
    regime. Measured on gold: that version put 0.595, 0.753 and 0.620 on `flat`
    at three cut-offs in the same year, against a realised flat rate of 0.448.
    A baseline that miscalibrates by a third depending on the month is not a bar,
    it is a moving target.

    Bucketing each return by its own contemporaneous σ gives 0.445 at all three —
    stable, and calibrated to what actually happens.
    """
    return climatology_from_buckets([b for _, b in historical_buckets(closes, horizon)])
