"""TimesFM 2.5 behind the `Forecaster` protocol (REQ-501, ADR-0031).

Google's TimesFM 2.5 — 200M parameters, decoder-only over patches. Also in-process
from local weights.

Two conventions this module absorbs so nothing downstream sees them:

**The quantile array is `[n, horizon, 10]` and index 0 is the mean, not a
quantile.** Indices 1–9 are the deciles. Read index 0 as a quantile and the row
looks non-monotone, which would silently corrupt the bucket conversion.

**XReg demands covariates spanning context *and* horizon.** A context-length
array raises `math domain error`. Future covariate values do not exist at the
cut-off, so they are held at the last observed value — information available at
the cut-off, therefore not leakage, but an assumption Chronos-2 is not making.
The forecast records it as `FutureCovariatePolicy.PERSISTENCE` so the two
covariate tracks are never compared as though they received the same input.
"""

from __future__ import annotations

from typing import Any

from finevents.features.panel import Series
from finevents.numeric.base import (
    DEFAULT_CONTEXT,
    QUANTILE_LEVELS,
    FutureCovariatePolicy,
    QuantileForecast,
    take_context,
)

MODEL_ID = "google/timesfm-2.5-200m-pytorch"

# Index 0 of TimesFM's quantile axis is the mean; the deciles start at 1.
_MEAN_INDEX = 0
_FIRST_DECILE_INDEX = 1


class TimesFMForecaster:
    """TimesFM 2.5, compiled once and reused."""

    name = "timesfm"

    def __init__(
        self,
        *,
        context_length: int = DEFAULT_CONTEXT,
        max_horizon: int = 16,
        model_id: str = MODEL_ID,
        model: Any | None = None,
    ) -> None:
        self.context_length = context_length
        self.max_horizon = max_horizon
        self.model_id = model_id
        self._model = model

    @property
    def model(self) -> Any:
        """The compiled model, loaded on first use."""
        if self._model is None:
            import torch
            from timesfm import ForecastConfig, TimesFM_2p5_200M_torch

            torch.manual_seed(0)  # REQ-507; the gate tests it properly
            model = TimesFM_2p5_200M_torch.from_pretrained(self.model_id)
            model.compile(
                ForecastConfig(
                    max_context=self.context_length,
                    max_horizon=self.max_horizon,
                    normalize_inputs=True,
                    use_continuous_quantile_head=True,
                    # Without this the quantile rows can cross, and a crossed CDF
                    # gives negative bucket probabilities in Design §4.13.
                    fix_quantile_crossing=True,
                    # Required by XReg — it raises at *call* time without it.
                    return_backcast=True,
                )
            )
            self._model = model
        return self._model

    def forecast(
        self,
        context: Series,
        covariates: dict[str, Series] | None,
        horizons: list[int],
    ) -> QuantileForecast:
        import numpy as np

        if not horizons:
            raise ValueError("at least one horizon is required")
        prediction_length = max(horizons)
        if prediction_length > self.max_horizon:
            raise ValueError(
                f"horizon {prediction_length} exceeds max_horizon {self.max_horizon}; "
                "recompile the model with a larger ForecastConfig.max_horizon"
            )

        target = list(map(float, take_context(context, self.context_length)))
        names: tuple[str, ...] = ()
        policy = FutureCovariatePolicy.NONE

        if covariates:
            extended: dict[str, list[list[float]]] = {}
            for name, series in sorted(covariates.items()):
                values = list(map(float, take_context(series, len(target))))
                if len(values) != len(target):
                    raise ValueError(
                        f"covariate {name!r} has {len(values)} observations against a "
                        f"{len(target)}-step context"
                    )
                # Persistence over the horizon. XReg refuses a context-length
                # array, and the last observed value is the only future value
                # knowable at the cut-off.
                extended[name] = [values + [values[-1]] * prediction_length]
            names = tuple(sorted(covariates))
            policy = FutureCovariatePolicy.PERSISTENCE

            point, quantiles = self.model.forecast_with_covariates(
                inputs=[target],
                dynamic_numerical_covariates=extended,
                xreg_mode="xreg + timesfm",
            )
            grid = _quantiles_from_covariate_call(np, point, quantiles, prediction_length)
        else:
            _, quantiles = self.model.forecast(
                horizon=prediction_length, inputs=[np.asarray(target)]
            )
            grid = np.asarray(quantiles)[0][:, _FIRST_DECILE_INDEX:]

        values = {h: tuple(float(v) for v in grid[h - 1]) for h in horizons}

        return QuantileForecast(
            model=self.name,
            levels=QUANTILE_LEVELS,
            values=values,
            context_length=len(target),
            covariates=names,
            future_covariate_policy=policy,
        )


def _quantiles_from_covariate_call(np: Any, point: Any, quantiles: Any, horizon: int) -> Any:
    """Normalise `forecast_with_covariates` output to [horizon, 9 deciles].

    The covariate path returns the XReg-adjusted point forecast; when it does not
    also return a full quantile grid, the base model's spread is re-centred on the
    adjusted point. Re-centring rather than substituting keeps the *width* of the
    distribution honest — XReg adjusts the level, not the uncertainty.
    """
    grid = np.asarray(quantiles)
    if grid.ndim == 3 and grid.shape[-1] >= _FIRST_DECILE_INDEX + len(QUANTILE_LEVELS):
        return grid[0][:, _FIRST_DECILE_INDEX : _FIRST_DECILE_INDEX + len(QUANTILE_LEVELS)]

    adjusted = np.asarray(point)[0][:horizon]
    if grid.ndim == 3:
        base = grid[0][:horizon, _FIRST_DECILE_INDEX:]
        centre = grid[0][:horizon, _MEAN_INDEX][:, None]
        return base - centre + adjusted[:, None]

    # No quantile information at all — a degenerate distribution would be a lie,
    # so refuse rather than fabricate a spread.
    raise ValueError(
        "TimesFM's covariate call returned no quantile grid; a bucket distribution "
        "cannot be built from a point forecast without inventing a spread"
    )
