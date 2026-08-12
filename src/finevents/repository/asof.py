"""The single temporal gateway (T1.3, REQ-104, Design §2).

ADR-0016: *"All reads go through `AsOfRepository(as_of)`, which returns only
records where `knowledge_time <= as_of`. No component reads a store directly;
ingest writes, everything else reads through the gateway."*

**In Lane B — the live path — `as_of` is always now.** That is not a default to
be overridden; it is ADR-0037's forward-only rule, and
`tools/check_boundaries.py` refuses any call site outside `harness/` that
constructs one with a historical instant.

Increment 1 delivers the gateway and the stores that exist. Methods whose store
arrives in a later increment raise `StoreNotYetAvailable` naming the increment,
rather than returning an empty result — an empty series here would be
indistinguishable from "no data yet" at every call site downstream.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from finevents.repository.clock import now, require_utc, to_iso
from finevents.repository.records import BitemporalRecord
from finevents.repository.runs import RunManifest, parse_run_id
from finevents.repository.store import BitemporalStore


class StoreNotYetAvailable(NotImplementedError):
    """A gateway method whose backing store is built by a later increment."""


class AsOfRepository:
    """Reads the world as it was knowable at `as_of`.

    Construct with `as_of=now()` everywhere except Lane A calibration and the
    leakage harness.
    """

    def __init__(
        self,
        as_of: datetime | None = None,
        *,
        events_store: BitemporalStore | None = None,
        runs_store: BitemporalStore | None = None,
        environment: str = "dev",
    ) -> None:
        self._as_of = require_utc(as_of if as_of is not None else now(), "as_of")
        self._events = events_store
        self._runs = runs_store
        self._env = environment

    @property
    def as_of(self) -> datetime:
        return self._as_of

    @property
    def environment(self) -> str:
        return self._env

    def __repr__(self) -> str:  # pragma: no cover - diagnostics only
        return f"AsOfRepository(as_of={to_iso(self._as_of)}, env={self._env!r})"

    # --- implemented in increment 1 ------------------------------------------

    def events(self, since: datetime) -> list[BitemporalRecord]:
        """Events with `event_date >= since`, knowable at `as_of`.

        Two different filters, and conflating them is the leakage this whole
        model exists to prevent: `since` bounds *when the event happened*,
        `as_of` bounds *when we could have known about it*.
        """
        store = self._require(self._events, "events")
        since = require_utc(since, "since")

        # Design §3: events PK is `{env}#{event_date}`, so a range over event
        # dates is a scan across partitions. Query each day rather than one
        # unbounded scan — a Scan would also read partitions from other
        # environments, which ADR-0024 makes a boundary violation, not just
        # waste.
        records: list[BitemporalRecord] = []
        for event_date in _dates_between(since, self._as_of):
            records.extend(store.query_as_of(f"{self._env}#{event_date}", self._as_of))
        return records

    def manifest(self, run_id: str | None = None) -> RunManifest | None:
        """A run manifest, or the latest one knowable at `as_of`.

        `None` means no run has completed yet — a first run has no predecessor,
        and that is a legitimate state rather than an error (REQ-108).
        """
        store = self._require(self._runs, "runs")

        if run_id is not None:
            parse_run_id(run_id)
            for record in store.query_as_of(self._env, self._as_of, sort_prefix=run_id):
                if record.sort == run_id:
                    return RunManifest.from_body(record.body)
            return None

        # "The latest" resolves by lexicographic sort-key order, which is why
        # Design §3 fixes run_id to a sortable format.
        records = store.query_as_of(self._env, self._as_of)
        if not records:
            return None
        return RunManifest.from_body(max(records, key=lambda r: r.sort).body)

    # --- arriving with their stores ------------------------------------------

    def prices(self, instrument: str, window: int) -> Any:
        raise StoreNotYetAvailable(
            "prices() reads the Parquet price history (REQ-113), which increment 2 "
            "creates and increment 4 fills. Increment 1 defines the S3 prefix only."
        )

    def covariates(self, names: list[str], window: int) -> Any:
        raise StoreNotYetAvailable(
            "covariates() reads the five FRED series (REQ-205), which arrive with "
            "increment 4's ingest."
        )

    def page(self, path: str) -> Any:
        raise StoreNotYetAvailable(
            "page() reads the versioned wiki (REQ-111), which increment 11 builds."
        )

    # --- internals ------------------------------------------------------------

    def _require(self, store: BitemporalStore | None, name: str) -> BitemporalStore:
        if store is None:
            raise StoreNotYetAvailable(
                f"this repository was constructed without a {name} store. Pass "
                f"{name}_store= to read from it."
            )
        return store


def _dates_between(start: datetime, end: datetime) -> list[str]:
    """Inclusive ISO dates from `start` to `end`, in order."""
    if start > end:
        return []
    days = (end.date() - start.date()).days
    return [
        (start.date().fromordinal(start.date().toordinal() + offset)).isoformat()
        for offset in range(days + 1)
    ]
