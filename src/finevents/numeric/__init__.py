"""numeric/ — Chronos-2 and TimesFM 2.5 wrappers.

One `Forecaster` protocol over two libraries with different conventions
(Design §2). Both run **in-process from local weights** — no SageMaker endpoint,
no Bedrock call (REQ-501).

Model imports are deliberately deferred into the concrete forecasters, so that
importing this package costs nothing: `torch` alone takes ~16 seconds to import
and neither set of weights is needed to construct a forecaster or read its name.
"""

from finevents.numeric.base import (
    DEFAULT_CONTEXT,
    QUANTILE_LEVELS,
    Forecaster,
    FutureCovariatePolicy,
    QuantileForecast,
    take_context,
)
from finevents.numeric.chronos import Chronos2Forecaster
from finevents.numeric.timesfm import TimesFMForecaster

__all__ = [
    "DEFAULT_CONTEXT",
    "QUANTILE_LEVELS",
    "Chronos2Forecaster",
    "Forecaster",
    "FutureCovariatePolicy",
    "QuantileForecast",
    "TimesFMForecaster",
    "take_context",
]
