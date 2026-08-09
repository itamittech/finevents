# ADR-0011: CAMEO substrate with a financial relevance overlay

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Event classification, severity scoring, learning layer inputs

## Context

GDELT codes events using **CAMEO** (Conflict and Mediation Event Observations) — roughly 20 root codes and ~300 detailed sub-codes, spanning statements, appeals, cooperation, threats, protest, force posture, assault, and mass violence. Backfill (ADR-0007) arrives pre-coded in CAMEO at no cost.

CAMEO was designed for political-science conflict analysis, and it shows:

- **Fine granularity where markets barely care** — many distinct codes for diplomatic and rhetorical acts.
- **Almost nothing where markets care most** — no representation of monetary policy, inflation data, supply shocks, import duty changes, or currency intervention.
- **Its intensity measure is not financial.** GDELT's Goldstein scale rates conflict-versus-cooperation intensity. An event can score as highly conflictual yet be market-irrelevant, or score mildly yet move gold sharply. Goldstein is a useful input, not a substitute for financial severity.

Re-coding eleven years of backfill into a bespoke taxonomy would require an LLM classification pass over the entire history — expensive, and it discards structure GDELT already provides.

## Decision

We will keep CAMEO as the substrate and add a financial relevance overlay on top.

**Layer 1 — CAMEO substrate (free, from GDELT):** event code, actors, geography, Goldstein scale, average tone, and mention/source/article counts. Stored verbatim; never overwritten.

**Layer 2 — financial relevance overlay (ours):**

- **Financial severity score**, distinct from Goldstein. Inputs include Goldstein intensity, GDELT's mention and article counts as a free media-salience proxy, actor and geography relevance to tracked instruments (a supply-country event matters more for palladium than a diplomatic exchange elsewhere), and event-type prior.
- **Asset-class linkage** — which of the eleven tracked series this event category plausibly affects, with a directional prior. This is a *hypothesis to be tested*, not an assumption baked into predictions; correlation pages in the wiki (ADR-0005) accumulate the evidence.
- **Supplementary categories CAMEO lacks** — monetary policy, inflation and employment prints, commodity supply shock, regulatory and duty change, currency intervention. These come predominantly from the economic calendar (ADR-0012) rather than GDELT.

**The two sources are complementary, not overlapping.** GDELT covers unscheduled geopolitical events; the economic calendar covers scheduled macro releases. Together they cover the event space; neither alone does.

**The overlay is versioned.** Changing the severity formula changes every historical score, which would silently invalidate accumulated correlations. Overlay version is recorded on each scored event, and a version change triggers a rescore-and-revalidate pass rather than an in-place edit.

## Alternatives considered

- **CAMEO natively, no overlay.** Rejected: no monetary-policy representation, and Goldstein intensity is not financial relevance. The learner would weight a diplomatic statement and a supply shock by the wrong criterion.
- **Custom financial taxonomy from scratch.** Rejected: cleanest conceptual fit, but requires an LLM classification pass over eleven years of backfill, and throws away GDELT's actor, geography, and salience structure — which the overlay uses as inputs anyway.

## Consequences

- Backfill needs no re-coding; eleven years of history is immediately usable.
- Severity scoring is explicit, inspectable, and tunable rather than implicit in a prompt.
- CAMEO's political-science bias persists in the substrate. Some market-relevant distinctions have no CAMEO code and depend entirely on the overlay to surface.
- **Overlay versioning adds real complexity**, and skipping it would let a formula tweak silently rewrite history. This is the same class of hazard as point-in-time leakage.
- The asset-linkage priors risk becoming self-fulfilling if predictions lean on them without testing. Correlation pages must record disconfirming evidence (ADR-0005), not just confirmations.
- Two event sources means deduplication matters: a Fed decision appears in both the economic calendar and GDELT news coverage.

## Revisit trigger

Financial severity score shows no relationship to realised volatility after backtest, **or** more than 30% of market-moving events prove to have no usable CAMEO representation — either would indicate the substrate is the wrong base layer.
