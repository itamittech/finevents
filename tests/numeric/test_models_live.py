"""Both models against real weights and real gold (REQ-501, REQ-504, REQ-507).

Marked `slow`: needs the 1.34 GB weight cache, so it is excluded in CI and run
locally. The contract tests beside this file use fakes and always run.

What only a live run can tell you: that the libraries behave as the wrappers
assume, that the covariate paths actually accept what is sent, and that repeated
calls are byte-identical.
"""

from __future__ import annotations

import csv
from datetime import date

import pytest

from finevents.features.panel import Series, align
from finevents.numeric import (
    QUANTILE_LEVELS,
    Chronos2Forecaster,
    FutureCovariatePolicy,
    TimesFMForecaster,
)

pytestmark = pytest.mark.slow

DATA = date  # placeholder to keep the import list honest
HORIZONS = [1, 5]
CONTEXT = 128  # shorter than the default, to keep the live suite quick


def _read(path, column, where=None):
    import pathlib

    root = pathlib.Path(__file__).resolve().parents[2] / "data"
    rows = {
        date.fromisoformat(r["date"]): float(r[column])
        for r in csv.DictReader((root / path).open(encoding="utf-8"))
        if where is None or where(r)
    }
    return rows


@pytest.fixture(scope="module")
def panel():
    gold = Series.of(
        "gold", _read("metals_cbr_rub.csv", "sell_rub_g", lambda r: r["metal"] == "gold")
    )
    if not len(gold):
        pytest.skip("data/ is empty — run scripts/fetch_metals_history.py first")
    silver = Series.of(
        "silver", _read("metals_cbr_rub.csv", "sell_rub_g", lambda r: r["metal"] == "silver")
    )
    vix = Series.of("vix", _read("fred_vixcls.csv", "vixcls"))
    return align(gold, [silver, vix])


@pytest.fixture(scope="module")
def chronos():
    return Chronos2Forecaster(context_length=CONTEXT)


@pytest.fixture(scope="module")
def timesfm():
    return TimesFMForecaster(context_length=CONTEXT)


def _covariates(panel):
    return {c.name: c for c in panel.covariates}


# --- the forecasts are well-formed -------------------------------------------


def test_chronos_univariate(panel, chronos) -> None:
    out = chronos.forecast(panel.target, None, HORIZONS)

    assert out.track == "chronos_uni"
    assert out.context_length == CONTEXT
    assert out.horizons == (1, 5)
    assert all(len(row) == len(QUANTILE_LEVELS) for row in out.values.values())


# --- anchoring: the forecast is for *tomorrow*, not for the start of the context


@pytest.mark.parametrize("which", ["chronos", "timesfm"])
@pytest.mark.parametrize("with_covariates", [False, True])
def test_the_forecast_is_anchored_to_the_end_of_the_context(
    panel, chronos, timesfm, which, with_covariates
) -> None:
    """A one-day-ahead median must sit near the last close, not near the oldest.

    This caught a real bug. `return_backcast=True` — required by TimesFM's XReg —
    prepends the reconstructed context to the returned array, so reading from the
    front yields a forecast for the *start* of the window. Against a series that
    had since doubled, that scored like a model with no skill rather than raising.

    A fake cannot catch this: the shape only changes inside the real library.
    Three σ at t+1 is a wide band and still excludes being off by a year.
    """
    forecaster = chronos if which == "chronos" else timesfm
    covariates = _covariates(panel) if with_covariates else None

    out = forecaster.forecast(panel.target, covariates, HORIZONS)

    last_close = panel.target.values[-1]
    oldest_in_context = panel.target.values[-out.context_length]
    ratio = out.median(1) / last_close

    assert 0.90 < ratio < 1.10, (
        f"{out.track} median {out.median(1):.1f} against last close {last_close:.1f} "
        f"(oldest in context {oldest_in_context:.1f}) — a one-day forecast this far "
        f"from the anchor means the wrong rows were read"
    )


def test_chronos_covariate_informed(panel, chronos) -> None:
    out = chronos.forecast(panel.target, _covariates(panel), HORIZONS)

    assert out.track == "chronos_cov"
    assert out.covariates == ("silver", "vix")
    assert out.future_covariate_policy is FutureCovariatePolicy.NONE


def test_timesfm_univariate(panel, timesfm) -> None:
    out = timesfm.forecast(panel.target, None, HORIZONS)

    assert out.track == "timesfm_uni"
    assert 0.5 < out.median(1) / panel.target.values[-1] < 2.0


def test_timesfm_covariate_informed(panel, timesfm) -> None:
    """XReg is installable here only because jax/jaxlib/scikit-learn are pinned
    directly — `timesfm[xreg]` declares `jax[cuda]`, which has no Windows wheel."""
    out = timesfm.forecast(panel.target, _covariates(panel), HORIZONS)

    assert out.track == "timesfm_cov"
    assert out.future_covariate_policy is FutureCovariatePolicy.PERSISTENCE


# --- REQ-507: determinism ----------------------------------------------------


@pytest.mark.parametrize("which", ["chronos", "timesfm"])
@pytest.mark.parametrize("with_covariates", [False, True])
def test_repeated_calls_are_byte_identical(panel, chronos, timesfm, which, with_covariates) -> None:
    """REQ-507. Without this, Lane A's truncated replay is meaningless — and the
    consequence lands on the whole project, not just this POC."""
    forecaster = chronos if which == "chronos" else timesfm
    covariates = _covariates(panel) if with_covariates else None

    first = forecaster.forecast(panel.target, covariates, HORIZONS)
    second = forecaster.forecast(panel.target, covariates, HORIZONS)

    assert first.values == second.values, f"{which} is not deterministic"


# --- the four ladder tracks are distinguishable ------------------------------


def test_all_four_tracks_produce_distinct_named_forecasts(panel, chronos, timesfm) -> None:
    covariates = _covariates(panel)
    tracks = {
        f.forecast(panel.target, cov, HORIZONS).track
        for f in (chronos, timesfm)
        for cov in (None, covariates)
    }
    assert tracks == {"chronos_uni", "chronos_cov", "timesfm_uni", "timesfm_cov"}
