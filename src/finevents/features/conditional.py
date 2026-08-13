"""Conditional climatology — rung 2 (REQ-405, Design §4.10).

Design §4.10 calls this *"the rung SystemDesign calls the one that matters most
for honesty — if Diwali and a rate-hike regime explain the movement, the event
narrative is decoration."*

**Regime state** is nine cells: the tercile of the trailing 20-session change in
the real 10Y yield (`DFII10` — ADR-0017 calls it arguably *the* dominant gold
driver) crossed with the tercile of VIX level, terciles cut on the trailing 250
sessions.

**The backoff ladder** takes the most specific level with at least `N_min`
observations:

| Level | Conditioning | Buildable today |
|---|---|---|
| 4 | regime cell × festival-window × expiry-week | ✗ needs T3.2's calendar |
| 3 | regime cell × festival-window | ✗ needs T3.2's calendar |
| 2 | regime cell | ✓ |
| 1 | month × weekday | ✓ |
| 0 | unconditional (= rung 1) | ✓ |

Levels 4 and 3 are declared and disabled rather than omitted, so that the level
numbering does not shift when the calendar arrives and old records stay readable.

**The level used is returned and must be stored** (REQ-405). Design is blunt about
why: *"Without it a backoff to level 0 is invisible, and rung 2 silently becomes
rung 1 — which would make the confounding check pass by not running."*

---

**A spec reading, written down rather than assumed.** §4.10 says terciles are
*"cut on the trailing 250 sessions, at the run cut-off"*. That fixes where they
are **cut**; it does not say which days they are **applied** to. Two readings:

- *Cut once at the cut-off, applied to all history.* Then a 2016 day is asked
  whether its yield change was in the top third of **2026's** distribution, and
  its cell changes every time the cut-off moves.
- *Point-in-time — each day classified by the terciles prevailing then.* "Top
  tercile" then means the same thing for every day, and the mapping is stable.

This module takes the **point-in-time** reading. It is the same correction that
`climatology` needed — bucketing history against today's σ made the baseline
swing by a third within one year — and it preserves the stable-prefix property
that keeps a rolling evaluation O(n) rather than O(n²). Both readings satisfy
REQ-407; only this one gives a conditioning cell that means one thing.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date

from finevents.features.volatility import Bucket, climatology_from_buckets

TERCILE_WINDOW = 250
YIELD_CHANGE_SESSIONS = 20

LEVEL_UNCONDITIONAL = 0
LEVEL_CALENDAR = 1
LEVEL_REGIME = 2
LEVEL_REGIME_FESTIVAL = 3
LEVEL_REGIME_FESTIVAL_EXPIRY = 4

#: Levels needing the festival/expiry table (T3.2), which does not exist yet.
UNAVAILABLE_LEVELS = (LEVEL_REGIME_FESTIVAL_EXPIRY, LEVEL_REGIME_FESTIVAL)


class ConditioningError(ValueError):
    """Conditioning that cannot be computed honestly."""


@dataclass(frozen=True, slots=True)
class RegimeCell:
    """One of nine cells. `None` terciles mean the cell is not yet determinable."""

    real_yield_change: int
    vix_level: int

    def __str__(self) -> str:
        names = ("low", "mid", "high")
        return f"dyield={names[self.real_yield_change]}/vix={names[self.vix_level]}"


@dataclass(frozen=True, slots=True)
class DayFeatures:
    """Everything rung 2 conditions on, for one historical session."""

    index: int
    when: date
    bucket: Bucket
    cell: RegimeCell | None


@dataclass(frozen=True, slots=True)
class ConditionalForecast:
    """A rung-2 distribution, with the level that produced it.

    `level` is not diagnostic decoration — REQ-405 requires it stored with the
    prediction, because a run that silently backs off to level 0 is rung 1 wearing
    rung 2's name.
    """

    probabilities: tuple[float, ...]
    level: int
    n: int
    cell: RegimeCell | None

    @property
    def backed_off_to_unconditional(self) -> bool:
        return self.level == LEVEL_UNCONDITIONAL


def _tercile(value: float, sample: Sequence[float]) -> int | None:
    """Which third of `sample` contains `value`. None if the sample is too thin."""
    if len(sample) < TERCILE_WINDOW:
        return None
    ordered = sorted(sample)
    lower = ordered[len(ordered) // 3]
    upper = ordered[2 * len(ordered) // 3]
    if value < lower:
        return 0
    if value < upper:
        return 1
    return 2


def regime_history(real_yield: Sequence[float], vix: Sequence[float]) -> list[RegimeCell | None]:
    """The regime cell for every session, classified point-in-time.

    Entry `i` uses only `real_yield[:i+1]` and `vix[:i+1]`, so the result is a
    **stable prefix** — the same property `historical_buckets` relies on, and the
    reason a rolling evaluation can precompute this once.
    """
    if len(real_yield) != len(vix):
        raise ConditioningError(
            f"real yield has {len(real_yield)} sessions against VIX's {len(vix)}; "
            "both must be aligned to the target calendar"
        )

    changes: list[float | None] = [None] * len(real_yield)
    for i in range(YIELD_CHANGE_SESSIONS, len(real_yield)):
        changes[i] = real_yield[i] - real_yield[i - YIELD_CHANGE_SESSIONS]

    cells: list[RegimeCell | None] = []
    for i in range(len(real_yield)):
        change = changes[i]
        if change is None:
            cells.append(None)
            continue

        change_window = [
            c for c in changes[max(0, i - TERCILE_WINDOW + 1) : i + 1] if c is not None
        ]
        vix_window = vix[max(0, i - TERCILE_WINDOW + 1) : i + 1]

        change_tercile = _tercile(change, change_window)
        vix_tercile = _tercile(vix[i], vix_window)
        cells.append(
            None
            if change_tercile is None or vix_tercile is None
            else RegimeCell(change_tercile, vix_tercile)
        )
    return cells


def conditional_climatology(
    history: Sequence[DayFeatures],
    today_cell: RegimeCell | None,
    today: date,
    n_min: int,
) -> ConditionalForecast:
    """Rung 2 for one cut-off, via the backoff ladder.

    `history` must contain only sessions at or before the cut-off; slicing it is
    the caller's job, which keeps REQ-407 a property of the data handed in rather
    than a rule this function has to remember.

    `n_min` is **REQ-408**, a calibration *method* rather than a value. It has no
    default here on purpose: too low and rung 2 fits noise and beats the agent for
    the wrong reason; too high and it collapses to level 0, so the confounding
    check passes by not running. Passing a number is a deliberate act, and until
    it is calibrated against the seed join the number is provisional.
    """
    if n_min < 1:
        raise ConditioningError(f"n_min must be at least 1, got {n_min}")
    if not history:
        raise ConditioningError("no history to condition on")

    # Level 2 — regime cell.
    if today_cell is not None:
        matching = [d.bucket for d in history if d.cell == today_cell]
        if len(matching) >= n_min:
            return ConditionalForecast(
                climatology_from_buckets(matching), LEVEL_REGIME, len(matching), today_cell
            )

    # Level 1 — month × weekday.
    matching = [
        d.bucket
        for d in history
        if d.when.month == today.month and d.when.weekday() == today.weekday()
    ]
    if len(matching) >= n_min:
        return ConditionalForecast(
            climatology_from_buckets(matching), LEVEL_CALENDAR, len(matching), today_cell
        )

    # Level 0 — unconditional. Identical to rung 1, which is exactly why the
    # level travels with the forecast.
    buckets = [d.bucket for d in history]
    return ConditionalForecast(
        climatology_from_buckets(buckets), LEVEL_UNCONDITIONAL, len(buckets), today_cell
    )
