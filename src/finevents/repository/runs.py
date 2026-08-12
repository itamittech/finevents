"""Run identity and the run manifest (Design §3, §7).

`run_id` is `{YYYY-MM-DD}T{HHMMSS}Z` — **lexicographically sortable, and so
chronologically ordered**. Design §3 is explicit that two behaviours depend on
that property:

- `AsOfRepository.manifest(run_id=None)` meaning "the latest"
- "the next run resumes from the last manifest" (§7 crash recovery)

*"A UUID breaks both silently."* Hence a parser that rejects anything else,
rather than a convention in a docstring.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from finevents.repository.clock import from_iso, require_utc, to_iso

RUN_ID_FORMAT = "%Y-%m-%dT%H%M%SZ"
RUN_ID_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{6}Z$")


class RunIdError(ValueError):
    """A run id that would break chronological ordering."""


def run_id_for(instant: datetime) -> str:
    """Canonical run id for an instant."""
    return require_utc(instant, "run instant").strftime(RUN_ID_FORMAT)


def parse_run_id(run_id: str) -> datetime:
    """Instant a run id denotes. Rejects any other shape."""
    if not RUN_ID_PATTERN.match(run_id):
        raise RunIdError(
            f"{run_id!r} is not a run id. Expected {RUN_ID_FORMAT} — the format is "
            "load-bearing: 'the latest manifest' and crash recovery both resolve by "
            "lexicographic order, and a non-sortable id breaks them silently."
        )
    return datetime.strptime(run_id, RUN_ID_FORMAT).replace(tzinfo=UTC)


@dataclass(frozen=True, slots=True)
class RunManifest:
    """What one pipeline run knew and did (Design §3, `runs` table).

    `consolidation_watermark` is the crash-recovery pointer from Design §7:
    steps 10–12 commit scores and page versions before step 16 predicts, so
    without it a mid-run halt orphans the day's evidence rows with no record of
    what was already folded in.
    """

    run_id: str
    cut_off: datetime
    period_id: str
    config_version: str
    consolidation_watermark: str | None = None
    manifest_pointer: str | None = None
    step_timings: dict[str, float] = field(default_factory=dict)
    token_usage: dict[str, int] = field(default_factory=dict)

    def __post_init__(self) -> None:
        parse_run_id(self.run_id)  # validates, raises on a non-sortable id
        object.__setattr__(self, "cut_off", require_utc(self.cut_off, "cut_off"))

    @property
    def started_at(self) -> datetime:
        return parse_run_id(self.run_id)

    def to_body(self) -> dict[str, Any]:
        """Attributes for the `runs` item, excluding the bitemporal timestamps."""
        return {
            "run_id": self.run_id,
            "cut_off": to_iso(self.cut_off),
            "period_id": self.period_id,
            "config_version": self.config_version,
            "consolidation_watermark": self.consolidation_watermark,
            "manifest_pointer": self.manifest_pointer,
            "step_timings": self.step_timings,
            "token_usage": self.token_usage,
        }

    @classmethod
    def from_body(cls, body: dict[str, Any]) -> RunManifest:
        return cls(
            run_id=body["run_id"],
            cut_off=from_iso(body["cut_off"]),
            period_id=body["period_id"],
            config_version=body["config_version"],
            consolidation_watermark=body.get("consolidation_watermark"),
            manifest_pointer=body.get("manifest_pointer"),
            step_timings=dict(body.get("step_timings") or {}),
            token_usage={k: int(v) for k, v in (body.get("token_usage") or {}).items()},
        )
