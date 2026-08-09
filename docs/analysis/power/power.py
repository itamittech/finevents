"""FinEvents power analysis — can the design detect the effect it claims, in the time it plans?

Statistic under test: the paired RPS difference between the agent track and a baseline,
aggregated by DAY (not by prediction), because instruments co-move.

Generative model
----------------
Standardised returns z_t ~ MVN(0, Sigma) over 11 instruments, Sigma block-structured.
The agent sees a noisy signal of tomorrow:  s = rho*z + sqrt(1-rho^2)*eps
so corr(signal, outcome) = rho.  Its forecast is the implied posterior N(rho*s, 1-rho^2),
converted to the five volatility-relative buckets of ADR-0008 (+/-0.5, +/-1.5 sigma).
Climatology is the unconditional N(0,1) over the same buckets.

rho is the honest knob: rho = 0.05 means the agent's forecast correlates 0.05 with the
standardised move, i.e. R^2 = 0.25%.  For daily financial prediction on public news that
would already be a strong result.
"""
import numpy as np
from scipy.stats import norm

RNG = np.random.default_rng(20260809)
EDGES = np.array([-1.5, -0.5, 0.5, 1.5])          # ADR-0008 bucket boundaries, in sigma
K = 5

INSTRUMENTS = ["NIFTY", "SENSEX", "SPX", "NDX", "DJI",
               "XAU", "XAG", "XPT", "XPD", "MCXAU", "MCXAG"]

# --- correlation structure -------------------------------------------------------------
# MEASURED from FRED (2016-2026, standardised daily log returns): US index block rho = 0.859
RHO_US = 0.859
# ASSUMED, and swept in sensitivity(): every value below is an assumption, not a measurement.
RHO_IN = 0.98      # NIFTY/SENSEX -- share most of their constituent market cap
RHO_METALS = 0.60  # gold/silver/platinum/palladium
RHO_MCX = 0.95     # MCX leg vs its USD spot counterpart (differs only by the FX leg)
RHO_EQ_CROSS = 0.35  # Indian vs US indices
RHO_EQ_METAL = 0.10  # equities vs metals


def build_sigma(rho_us=RHO_US, rho_in=RHO_IN, rho_metals=RHO_METALS,
                rho_mcx=RHO_MCX, rho_eq_cross=RHO_EQ_CROSS, rho_eq_metal=RHO_EQ_METAL):
    n = len(INSTRUMENTS)
    S = np.eye(n)
    idx = {name: i for i, name in enumerate(INSTRUMENTS)}
    IN, US = ["NIFTY", "SENSEX"], ["SPX", "NDX", "DJI"]
    MET, MCX = ["XAU", "XAG", "XPT", "XPD"], ["MCXAU", "MCXAG"]

    def fill(a, b, r):
        for x in a:
            for y in b:
                if x != y:
                    S[idx[x], idx[y]] = S[idx[y], idx[x]] = r

    fill(IN, IN, rho_in)
    fill(US, US, rho_us)
    fill(MET, MET, rho_metals)
    fill(MET + MCX, MET + MCX, rho_metals)      # metals block incl. MCX
    fill(IN + US, IN + US, rho_eq_cross)        # cross-market equities
    fill(IN, IN, rho_in)                        # restore tighter within-block
    fill(US, US, rho_us)
    fill(IN + US, MET + MCX, rho_eq_metal)
    S[idx["MCXAU"], idx["XAU"]] = S[idx["XAU"], idx["MCXAU"]] = rho_mcx
    S[idx["MCXAG"], idx["XAG"]] = S[idx["XAG"], idx["MCXAG"]] = rho_mcx
    S[idx["MCXAU"], idx["MCXAG"]] = S[idx["MCXAG"], idx["MCXAU"]] = rho_metals

    # nearest PSD repair (eigenvalue clip) -- the hand-built matrix need not be PSD
    w, V = np.linalg.eigh(S)
    if w.min() < 1e-8:
        w = np.clip(w, 1e-8, None)
        S = V @ np.diag(w) @ V.T
        d = np.sqrt(np.diag(S))
        S = S / np.outer(d, d)
    return S


def n_eff(S):
    """Effective independent series: variance of the equally weighted mean vs 1/n."""
    n = S.shape[0]
    return n / (np.ones(n) @ S @ np.ones(n) / n)


def bucket_probs(mu, sd):
    """P(z in each of the 5 buckets) for z ~ N(mu, sd^2). mu, sd broadcast."""
    cdf = norm.cdf((EDGES[:, None] - mu[None, :]) / sd[None, :])   # (4, N)
    out = np.empty((K, mu.size))
    out[0] = cdf[0]
    out[1:4] = np.diff(cdf, axis=0)
    out[4] = 1.0 - cdf[3]
    return np.clip(out, 1e-12, None)


def rps(p, outcome_idx):
    """Ranked probability score. p: (K, N) probabilities. outcome_idx: (N,) realised bucket."""
    F = np.cumsum(p, axis=0)[:-1]                                   # (K-1, N)
    O = (np.arange(K - 1)[:, None] >= outcome_idx[None, :]).astype(float)
    return ((F - O) ** 2).sum(axis=0) / (K - 1)


def simulate(rho_signal, n_days, S, event_only=False, event_frac=0.20, seed=None,
             kappa=0.5, return_panel=False):
    """Per-day mean paired RPS difference (agent - climatology). Negative = agent better.

    kappa is the share of the agent's forecast ERROR that is COMMON across instruments.
    This is the parameter the power turns on, and it is not free to choose: the predictor
    reads a byte-identical regime block across all 11 calls (REQ-406), the same classified
    event list, and the same wiki. Its mistakes are therefore correlated by construction.
      kappa = 0.0  every instrument's error independent -- optimistic, and unrealistic here
      kappa = 1.0  one shared error -- the 11 calls carry the information of one
    """
    rng = np.random.default_rng(seed) if seed is not None else RNG
    n = S.shape[0]
    L = np.linalg.cholesky(S)
    z = (rng.standard_normal((n_days, n)) @ L.T)                    # standardised returns

    live = (rng.random(n_days) < event_frac) if event_only else np.ones(n_days, dtype=bool)

    zf = z.ravel()
    outcome = np.searchsorted(EDGES, zf)                            # 0..4
    r_clim = rps(bucket_probs(np.zeros(zf.size), np.ones(zf.size)), outcome)

    eff = (np.where(live, rho_signal, 0.0)[:, None] * np.ones((1, n))).ravel()
    common = np.repeat(rng.standard_normal(n_days), n)              # one shock per day
    idio = rng.standard_normal(zf.size)
    noise = np.sqrt(kappa) * common + np.sqrt(1 - kappa) * idio
    s = eff * zf + np.sqrt(np.clip(1 - eff**2, 0, None)) * noise
    r_agent = rps(bucket_probs(eff * s, np.sqrt(np.clip(1 - eff**2, 1e-9, None))), outcome)

    d = (r_agent - r_clim).reshape(n_days, n)
    return d if return_panel else d.mean(axis=1)


def n_eff_statistic(rho_signal, S, kappa, n_days=40000, seed=5):
    """Effective independent observations per day FOR THE TEST STATISTIC.

    This is what governs power -- not the correlation of returns. The RPS difference is a
    nonlinear function of the return, so corr(d_i, d_j) != corr(z_i, z_j).
    """
    d = simulate(rho_signal, n_days, S, seed=seed, kappa=kappa, return_panel=True)
    n = d.shape[1]
    C = np.corrcoef(d.T)
    rbar = C[np.triu_indices(n, 1)].mean()
    return n / (1.0 + (n - 1) * rbar), rbar


def power_from(d_daily, n_days, autocorr_deflation=1.0, alpha=0.05):
    """Two-sided power for H0: mean = 0, given the simulated daily-difference distribution."""
    mu, sd = d_daily.mean(), d_daily.std(ddof=1)
    n_indep = n_days * autocorr_deflation
    se = sd / np.sqrt(n_indep)
    zc = norm.ppf(1 - alpha / 2)
    lam = abs(mu) / se
    return norm.cdf(-zc + lam) + norm.cdf(-zc - lam), mu, sd


def days_for_power(rho_signal, S, target=0.80, deflation=1.0, event_only=False, cap=6000):
    d = simulate(rho_signal, 60000, S, event_only=event_only, seed=7)
    mu, sd = d.mean(), d.std(ddof=1)
    zc, zb = norm.ppf(0.975), norm.ppf(target)
    if abs(mu) < 1e-12:
        return np.inf, mu, sd
    n = ((zc + zb) * sd / abs(mu)) ** 2 / deflation
    return n, mu, sd
