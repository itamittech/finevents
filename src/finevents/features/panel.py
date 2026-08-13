"""Aligned series and the as-of covariate join (REQ-503, REQ-407).

A `Panel` is one target series plus covariates, all on the **target's** trading
calendar. Two rules make the alignment honest rather than convenient:

**Covariates join as-of, never by exact date.** For each target session, a
covariate contributes its most recent observation *at or before* that date. On a
US market holiday the last published 10-year yield is not missing data — it is
what was knowable, which is the same semantics `AsOfRepository` gives over the
store. Dropping those sessions instead would discard ~22% of the gold history
because Russian and US holidays differ.

**Nothing is invented.** A covariate with no observation at or before a session
leaves that session unusable, and the session is excluded rather than
back-filled. Design §7: never substitute a value; a gap is recoverable and
visible, a fabricated value is not.

Pure stdlib on purpose. The whole point of the demo is that σ can be recomputed
by hand from the same 60 closes, and a dependency-free implementation is one
fewer thing standing between the number and the check.
"""

from __future__ import annotations

import bisect
import itertools
from dataclasses import dataclass
from datetime import date


class PanelError(ValueError):
    """A panel that cannot be built honestly."""


@dataclass(frozen=True, slots=True)
class Series:
    """A dated numeric series, ascending by date, no duplicates."""

    name: str
    dates: tuple[date, ...]
    values: tuple[float, ...]

    def __post_init__(self) -> None:
        if len(self.dates) != len(self.values):
            raise PanelError(f"{self.name}: {len(self.dates)} dates but {len(self.values)} values")
        if any(b <= a for a, b in itertools.pairwise(self.dates)):
            raise PanelError(
                f"{self.name}: dates are not strictly ascending. A duplicate or "
                f"out-of-order session silently corrupts every trailing window."
            )

    def __len__(self) -> int:
        return len(self.dates)

    @classmethod
    def of(cls, name: str, rows: dict[date, float]) -> Series:
        ordered = sorted(rows)
        return cls(name, tuple(ordered), tuple(rows[d] for d in ordered))

    def as_of(self, cut_off: date) -> Series:
        """The series truncated to sessions at or before `cut_off`.

        Inclusive at the boundary, matching REQ-107. Slicing here rather than at
        each call site is what makes REQ-407 structural: no feature computed
        from the result can reach past the cut-off, whatever window it asks for.
        """
        end = bisect.bisect_right(self.dates, cut_off)
        return Series(self.name, self.dates[:end], self.values[:end])

    def latest_at(self, when: date) -> float | None:
        """Most recent value at or before `when`; None if the series starts later."""
        position = bisect.bisect_right(self.dates, when)
        return self.values[position - 1] if position else None

    def trailing(self, n: int) -> tuple[float, ...]:
        """The last `n` values. Fewer than `n` returns what exists."""
        return self.values[-n:] if n > 0 else ()


@dataclass(frozen=True, slots=True)
class Panel:
    """A target series with covariates aligned onto its calendar."""

    target: Series
    covariates: tuple[Series, ...]

    @property
    def dates(self) -> tuple[date, ...]:
        return self.target.dates

    def __len__(self) -> int:
        return len(self.target)

    def as_of(self, cut_off: date) -> Panel:
        return Panel(self.target.as_of(cut_off), tuple(c.as_of(cut_off) for c in self.covariates))

    def covariate_matrix(self) -> dict[str, tuple[float, ...]]:
        """Covariates as arrays parallel to `dates`, joined as-of.

        REQ-503 requires covariates as **series aligned to the context window**,
        not scalars, which is exactly this shape.
        """
        matrix: dict[str, tuple[float, ...]] = {}
        for covariate in self.covariates:
            row: list[float] = []
            for session in self.target.dates:
                value = covariate.latest_at(session)
                if value is None:
                    raise PanelError(
                        f"{covariate.name} has no observation at or before "
                        f"{session.isoformat()}. Build the panel with `align`, which "
                        f"trims the leading sessions rather than inventing values."
                    )
                row.append(value)
            matrix[covariate.name] = tuple(row)
        return matrix


def align(target: Series, covariates: list[Series]) -> Panel:
    """Build a panel on the target's calendar.

    Leading target sessions with no prior observation for some covariate are
    **trimmed**, not filled. That trim is the only data loss, it is reported by
    the returned panel's length, and it happens once at the start rather than
    scattered through the series.
    """
    if not len(target):
        raise PanelError(f"{target.name} is empty")

    starts = [c.dates[0] for c in covariates if len(c)]
    missing = [c.name for c in covariates if not len(c)]
    if missing:
        raise PanelError(f"covariates with no observations: {sorted(missing)}")

    first_usable = max([target.dates[0], *starts]) if starts else target.dates[0]
    begin = bisect.bisect_left(target.dates, first_usable)
    trimmed = Series(target.name, target.dates[begin:], target.values[begin:])

    if not len(trimmed):
        raise PanelError(
            f"no target session is covered by every covariate. Target starts "
            f"{target.dates[0]}, latest covariate start is {first_usable}."
        )
    return Panel(trimmed, tuple(covariates))
