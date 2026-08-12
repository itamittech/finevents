"""Append-only bitemporal storage (T1.2, REQ-102, REQ-105–108).

Two guarantees, both enforced here rather than by convention:

**Writes append.** Every put carries a condition that the key does not already
exist. A revision is a new record with a later `knowledge_time`, never an
overwrite — ADR-0016: *"an updated row makes it unanswerable forever."* The
condition means an accidental overwrite raises instead of succeeding quietly.

**Reads are as-of.** `query_as_of` returns only records with
`knowledge_time <= as_of`. Boundary equality is *inclusive* (REQ-107) and is the
likeliest bug in the project — Tasks.md says so directly, and it is tested
explicitly rather than left implied by the operator.

This module and `ingest/` are the only places permitted to hold a storage
client (ADR-0004, REQ-104), which `tools/check_boundaries.py` enforces.
"""

from __future__ import annotations

from collections.abc import Iterator, Sequence
from datetime import datetime
from typing import TYPE_CHECKING, Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from finevents.repository.clock import require_utc, to_iso
from finevents.repository.records import (
    KNOWLEDGE_TIME,
    PARTITION_KEY,
    SORT_KEY,
    BitemporalRecord,
)

if TYPE_CHECKING:  # pragma: no cover
    from mypy_boto3_dynamodb.service_resource import Table


class OverwriteRejected(RuntimeError):
    """A write would have replaced an existing vintage.

    Under forward-only there is no second attempt at a live day, so a silently
    clobbered record is unrecoverable evidence rather than a recoverable bug.
    """


class BitemporalStore:
    """Append-only access to one DynamoDB table."""

    def __init__(
        self, table_name: str, *, region: str = "us-east-1", endpoint_url: str | None = None
    ):
        self._table_name = table_name
        # endpoint_url carries the Docker Compose DynamoDB Local address in
        # local development (Design §8, T11.10); None means real AWS.
        resource = boto3.resource("dynamodb", region_name=region, endpoint_url=endpoint_url)
        self._table: Table = resource.Table(table_name)

    @property
    def table_name(self) -> str:
        return self._table_name

    # --- write ---------------------------------------------------------------

    def append(self, record: BitemporalRecord) -> None:
        """Write one vintage. Raises if the key already exists.

        The condition is what makes REQ-102 structural. Without it, "revisions
        append" is a rule every future call site has to remember, and ADR-0016
        rejected exactly that: *"correctness depends on every developer
        remembering, on every query, forever. The failure mode is silent and
        rewarding."*
        """
        try:
            self._table.put_item(
                Item=record.to_item(),
                ConditionExpression=(
                    Attr(PARTITION_KEY).not_exists() & Attr(SORT_KEY).not_exists()
                ),
            )
        except ClientError as exc:
            if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise OverwriteRejected(
                    f"{self._table_name}: a record already exists at "
                    f"{record.partition!r}/{record.sort!r}. Revisions append with a "
                    f"later knowledge_time (REQ-102); they never overwrite. If this "
                    f"is a revision, give it a sort key that distinguishes the vintage."
                ) from exc
            raise

    def append_all(self, records: Sequence[BitemporalRecord]) -> None:
        """Write many vintages.

        Deliberately **not** a `batch_writer`: batch writes cannot carry a
        condition expression, so using one would silently discard the
        append-only guarantee for the sake of throughput. Daily volumes here are
        in the thousands, not millions.
        """
        for record in records:
            self.append(record)

    # --- read ----------------------------------------------------------------

    def query_as_of(
        self,
        partition: str,
        as_of: datetime,
        *,
        sort_prefix: str | None = None,
        sort_from: str | None = None,
    ) -> list[BitemporalRecord]:
        """Records in `partition` knowable at `as_of`, in sort-key order.

        `knowledge_time <= as_of`, inclusive at the boundary (REQ-107).

        The filter is applied server-side but *after* the key condition, so it
        costs read capacity on rows it discards. That is the accepted trade:
        Design §3 fixes the sort keys around the access patterns each table
        actually has, and none of them can also carry `knowledge_time`. The
        alternative — filtering in the client — would let a caller forget.
        """
        as_of = require_utc(as_of, "as_of")

        condition = Key(PARTITION_KEY).eq(partition)
        if sort_prefix is not None:
            condition = condition & Key(SORT_KEY).begins_with(sort_prefix)
        elif sort_from is not None:
            condition = condition & Key(SORT_KEY).gte(sort_from)

        return list(
            self._paginate(
                KeyConditionExpression=condition,
                FilterExpression=Attr(KNOWLEDGE_TIME).lte(to_iso(as_of)),
            )
        )

    def _paginate(self, **kwargs: Any) -> Iterator[BitemporalRecord]:
        """Follow LastEvaluatedKey to exhaustion.

        A single `query` call returns at most 1 MB *before* the filter is
        applied, so a partition with many not-yet-knowable records can return an
        empty page while more matching records exist further on. Stopping at the
        first page would make as-of reads quietly incomplete — and incomplete in
        a way that looks like "no data yet".
        """
        while True:
            response = self._table.query(**kwargs)
            for item in response.get("Items", []):
                yield BitemporalRecord.from_item(item)

            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                return
            kwargs["ExclusiveStartKey"] = last_key

    def latest_as_of(self, partition: str, as_of: datetime) -> BitemporalRecord | None:
        """The most recently *known* record in a partition, or None.

        Returns None for an empty history rather than raising or substituting a
        default (REQ-108). A default here would be indistinguishable from real
        data at every downstream call site.
        """
        records = self.query_as_of(partition, as_of)
        if not records:
            return None
        return max(records, key=lambda r: (r.knowledge_time, r.sort))
