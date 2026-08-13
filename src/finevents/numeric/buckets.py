"""Quantile → bucket conversion (REQ-508, Design §4.13).

Both models emit quantiles of the future *price*; the ladder needs probabilities
over the five σ-relative buckets of the *return*. Design §4.13 fixes the method:

1. Read the quantile levels and values as points on the CDF of the horizon return.
2. **Interior** — evaluate the CDF at each of the four bucket boundaries by
   monotone (PCHIP) interpolation in value-space, *"which cannot produce a
   non-monotone CDF the way a cubic spline can."*
3. **Tails** — beyond the outermost quantiles, fit an exponential tail matched to
   the slope between the two outermost quantile pairs.
4. Difference into five probabilities; floor each at `1e-6` and renormalise.

**The tail rule is not a detail.** Design §4.13: the outer buckets lie entirely in
the tails, so clamping there would cap each tail's mass at the extreme quantile
level and systematically understate large moves in rungs 3 and 4 — which would
*flatter the agent* in the one comparison the project exists to make.

PCHIP is implemented here rather than imported. `scipy` is available through the
numeric group, but scoring should not require a 1.3 GB model install to run, and
Fritsch–Carlson is forty lines that can be checked against the paper.
"""

from __future__ import annotations

import math

from finevents.features.volatility import Bucket, Buckets
from finevents.numeric.base import QuantileForecast

PROBABILITY_FLOOR = 1e-6


class ConversionError(ValueError):
    """A quantile set that cannot be read as a CDF."""


# --- monotone cubic Hermite (Fritsch–Carlson, 1980) --------------------------


def _pchip_slopes(xs: list[float], ys: list[float]) -> list[float]:
    """Derivatives that guarantee the interpolant is monotone.

    A natural cubic spline through monotone points can overshoot and come back
    down — which on a CDF means a negative bucket probability. Fritsch–Carlson
    zeroes the derivative at any local extremum and otherwise takes a weighted
    harmonic mean of the neighbouring secants, which cannot overshoot.
    """
    n = len(xs)
    h = [xs[i + 1] - xs[i] for i in range(n - 1)]
    secant = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]

    slopes = [0.0] * n
    for i in range(1, n - 1):
        if secant[i - 1] * secant[i] <= 0.0:
            slopes[i] = 0.0  # a local extremum: flat, never overshooting
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            slopes[i] = (w1 + w2) / (w1 / secant[i - 1] + w2 / secant[i])

    slopes[0] = _end_slope(
        secant[0], secant[1] if n > 2 else secant[0], h[0], h[1] if n > 2 else h[0]
    )
    slopes[-1] = _end_slope(
        secant[-1], secant[-2] if n > 2 else secant[-1], h[-1], h[-2] if n > 2 else h[-1]
    )
    return slopes


def _end_slope(near: float, far: float, h_near: float, h_far: float) -> float:
    """One-sided three-point endpoint slope, clamped to stay monotone."""
    slope = ((2 * h_near + h_far) * near - h_near * far) / (h_near + h_far)
    if slope * near <= 0.0:
        return 0.0
    if abs(slope) > 3 * abs(near):
        return 3 * near
    return slope


def _pchip_at(xs: list[float], ys: list[float], slopes: list[float], x: float) -> float:
    """Evaluate the interpolant at `x`, which must lie inside [xs[0], xs[-1]]."""
    i = 0
    while i < len(xs) - 2 and x > xs[i + 1]:
        i += 1

    h = xs[i + 1] - xs[i]
    t = (x - xs[i]) / h
    t2, t3 = t * t, t * t * t

    # Hermite basis.
    return (
        (2 * t3 - 3 * t2 + 1) * ys[i]
        + (t3 - 2 * t2 + t) * h * slopes[i]
        + (-2 * t3 + 3 * t2) * ys[i + 1]
        + (t3 - t2) * h * slopes[i + 1]
    )


# --- the CDF, interior and tails ---------------------------------------------


class ReturnCDF:
    """The CDF of the horizon return, read off a quantile set."""

    def __init__(self, values: list[float], levels: list[float]) -> None:
        if len(values) != len(levels) or len(values) < 3:
            raise ConversionError(
                f"need at least 3 matched (value, level) pairs, got "
                f"{len(values)} values and {len(levels)} levels"
            )
        if any(b <= a for a, b in zip(values, values[1:], strict=False)):
            raise ConversionError(
                "quantile values are not strictly increasing; a flat or crossed "
                "quantile pair has no CDF"
            )
        self.values = values
        self.levels = levels
        self._slopes = _pchip_slopes(values, levels)

        # Tail rates, matched to the slope between the two outermost pairs.
        # For F(r) = p0·exp(λ(r − v0)) the density at v0 is p0·λ, so λ = slope/p0.
        lower_slope = (levels[1] - levels[0]) / (values[1] - values[0])
        upper_slope = (levels[-1] - levels[-2]) / (values[-1] - values[-2])
        self._lower_rate = lower_slope / levels[0]
        self._upper_rate = upper_slope / (1.0 - levels[-1])

    def __call__(self, r: float) -> float:
        """P(return ≤ r)."""
        if r < self.values[0]:
            # Exponential lower tail — decays towards 0, never reaching it.
            return self.levels[0] * math.exp(self._lower_rate * (r - self.values[0]))
        if r > self.values[-1]:
            # Exponential upper tail — approaches 1, never reaching it.
            excess = (1.0 - self.levels[-1]) * math.exp(-self._upper_rate * (r - self.values[-1]))
            return 1.0 - excess
        return _pchip_at(self.values, self.levels, self._slopes, r)


# --- the conversion ----------------------------------------------------------


def to_bucket_probabilities(
    forecast: QuantileForecast,
    horizon: int,
    last_close: float,
    buckets: Buckets,
) -> tuple[float, ...]:
    """Five bucket probabilities for one horizon, in `Bucket` order.

    `last_close` converts the model's price quantiles into return quantiles. The
    log is monotone, so the q-th quantile of the price maps to the q-th quantile
    of the return — no re-sorting, no loss.
    """
    if last_close <= 0:
        raise ConversionError(f"last_close must be positive, got {last_close}")
    if horizon not in forecast.values:
        raise ConversionError(f"{forecast.track} has no horizon {horizon}")

    prices = forecast.values[horizon]
    if any(p <= 0 for p in prices):
        raise ConversionError(
            f"{forecast.track} h={horizon} produced a non-positive price quantile; "
            "a log return is undefined there"
        )

    returns = [math.log(p / last_close) for p in prices]
    cdf = ReturnCDF(returns, list(forecast.levels))

    at = [cdf(edge) for edge in buckets.edges]
    raw = [
        at[0],
        at[1] - at[0],
        at[2] - at[1],
        at[3] - at[2],
        1.0 - at[3],
    ]

    floored = [max(p, PROBABILITY_FLOOR) for p in raw]
    total = sum(floored)
    return tuple(p / total for p in floored)


def flat_distribution() -> tuple[float, ...]:
    """All mass on `flat` — the trivial baseline ADR-0008 says the ±5% scheme
    would have flattered. Floored so it remains scoreable."""
    raw = [PROBABILITY_FLOOR] * len(Bucket)
    raw[Bucket.FLAT] = 1.0
    total = sum(raw)
    return tuple(p / total for p in raw)
