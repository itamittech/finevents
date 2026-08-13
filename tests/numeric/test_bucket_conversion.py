"""Quantile → bucket conversion (REQ-508, Design §4.13).

Design §4.13 calls the tail rule load-bearing rather than incidental, because the
outer buckets lie *entirely* in the tails: clamping there would understate large
moves in rungs 3 and 4 and so flatter the agent in the one comparison the project
exists to make. These tests pin the tail behaviour first.
"""

from __future__ import annotations

import math

import pytest

from finevents.features.volatility import Bucket, Buckets
from finevents.numeric.base import QUANTILE_LEVELS, QuantileForecast
from finevents.numeric.buckets import (
    PROBABILITY_FLOOR,
    ConversionError,
    ReturnCDF,
    flat_distribution,
    to_bucket_probabilities,
)

LAST_CLOSE = 10_000.0
SIGMA = 0.02
BUCKETS = Buckets(
    horizon=1,
    sigma=SIGMA,
    n_returns=59,
    edges=(-1.5 * SIGMA, -0.5 * SIGMA, 0.5 * SIGMA, 1.5 * SIGMA),
)


def forecast_from_returns(returns: list[float], horizon: int = 1) -> QuantileForecast:
    """A forecast whose quantiles are the given log returns off `LAST_CLOSE`."""
    prices = tuple(LAST_CLOSE * math.exp(r) for r in returns)
    return QuantileForecast(
        model="test", levels=QUANTILE_LEVELS, values={horizon: prices}, context_length=60
    )


def symmetric(scale: float) -> list[float]:
    """Nine deciles of a roughly normal return distribution, scaled."""
    z = [-1.2816, -0.8416, -0.5244, -0.2533, 0.0, 0.2533, 0.5244, 0.8416, 1.2816]
    return [scale * v for v in z]


# --- the CDF itself ----------------------------------------------------------


def test_cdf_reproduces_its_own_quantiles() -> None:
    """At each quantile value the CDF must return that quantile's level."""
    returns = symmetric(SIGMA)
    cdf = ReturnCDF(returns, list(QUANTILE_LEVELS))
    for value, level in zip(returns, QUANTILE_LEVELS, strict=True):
        assert cdf(value) == pytest.approx(level, abs=1e-9)


def test_cdf_is_monotone_across_the_whole_line() -> None:
    """PCHIP is specified precisely because a cubic spline can overshoot — and an
    overshoot on a CDF is a negative bucket probability."""
    cdf = ReturnCDF(symmetric(SIGMA), list(QUANTILE_LEVELS))
    grid = [(-6 + 12 * i / 400) * SIGMA for i in range(401)]
    seen = [cdf(r) for r in grid]
    assert all(b >= a - 1e-12 for a, b in zip(seen, seen[1:], strict=False))


def test_tails_leave_mass_beyond_the_outermost_quantiles() -> None:
    """The exponential tails must not clamp at the 10th and 90th percentiles.

    Checked at ±6σ, which is far past any real bucket edge — those sit at ±1.5σ.
    """
    cdf = ReturnCDF(symmetric(SIGMA), list(QUANTILE_LEVELS))

    assert 0.0 < cdf(-6 * SIGMA) < QUANTILE_LEVELS[0]
    assert QUANTILE_LEVELS[-1] < cdf(6 * SIGMA) < 1.0


def test_the_far_tail_saturates_rather_than_inverting() -> None:
    """Mathematically the tail never reaches 1; in float64 it does, around 20σ.

    `1 − excess` rounds to exactly 1.0 once the excess drops below ~1e-16. That is
    unavoidable and harmless — bucket edges live at 1.5σ — but it must saturate
    *monotonically* rather than wrap, because a CDF that stepped back down would
    give a negative bucket probability. The `PROBABILITY_FLOOR` then keeps the
    outermost bucket scoreable.
    """
    cdf = ReturnCDF(symmetric(SIGMA), list(QUANTILE_LEVELS))

    assert cdf(6 * SIGMA) <= cdf(20 * SIGMA) <= 1.0
    assert cdf(-20 * SIGMA) <= cdf(-6 * SIGMA)
    assert cdf(-20 * SIGMA) >= 0.0


def test_the_tail_is_not_clamped_at_the_outermost_level() -> None:
    """The failure mode Design §4.13 names explicitly.

    Clamping would make P(large down) exactly 0.1 for every forecast — the mass
    of the lowest quantile — regardless of how far the boundary sits into the
    tail. Here the boundary is well beyond the 10th percentile, so the true
    probability must be materially *below* 0.1.
    """
    wide = Buckets(
        horizon=1,
        sigma=SIGMA,
        n_returns=59,
        edges=(-4 * SIGMA, -0.5 * SIGMA, 0.5 * SIGMA, 4 * SIGMA),
    )
    probabilities = to_bucket_probabilities(
        forecast_from_returns(symmetric(SIGMA)), 1, LAST_CLOSE, wide
    )

    assert probabilities[Bucket.LARGE_DOWN] < 0.05
    assert probabilities[Bucket.LARGE_UP] < 0.05
    assert probabilities[Bucket.LARGE_DOWN] > 0.0


def test_a_flat_quantile_pair_is_refused() -> None:
    returns = symmetric(SIGMA)
    returns[4] = returns[3]
    with pytest.raises(ConversionError, match="strictly increasing"):
        ReturnCDF(returns, list(QUANTILE_LEVELS))


# --- the conversion ----------------------------------------------------------


def test_probabilities_form_a_distribution() -> None:
    p = to_bucket_probabilities(forecast_from_returns(symmetric(SIGMA)), 1, LAST_CLOSE, BUCKETS)

    assert len(p) == len(Bucket)
    assert sum(p) == pytest.approx(1.0)
    assert all(v >= PROBABILITY_FLOOR / 2 for v in p)


def test_a_centred_forecast_puts_most_mass_on_flat() -> None:
    """σ here equals the forecast scale, so ±0.5σ should capture roughly 38%."""
    p = to_bucket_probabilities(forecast_from_returns(symmetric(SIGMA)), 1, LAST_CLOSE, BUCKETS)

    assert p[Bucket.FLAT] == max(p)
    assert 0.30 < p[Bucket.FLAT] < 0.45


def test_a_shifted_forecast_moves_mass_upward() -> None:
    """The property that makes the forecast informative at all."""
    shifted = [r + 2 * SIGMA for r in symmetric(SIGMA)]
    p = to_bucket_probabilities(forecast_from_returns(shifted), 1, LAST_CLOSE, BUCKETS)

    assert p[Bucket.LARGE_UP] > p[Bucket.LARGE_DOWN]
    assert p[Bucket.SMALL_UP] + p[Bucket.LARGE_UP] > 0.5


def test_a_wider_forecast_moves_mass_into_the_tails() -> None:
    narrow = to_bucket_probabilities(
        forecast_from_returns(symmetric(SIGMA * 0.5)), 1, LAST_CLOSE, BUCKETS
    )
    wide = to_bucket_probabilities(
        forecast_from_returns(symmetric(SIGMA * 2.0)), 1, LAST_CLOSE, BUCKETS
    )

    assert wide[Bucket.FLAT] < narrow[Bucket.FLAT]
    assert wide[Bucket.LARGE_UP] > narrow[Bucket.LARGE_UP]
    assert wide[Bucket.LARGE_DOWN] > narrow[Bucket.LARGE_DOWN]


def test_symmetry_is_preserved() -> None:
    """A symmetric forecast against symmetric boundaries must give symmetric mass.

    An asymmetry here would mean the two tail fits disagree, which would bias
    every large-move probability in one direction.
    """
    p = to_bucket_probabilities(forecast_from_returns(symmetric(SIGMA)), 1, LAST_CLOSE, BUCKETS)

    assert p[Bucket.LARGE_DOWN] == pytest.approx(p[Bucket.LARGE_UP], rel=1e-6)
    assert p[Bucket.SMALL_DOWN] == pytest.approx(p[Bucket.SMALL_UP], rel=1e-6)


def test_a_non_positive_price_quantile_is_refused() -> None:
    bad = QuantileForecast(
        model="test",
        levels=QUANTILE_LEVELS,
        values={1: tuple(range(-4, 5))},
        context_length=60,
    )
    with pytest.raises(ConversionError, match="non-positive"):
        to_bucket_probabilities(bad, 1, LAST_CLOSE, BUCKETS)


def test_a_missing_horizon_is_refused() -> None:
    with pytest.raises(ConversionError, match="no horizon 5"):
        to_bucket_probabilities(forecast_from_returns(symmetric(SIGMA)), 5, LAST_CLOSE, BUCKETS)


def test_flat_distribution_is_scoreable() -> None:
    """All-flat needs a floor, or RPS against a large move would be undefined."""
    p = flat_distribution()
    assert sum(p) == pytest.approx(1.0)
    assert p[Bucket.FLAT] > 0.99
    assert all(v > 0 for v in p)
