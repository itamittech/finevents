"""The bitemporal record (T1.1, REQ-101, REQ-102).

Two timestamps on every record in every store, per ADR-0016:

    event_time      when the thing happened in the world
    knowledge_time  the earliest moment we could have known it

**This is the one thing in the project that cannot be retrofitted.** For several
sources the information needed to reconstruct `knowledge_time` is simply gone
once the moment passes — a revised close overwrites the vintage, a headline is
edited, a consensus figure is restated. Every store therefore takes its records
through this type rather than assembling dicts at each call site.

Derivation per source, including the conservative fallback where a source
publishes no ingestion timestamp, is documented in
`docs/design/knowledge-time-derivation.md` (REQ-103).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from finevents.repository.clock import from_iso, require_utc, to_iso

EVENT_TIME = "event_time"
KNOWLEDGE_TIME = "knowledge_time"
PARTITION_KEY = "pk"
SORT_KEY = "sk"

# Attribute names the record layer owns. A body may not shadow them — doing so
# would let a caller overwrite the very timestamps the model exists to protect.
RESERVED = frozenset({EVENT_TIME, KNOWLEDGE_TIME, PARTITION_KEY, SORT_KEY})


class RecordShapeError(ValueError):
    """A record that would violate the bitemporal contract."""


@dataclass(frozen=True, slots=True)
class BitemporalRecord:
    """One immutable vintage of a fact.

    Frozen because REQ-102 makes revisions *append*: a corrected figure is a new
    record with a later `knowledge_time`, never a mutation of this one. Making
    the object immutable removes the shape of code that would do otherwise.
    """

    partition: str
    sort: str
    event_time: datetime
    knowledge_time: datetime
    body: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.partition:
            raise RecordShapeError("partition key must be non-empty")
        if not self.sort:
            raise RecordShapeError("sort key must be non-empty")

        object.__setattr__(self, EVENT_TIME, require_utc(self.event_time, EVENT_TIME))
        object.__setattr__(self, KNOWLEDGE_TIME, require_utc(self.knowledge_time, KNOWLEDGE_TIME))

        shadowed = RESERVED & set(self.body)
        if shadowed:
            raise RecordShapeError(
                f"body may not contain reserved attributes {sorted(shadowed)} — "
                "these are owned by the bitemporal layer (REQ-101)"
            )

    @property
    def is_backdated(self) -> bool:
        """True when we learned of this after it happened — the normal case.

        The inverse is worth being able to spot: `knowledge_time` earlier than
        `event_time` means we claim to have known something before it occurred,
        which is either a scheduled-future record (a consensus forecast for a
        release that has not happened) or a bug. The repository does not reject
        it, because the first case is legitimate and common in this system.
        """
        return self.knowledge_time >= self.event_time

    def to_item(self) -> dict[str, Any]:
        """DynamoDB item. Timestamps canonicalised for lexicographic ordering."""
        return {
            PARTITION_KEY: self.partition,
            SORT_KEY: self.sort,
            EVENT_TIME: to_iso(self.event_time),
            KNOWLEDGE_TIME: to_iso(self.knowledge_time),
            **self.body,
        }

    @classmethod
    def from_item(cls, item: dict[str, Any]) -> BitemporalRecord:
        """Inverse of `to_item`. Missing timestamps are a hard error.

        REQ-101 is a `CI`-verified assertion over *every* store. A record that
        reached storage without both timestamps is not something to tolerate on
        read — it is evidence that some write path bypassed this layer.
        """
        for attribute in (PARTITION_KEY, SORT_KEY, EVENT_TIME, KNOWLEDGE_TIME):
            if attribute not in item:
                raise RecordShapeError(
                    f"stored item is missing {attribute!r} (REQ-101). Every record in "
                    f"every store carries event_time and knowledge_time; this one "
                    f"reached storage without going through the bitemporal writer."
                )
        body = {k: v for k, v in item.items() if k not in RESERVED}
        return cls(
            partition=item[PARTITION_KEY],
            sort=item[SORT_KEY],
            event_time=from_iso(item[EVENT_TIME]),
            knowledge_time=from_iso(item[KNOWLEDGE_TIME]),
            body=body,
        )
