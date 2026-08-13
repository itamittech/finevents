"""Conditional climatology — rung 2 (REQ-405, Design §4.10).

The failure this rung is most exposed to is not being wrong — it is being
*absent*: backing off to level 0 on every day, so rung 2 is rung 1 under another
name and the confounding check passes by not running. Design §4.10 says exactly
that, which is why the level travels with the forecast and why several of these
tests are about the ladder rather than the probabilities.
"""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from finevents.features.conditional import (
    LEVEL_CALENDAR,
    LEVEL_REGIME,
    LEVEL_UNCONDITIONAL,
    TERCILE_WINDOW,
    YIELD_CHANGE_SESSIONS,
    ConditioningError,
    DayFeatures,
    RegimeCell,
    conditional_climatology,
    regime_history,
)
from finevents.features.volatility import Bucket

ORIGIN = date(2020, 1, 6)  # a Monday


def day(index: int, bucket: Bucket, cell: RegimeCell | None) -> DayFeatures:
    return DayFeatures(index=index, when=ORIGIN + timedelta(days=index), bucket=bucket, cell=cell)


CELL_A = RegimeCell(0, 0)
CELL_B = RegimeCell(2, 2)


# --- the regime cell ---------------------------------------------------------


def test_no_cell_until_there_is_enough_history() -> None:
    """A tercile over fewer than 250 sessions is not a tercile."""
    n = TERCILE_WINDOW + YIELD_CHANGE_SESSIONS
    cells = regime_history([float(i) for i in range(n)], [float(i % 30) for i in range(n)])

    assert all(c is None for c in cells[:TERCILE_WINDOW])
    assert cells[-1] is not None


def test_cells_are_point_in_time_and_form_a_stable_prefix() -> None:
    """The reading this module takes, asserted.

    Each cell uses only data up to its own index, so truncating the inputs must
    not change any earlier cell. Without this a rolling evaluation would have to
    recompute the whole history at every cut-off — and, worse, a 2016 day's cell
    would drift as the cut-off moved.
    """
    n = 600
    yields = [float((i * 7) % 41) for i in range(n)]
    vix = [float((i * 13) % 29) for i in range(n)]

    full = regime_history(yields, vix)
    for cut_off in (400, 500):
        truncated = regime_history(yields[: cut_off + 1], vix[: cut_off + 1])
        assert truncated == full[: cut_off + 1]


def test_a_recent_yield_spike_lands_high_and_a_slump_lands_low() -> None:
    """The cell has to track the thing it claims to."""
    n = 400
    vix = [20.0] * n
    quiet = [4.0] * (n - YIELD_CHANGE_SESSIONS)
    spike = quiet + [4.0 + 0.1 * i for i in range(1, YIELD_CHANGE_SESSIONS + 1)]
    slump = quiet + [4.0 - 0.1 * i for i in range(1, YIELD_CHANGE_SESSIONS + 1)]

    assert regime_history(spike, vix)[-1].real_yield_change == 2
    assert regime_history(slump, vix)[-1].real_yield_change == 0


def test_the_cell_measures_how_unusual_today_is_not_the_direction() -> None:
    """Easy to misread, so pinned.

    A yield rising by the same amount every session has an *unchanging* 20-session
    change. Relative to its own trailing distribution that is not an unusual move
    at all — every day looks identical — so the cell does not flag it as a
    rate-rise regime. The conditioning variable is "how far is today's move from
    the recent norm", not "which way have yields been going".

    Ties land in the upper tercile, matching the lower-inclusive convention the
    movement buckets use (Design §4.1), so a degenerate all-equal window resolves
    to 2 rather than raising.
    """
    n = 400
    steady = [float(i) * 0.01 for i in range(n)]
    faster = [float(i) * 5.0 for i in range(n)]

    # Wildly different slopes, identical cell — because neither is *unusual*.
    assert regime_history(steady, [20.0] * n)[-1] == regime_history(faster, [20.0] * n)[-1]


def test_mismatched_series_lengths_are_refused() -> None:
    with pytest.raises(ConditioningError, match="aligned"):
        regime_history([1.0, 2.0, 3.0], [1.0, 2.0])


# --- the backoff ladder ------------------------------------------------------


def test_level_2_is_used_when_the_cell_has_enough_observations() -> None:
    history = [day(i, Bucket.LARGE_UP, CELL_A) for i in range(30)]

    out = conditional_climatology(history, CELL_A, ORIGIN + timedelta(days=31), n_min=10)

    assert out.level == LEVEL_REGIME
    assert out.n == 30
    assert out.probabilities[Bucket.LARGE_UP] == pytest.approx(1.0)


def test_it_conditions_rather_than_averaging() -> None:
    """The whole point: cell A's days must not be diluted by cell B's.

    If this fails, rung 2 returns something close to rung 1 while still reporting
    level 2 — the most misleading failure available to it.
    """
    history = [day(i, Bucket.LARGE_UP, CELL_A) for i in range(20)]
    history += [day(20 + i, Bucket.LARGE_DOWN, CELL_B) for i in range(20)]

    out = conditional_climatology(history, CELL_A, ORIGIN + timedelta(days=41), n_min=10)

    assert out.level == LEVEL_REGIME
    assert out.probabilities[Bucket.LARGE_UP] == pytest.approx(1.0)
    assert out.probabilities[Bucket.LARGE_DOWN] == pytest.approx(0.0)


def test_it_backs_off_to_calendar_when_the_cell_is_too_thin() -> None:
    """Level 1 is month × weekday, so the history must share both with today.

    Four years of Mondays gives roughly seventeen January Mondays — enough to
    clear n_min while the regime cell has none.
    """
    history = [day(7 * i, Bucket.FLAT, CELL_B) for i in range(4 * 52)]
    january_mondays = [d for d in history if d.when.month == 1 and d.when.weekday() == 0]
    assert len(january_mondays) >= 10

    target = date(2024, 1, 8)  # a January Monday
    out = conditional_climatology(history, CELL_A, target, n_min=10)

    assert out.level == LEVEL_CALENDAR
    assert out.n == len(january_mondays)


def test_it_backs_off_to_unconditional_when_nothing_else_qualifies() -> None:
    history = [day(i, Bucket.FLAT, CELL_B) for i in range(5)]

    out = conditional_climatology(history, CELL_A, date(2021, 7, 15), n_min=10)

    assert out.level == LEVEL_UNCONDITIONAL
    assert out.backed_off_to_unconditional


def test_an_undetermined_cell_skips_level_2_without_failing() -> None:
    """Early history has no cell. That is a backoff, not an error."""
    history = [day(i, Bucket.FLAT, None) for i in range(30)]

    out = conditional_climatology(history, None, date(2021, 7, 15), n_min=10)

    assert out.level == LEVEL_UNCONDITIONAL


def test_the_level_is_reported_so_a_silent_collapse_is_visible() -> None:
    """Design §4.10: without the level, a backoff to 0 is invisible and rung 2
    silently becomes rung 1."""
    history = [day(i, Bucket.FLAT, CELL_A) for i in range(30)]

    strict = conditional_climatology(history, CELL_A, ORIGIN + timedelta(days=31), n_min=1000)
    loose = conditional_climatology(history, CELL_A, ORIGIN + timedelta(days=31), n_min=5)

    assert strict.level == LEVEL_UNCONDITIONAL
    assert loose.level == LEVEL_REGIME
    assert strict.probabilities == loose.probabilities  # identical numbers…
    assert strict.level != loose.level  # …distinguishable only by the level


# --- refusals ----------------------------------------------------------------


def test_n_min_below_one_is_refused() -> None:
    with pytest.raises(ConditioningError, match="n_min"):
        conditional_climatology([day(0, Bucket.FLAT, CELL_A)], CELL_A, ORIGIN, n_min=0)


def test_empty_history_is_refused() -> None:
    with pytest.raises(ConditioningError, match="no history"):
        conditional_climatology([], CELL_A, ORIGIN, n_min=10)


def test_there_is_no_default_n_min() -> None:
    """REQ-408 is a calibration *method*, not a value. Passing one must be a
    deliberate act, so the parameter is required."""
    with pytest.raises(TypeError):
        conditional_climatology([day(0, Bucket.FLAT, CELL_A)], CELL_A, ORIGIN)  # type: ignore[call-arg]
