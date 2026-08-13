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
    series = closes(400)
    b = buckets_for(series, 1)
    freq = climatology(series, 1, b)

    assert len(freq) == len(Bucket)
    assert sum(freq) == pytest.approx(1.0)
    assert all(p >= 0 for p in freq)


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
