"""The only sanctioned source of time (T1.5, REQ-109).

ADR-0016: *"A rolling window that silently anchors on 'now' rather than the
simulated date is a large real class of bug that this makes impossible rather
than merely unlikely."*

Two mechanisms, because one is not enough:

1. **This module.** Every component takes its time from `now()`, which resolves
   through a context-bound `Clock`. In Lane A calibration the bound clock is a
   `FrozenClock`, so "now" *is* the injected instant and cannot drift.
2. **`tools/check_boundaries.py`.** A lint forbidding `datetime.now()`,
   `datetime.utcnow()`, `date.today()` and `time.time()` anywhere under
   `src/finevents/` except this file. Without it, rule 1 is a convention that
   one import defeats silently.

ADR-0016 phrased this as "wall-clock access raises in backtest mode". ADR-0037
withdrew backtesting entirely; REQ-109 carries the surviving obligation, scoped
to **Lane A calibration** — the one place that legitimately runs against a past
instant.
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Protocol, runtime_checkable


class WallClockAccessError(RuntimeError):
    """Raised when wall-clock time is reached for under a frozen clock.

    Not a defensive nicety. Under Lane A calibration the whole point is that the
    only time is the injected `as_of`; a component that reads the real clock
    produces a number that looks right and is silently contaminated.
    """


@runtime_checkable
class Clock(Protocol):
    """The time source. Injected, never imported ambiently."""

    def now(self) -> datetime:
        """Current instant, timezone-aware and in UTC."""
        ...


class SystemClock:
    """Wall-clock time. The default outside Lane A calibration.

    This is the **only** place in `src/finevents/` permitted to call
    `datetime.now()`; the boundary lint enforces that.
    """

    __slots__ = ()

    def now(self) -> datetime:
        return datetime.now(UTC)

    def __repr__(self) -> str:  # pragma: no cover - diagnostics only
        return "SystemClock()"


class FrozenClock:
    """A clock pinned to one instant — the Lane A calibration clock.

    `now()` returns the injected instant rather than raising, because a frozen
    clock's answer to "what time is it" is well defined: it is `as_of`. What must
    raise is reaching *past* this abstraction to the real clock, and that is what
    the lint prevents.
    """

    __slots__ = ("_instant",)

    def __init__(self, instant: datetime) -> None:
        self._instant = require_utc(instant, "FrozenClock instant")

    @property
    def instant(self) -> datetime:
        return self._instant

    def now(self) -> datetime:
        return self._instant

    def __repr__(self) -> str:  # pragma: no cover - diagnostics only
        return f"FrozenClock({to_iso(self._instant)})"


class ForbiddenClock:
    """A clock that refuses. For tests asserting nothing reaches wall time."""

    __slots__ = ("_reason",)

    def __init__(self, reason: str = "wall-clock access is forbidden here") -> None:
        self._reason = reason

    def now(self) -> datetime:
        raise WallClockAccessError(self._reason)


# The default is `None` rather than a `SystemClock()` instance: a ContextVar
# default is shared across every context, and binding a mutable object there is
# the shape of bug that makes one request's state visible to another. This clock
# happens to be stateless, but the pattern should not be the exception.
_CLOCK: ContextVar[Clock | None] = ContextVar("finevents_clock", default=None)
_SYSTEM_CLOCK = SystemClock()


def now() -> datetime:
    """The current instant, per the bound clock. Always UTC-aware.

    Unbound, this is wall-clock time — the live path's correct behaviour, since
    Lane B's `as_of` *is* now (ADR-0037).
    """
    clock = _CLOCK.get()
    return (clock if clock is not None else _SYSTEM_CLOCK).now()


@contextmanager
def bind_clock(clock: Clock) -> Iterator[Clock]:
    """Bind `clock` for the duration of the block.

    Context-local rather than global, so a Lane A calibration running beside
    anything else cannot leak its frozen instant into the live path.
    """
    token = _CLOCK.set(clock)
    try:
        yield clock
    finally:
        _CLOCK.reset(token)


# --- canonical instant handling ---------------------------------------------
#
# Every stored timestamp uses one fixed-width UTC representation. This is not
# cosmetic: `knowledge_time <= as_of` is evaluated by DynamoDB as a *string*
# comparison, and it is only equivalent to the instant comparison when every
# value has identical width and offset. A single naive datetime or a `+00:00`
# offset mixed in with `Z` breaks the ordering silently, in the direction of
# returning records that should have been invisible.

ISO_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
ISO_WIDTH = 27  # 2026-08-10T12:34:56.789012Z


def require_utc(value: datetime, label: str = "timestamp") -> datetime:
    """Reject naive datetimes; normalise anything else to UTC."""
    if not isinstance(value, datetime):
        raise TypeError(f"{label} must be a datetime, got {type(value).__name__}")
    if value.tzinfo is None:
        raise ValueError(
            f"{label} is timezone-naive. Every instant in this system is UTC-aware — "
            "a naive value is an unanswerable question about which zone it meant."
        )
    return value.astimezone(UTC)


def to_iso(value: datetime) -> str:
    """Canonical fixed-width UTC string, safe for lexicographic comparison."""
    text = require_utc(value).strftime(ISO_FORMAT)
    if len(text) != ISO_WIDTH:  # pragma: no cover - guards a strftime surprise
        raise ValueError(f"non-canonical timestamp width {len(text)}: {text!r}")
    return text


def from_iso(text: str) -> datetime:
    """Inverse of `to_iso`. Rejects anything not in canonical form."""
    if len(text) != ISO_WIDTH or not text.endswith("Z"):
        raise ValueError(
            f"{text!r} is not a canonical instant. Expected {ISO_FORMAT} "
            f"({ISO_WIDTH} characters) — mixed formats break as-of ordering."
        )
    return datetime.strptime(text, ISO_FORMAT).replace(tzinfo=UTC)
