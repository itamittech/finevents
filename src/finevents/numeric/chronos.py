"""Chronos-2 behind the `Forecaster` protocol (REQ-501, ADR-0030).

Amazon's Chronos-2 — 120M parameters, encoder architecture, 8,192-step context.
Runs **in-process from local weights**: no SageMaker endpoint, no Bedrock call
(REQ-501).

Its covariate handling is the honest one. `past_covariates` takes series covering
the context only, so nothing about the forecast horizon has to be assumed or
invented.
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

MODEL_ID = "amazon/chronos-2"


class Chronos2Forecaster:
    """Chronos-2, loaded once and reused."""

    name = "chronos"

    def __init__(
        self,
        *,
        context_length: int = DEFAULT_CONTEXT,
        model_id: str = MODEL_ID,
        pipeline: Any | None = None,
    ) -> None:
        self.context_length = context_length
        self.model_id = model_id
        self._pipeline = pipeline

    @property
    def pipeline(self) -> Any:
        """The underlying pipeline, loaded on first use.

        Lazy so that constructing a forecaster — in a test, or to read its name —
        does not pull 456 MB of weights off disk.
        """
        if self._pipeline is None:
            import torch
            from chronos import Chronos2Pipeline

            torch.manual_seed(0)  # REQ-507; the gate tests it properly
            self._pipeline = Chronos2Pipeline.from_pretrained(self.model_id)
        return self._pipeline

    def forecast(
        self,
        context: Series,
        covariates: dict[str, Series] | None,
        horizons: list[int],
    ) -> QuantileForecast:
        import torch

        if not horizons:
            raise ValueError("at least one horizon is required")
        prediction_length = max(horizons)

        target = take_context(context, self.context_length)
        payload: dict[str, Any] = {"target": torch.tensor(target, dtype=torch.float32)}

        names: tuple[str, ...] = ()
        if covariates:
            # Each covariate is trimmed to the *same* window as the target, so a
            # longer covariate history cannot silently widen the context.
            past: dict[str, Any] = {}
            for name, series in sorted(covariates.items()):
                values = take_context(series, len(target))
                if len(values) != len(target):
                    raise ValueError(
                        f"covariate {name!r} has {len(values)} observations against a "
                        f"{len(target)}-step context. `align` trims the panel so this "
                        f"cannot happen; a mismatch here means the panel was bypassed."
                    )
                past[name] = torch.tensor(values, dtype=torch.float32)
            payload["past_covariates"] = past
            names = tuple(sorted(covariates))

        with torch.inference_mode():
            quantiles, _ = self.pipeline.predict_quantiles(
                [payload],
                prediction_length=prediction_length,
                quantile_levels=list(QUANTILE_LEVELS),
            )

        # [item, horizon, quantile] — one item, because one series was passed.
        grid = quantiles[0][0]
        values = {h: tuple(float(v) for v in grid[h - 1]) for h in horizons}

        return QuantileForecast(
            model=self.name,
            levels=QUANTILE_LEVELS,
            values=values,
            context_length=len(target),
            covariates=names,
            future_covariate_policy=FutureCovariatePolicy.NONE,
        )
