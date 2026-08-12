"""Writes append; they never overwrite (T1.2, REQ-102, REQ-101).

ADR-0016: *"Every vintage of a revised figure is retained. 'What did we believe
about Q2 GDP on 15 August' must be answerable, and an updated row makes it
unanswerable forever."*
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from finevents.repository.clock import from_iso, to_iso
from finevents.repository.records import BitemporalRecord, RecordShapeError
from finevents.repository.store import BitemporalStore, OverwriteRejected

T0 = datetime(2026, 8, 10, 20, 0, tzinfo=UTC)


def _record(partition: str, sort: str, *, knowledge_time: datetime, close: str) -> BitemporalRecord:
    return BitemporalRecord(
        partition=partition,
        sort=sort,
        event_time=T0,
        knowledge_time=knowledge_time,
        body={"close": close},
    )


def test_writing_the_same_key_twice_is_refused(store: BitemporalStore, partition: str) -> None:
    """The guarantee, stated as a failure.

    Without the condition expression, the second put would succeed and the first
    vintage would be gone — with no error, no log line, and no way to recover it
    under forward-only.
    """
    store.append(_record(partition, "close", knowledge_time=T0, close="100.0"))

    with pytest.raises(OverwriteRejected, match="REQ-102"):
        store.append(_record(partition, "close", knowledge_time=T0, close="999.9"))


def test_the_original_vintage_survives_a_rejected_overwrite(
    store: BitemporalStore, partition: str
) -> None:
    """A refused write must not have partially applied."""
    store.append(_record(partition, "close", knowledge_time=T0, close="100.0"))

    with pytest.raises(OverwriteRejected):
        store.append(_record(partition, "close", knowledge_time=T0, close="999.9"))

    survivors = store.query_as_of(partition, T0 + timedelta(days=1))
    assert [r.body["close"] for r in survivors] == ["100.0"]


def test_a_revision_is_a_new_vintage_and_both_remain_readable(
    store: BitemporalStore, partition: str
) -> None:
    """The bitemporal payoff: two answers to the same question, by date.

    This is the whole point of the model. On the 10th we believed 100.0; on the
    11th the exchange revised it to 101.5. Both statements are true, and asking
    at the right as-of returns the right one.
    """
    store.append(_record(partition, "close#r0", knowledge_time=T0, close="100.0"))
    store.append(
        _record(partition, "close#r1", knowledge_time=T0 + timedelta(days=1), close="101.5")
    )

    on_the_tenth = store.query_as_of(partition, T0)
    on_the_eleventh = store.query_as_of(partition, T0 + timedelta(days=1))

    assert [r.body["close"] for r in on_the_tenth] == ["100.0"]
    assert [r.body["close"] for r in on_the_eleventh] == ["100.0", "101.5"]
    assert store.latest_as_of(partition, T0).body["close"] == "100.0"
    assert store.latest_as_of(partition, T0 + timedelta(days=1)).body["close"] == "101.5"


def test_batch_writes_keep_the_guarantee(store: BitemporalStore, partition: str) -> None:
    """`append_all` must not trade the condition for throughput.

    DynamoDB's `batch_writer` cannot carry a condition expression, so using one
    would silently disable append-only for bulk paths — which is precisely where
    a duplicate is most likely.
    """
    store.append(_record(partition, "a", knowledge_time=T0, close="1"))

    with pytest.raises(OverwriteRejected):
        store.append_all(
            [
                _record(partition, "b", knowledge_time=T0, close="2"),
                _record(partition, "a", knowledge_time=T0, close="clobber"),
            ]
        )


# --- REQ-101: both timestamps, on every record in every store ----------------


def test_a_record_cannot_shadow_the_reserved_timestamps() -> None:
    """A body key named `knowledge_time` would overwrite the real one on write."""
    with pytest.raises(RecordShapeError, match="reserved"):
        BitemporalRecord(
            partition="p",
            sort="s",
            event_time=T0,
            knowledge_time=T0,
            body={"knowledge_time": "yesterday, honestly"},
        )


def test_reading_an_item_written_without_the_timestamps_is_a_hard_error() -> None:
    """REQ-101 is asserted on read, not just trusted on write.

    An item lacking either timestamp is evidence that some path bypassed the
    bitemporal writer. Tolerating it on read is how that path stays hidden.
    """
    with pytest.raises(RecordShapeError, match="REQ-101"):
        BitemporalRecord.from_item({"pk": "p", "sk": "s", "event_time": to_iso(T0)})


def test_naive_datetimes_are_refused() -> None:
    """A naive instant is an unanswerable question about which zone it meant."""
    with pytest.raises(ValueError, match="timezone-naive"):
        BitemporalRecord(
            partition="p", sort="s", event_time=T0, knowledge_time=datetime(2026, 8, 10)
        )


@given(
    moment=st.datetimes(
        min_value=datetime(2026, 1, 1), max_value=datetime(2027, 1, 1), timezones=st.just(UTC)
    )
)
@settings(max_examples=200, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_canonical_timestamps_round_trip_at_fixed_width(moment: datetime) -> None:
    """Every stored instant is the same width, or string ordering lies.

    DynamoDB compares `knowledge_time` as a *string*. That is equivalent to
    comparing instants only while every value is fixed-width UTC — one shorter
    value (a trimmed `.0` microsecond, say) sorts wrongly and the as-of filter
    starts returning records it should have hidden.
    """
    text = to_iso(moment)
    assert len(text) == 27
    assert text.endswith("Z")
    assert from_iso(text) == moment
