"""Ingest validation (REQ-208, REQ-209).

Three checks, per Design: schema conformance, range plausibility, and continuity
against the prior session.

**A failure halts. Nothing is substituted, interpolated or judged.** Design §7:
*"Halting is preferred to degrading wherever the alternative is a substituted
value. Under forward-only a missing day is a gap in the record — recoverable and
visible. A day built on substituted data is a silent corruption of the only
evidence the project will ever have."*

So these functions return findings and the caller halts. They never repair.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta

from finevents.features.panel import Series

# A day-over-day log move beyond this is implausible for a daily price series and
# is far more likely a decimal error, a units change or a source defect. Gold's
# own daily σ is around 1.1%, so 40% is ~35σ — deliberately loose, because this
# check exists to catch corruption, not to censor real volatility.
MAX_ABS_DAILY_LOG_MOVE = 0.35

# A price series that never moves is a stuck feed. Long public holidays exist, so
# this is set well beyond any real closure.
MAX_IDENTICAL_RUN = 15

# A gap longer than this in a daily series suggests missing data rather than a
# holiday period.
MAX_GAP_DAYS = 21


@dataclass(frozen=True, slots=True)
class Finding:
    series: str
    when: date | None
    rule: str
    detail: str

    def __str__(self) -> str:
        stamp = self.when.isoformat() if self.when else "-"
        return f"{self.series:<22} {stamp:<12} [{self.rule}] {self.detail}"


def validate(series: Series, *, max_gap_days: int = MAX_GAP_DAYS) -> list[Finding]:
    """Every finding for one series. Empty means clean."""
    findings: list[Finding] = []

    if not len(series):
        return [Finding(series.name, None, "schema", "series is empty")]

    # --- range plausibility ---
    for when, value in zip(series.dates, series.values, strict=True):
        if not math.isfinite(value):
            findings.append(Finding(series.name, when, "range", f"non-finite value {value!r}"))

    # --- continuity against the prior session ---
    previous_date, previous_value = series.dates[0], series.values[0]
    identical_run = 1

    for when, value in zip(series.dates[1:], series.values[1:], strict=True):
        gap = (when - previous_date).days
        if gap > max_gap_days:
            findings.append(
                Finding(
                    series.name,
                    when,
                    "continuity",
                    f"{gap}-day gap since {previous_date.isoformat()}",
                )
            )

        if math.isfinite(value) and math.isfinite(previous_value):
            if value == previous_value:
                identical_run += 1
                if identical_run == MAX_IDENTICAL_RUN + 1:
                    findings.append(
                        Finding(
                            series.name,
                            when,
                            "continuity",
                            f"unchanged for {MAX_IDENTICAL_RUN + 1} consecutive sessions "
                            f"at {value!r} — a stuck feed looks exactly like this",
                        )
                    )
            else:
                identical_run = 1

            if value > 0 and previous_value > 0:
                move = abs(math.log(value / previous_value))
                if move > MAX_ABS_DAILY_LOG_MOVE:
                    findings.append(
                        Finding(
                            series.name,
                            when,
                            "continuity",
                            f"{move * 100:.1f}% log move from {previous_value} to {value} "
                            f"— beyond the {MAX_ABS_DAILY_LOG_MOVE * 100:.0f}% plausibility bound",
                        )
                    )

        previous_date, previous_value = when, value

    return findings


def validate_prices(series: Series, **kwargs: object) -> list[Finding]:
    """`validate` plus the checks that only apply to a price series."""
    findings = [
        Finding(series.name, when, "range", f"non-positive price {value!r}")
        for when, value in zip(series.dates, series.values, strict=True)
        if value <= 0
    ]
    return findings + validate(series, **kwargs)  # type: ignore[arg-type]


def forward_coverage(series: Series, through: date) -> timedelta:
    """How stale the series is relative to `through`.

    Staleness is not a validation failure — a source publishing a day late is
    normal. It is reported so a silently dead feed is visible.
    """
    return through - series.dates[-1]
