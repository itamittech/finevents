"""The `Forecaster` contract, and the conventions the wrappers absorb.

These run without weights. A fake pipeline stands in for each library, so the
tests assert what the *wrapper* does — which is the part that can be wrong in a
way the models cannot tell you about.

The real models are exercised in `test_models_live.py`, marked `slow`.
"""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from finevents.features.panel import Series
from finevents.numeric import (
    QUANTILE_LEVELS,
    Chronos2Forecaster,
    Forecaster,
    FutureCovariatePolicy,
    QuantileForecast,
    TimesFMForecaster,
    take_context,
)

N = 120


def series(name: str, start: float = 100.0) -> Series:
    origin = date(2026, 1, 1)
    return Series.of(name, {origin + timedelta(days=i): start + i for i in range(N)})


# --- the shared contract -----------------------------------------------------


def test_both_wrappers_satisfy_the_protocol() -> None:
    assert isinstance(Chronos2Forecaster(), Forecaster)
    assert isinstance(TimesFMForecaster(), Forecaster)


def test_constructing_a_forecaster_loads_no_weights() -> None:
    """456 MB and 882 MB should not move because someone read `.name`.

    Both wrappers defer the import and the load; if that regressed, every test
    collection would pay for it.
    """
    assert Chronos2Forecaster().name == "chronos"
    assert TimesFMForecaster().name == "timesfm"


def test_track_names_distinguish_univariate_from_covariate() -> None:
    base = dict(levels=QUANTILE_LEVELS, values={1: tuple(range(9))}, context_length=60)
    assert QuantileForecast(model="chronos", **base).track == "chronos_uni"
    assert QuantileForecast(model="chronos", covariates=("vix",), **base).track == "chronos_cov"


def test_non_monotone_quantiles_are_refused() -> None:
    """A crossed CDF gives negative bucket probabilities in Design §4.13.

    Refusing here means the failure surfaces at the model boundary rather than as
    an impossible probability three layers later.
    """
    with pytest.raises(ValueError, match="not monotone"):
        QuantileForecast(
            model="x",
            levels=QUANTILE_LEVELS,
            values={1: (1.0, 2.0, 3.0, 9.0, 4.0, 5.0, 6.0, 7.0, 8.0)},
            context_length=60,
        )


def test_wrong_number_of_values_is_refused() -> None:
    with pytest.raises(ValueError, match="values for"):
        QuantileForecast(
            model="x", levels=QUANTILE_LEVELS, values={1: (1.0, 2.0)}, context_length=60
        )


def test_context_is_the_trailing_window_only() -> None:
    s = series("gold")
    assert take_context(s, 60) == s.values[-60:]
    assert take_context(s, 10_000) == s.values  # fewer available than asked for


def test_empty_context_is_refused() -> None:
    with pytest.raises(ValueError, match="empty context"):
        take_context(Series("gold", (), ()), 60)


# --- Chronos: the wrapper's own behaviour ------------------------------------


class FakeChronos:
    """Records what it was handed, returns a well-formed monotone grid."""

    def __init__(self) -> None:
        self.calls: list[dict] = []

    def predict_quantiles(self, inputs, prediction_length, quantile_levels):
        import torch

        self.calls.append(
            {"payload": inputs[0], "length": prediction_length, "levels": quantile_levels}
        )
        grid = torch.tensor(
            [
                [100.0 + q + 10 * h for q in range(len(quantile_levels))]
                for h in range(prediction_length)
            ]
        )
        return [grid.unsqueeze(0)], None


def test_chronos_passes_past_covariates_and_records_no_future_policy() -> None:
    """Chronos-2 takes past-only covariates, so nothing about the horizon is assumed."""
    fake = FakeChronos()
    f = Chronos2Forecaster(context_length=60, pipeline=fake)

    out = f.forecast(series("gold"), {"vix": series("vix", 20.0)}, [1, 5])

    payload = fake.calls[0]["payload"]
    assert set(payload) == {"target", "past_covariates"}
    assert list(payload["past_covariates"]) == ["vix"]
    assert len(payload["target"]) == 60
    assert len(payload["past_covariates"]["vix"]) == 60

    assert out.track == "chronos_cov"
    assert out.future_covariate_policy is FutureCovariatePolicy.NONE
    assert out.horizons == (1, 5)


def test_chronos_univariate_sends_no_covariate_slot() -> None:
    fake = FakeChronos()
    out = Chronos2Forecaster(context_length=60, pipeline=fake).forecast(series("gold"), None, [1])

    assert set(fake.calls[0]["payload"]) == {"target"}
    assert out.track == "chronos_uni"


def test_chronos_requests_exactly_the_shared_levels() -> None:
    """Both models must emit the same levels, or the bucket conversion differs."""
    fake = FakeChronos()
    Chronos2Forecaster(pipeline=fake).forecast(series("gold"), None, [1])
    assert tuple(fake.calls[0]["levels"]) == QUANTILE_LEVELS


def test_chronos_asks_for_the_longest_horizon_once() -> None:
    """h=1 and h=5 is one call of length 5, not two calls."""
    fake = FakeChronos()
    Chronos2Forecaster(pipeline=fake).forecast(series("gold"), None, [1, 5])
    assert len(fake.calls) == 1
    assert fake.calls[0]["length"] == 5


# --- TimesFM: the two conventions --------------------------------------------


class FakeTimesFM:
    """Mimics TimesFM's array layout: index 0 is the MEAN, 1..9 are deciles."""

    def __init__(self) -> None:
        self.calls: list[dict] = []

    def _grid(self, horizon: int):
        import numpy as np

        rows = []
        for h in range(horizon):
            deciles = [100.0 + d + 10 * h for d in range(9)]
            rows.append([999.0, *deciles])  # 999 at index 0 — must be dropped
        return np.asarray([rows])

    def forecast(self, horizon, inputs):
        import numpy as np

        self.calls.append({"kind": "uni", "horizon": horizon, "inputs": inputs})
        return np.zeros((1, horizon)), self._grid(horizon)

    def forecast_with_covariates(self, inputs, dynamic_numerical_covariates, xreg_mode):
        import numpy as np

        self.calls.append({"kind": "cov", "inputs": inputs, "cov": dynamic_numerical_covariates})
        horizon = 5
        return np.zeros((1, horizon)), self._grid(horizon)


def test_timesfm_drops_the_mean_at_index_zero() -> None:
    """The single most dangerous convention in either library.

    Index 0 is the mean. Kept as a quantile, the row is non-monotone and the
    bucket conversion produces a negative probability for the lowest bucket.
    """
    fake = FakeTimesFM()
    out = TimesFMForecaster(context_length=60, model=fake).forecast(series("gold"), None, [1])

    assert 999.0 not in out.values[1]
    assert len(out.values[1]) == len(QUANTILE_LEVELS)
    assert out.values[1] == tuple(100.0 + d for d in range(9))


def test_timesfm_extends_covariates_over_the_horizon_by_persistence() -> None:
    """XReg refuses a context-length array, so the horizon is filled by holding
    the last observed value — knowable at the cut-off, so not leakage."""
    fake = FakeTimesFM()
    f = TimesFMForecaster(context_length=60, model=fake)

    out = f.forecast(series("gold"), {"vix": series("vix", 20.0)}, [1, 5])

    sent = fake.calls[0]["cov"]["vix"][0]
    assert len(sent) == 60 + 5
    assert sent[-5:] == [sent[59]] * 5  # the tail is the last observed value

    assert out.future_covariate_policy is FutureCovariatePolicy.PERSISTENCE


def test_the_two_covariate_policies_are_distinguishable() -> None:
    """The asymmetry the wrappers could not absorb, made visible instead.

    Chronos gets true past-only covariates; TimesFM gets a persistence assumption.
    Comparing the two covariate tracks naively would compare different inputs.
    """
    chronos = Chronos2Forecaster(pipeline=FakeChronos()).forecast(
        series("gold"), {"vix": series("vix", 20.0)}, [1]
    )
    timesfm = TimesFMForecaster(model=FakeTimesFM()).forecast(
        series("gold"), {"vix": series("vix", 20.0)}, [1]
    )

    assert chronos.future_covariate_policy is FutureCovariatePolicy.NONE
    assert timesfm.future_covariate_policy is FutureCovariatePolicy.PERSISTENCE


def test_a_horizon_beyond_the_compiled_maximum_is_refused() -> None:
    f = TimesFMForecaster(max_horizon=4, model=FakeTimesFM())
    with pytest.raises(ValueError, match="exceeds max_horizon"):
        f.forecast(series("gold"), None, [8])


@pytest.mark.parametrize(
    "forecaster",
    [
        Chronos2Forecaster(pipeline=FakeChronos()),
        TimesFMForecaster(model=FakeTimesFM()),
    ],
)
def test_no_horizons_is_refused(forecaster) -> None:
    with pytest.raises(ValueError, match="at least one horizon"):
        forecaster.forecast(series("gold"), None, [])
