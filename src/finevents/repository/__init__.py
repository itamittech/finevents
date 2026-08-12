"""repository/ — AsOfRepository, bitemporal read/write, manifest access.

May import a storage client (ADR-0004).

This package is the **only** temporal gateway (REQ-104). Everything outside
`ingest/` reads through `AsOfRepository`; nothing else touches a store.
"""

from finevents.repository.asof import AsOfRepository, StoreNotYetAvailable
from finevents.repository.clock import (
    Clock,
    ForbiddenClock,
    FrozenClock,
    SystemClock,
    WallClockAccessError,
    bind_clock,
    from_iso,
    now,
    require_utc,
    to_iso,
)
from finevents.repository.records import BitemporalRecord, RecordShapeError
from finevents.repository.runs import RunIdError, RunManifest, parse_run_id, run_id_for
from finevents.repository.store import BitemporalStore, OverwriteRejected

__all__ = [
    "AsOfRepository",
    "BitemporalRecord",
    "BitemporalStore",
    "Clock",
    "ForbiddenClock",
    "FrozenClock",
    "OverwriteRejected",
    "RecordShapeError",
    "RunIdError",
    "RunManifest",
    "StoreNotYetAvailable",
    "SystemClock",
    "WallClockAccessError",
    "bind_clock",
    "from_iso",
    "now",
    "parse_run_id",
    "require_utc",
    "run_id_for",
    "to_iso",
]
