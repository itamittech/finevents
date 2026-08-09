# ADR-0034: Correlation page evidence model

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** ADR-0005 (wiki), ADR-0008 (horizons), ADR-0029 (prediction contract)

## Context

Correlation pages carry evidence and confidence (ADR-0005), but two mechanics were unspecified.

**A prediction matures twice.** Made on day D, it resolves at t+1 on D+1 and again at t+5 on D+5 — so the same prediction generates evidence on two different days.

**And nothing bounded how far one outcome could move a page's confidence.** An agent rewriting a confidence number each day is exposed to recency bias, a known and well-documented LLM failure mode.

## Decision

### Evidence is per-horizon, appended, and never pooled

Each maturity writes its **own append-only entry** against the correlation page. Hit rate and confidence are tracked **separately for t+1 and t+5**.

They are genuinely different questions with different base rates — a same-day reaction and a five-day drift are not the same claim — so separate tracking is statistically correct, not merely tidy.

**The trap this avoids:** t+1 and t+5 outcomes from one prediction are *correlated*. A move that persists hits both. Counting them as two independent observations would inflate the evidence count and therefore confidence — a silent overstatement that compounds over years.

**Therefore: observation counts are never summed across horizons.** A page reports "N predictions tested, each at two horizons", never "2N observations". Any pooled statistic must account for the dependence, and the default is not to pool.

### Confidence is computed in code; the agent writes only narrative

The agent appends the observation and the reasoning. **It never sets the confidence number.** That follows the principle already established in ADR-0029: the model does no arithmetic, because any number a model computes is a number that can be silently wrong.

**Confidence is a Beta-Binomial posterior** over the per-horizon hit record, from a deliberately sceptical prior.

This solves the recency-swing problem without a clamp — **the mathematics bounds it**. One observation moves a posterior by an amount that shrinks naturally as evidence accumulates, and a small sample yields an honestly wide credible interval rather than false certainty. A page with one hit does not read as 100% confident.

**Two properties this buys:**

- **Confidence is a pure function of the evidence list.** If the formula changes, it is a deterministic recompute — not a re-run of the agent. Contrast with the overlay-version hazard (ADR-0011), where a formula change requires rescoring through a model.
- **Point-in-time confidence is recomputable rather than stored.** Reading a page as of a past date means computing the posterior from entries up to that date. No stale stored number can disagree with the evidence beneath it.

### Division of labour on a page

| Computed in code | Written by the agent |
|---|---|
| Per-horizon hit record | The observation record — what happened, in what context |
| Beta posterior mean and credible interval | Narrative interpretation of what it means for the hypothesis |
| Observation counts, per horizon | Contradiction and disconfirming-evidence flags |
| — | Whether to create a new page or add `[[wiki-links]]` |

## Alternatives considered

- **Hold t+1 and write one combined entry at t+5.** Avoids the double-touch and the correlation trap entirely. Rejected: a five-day lag before any learning from a prediction, in a system whose feedback loop is the point.
- **Provisional entry at t+1, revised at t+5.** Fastest feedback. Rejected: amending rather than appending breaks the append-only model and makes page history harder to audit.
- **Agent sets confidence, clamped to a maximum daily change.** Preserves judgment while bounding swing. Rejected: the clamp is an arbitrary parameter with no principled value, and it masks bad judgment rather than preventing it. A posterior achieves the same bound from first principles.
- **Agent sets confidence freely, with churn monitoring.** Rejected: by the time churn appears in a metric, the wiki has already absorbed it.

## Consequences

- Recency swing is prevented by construction rather than detected after the fact.
- Confidence is auditable and reproducible — anyone can recompute it from the evidence list.
- **The page gains a clear computed/written boundary**, which the wiki curator must respect. A curator that writes a confidence number is a bug, and should be caught by validation on the page schema.
- Per-horizon tracking means roughly twice the evidence entries, and pages grow faster. Relevant to ADR-0005's ~500-page revisit trigger.
- **"Hit" needs defining for a five-bucket ordinal prediction** — exact bucket, within-one-bucket, or directional. Directional is the readable default, with Ranked Probability Score remaining the rigorous metric; the page's hit rate is a human-facing summary, not the score of record.
- The prior's strength is a tunable. Too sceptical and real correlations take years to surface; too weak and early noise reads as signal.

## Revisit trigger

Credible intervals stay so wide after a full backtest that no correlation reaches actionable confidence — indicating the prior is too sceptical, or that per-horizon splitting has thinned the evidence too far.
