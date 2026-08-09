"""Estimate the real correlation structure among instruments FinEvents will track.

Only the US index block and the covariates are measurable from FRED without a key.
Indian indices, metals and MCX legs are assumed; those assumptions are the thing the
power sweep varies, so they are named here rather than buried.
"""
import numpy as np, pandas as pd, pathlib

D = pathlib.Path(__file__).parent / "fred"

def load(name):
    df = pd.read_csv(D / f"{name}.csv", na_values=["."])
    df.columns = ["date", name]
    df["date"] = pd.to_datetime(df["date"])
    return df.set_index("date")[name].astype(float).dropna()

series = {s: load(s) for s in ["SP500", "NASDAQ100", "DJIA", "VIXCLS", "DFII10", "DTWEXBGS", "DCOILWTICO"]}

# Align on the shortest common window (SP500/DJIA start 2016 in the free CSV)
px = pd.DataFrame({k: series[k] for k in ["SP500", "NASDAQ100", "DJIA"]}).dropna()
ret = np.log(px).diff().dropna()

print(f"US index block: {len(ret)} common sessions, {ret.index.min().date()} to {ret.index.max().date()}")
print("\nDaily log-return correlation (measured):")
print(ret.corr().round(4).to_string())

# Standardised returns using the project's own trailing-60 sigma (Design 4.1)
z = (ret / ret.rolling(60).std(ddof=1)).dropna()
print("\nStandardised (trailing-60 sigma) return correlation:")
print(z.corr().round(4).to_string())

c = z.corr().values
off = c[np.triu_indices_from(c, 1)]
print(f"\nUS index block mean off-diagonal rho = {off.mean():.4f}  (min {off.min():.4f}, max {off.max():.4f})")

# Effective number of independent series in a block of n with average correlation rho:
# n_eff = n / (1 + (n-1) * rho)   -- the variance of the mean of n equicorrelated unit-variance
# variables is (1 + (n-1)rho)/n, so the mean carries the information of n_eff independent draws.
def n_eff(n, rho):
    return n / (1.0 + (n - 1) * rho)

print(f"US indices: n=3, rho={off.mean():.3f} -> n_eff = {n_eff(3, off.mean()):.2f}")

# Covariate co-movement, for context on the regime block
cov = pd.DataFrame({k: series[k] for k in ["VIXCLS", "DFII10", "DTWEXBGS", "DCOILWTICO"]}).dropna()
cov_d = cov.diff().dropna()
print("\nCovariate daily-change correlation (measured):")
print(cov_d.corr().round(3).to_string())

np.save(D.parent / "us_index_rho.npy", np.array([off.mean()]))
