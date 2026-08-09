# ADR-0049: Market calendar scope, and the OTC spot convention

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** REQ-211, REQ-403, REQ-1203, REQ-1204
- **Amends:** [ADR-0037](0037-forward-only-agent-learning.md) (L9 test inputs), [ADR-0003](0003-track-gold-at-both-usd-spot-and-mcx-inr.md)

## Context

L9 — cross-market timing — is the **top-ranked surviving leakage vector** ([threat model](../design/point-in-time-test-harness.md)). Its test asserts, in UTC instants, that a source session's close preceded the target session's open (`Design.md` §4.7):

```
assert close_utc(S, last_session_at_or_before(cutoff)) < open_utc(T, s_T)
```

REQ-211 and T3.1 provide calendars for **NSE and NYSE only**. The instrument set spans more:

| Instruments | Venue | Calendar exists? |
|---|---|---|
| NIFTY 50 | NSE | yes |
| SENSEX | **BSE** | no |
| S&P 500, Dow | NYSE | yes |
| Nasdaq | **NASDAQ** | no |
| MCX gold, MCX silver | **MCX** | no |
| Gold, silver, platinum, palladium spot | **OTC — no venue** | not applicable |

So `open_utc(T, s_T)` is undefined for six of eleven instruments, and the top leakage test is specified for a minority of the set. Two of the gaps are the interesting ones:

- **MCX runs an evening session** to ~23:30 IST (18:00 UTC), which **overlaps the US session**. That is precisely the asymmetric case REQ-1204 says the test must cover, and it is the pair `prediction-contract.md` names as a coherence relationship.
- **OTC spot has no session at all.** It trades continuously from Sunday ~22:00 UTC to Friday ~22:00 UTC. There is no close to order against, so `close_utc` and `open_utc` are undefined rather than merely missing — the L9 predicate does not typecheck for these instruments.

Trading-day horizon arithmetic (REQ-403) has the same problem: "t+1 trading day" needs a session definition.

## Decision

**1. Calendars are required for every venue in the instrument set** — NSE, BSE, NASDAQ, NYSE and MCX — held as UTC instants with session open and close, covering DST transitions on both sides and each venue's own holidays. BSE and NSE holidays coincide in most years but not all, and *most* is exactly the failure mode REQ-1204 exists to catch. MCX carries both its morning and evening sessions; the evening close is the one that matters.

**2. OTC spot metals are given an explicit synthetic session**, since they have no real one:

| | Convention |
|---|---|
| Reference close | **17:00 America/New_York**, the conventional daily bar cut for OTC metals — 21:00 or 22:00 UTC depending on US DST |
| Trading day | A day with a reference close. Weekends excluded; the market is otherwise open |
| Holidays | Spot metals observe **no exchange holidays.** A reference close exists on, for example, US Thanksgiving |
| `open_utc` | The instant immediately after the previous reference close — spot has no gap |

**The convention is recorded in the calendar table, not derived in code**, and it is versioned with everything else. Changing it silently reinterprets every stored σ, bucket boundary and score.

**3. For a continuous market the L9 predicate reduces, and must be written to reduce rather than to be skipped.** With no gap between sessions, "the source closed before the target opened" is not the binding constraint; the binding constraint is the cut-off:

```
assert knowledge_time(input) <= cutoff  and  cutoff < reference_close_utc(T, s_T)
```

**A missing or inapplicable calendar entry is a hard CI failure, never a skipped assertion** (REQ-1204). A leakage test that silently passes because it could not evaluate is worse than no test — it reports safety it never checked. This is the specific way L9 defences erode.

**4. Cross-market pairs are enumerated explicitly** rather than derived, so a new instrument cannot join without someone deciding its ordering relationships. The MCX-evening/US-session overlap and the NSE-close/US-open lag are the two the fixture table must cover first.

## Consequences

- **T3.1 grows from two calendars to five plus a synthetic convention**, and REQ-211 is rewritten accordingly. This is more work than "market calendars" implied and it sits on the critical path, since Phase 4a gates Phase 5.
- **The MCX overlap is a genuine leakage risk, not a hypothetical.** An MCX evening close lands inside the US session. Using a US close from the same calendar date to predict an MCX session that already closed is the exact L9 failure, and it is *more* likely here than in the India/US equity case because the overlap is partial rather than clean.
- **Spot metals are not holiday-aligned with anything.** A US-holiday day yields a spot reference close and no US index close, so horizon arithmetic diverges across instruments within a single run. Scoring already handles per-instrument maturity (REQ-802); this makes the requirement explicit rather than incidental.
- **The synthetic close is a modelling choice with a cost.** 17:00 New York is a convention, not a fact about the market. Any comparison with a source using the London PM benchmark will differ, and published derived data must state which was used (REQ-1108).
- **`Design.md` §4.7's predicate is amended** to the two-clause form above, so it typechecks for every instrument.

## Alternatives considered

- **Use the London PM benchmark as the spot close.** Reasonable, and closer to how gold is priced institutionally. Rejected because it covers gold and silver well, platinum and palladium less well, and none of the equity instruments — one convention across all four metals is easier to reason about and to audit.
- **Treat spot metals as following the NYSE calendar.** Rejected: it would discard real observations on US holidays, when metals do trade and geopolitical events do not pause.
- **Skip the L9 assertion where a calendar is absent.** Rejected explicitly — it is the erosion mechanism the ADR exists to close.
- **Drop MCX from v1** to avoid the overlap. Rejected: [ADR-0003](0003-track-gold-at-both-usd-spot-and-mcx-inr.md) tracks metals at both USD spot and MCX INR deliberately, and the India/US timing relationship is one of the patterns the project most wants to learn.

## Revisit trigger

A venue changes its session times or introduces a session that overlaps another venue in the set differently — or a published spot benchmark is adopted that makes the synthetic 17:00 close unnecessary.
