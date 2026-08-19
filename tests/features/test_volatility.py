"""σ and the five buckets, against Design §4.1 exactly.

Design §4.1 exists because *"two conforming-looking implementations differ by ~1%
on n≈56 observations, which flips borderline bucket assignments."* So these tests
check the specified choices individually — window, demeaning, ddof, the minimum,
and the inclusive side of each boundary — rather than checking that σ is
"about right".
"""

from __future__ import annotations

import math
import statistics

import pytest
from hypothesis import given
from hypothesis import strategies as st

from finevents.features.volatility import (
    BOUNDARIES_IN_SIGMA,
    MIN_SESSIONS,
    WINDOW_SESSIONS,
    AbstainedByConstruction,
    Bucket,
    buckets_for,
    climatology,
    historical_buckets,
    overlapping_log_returns,
    sigma,
)


def closes(n: int, start: float = 100.0, step: float = 1.0) -> tuple[float, ...]:
    """A deterministic ascending series. Not realistic — legible."""
    return tuple(start + i * step for i in range(n))


# --- the estimator itself ----------------------------------------------------


def test_sigma_matches_an_independent_implementation() -> None:
    """Cross-checked against `statistics.stdev`, which is ddof=1 by definition.

    The hand-rolled variance in `volatility.py` is deliberately explicit so it
    can be read against the spec; this asserts it agrees with the standard
    library rather than trusting that reading.
    """
    series = closes(80)
    window = series[-WINDOW_SESSIONS:]
    expected = statistics.stdev(overlapping_log_returns(window, 1))

    value, n = sigma(series, 1)

    assert value == pytest.approx(expected, rel=1e-12)
    assert n == WINDOW_SESSIONS - 1


@pytest.mark.parametrize("horizon,expected", [(1, 59), (5, 55), (10, 50)])
def test_the_window_is_sixty_closes_not_sixty_returns(horizon: int, expected: int) -> None:
    """`60 sessions` means 60 closes, yielding `60 − h` overlapping returns.

    The alternative reading — 60 *returns*, so 60+h closes — is equally natural
    and gives a different σ. Design §4.1's own "n≈56" arithmetic only works
    under this one, and pinning it here is what stops the Lane A and live paths
    drifting apart.
    """
    _, n = sigma(closes(200), horizon)
    assert n == expected


def test_sigma_is_demeaned() -> None:
    """A trending series has non-zero mean return; not subtracting it inflates σ."""
    series = closes(80, step=2.0)
    window = series[-WINDOW_SESSIONS:]
    returns = overlapping_log_returns(window, 1)

    demeaned, _ = sigma(series, 1)
    raw = math.sqrt(sum(r**2 for r in returns) / (len(returns) - 1))

    assert demeaned < raw
    assert demeaned == pytest.approx(statistics.stdev(returns), rel=1e-12)


def test_only_the_trailing_window_is_used() -> None:
    """Sessions before the last 60 must not move σ.

    A window that silently widened with history would make early and late
    predictions incomparable, and the drift would be invisible.
    """
    recent = closes(WINDOW_SESSIONS)
    padded = closes(40, start=5.0, step=9.0) + recent

    assert sigma(padded, 1)[0] == pytest.approx(sigma(recent, 1)[0], rel=1e-12)


# --- abstention --------------------------------------------------------------


def test_below_the_minimum_it_abstains_rather_than_defaulting() -> None:
    """Design §4.1: abstained *by construction*, never a substituted σ.

    A default here would set bucket boundaries from nothing, and every score
    downstream would inherit them without any signal that it had happened.
    """
    with pytest.raises(AbstainedByConstruction, match="40"):
        sigma(closes(MIN_SESSIONS - 1), 1)


def test_exactly_the_minimum_is_allowed() -> None:
    value, n = sigma(closes(MIN_SESSIONS), 1)
    assert value > 0
    assert n == MIN_SESSIONS - 1


def test_a_horizon_that_leaves_too_few_returns_abstains() -> None:
    with pytest.raises(AbstainedByConstruction):
        sigma(closes(MIN_SESSIONS), horizon=MIN_SESSIONS)


def test_non_positive_closes_are_refused() -> None:
    with pytest.raises(ValueError, match="non-positive"):
        overlapping_log_returns((100.0, 0.0, 100.0), 1)


# --- bucket boundaries -------------------------------------------------------


def test_boundaries_are_the_adr_multiples() -> None:
    b = buckets_for(closes(80), 1)
    assert b.edges == pytest.approx(tuple(m * b.sigma for m in BOUNDARIES_IN_SIGMA))
    assert BOUNDARIES_IN_SIGMA == (-1.5, -0.5, 0.5, 1.5)


@pytest.mark.parametrize(
    "multiple,expected",
    [
        (-3.0, Bucket.LARGE_DOWN),
        (-1.5, Bucket.SMALL_DOWN),  # lower-inclusive: −1.5σ ≤ r
        (-1.0, Bucket.SMALL_DOWN),
        (-0.5, Bucket.FLAT),  # lower-inclusive
        (0.0, Bucket.FLAT),
        (0.5, Bucket.SMALL_UP),  # lower-inclusive
        (1.4999, Bucket.SMALL_UP),
        (1.5, Bucket.LARGE_UP),  # r ≥ 1.5σ
        (3.0, Bucket.LARGE_UP),
    ],
)
def test_assignment_at_and_around_every_boundary(multiple: float, expected: Bucket) -> None:
    """Every boundary is lower-inclusive, per Design §4.1's table.

    Each edge is tested *at* the boundary, not near it. A `<=` where `<` belongs
    shifts one bucket at exactly the values that occur most often.
    """
    b = buckets_for(closes(80), 1)
    assert b.assign(multiple * b.sigma) == expected


def test_percentage_translation_is_the_log_inverse() -> None:
    """ADR-0008 shows a human "roughly +1.2% to +3.5%"; σ-relative stays internal."""
    b = buckets_for(closes(80), 1)
    for edge, percent in zip(b.edges, b.as_percent(), strict=True):
        assert percent == pytest.approx((math.exp(edge) - 1.0) * 100.0)


# --- climatology -------------------------------------------------------------


def test_climatology_is_a_distribution() -> None:
    freq = climatology(closes(400), 1)

    assert len(freq) == len(Bucket)
    assert sum(freq) == pytest.approx(1.0)
    assert all(p >= 0 for p in freq)


def test_climatology_is_scale_free() -> None:
    """REQ-404's bucket frequency must not move with the current volatility.

    Each historical return belongs to the bucket *its own* σ gave it (REQ-401),
    so multiplying the whole series by a constant — which scales every σ
    identically — must leave the frequencies untouched.

    Measured on real gold, the version that bucketed all history against today's
    σ reported 0.595, 0.753 and 0.620 on `flat` at three cut-offs in one year,
    against a realised flat rate of 0.448. A bar that moves by a third depending
    on the month is not a bar.
    """
    base = closes(400, start=100.0, step=1.0)
    scaled = tuple(v * 37.5 for v in base)

    assert climatology(base, 1) == pytest.approx(climatology(scaled, 1))


def test_climatology_reflects_the_realised_bucket_mix() -> None:
    """It is a frequency count, so it must equal the counted frequencies."""
    series = closes(300)
    buckets = [b for _, b in historical_buckets(series, 1)]
    freq = climatology(series, 1)

    for bucket in Bucket:
        expected = sum(1 for b in buckets if b == bucket) / len(buckets)
        assert freq[bucket] == pytest.approx(expected)


def test_the_bucket_history_is_a_stable_prefix() -> None:
    """The property the O(n) rolling evaluation depends on.

    Each entry uses only data up to its own index, so slicing a history computed
    once over the whole series must equal recomputing it at that cut-off. If this
    ever stops holding, every climatology in a rolling run is silently wrong.
    """
    series = closes(300)
    full = historical_buckets(series, 1)

    for cut_off in (150, 200, 250):
        recomputed = historical_buckets(series[: cut_off + 1], 1)
        assert [b for end, b in full if end <= cut_off] == [b for _, b in recomputed]


@given(
    values=st.lists(
        st.floats(min_value=50.0, max_value=5000.0, allow_nan=False, allow_infinity=False),
        min_size=MIN_SESSIONS,
        max_size=200,
    )
)
def test_sigma_is_non_negative_and_finite_for_any_positive_series(values: list[float]) -> None:
    value, _ = sigma(tuple(values), 1)
    assert math.isfinite(value)
    assert value >= 0.0


# --- the momentum bar (ADR-0058) ------------------------------------------------


def _trending(n: int = 200, step: float = 1.004) -> tuple[float, ...]:
    """A series that rises steadily with a deterministic wobble.

    The wobble matters: a perfectly geometric series has zero return variance,
    so sigma is zero, every drift is undefined and the bar degenerates. Real
    prices always have some; the fixture must too or it tests nothing.
    """
    price, out = 100.0, []
    for i in range(n):
        out.append(price * (1.0 + 0.006 * ((i % 7) - 3) / 3.0))
        price *= step
    return tuple(out)


def test_zero_drift_reproduces_climatology_exactly() -> None:
    """The momentum bar is a strict generalisation of the bar it sits beside:
    with no drift it IS climatology, so any difference between them on a live
    day is the drift and nothing else."""
    from finevents.features.volatility import climatology, drifted_climatology

    closes = _trending()
    for horizon in (1, 5):
        assert drifted_climatology(closes, horizon, 0.0) == climatology(closes, horizon)


def test_a_positive_drift_moves_belief_upward_and_a_negative_one_down() -> None:
    from finevents.features.volatility import drifted_climatology

    closes = _trending()
    base = drifted_climatology(closes, 1, 0.0)
    up = drifted_climatology(closes, 1, 0.75)
    down = drifted_climatology(closes, 1, -0.75)

    # The expected bucket is the honest invariant: on a strongly trending series
    # the up-mass can already be saturated, and the drift then moves belief from
    # "small up" to "large up" without changing the total above flat.
    def expected(row: tuple[float, ...]) -> float:
        return sum(i * p for i, p in enumerate(row))

    assert expected(up) > expected(base) > expected(down)
    for row in (base, up, down):
        assert abs(sum(row) - 1.0) < 1e-9


def test_recent_drift_is_measured_in_sigmas_and_is_price_only() -> None:
    from finevents.features.volatility import recent_drift_sigma

    rising = _trending()
    falling = tuple(reversed(rising))
    assert recent_drift_sigma(rising, 1) > 0
    assert recent_drift_sigma(falling, 1) < 0
    # a horizon of five sessions extrapolates five sessions of drift
    assert recent_drift_sigma(rising, 5) != recent_drift_sigma(rising, 1)
    assert recent_drift_sigma(rising[:5], 1) == 0.0  # too short to say anything
