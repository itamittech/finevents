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
            grid = _forecast_rows(np, quantiles, prediction_length)[:, _FIRST_DECILE_INDEX:]

        values = {h: tuple(float(v) for v in grid[h - 1]) for h in horizons}

        return QuantileForecast(
            model=self.name,
            levels=QUANTILE_LEVELS,
            values=values,
            context_length=len(target),
            covariates=names,
            future_covariate_policy=policy,
        )


def _forecast_rows(np: Any, quantiles: Any, horizon: int) -> Any:
    """The `horizon` forecast rows, whatever else the array carries.

    **`return_backcast=True` prepends the reconstructed context.** XReg requires
    that flag, and it changes the shape of the *univariate* call too: the array
    becomes `[1, padded_context + horizon, 10]` rather than `[1, horizon, 10]`.

    Reading from the front then silently returns a reconstruction of the *oldest*
    part of the context — a forecast for two years ago, presented as tomorrow.
    It does not raise, it does not warn, and against a series that has since
    doubled it scores exactly like a model with no skill. Slice from the end.
    """
    grid = np.asarray(quantiles)
    if grid.ndim != 3:
        raise ValueError(
            f"expected a 3-D quantile array, got shape {grid.shape}; a bucket "
            "distribution cannot be built without a quantile grid"
        )
    if grid.shape[1] < horizon:
        raise ValueError(f"only {grid.shape[1]} rows returned for horizon {horizon}")
    return grid[0][-horizon:]


def _quantiles_from_covariate_call(np: Any, point: Any, quantiles: Any, horizon: int) -> Any:
    """Normalise `forecast_with_covariates` output to [horizon, 9 deciles]."""
    rows = _forecast_rows(np, quantiles, horizon)
    if rows.shape[-1] >= _FIRST_DECILE_INDEX + len(QUANTILE_LEVELS):
        return rows[:, _FIRST_DECILE_INDEX : _FIRST_DECILE_INDEX + len(QUANTILE_LEVELS)]

    # The XReg-adjusted point forecast, with the base model's spread re-centred on
    # it. Re-centring rather than substituting keeps the *width* honest — XReg
    # adjusts the level, not the uncertainty.
    adjusted = np.asarray(point)[0][-horizon:]
    base = rows[:, _FIRST_DECILE_INDEX:]
    centre = rows[:, _MEAN_INDEX][:, None]
    return base - centre + adjusted[:, None]
