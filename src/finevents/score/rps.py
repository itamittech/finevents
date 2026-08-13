"""Ranked probability score (REQ-803, Design §4.2).

    RPS = (1 / (K − 1)) · Σ_{k=1}^{K−1} (F_k − O_k)²

with `K = 5`, `F_k` the cumulative predicted probability through bucket k and
`O_k` the cumulative observed indicator. Lower is better.

**Why RPS and not accuracy.** The buckets are *ordinal*. Predicting "large up"
when the outcome was "small up" is a smaller error than predicting "large down",
and RPS is the metric that knows that — Design §4.2: *"being wrong by one bucket
costs less than being wrong by four, which is the entire reason RPS is used
rather than log loss or accuracy."*

No model client is reachable from this module (T9.3, REQ-801) — scoring must not
be able to consult anything.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from finevents.features.volatility import Bucket

K = len(Bucket)
TOLERANCE = 1e-6


class ScoringError(ValueError):
    """A distribution or outcome that cannot be scored."""


def ranked_probability_score(probabilities: tuple[float, ...], observed: Bucket) -> float:
    """RPS for one prediction against one realised bucket."""
    if len(probabilities) != K:
        raise ScoringError(f"expected {K} probabilities, got {len(probabilities)}")
    if any(p < 0 for p in probabilities):
        raise ScoringError(f"negative probability in {probabilities}")
    total = sum(probabilities)
    if not math.isclose(total, 1.0, abs_tol=1e-6):
        raise ScoringError(f"probabilities sum to {total}, not 1")

    cumulative = 0.0
    score = 0.0
    for k in range(K - 1):
        cumulative += probabilities[k]
        observed_cumulative = 1.0 if k >= observed else 0.0
        score += (cumulative - observed_cumulative) ** 2
    return score / (K - 1)


@dataclass(frozen=True, slots=True)
class TrackScore:
    """A track's mean RPS over one set of days, with its uncertainty.

    The interval is what makes the number honest early on. Ten days give a mean
    with an interval so wide it excludes nothing; two hundred give one that can
    exclude climatology. Reporting the mean alone invites a conclusion the sample
    cannot support.
    """

    track: str
    horizon: int
    n: int
    mean: float
    stderr: float

    @property
    def interval95(self) -> tuple[float, float]:
        half = 1.96 * self.stderr
        return (self.mean - half, self.mean + half)

    def beats(self, other: TrackScore) -> bool:
        """True when this track's mean is lower *and* the intervals do not overlap.

        Deliberately strict. A lower mean inside an overlapping interval is not
        evidence of skill, and calling it one is how a null result gets reported
        as a finding.
        """
        return self.mean < other.mean and self.interval95[1] < other.interval95[0]


@dataclass(frozen=True, slots=True)
class PairedComparison:
    """One track against a baseline, compared **day by day**.

    Every rung is scored on identical days against identical outcomes, so the
    scores are paired. Comparing two independent means throws that away — and
    throws away most of the power, because day-to-day outcome noise is far larger
    than the difference between two forecasters and it *cancels* in the pairing.

    Concretely: on a day the gold price jumps three buckets, every rung scores
    badly. That shared badness is not information about which rung is better, and
    an unpaired test lets it dominate the interval.

    T13.9 specifies day-level aggregation for exactly this reason.
    """

    track: str
    baseline: str
    horizon: int
    n: int
    mean_difference: float
    stderr: float
    wins: int

    @property
    def interval95(self) -> tuple[float, float]:
        half = 1.96 * self.stderr
        return (self.mean_difference - half, self.mean_difference + half)

    @property
    def better(self) -> bool:
        """True when the track beats the baseline with the interval excluding zero.

        Negative difference means lower RPS, which is better.
        """
        return self.interval95[1] < 0.0

    @property
    def worse(self) -> bool:
        return self.interval95[0] > 0.0

    @property
    def verdict(self) -> str:
        if self.better:
            return "BETTER"
        if self.worse:
            return "worse"
        return "no detectable difference"


def compare_paired(
    track: str, baseline: str, horizon: int, track_scores: list[float], baseline_scores: list[float]
) -> PairedComparison:
    """Mean per-day RPS difference, `track − baseline`. Negative is better."""
    if len(track_scores) != len(baseline_scores):
        raise ScoringError(
            f"{track} has {len(track_scores)} days against {baseline}'s "
            f"{len(baseline_scores)} — a paired comparison needs identical days"
        )
    if not track_scores:
        raise ScoringError(f"{track} vs {baseline}: no scored days")

    differences = [a - b for a, b in zip(track_scores, baseline_scores, strict=True)]
    n = len(differences)
    mean = sum(differences) / n
    wins = sum(1 for d in differences if d < 0)

    if n < 2:
        return PairedComparison(track, baseline, horizon, n, mean, float("inf"), wins)

    variance = sum((d - mean) ** 2 for d in differences) / (n - 1)
    return PairedComparison(track, baseline, horizon, n, mean, math.sqrt(variance / n), wins)


def by_outcome(scores: list[float], outcomes: list[Bucket]) -> dict[Bucket, list[float]]:
    """Scores split by the bucket that actually happened.

    A mean over all days can hide real capability: a rung might be strong on the
    large-move days that matter and ordinary on the flat majority, and since
    ~60% of days are flat, the flat days dominate the average.
    """
    if len(scores) != len(outcomes):
        raise ScoringError(f"{len(scores)} scores against {len(outcomes)} outcomes")

    split: dict[Bucket, list[float]] = {}
    for score, outcome in zip(scores, outcomes, strict=True):
        split.setdefault(outcome, []).append(score)
    return split


def summarise(track: str, horizon: int, scores: list[float]) -> TrackScore:
    """Mean RPS and its standard error over the scored days."""
    if not scores:
        raise ScoringError(f"{track} h={horizon}: no scored days")

    n = len(scores)
    mean = sum(scores) / n
    if n < 2:
        return TrackScore(track, horizon, n, mean, float("inf"))

    variance = sum((s - mean) ** 2 for s in scores) / (n - 1)
    return TrackScore(track, horizon, n, mean, math.sqrt(variance / n))
