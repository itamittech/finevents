"""FinEvents power analysis — produces results.md.

Run:  python run_analysis.py > results.txt

Answers one question: can the design detect the effect it claims, in the time it plans to
take? Serves ADR-0046. Every number below is reproducible from this file plus the FRED
series listed in fetch_fred.sh; the only measured input is the US index correlation.
"""
import numpy as np
from scipy.stats import norm
from power import (build_sigma, n_eff, n_eff_statistic, simulate, INSTRUMENTS, RHO_US)

YEAR = 250
TUNING = 60
ZA2, ZA1, ZB = norm.ppf(0.975), norm.ppf(0.95), norm.ppf(0.80)
KAPPA = 0.5          # central assumption: half the agent's error is common across instruments
S = build_sigma()


def days_for(rho, S_=S, kappa=KAPPA, deflation=1.0, one_sided=False, event_only=False,
             n_days=60000, seed=21):
    d = simulate(rho, n_days, S_, seed=seed, kappa=kappa, event_only=event_only)
    mu, sd = d.mean(), d.std(ddof=1)
    if abs(mu) < 1e-12:
        return np.inf, mu, sd
    zc = ZA1 if one_sided else ZA2
    return ((zc + ZB) * sd / abs(mu)) ** 2 / deflation, mu, sd


def power_at(rho, nd, S_=S, kappa=KAPPA, deflation=1.0, seed=31):
    d = simulate(rho, 60000, S_, seed=seed, kappa=kappa)
    mu, sd = d.mean(), d.std(ddof=1)
    lam = abs(mu) / (sd / np.sqrt(nd * deflation))
    return norm.cdf(-ZA2 + lam) + norm.cdf(-ZA2 - lam)


def h(t):
    print("\n" + "=" * 78 + f"\n{t}\n" + "=" * 78)


h("1. EFFECTIVE SAMPLE SIZE — the number nothing in the doc set computes")
print(f"Instruments scoped (REQ-201): {len(INSTRUMENTS)}")
print(f"US index block correlation  : {RHO_US:.3f}   MEASURED, FRED daily 2016-2026, standardised")
print(f"Return-based n_eff          : {n_eff(S):.2f} independent series per day")
print()
print("But power depends on the correlation of the TEST STATISTIC, not of returns. The RPS")
print("difference is a nonlinear function of the return, and it also inherits however much")
print("of the agent's ERROR is common across instruments (kappa).")
print()
print(f"{'kappa':>7} {'corr(d_i,d_j)':>15} {'n_eff(statistic)':>18}")
print("-" * 78)
for k in [0.0, 0.25, 0.5, 0.75, 1.0]:
    ne, rb = n_eff_statistic(0.05, S, k)
    print(f"{k:>7.2f} {rb:>15.3f} {ne:>18.2f}")
print()
print("kappa is not a free choice. The predictor receives a byte-identical regime block on")
print("all 11 calls (REQ-406), the same classified event list, the same wiki and the same")
print("model. When it misreads the day, it misreads it for every instrument at once.")
print(f"Central case below: kappa = {KAPPA}.")

h("2. TRADING DAYS TO 80% POWER (alpha=0.05, two-sided, t+1)")
print(f"{'rho(signal)':>12} {'R^2':>8} {'mean dRPS':>12} {'days':>9} {'years':>8}")
print("-" * 78)
for rho in [0.02, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20, 0.30]:
    nd, mu, sd = days_for(rho)
    print(f"{rho:>12.2f} {rho**2*100:>7.2f}% {mu:>12.5f} {nd:>9.0f} {nd/YEAR:>8.1f}")
print()
print("rho is corr(agent forecast, standardised move). For daily forecasting on public news,")
print("rho = 0.05 (R^2 = 0.25%) would already be a strong, publishable result.")

h("3. POWER AT THE DESIGN'S OWN MILESTONE — month 11-13 = ~190 post-tuning days")
N1 = YEAR - TUNING
print(f"{'rho(signal)':>12} {'power t+1':>12} {'power t+5':>12}   verdict")
print("-" * 78)
for rho in [0.02, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20, 0.30]:
    p1, p5 = power_at(rho, N1), power_at(rho, N1, deflation=0.2)
    v = "detectable" if p1 >= 0.8 else ("marginal" if p1 >= 0.5 else "UNDERPOWERED")
    print(f"{rho:>12.2f} {p1:>12.1%} {p5:>12.1%}   {v}")

h("4. MINIMUM DETECTABLE EFFECT BY ELAPSED TIME (80% power, t+1)")
grid = np.arange(0.01, 0.60, 0.005)
pre = {}
for r in grid:
    d = simulate(r, 40000, S, seed=3, kappa=KAPPA)
    pre[r] = (d.mean(), d.std(ddof=1))
print(f"{'window':<34} {'days':>6} {'MDE rho':>9} {'MDE R^2':>9} {'MDE dRPS':>10}")
print("-" * 78)
for label, nd in [("Year 1 post-tuning (month 3-13)", N1), ("Year 2 cumulative", 2*YEAR-TUNING),
                  ("Year 3 cumulative", 3*YEAR-TUNING), ("Year 5 cumulative", 5*YEAR-TUNING),
                  ("Year 10 cumulative", 10*YEAR-TUNING)]:
    hit = None
    for r in grid:
        mu, sd = pre[r]
        lam = abs(mu) / (sd / np.sqrt(nd))
        if norm.cdf(-ZA2 + lam) + norm.cdf(-ZA2 - lam) >= 0.80:
            hit = (r, mu); break
    print(f"{label:<34} {nd:>6} " + (f"{hit[0]:>9.3f} {hit[0]**2*100:>8.2f}% {hit[1]:>10.5f}"
                                     if hit else f"{'>0.60':>9} {'-':>9} {'-':>10}"))

h("5. THE t+5 OVERLAP PENALTY")
n1, _, _ = days_for(0.05, deflation=1.0)
n5, _, _ = days_for(0.05, deflation=0.2)
print(f"t+1, rho=0.05 : {n1:>7.0f} days ({n1/YEAR:.1f} yr)")
print(f"t+5, rho=0.05 : {n5:>7.0f} days ({n5/YEAR:.1f} yr)")
print()
print("t+5 predictions made on consecutive days share 4 of their 5 sessions, so the t+5")
print("score series carries roughly 1/5 the independent information its count implies.")
print("Treating t+1 and t+5 as two co-equal endpoints doubles the multiplicity burden while")
print("adding little information. t+5 belongs as a secondary endpoint, not a primary one.")

h("6. 'BEST BASELINE' — REQ-903's headline statistic is biased against the agent")
from power import bucket_probs, rps, EDGES
rng = np.random.default_rng(4242)
nd_, n_inst = 40000, S.shape[0]
L = np.linalg.cholesky(S)
z = (rng.standard_normal((nd_, n_inst)) @ L.T).ravel()
outcome = np.searchsorted(EDGES, z)

def track(rho, seed):
    r = np.random.default_rng(seed)
    eff = np.full(z.size, rho)
    common = np.repeat(r.standard_normal(nd_), n_inst)
    noise = np.sqrt(KAPPA)*common + np.sqrt(1-KAPPA)*r.standard_normal(z.size)
    s = eff*z + np.sqrt(np.clip(1-eff**2, 0, None))*noise
    return rps(bucket_probs(eff*s, np.sqrt(np.clip(1-eff**2, 1e-9, None))), outcome
               ).reshape(nd_, n_inst).mean(axis=1)

tracks = {"climatology": track(0.00, 101), "cond_climatology": track(0.03, 102),
          "chronos": track(0.06, 103), "timesfm": track(0.055, 104)}
agent = track(0.08, 999)
M = np.vstack(list(tracks.values()))
best_single = M.mean(axis=1).min()
daily_min = M.min(axis=0).mean()
print(f"{'track':<20}{'mean RPS':>12}")
print("-" * 78)
for k, v in tracks.items():
    print(f"{k:<20}{v.mean():>12.5f}")
print(f"{'AGENT (rho=0.08)':<20}{agent.mean():>12.5f}")
print()
print(f"Best single track, chosen once     : {best_single:.5f}")
print(f"Per-day minimum over the 4 tracks  : {daily_min:.5f}   (bias {daily_min-best_single:+.5f})")
print()
print(f"Agent - best single track  : {agent.mean()-best_single:+.5f}   <- the honest claim")
print(f"Agent - per-day minimum    : {agent.mean()-daily_min:+.5f}   <- REQ-903 as written")
print()
print("The per-day minimum is not a forecaster anyone could have run: it selects the winning")
print("track after the outcome is known. A genuinely better agent loses to it. If 'best")
print("baseline' is resolved per day, the headline figure reports an oracle's advantage,")
print("not the agent's deficit.")

h("7. WHAT RESTORES POWER — and the ceiling that kappa imposes")
def equicorr(n, rho):
    A = np.full((n, n), rho); np.fill_diagonal(A, 1.0); return A

print(f"{'instrument set':<44}{'n_eff(stat)':>12}{'days':>8}{'years':>7}")
print("-" * 78)
for label, S_ in [("11 as scoped (measured)", S),
                  ("30 single stocks, sectors (rho=0.45)", equicorr(30, 0.45)),
                  ("50 single stocks, sectors (rho=0.45)", equicorr(50, 0.45)),
                  ("100 single stocks (rho=0.45)", equicorr(100, 0.45))]:
    ne, _ = n_eff_statistic(0.05, S_, KAPPA)
    nd, _, _ = days_for(0.05, S_=S_)
    print(f"{label:<44}{ne:>12.2f}{nd:>8.0f}{nd/YEAR:>7.1f}")
print()
print(f"Diminishing hard: at kappa={KAPPA} the statistic-level correlation floors around")
print("0.15, so n_eff(statistic) cannot exceed ~1/0.15 ~ 7 no matter how many instruments")
print("are added. Widening the instrument set helps materially, but kappa caps the ceiling.")
print("Reducing kappa -- giving the predictor genuinely instrument-specific context rather")
print("than one shared regime block -- is the lever nobody has considered.")
print()
n2, _, _ = days_for(0.05, one_sided=True)
print(f"One-sided alpha=0.05 (the hypothesis IS directional): {n2:.0f} days vs {n1:.0f} "
      f"({(1-n2/n1)*100:.0f}% fewer)")
