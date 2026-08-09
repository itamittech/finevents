# Point-in-Time Leakage: Threat Model and Test Harness

**Status:** Design — pending implementation
**Serves:** ADR-0005, ADR-0007, ADR-0008, ADR-0011, ADR-0016, **ADR-0037**
**Risk register:** was the highest-severity standing risk; **substantially reduced by [ADR-0037](../adr/0037-forward-only-agent-learning.md)**

> **Revision 2026-08-09 — the threat model contracted.** [ADR-0037](../adr/0037-forward-only-agent-learning.md) removed historical replay: the agent never runs against a past date. Seven of eleven leakage vectors were failures of *reconstruction* and no longer have a mechanism. What remains is documented below, reranked. **L9 (cross-market timing) replaces L11 (pre-training contamination) at the top.** Part 1 keeps all eleven vectors — the retired ones are load-bearing for Lane A and must not be quietly forgotten.

## Why this document exists

Point-in-time leakage is when a prediction uses information that was not available at the moment it was made. It fails silently, its symptom is *success*, and it is usually discovered only in production when live accuracy collapses to baseline.

A system whose entire premise is measurable self-improvement is worthless if its measurements are contaminated. This harness is therefore not optional test coverage — it is what makes the central claim falsifiable.

**The design principle is unchanged: make leakage structurally impossible first, then test that the structure holds.** What changed is that ADR-0037 made a large slice of it structurally impossible for free, by removing the operation that could fail. Recording forward is trivially correct; reconstructing backward is where leakage lived.

---

## Part 0 — The two lanes

Every statement in this document is scoped to one of two lanes ([ADR-0037](../adr/0037-forward-only-agent-learning.md)). Conflating them is the fastest way to misread the risk.

| | Lane A — numeric | Lane B — agent |
|---|---|---|
| What runs | Climatology, conditional climatology, Chronos-2, TimesFM 2.5 | Prediction, scoring, wiki consolidation |
| Historical execution | Yes — backtested over 11 years | **Never** |
| Purpose of history | Calibration and sanity only | n/a |
| Compared against the agent? | **Live days only** | — |
| Leakage exposure | Full reconstruction risk | Recording risk only |

**Lane A's historical numbers are calibration, not evidence.** They set bucket boundaries and confirm the baselines behave sanely. They are never quoted as skill and never compared against the agent — that comparison happens live, on identical days, for all five rungs.

---

## Part 1 — Threat model

Eleven vectors. The status column reflects the post-ADR-0037 design.

### Live (Lane B) — what can still leak

| # | Vector | Mechanism | Why it survives |
|---|---|---|---|
| **L9** | **Cross-market timing** | Using the US close to predict the Indian close on the same calendar date, when India closed ~10.5h earlier | **Highest risk.** A *within-day ordering* failure, not a historical one. Forward-only running does nothing for it. |
| **L4** | **Severity overlay versioning** | An overlay formula change rescores historical events, retroactively rewriting what severity meant | Overlay changes still propagate backwards through the seeded wiki (ADR-0038) and the event-day bar |
| **L5** | **Consensus revision** | Using a forecast value revised *after* the release rather than the one published before it | Downgraded from reconstruction to **recording discipline**: snapshot at fetch, never re-read |
| **L6** | **Data vintage** | Macro series are revised; using the current figure rather than the original print | Same downgrade as L5 |

**L9 deserves the emphasis it now gets.** The India/US timezone lag is one of the patterns this project most wants to learn (ADR-0009), so the code will deliberately reach across markets. Deliberate cross-market access and accidental lookahead are the same operation with a different timestamp. It is where leakage is most likely to be introduced by someone who believes they are being careful — and it is now the *only* vector where that is true.

### Retired for Lane B — still live for Lane A

These no longer have a mechanism in the agent path, because nothing reconstructs a past date. They remain fully active in Lane A's historical calibration and must be enforced there.

| # | Vector | Why it is gone for Lane B |
|---|---|---|
| L1 | Wiki state | Wiki state *is* current state. There is no past revision to resolve. |
| L2 | Volatility window | A trailing-60-session window anchored on today cannot reach forward. |
| L3 | Climatology baseline | Fit on all history up to today, which is correct by definition rather than by discipline. |
| L7 | Index composition | v1 tracks index level, not constituents (ADR-0009). No survivorship surface. |
| L8 | Event timestamp | A nightly fetch can only return what was already published. Largely, not wholly — see the snapshot test. |
| L10 | Feature normalisation | Live normalisation uses only history to date. Applies to Lane A calibration only. |
| L11 | Pre-training contamination | **The decisive one.** See below. |

### L11 — from "cannot be fixed" to "does not apply"

The previous revision of this document said L11 *"is not our bug… cannot be fixed, only bounded."* That was true of backtests. It is not true of live running.

Chronos-2 and TimesFM 2.5 were pre-trained on public price series — gold, S&P 500 and NIFTY are among the most public series in existence, and research finds time-series foundation-model evaluations inflated **47–184%** by train/test overlap. Contamination occurs when the **target** was in the training corpus.

**Running live, the target is always tomorrow, which is in no published model's training set regardless of cutoff.** Contamination goes to zero by construction.

Two clarifications that matter for implementation:

- **Do not restrict the model's input window to post-cutoff data.** Chronos wants 512–1024 sessions of context; a post-cutoff-only window would starve it for two years and buy nothing. Contaminated *context* is not leakage. Contaminated *targets* are.
- **L11 survives in Lane A's historical calibration**, where it is labelled and never compared against the agent. Lane A's pre-cutoff numbers describe a model that may have memorised the answers, which is exactly why they are calibration rather than evidence.

This removes the project's most awkward reporting obligation. Every agent number will be genuinely out-of-sample, with no pre/post-cutoff split to explain.

---

## Part 2 — Prevention by construction

### 2.1 Bitemporal records (ADR-0016) — retained, purpose shifted

Every record still carries two timestamps:

- **`event_time`** — when the thing happened in the world.
- **`knowledge_time`** — the earliest moment we could have known it.

| Record type | `event_time` | `knowledge_time` |
|---|---|---|
| Price bar | Session close | Close + publication lag |
| GDELT event | Event occurrence date | GDELT database insertion time |
| News article | Event occurrence | Article publication |
| Consensus forecast | Scheduled release date | Forecast publication (before release) |
| Actual release | Release timestamp | Release timestamp |
| Revised macro figure | Original period | Revision publication date |
| Wiki page write | — | S3 version timestamp (ADR-0026) |

Revisions are **appended as new records, never updates in place.**

**What changed:** the schema is no longer load-bearing for *reconstructing* a past prediction. It is load-bearing for **scoring** — a t+5 prediction matures five days later and must be scored against what was known at t, which requires the record to say so. That is a recording obligation, and it is far easier to satisfy correctly than a reconstruction obligation.

It remains non-retrofittable, so it is still built first (Part 6).

### 2.2 The as-of gateway — now a Lane A component

```
AsOfRepository(as_of: datetime) -> only records where knowledge_time <= as_of
```

Rules, enforced rather than documented:

- **No component reads a store directly.** Ingest writes; everything else reads through the gateway.
- **An architecture test asserts this** — no import of a storage client outside the ingest and repository modules.
- **The gateway is the only place `as_of` filtering exists**, so there is exactly one place to audit.

In Lane B, `as_of` is always *now*, so the gateway is a pass-through in practice. **Keep it anyway.** It is what makes Lane A's calibration correct, and it is the seam that would be needed if replay ever returns.

### 2.3 Snapshot integrity — the new structural guarantee

Replacing the frozen clock as the primary live-path discipline:

- **Every fetched record is stamped with its fetch timestamp at the moment of ingest**, by the ingest layer, not derived later.
- **The daily run declares a prediction cut-off timestamp** before assembling any prompt.
- **Nothing bearing a `knowledge_time` after the cut-off may enter the prompt**, asserted in the prompt assembly path rather than reviewed.
- **Fetched values are immutable once written.** A revised consensus figure or macro print appends a new row; the original is never re-read for a prediction already made.

This is what closes L5, L6 and L8 in the live path, and it is cheap because it operates on data flowing forward rather than data being reassembled.

### 2.4 The frozen clock — retained for Lane A

In Lane A calibration mode, wall-clock access raises. `datetime.now()`, `date.today()` and equivalents are unavailable; the only time is `as_of`, injected explicitly. A rolling window that quietly anchors on "now" instead of the simulated date produces exactly the symptom-free leakage this document exists to prevent.

---

## Part 3 — Test layers

### Layer 1 — Repository property tests (every commit, seconds)

Property-based (Hypothesis) over randomly generated `as_of` values and record sets:

- No returned record ever has `knowledge_time > as_of`.
- Querying at `as_of = T` returns a subset of querying at `as_of = T + Δ`, for all positive Δ. *(Monotonicity — knowledge only grows.)*
- Empty history returns empty, not an error or a default.
- Records with `knowledge_time` exactly equal to `as_of` are included, and the boundary is tested explicitly. Off-by-one at the boundary is the most likely bug and the least likely to be noticed.

### Layer 2 — Snapshot integrity and cross-market ordering (every PR) — **the new centrepiece**

Two tests, both targeting what actually survives.

**2a. Snapshot integrity.** For a daily run with declared cut-off T:

```
1. Assemble the prompt for date T.
2. Walk every record that entered it — prices, events, consensus,
   covariates, wiki evidence.
3. Assert knowledge_time <= T for every one, with no exceptions list.
4. Assert the assembled prompt is byte-identical when rebuilt from the
   stored snapshot, so what was scored is what was sent.
```

**2b. Cross-market ordering (L9).** The one that needs a theory, because L9 is the one vector that structure alone does not close:

```
For every (source market, target market) pair, assert the source session
close used as an input closed strictly before the target session opened,
in UTC — not on the same calendar date.
```

Table-driven over the market calendar, including the cases that break naive implementations: Indian holidays when the US trades, US holidays when India trades, and DST transitions that move the lag from 10.5h to 9.5h. **A calendar-date comparison passes the naive case and fails every interesting one**, which is why this is asserted in UTC instants rather than dates.

### Layer 3 — Canary injection (nightly)

Proves leakage is *detectable* rather than merely absent.

```
1. Inject a synthetic record with knowledge_time = T + 30 days,
   containing a distinctive sentinel value.
2. Run prediction as-of T.
3. Assert the sentinel appears nowhere: not in output, not in retrieved
   context, not in reasoning traces, not in cited pages.
```

One canary per surviving vector — a future price bar, a future event, a revised consensus figure, a cross-market close from the wrong side of the boundary.

**A canary that is never caught proves nothing unless the harness is itself tested.** The suite includes a deliberately leaky pipeline variant that the canaries *must* catch. A test that cannot fail is not a test.

### Layer 4 — Truncated replay (Lane A only) — **demoted from centrepiece**

```
1. Run Lane A as-of date D against the complete database.
2. Physically truncate a copy: delete every record with knowledge_time > D.
3. Run the identical computation as-of D against the truncated copy.
4. Assert identical output.
```

It needed no theory about *how* leakage occurred — it detected the fact of it — which is why it was the centrepiece while reconstruction was the main threat.

**Under ADR-0037 it is trivially true for Lane B**, because the live database *is* truncated to today. It is retained for Lane A calibration and as a regression test that no one accidentally introduces a future-reading query into shared code. Cheap now that no LLM calls are involved.

### Layer 5 — Statistical negative controls (per evaluation window)

- **Shuffle test.** Randomly reassign events to dates and re-run. Skill must collapse to baseline. If the system still predicts well with the event–date relationship destroyed, it is reading something other than events — most likely the price series itself.
- **Seeded/observed divergence (ADR-0038).** Track whether the agent's own scored observations ever contradict the seeded statistics. Persistent zero divergence means the agent is reproducing the seed rather than learning, which the ADR-0029 anchoring index does not measure.
- **Vintage check.** For any macro series used, assert the value matches the originally-published vintage, not the current revised figure (L6).
- **Too-good-to-be-true trip.** Skill above a configured ceiling **fails the build rather than passing it.** On this problem a strong result is more likely to be a bug than a discovery. The build failure is a prompt to investigate, not a verdict — but it must not be possible to ship an unexplained excellent result.

### Layer 6 — Live forward validation (continuous) — **now the primary evidence path**

Under ADR-0037 this is not a backstop. It is where every agent result comes from.

- Predictions are written to immutable, timestamped storage **before market open** and never revised.
- Both horizons are scored on maturity, against the record of what was known at prediction time.
- The **five-rung ladder is scored on identical days**, so no rung enjoys a sample advantage.
- The **shadow model arm ([ADR-0039](../adr/0039-live-shadow-model-ab.md))** is scored alongside and never written back to the wiki.

The previous revision framed live divergence from backtest as the signature of residual leakage. With no agent backtest to diverge from, the equivalent tripwire is **Lane A**: if the numeric rungs perform materially worse live than their historical calibration suggested, that is either L11 contamination showing itself, or a live data defect. Both are worth an investigation, and they are distinguishable by whether the gap sits inside or outside the models' pre-training window.

---

## Part 4 — CI integration

| Trigger | Tests | Budget |
|---|---|---|
| Every commit | Layer 1 property tests, architecture import test, frozen-clock test | < 30s |
| PR touching `ingest/`, `pipeline/`, `eval/`, `wiki/` | Layer 2 snapshot integrity + cross-market ordering | seconds |
| PR touching Lane A | Layer 4 truncated replay, sampled dates | minutes |
| Nightly | Layer 3 canaries, all surviving vectors | — |
| Per evaluation window | Layer 5 negative controls; results attached to the run record | — |
| Continuous | Layer 6 live scoring and ladder comparison | — |

Per ADR-0014, these are CI gates. **Layer 2 is the merge gate for pipeline changes** — it has taken over that role from truncated replay.

---

## Part 5 — Acceptance criteria

- [ ] Every record carries `event_time` and `knowledge_time`; revisions append rather than overwrite.
- [ ] No storage client is imported outside `ingest/` and `repository/`, enforced by test.
- [ ] Every fetched record is stamped with fetch time at ingest.
- [ ] Prompt assembly rejects any record with `knowledge_time` after the declared cut-off, with no exceptions list.
- [ ] The assembled prompt rebuilds byte-identically from the stored snapshot.
- [ ] Cross-market ordering asserted in UTC instants, table-driven, covering asymmetric holidays and DST transitions.
- [ ] A canary exists for each surviving vector (L4, L5, L6, L8, L9), each proven catchable against a deliberately leaky variant.
- [ ] Truncated replay produces identical Lane A output across at least three market regimes.
- [ ] Shuffle test collapses skill to baseline.
- [ ] Skill above the configured ceiling fails the build.
- [ ] Every wiki observation carries a `seeded` / `observed` tag, asserted in CI (ADR-0038).
- [ ] Lane A historical output is labelled *calibration* everywhere it surfaces, and is never compared against the agent.

---

## Part 6 — Build order

**Bitemporal schema and gateway first, test layers alongside each component.**

The schema is not negotiable up front. `knowledge_time` cannot be retrofitted onto populated stores — for several sources the information needed to reconstruct it is unrecoverable once ingest has run without it. Everything else can be added incrementally; this cannot.

| Order | Work | Gate before proceeding |
|---|---|---|
| 1 | Bitemporal schema across all stores | Schema review; `knowledge_time` derivation documented per source |
| 2 | `AsOfRepository` gateway + architecture import test | Layer 1 property tests green |
| 3 | Frozen clock (Lane A mode) | Wall-clock access raises |
| 4 | LLM record/replay layer (ADR-0018) | Replay deterministic; cache miss is a hard failure, never a silent live call |
| 5 | Ingest (daily + historical), per source, with fetch stamping | Ingest validation green; canary per source |
| 6 | **Snapshot integrity + cross-market ordering (Layer 2)** | Both green |
| 7 | Lane A: climatology, Chronos, TimesFM + truncated replay | Layer 4 green across 3+ regimes |
| 8 | Wiki seed + provenance tagging (ADR-0038) | Tag-awareness asserted in CI |
| 9 | Lane B: agent, scoring, consolidation | Layer 3 canaries green |
| 10 | Live forward validation (Layer 6) + ladder scoring | Ladder scores all five rungs on identical days |

**Nothing goes live before step 6 passes.** The old rule — *no backtest number is quoted before truncated replay is green* — still governs Lane A, but it no longer gates the project, because there is no agent backtest to quote. The replacement rule is stricter in practice: **the agent may not make a scored prediction until snapshot integrity and cross-market ordering are green**, since under forward-only a leaked prediction cannot be re-run. There is no second chance at a live day.

---

## Open questions

- What is the right value for the too-good-to-be-true ceiling? Too low and it fires constantly; too high and it never fires. Needs calibrating against the first months of live results.
- Where exactly does `knowledge_time` come from for Stooq CSV, which publishes no ingestion timestamp? A conservative documented estimate is the fallback.
- How long is the tuning period ([ADR-0037](../adr/0037-forward-only-agent-learning.md)) during which live results are recorded but excluded from the skill record — and what closes it? It must be fixed in advance, not chosen after seeing the numbers.
