"""The frozen clock, and the wall-clock ban (T1.5, REQ-109).

ADR-0016: *"A rolling window that silently anchors on 'now' rather than the
simulated date is a large real class of bug that this makes impossible rather
than merely unlikely."*

REQ-109 is verified `U` **and** `CI`. The unit half is here; the CI half is the
wall-clock rule in `tools/check_boundaries.py`, tested in
`tests/tools/test_boundaries.py`. Either alone is insufficient — the runtime
abstraction can be bypassed by an import, and a lint cannot prove the frozen
instant is actually used.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from finevents.repository.clock import (
    ForbiddenClock,
    FrozenClock,
    SystemClock,
    WallClockAccessError,
    bind_clock,
    now,
)

AS_OF = datetime(2026, 8, 10, 21, 0, tzinfo=UTC)


def test_frozen_clock_returns_the_injected_instant() -> None:
    assert FrozenClock(AS_OF).now() == AS_OF


def test_frozen_clock_does_not_advance() -> None:
    """Two reads, one instant. A clock that drifted would reintroduce exactly the
    bug the abstraction exists to remove."""
    clock = FrozenClock(AS_OF)
    assert clock.now() == clock.now() == AS_OF


def test_bound_clock_is_what_now_resolves_to() -> None:
    with bind_clock(FrozenClock(AS_OF)):
        assert now() == AS_OF


def test_binding_is_restored_afterwards() -> None:
    """A leaked frozen instant would silently pin the live path to a past date."""
    with bind_clock(FrozenClock(AS_OF)):
        pass
    assert now() > AS_OF  # back on the system clock


def test_nested_binding_restores_the_outer_clock() -> None:
    outer = FrozenClock(AS_OF)
    inner = FrozenClock(AS_OF + timedelta(days=1))

    with bind_clock(outer):
        with bind_clock(inner):
            assert now() == inner.instant
        assert now() == outer.instant


def test_forbidden_clock_raises() -> None:
    """For tests that must prove nothing reached wall time."""
    with (
        bind_clock(ForbiddenClock("Lane A calibration must not read the wall clock")),
        pytest.raises(WallClockAccessError, match="Lane A"),
    ):
        now()


def test_frozen_clock_rejects_a_naive_instant() -> None:
    with pytest.raises(ValueError, match="timezone-naive"):
        FrozenClock(datetime(2026, 8, 10, 21, 0))


def test_frozen_clock_normalises_to_utc() -> None:
    """An instant given in another zone is the same instant, stored canonically."""
    from datetime import timezone

    ist = timezone(timedelta(hours=5, minutes=30))
    clock = FrozenClock(datetime(2026, 8, 11, 2, 30, tzinfo=ist))

    assert clock.now() == AS_OF
    assert clock.now().tzinfo is UTC


def test_system_clock_is_utc_aware() -> None:
    moment = SystemClock().now()
    assert moment.tzinfo is not None
    assert moment.utcoffset() == timedelta(0)
