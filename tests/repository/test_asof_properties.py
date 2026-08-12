"""Property tests over the as-of gateway (T1.4, REQ-105–108, REQ-407).

These are the `P`-coded requirements. Hypothesis generates the as-of values
rather than a developer choosing them, which is the point: the boundary bug this
layer exists to prevent is one a hand-picked example set reliably misses.
"""

from __future__ import annotations

import itertools
from datetime import UTC, datetime, timedelta

from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from finevents.repository.records import BitemporalRecord
from finevents.repository.store import BitemporalStore

# A bounded window keeps generated instants inside a plausible operating range
# and keeps the canonical formatter's fixed width honest (four-digit years).
EPOCH = datetime(2026, 1, 1, tzinfo=UTC)
HORIZON = timedelta(days=365)

instants = st.datetimes(
    min_value=EPOCH.replace(tzinfo=None),
    max_value=(EPOCH + HORIZON).replace(tzinfo=None),
    timezones=st.just(UTC),
)

PROPERTY = settings(
    max_examples=60,
    deadline=None,  # moto over botocore is slow enough to trip the default
    # The `store` fixture is module-scoped, so it is genuinely shared across
    # examples by design rather than by accident.
    suppress_health_check=[HealthCheck.function_scoped_fixture],
)

# Every example needs a partition no example has used, because writes are
# append-only and a repeat is rejected rather than overwritten.
#
# This is a counter and **not** a drawn strategy. `st.uuids()` shrinks toward
# canonical values, so it hands out the same UUID to many examples — and across
# test functions too, which makes one test's writes visible to another's
# "empty history" assertion. The partition is isolation scaffolding, not part of
# any property, so it has no business being generated data.
_partitions = itertools.count()


def fresh_partition() -> str:
    return f"prop#{next(_partitions):06d}"


def _write(store: BitemporalStore, partition: str, knowledge_times: list[datetime]) -> None:
    for index, knowledge_time in enumerate(knowledge_times):
        store.append(
            BitemporalRecord(
                partition=partition,
                sort=f"{index:04d}",
                event_time=EPOCH,
                knowledge_time=knowledge_time,
                body={"index": index},
            )
        )


# --- REQ-105 -----------------------------------------------------------------


@given(knowledge_times=st.lists(instants, min_size=1, max_size=8), as_of=instants)
@PROPERTY
def test_no_record_past_as_of_is_ever_returned(
    store: BitemporalStore, knowledge_times: list[datetime], as_of: datetime
) -> None:
    """REQ-105: `AsOfRepository(as_of)` returns no record with `knowledge_time > as_of`.

    The single guarantee the entire leakage argument rests on.
    """
    partition = fresh_partition()
    _write(store, partition, knowledge_times)

    for record in store.query_as_of(partition, as_of):
        assert record.knowledge_time <= as_of, (
            f"leaked a record knowable at {record.knowledge_time.isoformat()} "
            f"when reading as of {as_of.isoformat()}"
        )


# --- REQ-106 -----------------------------------------------------------------


@given(
    knowledge_times=st.lists(instants, min_size=1, max_size=8),
    as_of=instants,
    delta_seconds=st.integers(min_value=1, max_value=60 * 60 * 24 * 30),
)
@PROPERTY
def test_knowledge_is_monotonic_in_as_of(
    store: BitemporalStore,
    knowledge_times: list[datetime],
    as_of: datetime,
    delta_seconds: int,
) -> None:
    """REQ-106: reading at T yields a subset of reading at T + Δ, for Δ > 0.

    Knowledge only accumulates. A violation would mean something became
    *un*-knowable with the passage of time, which can only happen if a write
    path overwrote a vintage — the failure REQ-102 exists to prevent.
    """
    partition = fresh_partition()
    _write(store, partition, knowledge_times)

    earlier = {r.sort for r in store.query_as_of(partition, as_of)}
    later = {r.sort for r in store.query_as_of(partition, as_of + timedelta(seconds=delta_seconds))}

    assert (
        earlier <= later
    ), f"records visible at the earlier instant vanished later: {sorted(earlier - later)}"


# --- REQ-107 -----------------------------------------------------------------


@given(knowledge_time=instants)
@PROPERTY
def test_equality_at_the_boundary_is_always_inclusive(
    store: BitemporalStore, knowledge_time: datetime
) -> None:
    """REQ-107: a record whose `knowledge_time` equals `as_of` is included.

    `test_boundary_equality.py` pins this at fixed instants for readability;
    this generates the instant, so a formatter that is only correct for some
    microsecond values cannot hide.
    """
    partition = fresh_partition()
    _write(store, partition, [knowledge_time])

    found = store.query_as_of(partition, knowledge_time)

    assert len(found) == 1, (
        f"knowledge_time == as_of ({knowledge_time.isoformat()}) was excluded — "
        "the comparison is `<` where REQ-107 requires `<=`"
    )


# --- REQ-108 -----------------------------------------------------------------


@given(as_of=instants)
@PROPERTY
def test_empty_history_returns_empty_never_raises(store: BitemporalStore, as_of: datetime) -> None:
    """REQ-108: empty history returns an empty result, never an error and never
    a default value.

    A default here is the more dangerous of the two failures: it is
    indistinguishable from real data at every call site downstream, and it would
    enter a record that under forward-only cannot be re-run.
    """
    partition = fresh_partition()

    assert store.query_as_of(partition, as_of) == []
    assert store.latest_as_of(partition, as_of) is None


# --- REQ-407 -----------------------------------------------------------------


@given(
    knowledge_times=st.lists(instants, min_size=1, max_size=10),
    cut_off=instants,
    window=st.integers(min_value=1, max_value=60),
)
@PROPERTY
def test_no_window_size_can_reach_past_the_cut_off(
    store: BitemporalStore,
    knowledge_times: list[datetime],
    cut_off: datetime,
    window: int,
) -> None:
    """REQ-407: all feature normalisation uses only data with `knowledge_time`
    at or before the run's cut-off.

    Features arrive in increment 8, but the guarantee belongs here — Tasks.md
    assigns REQ-407 to T1.4 precisely because it is a property of the *gateway*,
    not of any estimator. A trailing-60-session σ is exactly the shape of
    computation that silently anchors on "now"; if no window size can reach past
    the cut-off, no normalisation built on this gateway can either.
    """
    partition = fresh_partition()
    _write(store, partition, knowledge_times)

    visible = store.query_as_of(partition, cut_off)
    trailing = sorted(visible, key=lambda r: r.knowledge_time)[-window:]

    assert all(r.knowledge_time <= cut_off for r in trailing)
    assert len(trailing) <= window
