"""Ranked probability score (REQ-803, Design §4.2).

The formula is three lines. What these tests pin is the *property* RPS is chosen
for — that it knows the buckets are ordered — because a plausible-looking
implementation that ignores the ordering would still return a number.
"""

from __future__ import annotations

import math

import pytest

from finevents.features.volatility import Bucket
from finevents.numeric.buckets import flat_distribution
from finevents.score.rps import (
    ScoringError,
    compare_paired,
    ranked_probability_score,
    summarise,
)


def certain(bucket: Bucket) -> tuple[float, ...]:
    return tuple(1.0 if i == bucket else 0.0 for i in range(len(Bucket)))


UNIFORM = tuple(0.2 for _ in Bucket)


# --- the formula -------------------------------------------------------------


def test_a_correct_certain_forecast_scores_zero() -> None:
    assert ranked_probability_score(certain(Bucket.FLAT), Bucket.FLAT) == 0.0


def test_the_worst_possible_forecast_scores_one() -> None:
    """All mass on large up, outcome large down. RPS is normalised to [0, 1]."""
    assert ranked_probability_score(certain(Bucket.LARGE_UP), Bucket.LARGE_DOWN) == pytest.approx(
        1.0
    )


def test_uniform_scores_the_same_from_either_extreme() -> None:
    low = ranked_probability_score(UNIFORM, Bucket.LARGE_DOWN)
    high = ranked_probability_score(UNIFORM, Bucket.LARGE_UP)
    assert low == pytest.approx(high)


# --- the property RPS exists for --------------------------------------------


def test_being_wrong_by_one_bucket_costs_less_than_by_four() -> None:
    """Design §4.2's stated reason for choosing RPS over log loss or accuracy.

    An implementation that ignored the ordering — treating the buckets as
    unordered classes — would score these two identically, and every comparison
    downstream would silently lose the thing the bucket scheme is *for*.
    """
    near = ranked_probability_score(certain(Bucket.SMALL_UP), Bucket.FLAT)
    far = ranked_probability_score(certain(Bucket.LARGE_UP), Bucket.LARGE_DOWN)
    assert near < far


def test_error_grows_monotonically_with_distance() -> None:
    outcome = Bucket.LARGE_DOWN
    scores = [ranked_probability_score(certain(b), outcome) for b in Bucket]
    assert all(b > a for a, b in zip(scores, scores[1:], strict=False))


def test_hedging_beats_being_confidently_wrong() -> None:
    """The behaviour that makes RPS a proper scoring rule worth optimising."""
    hedged = ranked_probability_score(UNIFORM, Bucket.LARGE_DOWN)
    confident_wrong = ranked_probability_score(certain(Bucket.LARGE_UP), Bucket.LARGE_DOWN)
    assert hedged < confident_wrong


def test_all_flat_is_punished_on_a_large_move() -> None:
    """The trivial baseline ADR-0008 says a ±5% scheme would have flattered."""
    quiet = ranked_probability_score(flat_distribution(), Bucket.FLAT)
    violent = ranked_probability_score(flat_distribution(), Bucket.LARGE_DOWN)
    assert quiet < 1e-6
    assert violent > 0.4


# --- refusals ----------------------------------------------------------------


def test_probabilities_that_do_not_sum_to_one_are_refused() -> None:
    with pytest.raises(ScoringError, match="sum to"):
        ranked_probability_score((0.5, 0.1, 0.1, 0.1, 0.1), Bucket.FLAT)


def test_a_negative_probability_is_refused() -> None:
    """The symptom of a non-monotone CDF reaching this far — refuse it loudly."""
    with pytest.raises(ScoringError, match="negative"):
        ranked_probability_score((-0.1, 0.3, 0.4, 0.2, 0.2), Bucket.FLAT)


def test_the_wrong_number_of_buckets_is_refused() -> None:
    with pytest.raises(ScoringError, match="expected 5"):
        ranked_probability_score((0.5, 0.5), Bucket.FLAT)


# --- summarising over days ---------------------------------------------------


def test_summary_reports_mean_and_interval() -> None:
    s = summarise("chronos_uni", 1, [0.1, 0.2, 0.3, 0.2, 0.2])
    assert s.n == 5
    assert s.mean == pytest.approx(0.2)
    lo, hi = s.interval95
    assert lo < s.mean < hi


def test_a_single_day_has_an_infinite_interval() -> None:
    """One observation cannot bound anything, and saying so is the point."""
    s = summarise("chronos_uni", 1, [0.2])
    assert s.stderr == float("inf")


def test_beats_requires_separated_intervals_not_just_a_lower_mean() -> None:
    """Strict on purpose.

    A lower mean inside an overlapping interval is not evidence of skill, and
    treating it as such is exactly how a null result gets reported as a finding.
    """
    noisy_better = summarise("model", 1, [0.10, 0.50, 0.10, 0.50, 0.10])
    baseline = summarise("climatology", 1, [0.30, 0.31, 0.29, 0.30, 0.30])

    assert noisy_better.mean < baseline.mean
    assert not noisy_better.beats(baseline)


def test_beats_is_true_when_the_gap_is_real() -> None:
    clear = summarise("model", 1, [0.10, 0.11, 0.09, 0.10, 0.10])
    baseline = summarise("climatology", 1, [0.30, 0.31, 0.29, 0.30, 0.30])
    assert clear.beats(baseline)


def test_no_scored_days_is_refused() -> None:
    with pytest.raises(ScoringError, match="no scored days"):
        summarise("chronos_uni", 1, [])


# --- paired comparison and the overlap-aware standard error ------------------


def test_hac_lag_zero_is_exactly_the_iid_standard_error() -> None:
    """`hac_lag=0` must reproduce the pre-correction formula to the last bit,
    so adding the option cannot silently change any existing comparison."""
    a = [0.31, 0.12, 0.44, 0.10, 0.52, 0.23, 0.18, 0.40]
    b = [0.20, 0.20, 0.30, 0.20, 0.40, 0.10, 0.20, 0.30]

    differences = [x - y for x, y in zip(a, b, strict=True)]
    mean = sum(differences) / len(differences)
    variance = sum((d - mean) ** 2 for d in differences) / (len(differences) - 1)
    iid_stderr = math.sqrt(variance / len(differences))

    c = compare_paired("m", "base", 1, a, b, hac_lag=0)
    assert c.stderr == pytest.approx(iid_stderr, rel=1e-12)
    assert c.hac_lag == 0


def test_overlap_style_autocorrelation_widens_the_interval() -> None:
    """t+5 differences are serially dependent by construction — the horizon is
    five sessions, scoring is daily, so adjacent differences share four outcome
    sessions. On a positively autocorrelated series the honest interval is
    wider; the iid one overclaims, which is how a borderline rung gets called
    "worse" on evidence the data cannot support."""
    slow_drift = [math.sin(t / 4.0) * 0.02 for t in range(60)]
    base = [0.0] * 60

    iid = compare_paired("m", "base", 5, slow_drift, base, hac_lag=0)
    hac = compare_paired("m", "base", 5, slow_drift, base, hac_lag=4)

    assert hac.stderr > 1.5 * iid.stderr
    assert hac.hac_lag == 4


def test_bartlett_weights_never_produce_a_negative_variance() -> None:
    """Extreme negative autocorrelation is where a raw HAC sum can go below
    zero; Bartlett weights guarantee it cannot, and the floor is the backstop."""
    alternating = [0.01 * (-1.0) ** t for t in range(50)]
    c = compare_paired("m", "base", 5, alternating, [0.0] * 50, hac_lag=4)

    assert math.isfinite(c.stderr)
    assert c.stderr >= 0.0


def test_a_negative_hac_lag_is_refused() -> None:
    with pytest.raises(ScoringError, match="hac_lag"):
        compare_paired("m", "base", 1, [0.1, 0.2], [0.1, 0.1], hac_lag=-1)
