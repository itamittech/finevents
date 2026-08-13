"""The `Forecaster` protocol both models implement (Design §2, REQ-501–504).

One interface over two libraries with genuinely different conventions. Absorbing
those differences here is the whole point: nothing downstream should know that
TimesFM puts the mean at index 0 of its quantile array, or that Chronos calls
its covariate slot `past_covariates`.

**The asymmetry that could not be absorbed** is recorded rather than hidden.
Chronos-2 accepts *past-only* covariates natively. TimesFM's XReg requires
covariate values spanning context **and** horizon, and raises on a context-length
array. Since future covariate values do not exist at the cut-off, a
covariate-informed TimesFM run has to assume something about them — so
`QuantileForecast` carries `future_covariate_policy`, and a consumer comparing
the two tracks can see they were not given the same thing.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol, runtime_checkable

from finevents.features.panel import Series

# Both models emit these nine levels. TimesFM produces deciles natively, and
# Chronos will produce whatever it is asked for — so the deciles are the set that
# needs no interpolation on either side. Design §4.13 converts them to buckets.
QUANTILE_LEVELS: tuple[float, ...] = (0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9)

# REQ-502: a fixed-length rolling context. Chronos-2 accepts 8,192 steps, which
# is more history than this series has — but a *variable* context would confound
# the comparison, since a later cut-off would silently get a longer window.
# 512 sessions is roughly two years of daily data: long enough to carry regime,
# short enough to keep the batch cheap. A POC choice, not a specified value.
DEFAULT_CONTEXT = 512


class FutureCovariatePolicy(StrEnum):
    """What a forecaster was told about covariates over the horizon."""

    NONE = "none"
    """Past-only. The model was given no future covariate values — Chronos-2."""

    PERSISTENCE = "persistence"
    """Future values held at the last observed value.

    Uses only information available at the cut-off, so it is **not leakage** — but
    it is an assumption ("covariates do not move"), and it is not the same input
    Chronos-2 received. Required because TimesFM's XReg refuses a context-length
    covariate array.
    """


@dataclass(frozen=True, slots=True)
class QuantileForecast:
    """One model's distribution over future values, for one series.

    `values[h]` is the quantile vector for horizon `h`, aligned to
    `QUANTILE_LEVELS` and monotonically non-decreasing.
    """

    model: str
    levels: tuple[float, ...]
    values: dict[int, tuple[float, ...]]
    context_length: int
    covariates: tuple[str, ...] = ()
    future_covariate_policy: FutureCovariatePolicy = FutureCovariatePolicy.NONE

    def __post_init__(self) -> None:
        for horizon, row in self.values.items():
            if len(row) != len(self.levels):
                raise ValueError(
                    f"{self.model} h={horizon}: {len(row)} values for " f"{len(self.levels)} levels"
                )
            if any(b < a for a, b in zip(row, row[1:], strict=False)):
                raise ValueError(
                    f"{self.model} h={horizon}: quantiles are not monotone — {row}. "
                    "A crossed CDF makes the bucket conversion in Design §4.13 "
                    "produce negative probabilities."
                )

    @property
    def horizons(self) -> tuple[int, ...]:
        return tuple(sorted(self.values))

    @property
    def track(self) -> str:
        """Ladder track name — `chronos_uni`, `timesfm_cov`, and so on."""
        return f"{self.model}_{'cov' if self.covariates else 'uni'}"

    def median(self, horizon: int) -> float:
        return self.values[horizon][self.levels.index(0.5)]


@runtime_checkable
class Forecaster(Protocol):
    """Chronos-2 and TimesFM 2.5 both implement this (Design §2)."""

    name: str

    def forecast(
        self,
        context: Series,
        covariates: dict[str, Series] | None,
        horizons: list[int],
    ) -> QuantileForecast: ...


def take_context(series: Series, length: int) -> tuple[float, ...]:
    """The trailing `length` observations, or everything if there are fewer.

    `series` must already be truncated at the cut-off — `Series.as_of` does that,
    which is what keeps REQ-407 structural rather than remembered.
    """
    if not len(series):
        raise ValueError(f"{series.name}: empty context")
    return series.values[-length:]
