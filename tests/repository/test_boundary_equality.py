"""Boundary equality at `as_of` (T1.4, REQ-107).

**Read this file if you read nothing else in the repository tests.**

Tasks.md T1.4: *"Boundary equality is the likeliest bug and the least likely to
be noticed."* Execution.md increment 1 says the same thing and points here.

The bug is one character. `knowledge_time < as_of` instead of `<=` looks
correct, passes every casual test, and silently drops exactly the records whose
knowledge arrived at the cut-off instant. In a daily pipeline whose cut-off is a
market close, "arrived exactly at the cut-off" is not a rare edge — it is the
close price itself, every single day.

It fails in the *safe-looking* direction too. Dropping records makes the system
appear more conservative about leakage, so it produces no alarming symptom;
it just quietly starves the forecast of the most recent bar.

Each test below pins one side of the boundary, with no randomisation, so a
failure names the exact relation that broke.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from finevents.repository.records import BitemporalRecord
from finevents.repository.store import BitemporalStore

CUT_OFF = datetime(2026, 8, 10, 21, 0, 0, tzinfo=UTC)
ONE_MICROSECOND = timedelta(microseconds=1)


def _record(partition: str, sort: str, knowledge_time: datetime) -> BitemporalRecord:
    return BitemporalRecord(
        partition=partition,
        sort=sort,
        event_time=datetime(2026, 8, 10, 20, 0, 0, tzinfo=UTC),
        knowledge_time=knowledge_time,
        body={"close": "1234.5"},
    )


def test_knowledge_time_exactly_at_as_of_is_included(
    store: BitemporalStore, partition: str
) -> None:
    """`knowledge_time == as_of` is knowable. This is REQ-107, stated directly.

    If this test fails, the comparison is `<` where it must be `<=`.
    """
    store.append(_record(partition, "exact", CUT_OFF))

    found = store.query_as_of(partition, CUT_OFF)

    assert [r.sort for r in found] == ["exact"], (
        "a record whose knowledge_time equals as_of was excluded. REQ-107 makes "
        "the boundary inclusive; `<` instead of `<=` drops the cut-off instant, "
        "which in this pipeline is the daily close."
    )


def test_one_microsecond_after_as_of_is_excluded(store: BitemporalStore, partition: str) -> None:
    """The other side of the same boundary — REQ-105.

    If this test fails, the comparison is `<=` where the value is later, i.e.
    the filter is not applied at all, and the gateway is leaking.
    """
    store.append(_record(partition, "just-after", CUT_OFF + ONE_MICROSECOND))

    found = store.query_as_of(partition, CUT_OFF)

    assert found == [], (
        "a record knowable only after as_of was returned. That is leakage: the "
        "forecast can see the future by one microsecond, and nothing downstream "
        "can detect it."
    )


def test_one_microsecond_before_as_of_is_included(store: BitemporalStore, partition: str) -> None:
    """The uncontroversial side, pinned so a broken filter cannot pass by
    excluding everything."""
    store.append(_record(partition, "just-before", CUT_OFF - ONE_MICROSECOND))

    assert [r.sort for r in store.query_as_of(partition, CUT_OFF)] == ["just-before"]


def test_all_three_positions_together(store: BitemporalStore, partition: str) -> None:
    """Before, exactly at, and after — in one partition.

    Written separately from the three tests above because a filter can be wrong
    in a way that only shows when the boundary record has neighbours: an
    off-by-one in a range comparison, or a sort-key assumption leaking into what
    should be a knowledge-time decision.
    """
    store.append(_record(partition, "a-before", CUT_OFF - ONE_MICROSECOND))
    store.append(_record(partition, "b-exact", CUT_OFF))
    store.append(_record(partition, "c-after", CUT_OFF + ONE_MICROSECOND))

    found = [r.sort for r in store.query_as_of(partition, CUT_OFF)]

    assert found == ["a-before", "b-exact"], (
        f"expected the two knowable records in sort order, got {found}. "
        "Exactly two of the three are visible at the cut-off."
    )


def test_boundary_holds_at_a_whole_second(store: BitemporalStore, partition: str) -> None:
    """The same boundary where microseconds are zero.

    Canonical timestamps are fixed-width with `.000000` for a whole second. A
    formatter that trimmed trailing zeros would make this string shorter than
    its neighbours and break the lexicographic comparison the filter relies on —
    while every microsecond-bearing test above still passed.
    """
    whole_second = datetime(2026, 8, 10, 21, 0, 0, 0, tzinfo=UTC)
    store.append(_record(partition, "whole", whole_second))

    assert [r.sort for r in store.query_as_of(partition, whole_second)] == ["whole"]
