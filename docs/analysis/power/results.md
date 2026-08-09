# Power analysis — can FinEvents detect the effect it claims?

**Date:** 2026-08-09
**Serves:** [ADR-0046](../../adr/0046-pre-registered-skill-comparison.md)
**Reproduce:** `./fetch_fred.sh && python corr_est.py && python run_analysis.py > results.txt`

The doc set contains no power calculation. `ADR-0037:71` concedes that same-day cross-instrument correlation puts effective sample size "well below the raw figure" and asserts "the direction holds" without computing it. This computes it.

## The question

`Product.md` states the success criterion: **"the harness is credible enough that a *null* result is believable."** An underpowered test cannot deliver a believable null — at low power, failing to detect an effect is uninformative about whether one exists. So the question is not "will the agent win" but **"if the agent had a real edge, would this design see it, on this timeline?"**

## Method

Standardised returns for the 11 scoped instruments are drawn from a block correlation matrix. The **US index block correlation is measured** from FRED daily data, 2016–2026: **ρ = 0.859** on trailing-60-σ standardised returns. Indian indices, metals and MCX legs are assumed and swept.

The agent is modelled as seeing a noisy signal of tomorrow, `s = ρ·z + √(1−ρ²)·ε`, so **ρ = corr(agent forecast, standardised move)**. Its forecast is the implied posterior, converted to the five ADR-0008 buckets. Climatology is unconditional N(0,1) over the same buckets. Both are scored by RPS; the statistic is the paired difference aggregated **by day**.

For calibration: **ρ = 0.05 means R² = 0.25%.** For daily forecasting on public news at a daily horizon — a heavily arbitraged setting, as `Product.md` itself notes — that would already be a strong, publishable result.

## The parameter everything turns on: κ

Power depends on the correlation of the *test statistic*, not of returns. The RPS difference is a nonlinear function of the return, and it inherits however much of the agent's **error** is common across instruments. Call that share κ.

| κ | corr(dᵢ, dⱼ) | n_eff (statistic) |
|---|---|---|
| 0.00 | 0.000 | 10.99 |
| 0.25 | 0.074 | 6.34 |
| **0.50** | **0.148** | **4.44** |
| 0.75 | 0.222 | 3.41 |
| 1.00 | 0.297 | 2.77 |

**κ is not a free choice.** The predictor receives a byte-identical regime block on all eleven calls (REQ-406), the same classified event list, the same wiki and the same model. When it misreads the day, it misreads it for every instrument at once. κ ≈ 0.5 is the central case used below; κ = 0 is the optimistic corner and is not this design.

Return-based n_eff for the instrument set is **2.54** — eleven instruments yield about 2.5 independent series per day.

## Result 1 — days to 80% power (α = 0.05 two-sided, t+1, κ = 0.5)

| ρ | R² | mean ΔRPS | days | years |
|---|---|---|---|---|
| 0.02 | 0.04% | −0.00002 | 32,407 | 129.6 |
| 0.03 | 0.09% | −0.00005 | 12,161 | 48.6 |
| **0.05** | **0.25%** | **−0.00016** | **3,857** | **15.4** |
| 0.08 | 0.64% | −0.00043 | 1,405 | 5.6 |
| 0.10 | 1.00% | −0.00067 | 878 | 3.5 |
| 0.15 | 2.25% | −0.00154 | 376 | 1.5 |
| 0.20 | 4.00% | −0.00278 | 206 | 0.8 |

## Result 2 — power at the design's own milestone (~190 post-tuning days)

| ρ | power t+1 | power t+5 | verdict |
|---|---|---|---|
| 0.03 | 6.1% | 5.2% | underpowered |
| **0.05** | **9.1%** | **5.8%** | **underpowered** |
| 0.08 | 17.0% | 7.3% | underpowered |
| 0.10 | 24.7% | 8.8% | underpowered |
| 0.15 | 50.3% | 14.2% | marginal |
| 0.20 | 76.2% | 22.3% | marginal |

**At month 11–13, a strong-for-finance edge has a 9% chance of being detected.** A 5% test rejects 5% of the time under the null, so 9% power is barely distinguishable from no test at all.

## Result 3 — minimum detectable effect by elapsed time

| Window | days | MDE ρ | MDE R² |
|---|---|---|---|
| Year 1 post-tuning (month 3–13) | 190 | 0.200 | 4.00% |
| Year 2 cumulative | 440 | 0.130 | 1.69% |
| Year 3 cumulative | 690 | 0.105 | 1.10% |
| Year 5 cumulative | 1,190 | 0.080 | 0.64% |
| Year 10 cumulative | 2,440 | 0.055 | 0.30% |

To reach a verdict at month 13, the agent would need R² ≈ 4% against next-day standardised moves from public event data. That is not a plausible effect size; it is an implausible one.

## Result 4 — t+5 is not a second endpoint

t+5 predictions on consecutive days share four of their five sessions, so the score series carries roughly **1/5** the independent information its count implies: 19,287 days to power at ρ = 0.05, against 3,857 for t+1. Treating t+1 and t+5 as co-equal endpoints doubles the multiplicity burden while adding little information.

## Result 5 — `best baseline` is biased against the agent

REQ-903 reports **agent RPS minus best-baseline RPS**. Simulating four tracks with genuinely similar skill (as ADR-0032 expects — "which numeric model leads is expected to vary by regime"), against an agent that is genuinely better:

| | RPS |
|---|---|
| Best single track, chosen once | 0.13760 |
| Per-day minimum over 4 tracks | 0.13491 |
| **Selection bias** | **−0.00269** |

| Comparison | Value |
|---|---|
| Agent − best single track | **−0.00023** — the honest claim, agent wins |
| Agent − per-day minimum | **+0.00246** — REQ-903 as written, agent loses |

**The per-day minimum is not a forecaster anyone could have run.** It selects the winning track after the outcome is known. The bias it introduces is **an order of magnitude larger than a realistic agent edge**, so a genuinely better agent is reported as losing. This is not a power problem — it is a bias, and no amount of data fixes it.

*(If `best baseline` is instead resolved once over the whole period rather than per day, the bias is far smaller but still present, and still needs the pre-registered correction. The requirement does not currently say which.)*

## Result 6 — what actually helps, and the ceiling that does not move

| Instrument set | n_eff (stat) | days | years |
|---|---|---|---|
| 11 as scoped (measured) | 4.44 | 3,857 | 15.4 |
| 30 single stocks across sectors | 4.40 | 3,630 | 14.5 |
| 50 single stocks across sectors | 4.71 | 2,848 | 11.4 |
| 100 single stocks | 4.75 | 3,193 | 12.8 |

**Widening the instrument set barely helps.** At κ = 0.5 the statistic-level correlation floors near 0.15, so n_eff cannot exceed about 7 however many instruments are added. This corrects a first-pass estimate made with κ = 0, which wrongly suggested breadth was the dominant lever.

**And no statistical method can beat that ceiling.** With `dᵢ = c + eᵢ` where `c` is the common component, any weighted mean with weights summing to one has variance `Var(c) + Σwᵢ²Var(eᵢ)`. The common term is irreducible. GLS weighting, optimal pooling, better estimators — none of them touch it.

**The only lever that moves κ is a design change:** giving the predictor genuinely instrument-specific context instead of one shared regime block. That is the opposite of REQ-406's byte-identical block, which exists for coherence — so coherence and statistical power are in direct tension, and nothing in the doc set has noticed.

Two cheaper levers are real but small: a **one-sided test** (the hypothesis is directional) saves 21%, and dropping t+5 from the primary endpoint removes half the multiplicity burden.

## Conclusion

The design cannot deliver its own stated success criterion on its own timeline. At month 11–13 it will produce a wide confidence interval containing both zero and every plausible effect size — **an inconclusive result, not a believable null.**

That is a finding about the *measurement*, not about the *architecture*. Forward-only, the ladder, the leakage harness and the provenance model are all unaffected and all still correct. What has to change is the claim attached to the timeline, and the statistic used to make it.

## Limitations

- The Gaussian return model understates tail frequency; real returns are fat-tailed, which widens RPS variance and makes these estimates **optimistic**.
- Indian index, metals and MCX correlations are assumed, not measured — only the US index block is measured. The κ sweep dominates this uncertainty.
- κ itself is an assumption. It is the single most important input and it should be **measured from the live record** as soon as ~60 scored days exist, then this analysis re-run.
- The agent's edge is modelled as constant. If it concentrates on event days, the event-day subset is smaller but cleaner; simulated separately, that does not change the conclusion.
