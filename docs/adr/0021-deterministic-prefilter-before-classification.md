# ADR-0021: Deterministic pre-filter before any model classification

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** Cost control (project summary point 10), backfill viability (ADR-0007)

## Context

GDELT 2.0 holds millions of events across the February 2015 → present window. Sending all of them through a model for classification and severity scoring (ADR-0011) is the single largest cost exposure in the project, and it scales with a number nobody has measured yet.

Model choice is the obvious lever and the weaker one. GDELT already ships, free and pre-structured, the fields needed to discard most events without any inference at all:

- **Goldstein scale** — conflict/cooperation intensity
- **Mention, source, and article counts** — media salience proxy
- **Actor codes** — who was involved
- **Geography** — where, and therefore its relevance to the eleven tracked series
- **CAMEO event code** — the substrate taxonomy

Filtering on these in plain Python costs nothing and is deterministic, testable, and reproducible. **The cheapest token is the one never sent**, and this lever is independent of which model is eventually chosen.

## Decision

We will filter GDELT deterministically, in code, before any event reaches a model — and calibrate the thresholds against a hand-labelled sample so the recall being bought is a known quantity rather than a hope.

**Pipeline order is fixed:** GDELT ingest → deterministic filter → model classification and severity scoring → wiki.

**Filter inputs:** Goldstein intensity, mention/article/source counts, actor codes, geography relevance to the tracked series, CAMEO category.

**Calibration is mandatory, not optional.** A hand-labelled sample of events — labelled for genuine market relevance — is used to measure the filter's recall and precision at candidate thresholds. A filter shipped without a measured recall figure is an unknown-sized hole in the event history, and it fails silently.

**The filter is versioned like the severity overlay (ADR-0011).** Changing thresholds changes which events exist in the history, which invalidates accumulated correlations. Filter version is recorded on each run; a change triggers a re-filter-and-revalidate pass, never an in-place edit.

**Filter decisions are logged, not discarded.** Rejected events are recorded with the rule that rejected them. Without this, "why is there no event for that day" is unanswerable, and the filter cannot be audited or tuned after the fact.

**Missed-move tracking is a partial independent check.** ADR-0013 already records an abstention on a day that produced a >1.5σ move as a *missed move*. A filter systematically dropping market-moving events will show up there as a rising missed-move count — a genuine cross-check that does not depend on the labelled sample being representative.

## Alternatives considered

- **Permissive filter — drop only obvious noise.** Rejected: maximum coverage, but cost scales with whatever volume survives, and the volume is currently unmeasured. It also loads the model with events a numeric threshold could have rejected for free.
- **Two-stage — cheap model triages, stronger model scores.** Rejected for v1, though it remains a sound pattern. It is strictly more complex: two model stages to build, tune, and keep consistent across backfill and live. Revisit if the deterministic filter proves too blunt.
- **No filter, cheaper model instead.** Rejected as a false trade: model choice and filtering are independent levers, and filtering is free. Do the free one first, then choose a model.

## Consequences

- Largest cost lever in the project, at zero marginal cost, applied before any model decision matters.
- Makes backfill cost predictable — volume becomes a number chosen deliberately rather than discovered from a bill.
- Filtering is deterministic and reproducible, so it replays identically under the truncated-replay harness.
- **A threshold set too high silently drops real events**, and the resulting gap is invisible in the data. This is the central risk; the labelled sample and missed-move tracking exist to bound it.
- The labelled sample is real work and needs enough events to be meaningful across event categories.
- Filter versioning adds the same class of complexity as overlay versioning — and the same hazard if skipped.
- Thresholds will need re-tuning if the instrument set expands in v2 (ADR-0009), since geography and actor relevance are defined against the tracked series.

## Revisit trigger

Measured recall on the labelled sample falls below the agreed floor, **or** missed moves (ADR-0013) rise without a corresponding change in abstention policy — either indicates the filter is discarding events that matter.
