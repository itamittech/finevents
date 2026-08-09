# ADR-0033: The evaluation harness is a first-class deliverable

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Project positioning; [Product.md](../Product.md)

## Context

Prior-art research established that neither the idea nor the architecture is novel. Event-driven market analytics is a mature commercial category — RavenPack holds roughly 22% of the financial sentiment niche across 40,000+ sources, and S&P Global acquired Kensho to compete in it. Compounding agent memory for trading is published research (FinMem's layered episodic and semantic memory); multi-agent role decomposition is published too (TradingAgents).

What the 2026 critical literature *does* say is missing is rigorous evaluation. Its named failure modes — **memory contamination** (backtests overlapping model knowledge cutoffs, so memorised prices substitute for reasoning), the **oracle fallacy** (retrieving a past episode containing a post-hoc narrative), **attribution** (raw returns being a noisy proxy for skill), and **unmodelled transaction costs** (only two surveyed systems account for them) — are exactly the areas this design has spent its effort on, and the papers note most published systems do not handle them.

The stated goals are a **learning and demonstration artifact** and a **reusable evaluation framework**. Positioning: keep the design, sharpen the framing.

## Decision

**Two first-class deliverables**, not one product with a testing byproduct:

1. **FinEvents** — the event-correlation system.
2. **The evaluation harness** — extractable, reusable, and usable against someone else's predictor.

### Framing

**An evaluation-first system that happens to predict**, not a prediction system that happens to be evaluated. This is a documentation and README stance, and it is honest: the harness is the differentiated part.

### The predictor contract

For the harness to be reusable, predictors must sit behind a defined interface rather than being entangled with the eval code:

```
predict(as_of, instrument, context) -> BucketDistribution | Abstain
```

**This structure already exists implicitly.** Chronos-2, TimesFM 2.5, conditional climatology, persistence and the agent are all already predictors behind a common shape — the baseline ladder *is* a set of interchangeable implementations. Making it reusable is therefore largely naming and documenting what the design already does, not restructuring it.

What the harness owns, and a plugged-in predictor gets for free: point-in-time correctness via the as-of gateway, the baseline ladder, Ranked Probability Score and calibration, abstention and coverage accounting, missed-move tracking, anchoring controls, truncated-replay determinism, and **contamination splitting (L11)**.

### A negative result is a valid outcome

If the agent fails to beat the numeric baselines, that is a **publishable finding**, not a failure of the project. It is also rare — most published work lacks the evaluation rigour to make such a claim credible.

This is only true if the harness is trustworthy enough that a null result is believable, which raises the bar on the harness rather than lowering it on the system.

### Documentation is a deliverable

Per ADR-0001 the document set already exists; its audience now includes people who are not us. Reproducibility moves from good practice to hard requirement — already largely satisfied by record-and-replay (ADR-0018) and truncated replay.

### Prior art to read and credit

The four-level data-side masking protocol for controlling memory exposure is directly relevant to L11 and should be read before finalising the contamination approach. Adopting or crediting existing work is preferable to reinventing a weaker version.

## Alternatives considered

- **Pivot the domain** — apply the same wiki-plus-rigorous-eval pattern to operations, incidents, or supply chain, where events-to-outcomes is real but the field is not adversarial and arbitraged. Genuinely better odds of a positive result. Rejected for now: finance is the harder case, and a harness proven on the hard case transfers to easier ones more credibly than the reverse.
- **Narrow to explainability as the core claim.** The auditable wiki is a real structural advantage as incumbents face XAI pressure. Rejected as the *primary* framing — it is a property worth highlighting rather than the thesis.
- **Pursue predictive edge seriously.** Would require confronting intraday horizons, transaction costs (10–20bps round-trip compounding to 25–50 percentage points of annual drag), and the arbitrage problem directly. Not the stated goal.

## Consequences

- **No architectural change.** The eval rigour and explainability were already the differentiators; this decision names them rather than redirecting effort.
- The harness must not import agent-specific types. A boundary test should enforce this, the way ADR-0016's architecture test enforces the storage boundary.
- **Licence must be permissive** (Apache 2.0 or MIT) for the harness to be reusable — this closes part of the open licence question, though data-redistribution policy remains separate.
- The claim "predicts direction" must never be presented as "makes money". The gap between them is the transaction-cost drag above, and nothing in this design addresses it.
- Documentation effort rises, and now has an external audience.
- Publishing a null result requires the harness to be credible to a sceptical reader — which is the same bar the design already set for itself.

## Revisit trigger

The agent demonstrably beats the top baseline rung out-of-sample on post-contamination-cutoff data — at which point the predictive claim becomes worth pursuing on its own terms, and the goal set should be revisited.
