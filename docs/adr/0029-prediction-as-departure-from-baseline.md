# ADR-0029: Prediction as departure from baseline, one call per instrument

- **Status:** Accepted
- **Date:** 2026-08-09
- **Serves:** ADR-0008 (buckets), ADR-0013 (abstention), ADR-0017 (covariates)
- **Detail:** [Prediction Contract](../design/prediction-contract.md)

## Context

How the predictor agent is actually invoked had not been recorded. The naive shape — assemble the relevant context and ask the model what a price will do — fails on several counts: the model would perform arithmetic it cannot be trusted with, the output would not support Ranked Probability Score or calibration measurement, and a result would be uninterpretable against the climatology baseline that ADR-0008 requires skill to be measured against.

Three specific questions needed settling: what the model outputs, how many calls a run makes, and what the model is allowed to see of its own history.

## Decision

### 1. The model predicts a departure from a computed baseline, as a distribution

Output is a **probability distribution over the five σ-buckets, at t+1 and t+5**, per instrument — plus confidence, cited wiki pages with version IDs, and reasoning. Or an abstention.

A distribution rather than a label because Ranked Probability Score requires one, calibration requires probabilities, and abstention is expressible as a distribution matching the baseline.

The model is handed the conditional climatology distribution and asked how the event should shift it. **This framing is what makes the result interpretable**: climatology is the benchmark, so departing and being right demonstrates skill, and echoing the baseline scores zero — honestly.

**The model does no arithmetic.** Bucket boundaries, σ, baselines, standardised surprise and severity all arrive as computed inputs. Any number the model derives is a number that can be silently wrong.

### 2. One call per instrument — eleven per run

Each prediction is independent, attributable, and small enough to validate reliably. A malformed response costs one instrument, not the day.

**Coherence comes from shared context rather than a shared call.** All eleven prompts carry the *same* regime block — real yields, dollar index, VIX, crude, as σ-relative moves — so instruments reason from an identical view of market state despite being predicted separately. No additional "market state" call is needed; the regime covariates already are that state.

**Residual incoherence is measured, not prevented.** A deterministic post-hoc check scores the eleven predictions against known structural relationships — NIFTY against SENSEX, gold against the dollar, gold against equities under risk-off, spot gold against MCX via USD/INR. Violations are flagged as a metric and never blocked: a genuine decoupling is a real market event and must not be suppressed. A sustained rise in violations is the signal that per-instrument calls are costing coherence.

### 3. Baseline-blind control runs

On a sampled fraction of days each instrument is predicted twice — once with the baseline in the prompt, once without — recorded and distinguished by a `baseline_shown` flag.

This yields an **anchoring index** (how much closer the baseline-shown prediction sits to the baseline than the blind one) and **blind skill** (RPS of blind predictions). Together they answer whether the model is reasoning or restating what it was handed — a question that is otherwise unanswerable, since a model echoing climatology produces a plausible reasoning trace either way.

### 4. The predictor sees outcomes, never its own prior reasoning

Correlation pages carry hit rates and disconfirming evidence, all grounded in what actually happened. Past reasoning text is not fed back. This anchors the feedback loop to reality rather than to the model's own prior arguments, and avoids a model rationalising consistency with itself instead of reassessing from evidence.

## Alternatives considered

- **One call for all eleven instruments.** Full cross-instrument coherence, and closer to how an analyst reasons. Rejected: 110 probabilities in one structured response is error-prone, and one malformed output loses the entire day. The shared regime block recovers most of the coherence benefit.
- **One call per asset class.** Middle ground on both axes. Rejected in favour of full isolation plus the coherence metric, which makes the cost of isolation visible rather than assumed.
- **Withhold the baseline entirely.** Eliminates anchoring by construction. Rejected: discards genuinely useful context, and predictions would likely underperform a baseline the model was never shown. The sampled control measures anchoring without paying that cost.
- **Show the model its recent predictions and outcomes.** Richer context, and the model could notice its own systematic biases. Rejected on the rationalisation risk above.
- **Predict a point estimate or a single bucket.** Rejected: incompatible with Ranked Probability Score and with calibration measurement, and leaves no natural representation for abstention.

## Consequences

- Results are interpretable against the benchmark by construction — the thing being predicted *is* the departure from what we would otherwise have assumed.
- Eleven calls per run rather than one; still trivial at Nova rates, and each is independently retryable.
- Validation is enforceable in code: probabilities sum to 1, cited pages must exist in the manifest as of the prediction date, and **abstention is rejected when severity crosses the mandatory-prediction threshold** — putting ADR-0013's rule in code rather than in a prompt.
- **Prompt assembly becomes a point-in-time surface**, and a significant one: leakage vectors L2, L3 and L10 live there rather than in storage. Truncated replay must cover the assembled prompt, not just the query layer.
- Baseline-blind runs roughly double prediction cost on sampled days. Negligible in absolute terms.
- The coherence check needs its structural relationships maintained as the instrument set grows in v2.
- **A known residual:** hit rates are grounded in outcomes, but the hypothesis space is model-generated — evidence only accumulates on pairings the model thought to propose, and nothing surfaces a correlation it never hypothesised. Unaddressed; worth revisiting once the loop runs.

## Revisit trigger

Coherence violations rise sustainably (per-instrument calls are costing too much consistency), **or** the anchoring index shows the model is substantially restating the baseline rather than reasoning from evidence.
