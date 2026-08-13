"""Series slicing and the as-of covariate join (REQ-503, REQ-407).

The join is where a leakage bug would hide. Aligning covariates onto a target's
calendar means answering "what was the 10-year yield on a US market holiday",
and the only correct answer is *the last published value* — which is the same
semantics `AsOfRepository` gives over the store, arrived at from the other side.
"""

from __future__ import annotations

from datetime import date

import pytest

from finevents.features.panel import Panel, PanelError, Series, align

D = date


def series(name: str, pairs: list[tuple[str, float]]) -> Series:
    return Series.of(name, {D.fromisoformat(d): v for d, v in pairs})


GOLD = series("gold", [("2026-01-05", 100.0), ("2026-01-06", 101.0), ("2026-01-07", 102.0)])


# --- Series ------------------------------------------------------------------


def test_dates_must_be_strictly_ascending() -> None:
    """A duplicate silently corrupts every trailing window that spans it."""
    with pytest.raises(PanelError, match="ascending"):
        Series("x", (D(2026, 1, 6), D(2026, 1, 5)), (1.0, 2.0))


def test_mismatched_lengths_are_refused() -> None:
    with pytest.raises(PanelError, match="dates but"):
        Series("x", (D(2026, 1, 5),), (1.0, 2.0))


def test_as_of_is_inclusive_at_the_boundary() -> None:
    """Matches REQ-107. A session dated exactly at the cut-off is knowable."""
    assert len(GOLD.as_of(D(2026, 1, 6))) == 2
    assert GOLD.as_of(D(2026, 1, 6)).dates[-1] == D(2026, 1, 6)


def test_as_of_before_the_start_is_empty_not_an_error() -> None:
    assert len(GOLD.as_of(D(2020, 1, 1))) == 0


def test_latest_at_returns_the_last_known_value() -> None:
    """The whole point of the as-of join: a weekend takes Friday's value."""
    assert GOLD.latest_at(D(2026, 1, 6)) == 101.0
    assert GOLD.latest_at(D(2026, 1, 10)) == 102.0  # after the end, carry forward


def test_latest_at_before_the_series_starts_is_none() -> None:
    """None, not a default. A default here would be invented data."""
    assert GOLD.latest_at(D(2020, 1, 1)) is None


# --- the as-of join ----------------------------------------------------------


def test_a_covariate_missing_a_session_takes_its_last_known_value() -> None:
    """The US-holiday case, which is 22% of the real gold history.

    Dropping these sessions instead would discard a fifth of the data because
    Russian and US markets keep different holidays.
    """
    yields = series("yield", [("2026-01-05", 4.5), ("2026-01-07", 4.6)])  # 6th missing

    matrix = align(GOLD, [yields]).covariate_matrix()

    assert matrix["yield"] == (4.5, 4.5, 4.6)


def test_leading_sessions_without_coverage_are_trimmed_not_filled() -> None:
    """No back-fill. Design §7: never substitute a value.

    Back-filling would invent a covariate observation from the future, which is
    leakage wearing the costume of a convenience.
    """
    late = series("late", [("2026-01-06", 9.0), ("2026-01-07", 9.5)])

    panel = align(GOLD, [late])

    assert panel.dates == (D(2026, 1, 6), D(2026, 1, 7))
    assert panel.covariate_matrix()["late"] == (9.0, 9.5)


def test_a_covariate_starting_after_every_target_session_is_a_hard_error() -> None:
    later = series("later", [("2027-01-01", 1.0)])
    with pytest.raises(PanelError, match="no target session"):
        align(GOLD, [later])


def test_an_empty_covariate_is_refused() -> None:
    with pytest.raises(PanelError, match="no observations"):
        align(GOLD, [Series("empty", (), ())])


def test_covariate_matrix_refuses_rather_than_inventing() -> None:
    """Constructed directly, bypassing `align`'s trim — must still not fabricate."""
    late = series("late", [("2026-01-07", 9.0)])
    panel = Panel(GOLD, (late,))

    with pytest.raises(PanelError, match="no observation at or before"):
        panel.covariate_matrix()


def test_matrix_rows_are_parallel_to_the_target_calendar() -> None:
    """REQ-503: covariates as series aligned to the context window, not scalars."""
    a = series("a", [("2026-01-05", 1.0), ("2026-01-06", 2.0), ("2026-01-07", 3.0)])
    b = series("b", [("2026-01-05", 10.0), ("2026-01-07", 30.0)])

    panel = align(GOLD, [a, b])
    matrix = panel.covariate_matrix()

    assert all(len(row) == len(panel) for row in matrix.values())
    assert matrix["b"] == (10.0, 10.0, 30.0)


def test_panel_as_of_truncates_target_and_covariates_together() -> None:
    """A panel sliced at a cut-off must not leave a covariate reaching past it."""
    a = series("a", [("2026-01-05", 1.0), ("2026-01-06", 2.0), ("2026-01-07", 3.0)])

    sliced = align(GOLD, [a]).as_of(D(2026, 1, 6))

    assert sliced.dates[-1] == D(2026, 1, 6)
    assert sliced.covariates[0].dates[-1] == D(2026, 1, 6)
