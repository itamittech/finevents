#!/usr/bin/env python3
"""The reasoning rung: a brief in, a sealed bucket bet out (P8c — ADR-0057, REQ-1301–1303).

Key-ready, key-optional. Without `OPENAI_API_KEY` everything here still runs
except the model call itself — the daily runner seals the numeric rungs and says
plainly that the reasoning rung was skipped. Drop the key into the environment
and the next run seals `llm_raw` beside every other method, scored by the same
maturation. Model id comes from `FINEVENTS_LLM_MODEL` (default: gpt-5.6-sol) —
configuration, never code.

Run:  python scripts/poc_reasoning.py --show-brief gold
      (any instrument: gold, silver, usd_rub, usd_inr, wti) — prints the exact
      brief the agent will read, keyless, from today's sealed record, so what
      you inspect is what the model gets.

Guardrails carried from ADR-0057:
- one bounded structured-output turn, zero tools;
- the full brief and response persist under `data/reasoning/` (gitignored —
  prompts stay local), with their SHA-256 hashes in the sealed record
  (REQ-1302), so every live bet is auditable after the fact;
- forward-only (ADR-0037): this rung runs against today only. It has no
  offline ladder history and never will — its record accrues live.

Reproducibility note, stated rather than implied: REQ-507's byte-determinism
belongs to the numeric lane. A hosted reasoning model does not promise it; the
honesty mechanism for this rung is the recorded transcript, not replay.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import UTC, datetime
from pathlib import Path

from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from poc_env import load_env_file  # noqa: E402

# The builder keeps the key in .env (gitignored, hook-blocked). Loaded once at
# import; real environment variables always win over the file.
load_env_file()

ROOT = Path(__file__).resolve().parent.parent
RECORDS = ROOT / "data" / "reasoning"
LIVE = ROOT / "ui" / "data" / "live.js"
EVENTS = ROOT / "ui" / "data" / "events.js"
RESULTS = {
    "gold": ROOT / "ui" / "data" / "results.js",
    "silver": ROOT / "ui" / "data" / "results_silver.js",
    "usd_rub": ROOT / "ui" / "data" / "results_usd_rub.js",
    "usd_inr": ROOT / "ui" / "data" / "results_usd_inr.js",
    "wti": ROOT / "ui" / "data" / "results_wti.js",
}

#: What each target IS — the first thing the model must know, because "gold"
#: alone hides the rouble leg, and a point bet needs its units understood.
IDENTITY = {
    "gold": "gold priced in roubles per gram (the Bank of Russia daily fix — an XAU/RUB series)",
    "silver": "silver priced in roubles per gram (Bank of Russia daily fix)",
    "usd_rub": "the US dollar priced in roubles (Bank of Russia official rate)",
    "usd_inr": "the US dollar priced in Indian rupees (Fed H.10 reference rate)",
    "wti": "WTI crude oil in US dollars per barrel",
}

ENV_KEY = "OPENAI_API_KEY"
ENV_MODEL = "FINEVENTS_LLM_MODEL"
DEFAULT_MODEL = "gpt-5.6-sol"

BUCKETS = ("large down", "small down", "flat", "small up", "large up")


class HorizonBet(BaseModel):
    """Five ordinal bucket probabilities plus one exact call (REQ-1301).

    The distribution is the scored contract (RPS against sealed edges). The
    point estimate is the builder's ask — "the model should predict one exact
    value" — sealed beside it and displayed against the realised move; it is
    reported, not RPS-scored, so it can never be gamed into the headline."""

    large_down: float = Field(ge=0, le=1)
    small_down: float = Field(ge=0, le=1)
    flat: float = Field(ge=0, le=1)
    small_up: float = Field(ge=0, le=1)
    large_up: float = Field(ge=0, le=1)
    point_pct: float = Field(
        ge=-25,
        le=25,
        description="your single best estimate of the percent move over this horizon, "
        "sign included — e.g. -0.42 for a 0.42% fall",
    )

    def as_tuple(self) -> tuple[float, ...]:
        return (self.large_down, self.small_down, self.flat, self.small_up, self.large_up)


class Prediction(BaseModel):
    t1: HorizonBet
    t5: HorizonBet
    rationale: str = Field(max_length=600, description="one short paragraph; recorded locally")


class LessonModel(BaseModel):
    """One falsifiable, cited lesson. `poc_wiki.apply_curation` re-enforces the
    rules in code — the schema is the first gate, never the only one."""

    text: str = Field(max_length=220)
    cites: list[str] = Field(min_length=1, description="evidence dates, YYYY-MM-DD")


class CuratorUpdate(BaseModel):
    lessons: list[LessonModel] = Field(max_length=15)
    day_note: str | None = Field(default=None, max_length=220)


def api_key_present() -> bool:
    return bool(os.environ.get(ENV_KEY))


def model_id() -> str:
    return os.environ.get(ENV_MODEL) or DEFAULT_MODEL


def clean_distribution(values: tuple[float, ...]) -> tuple[float, ...]:
    """Floor negatives, renormalise, round-with-repair. A schema-valid row can
    still sum to 0.98 — and plain 4dp rounding can leave 0.9999, which the RPS
    scorer rightly refuses (found on the first live maturation)."""
    from poc_live_track import round_distribution

    floored = [max(0.0, v) for v in values]
    total = sum(floored)
    if total <= 0:
        raise ValueError(f"degenerate distribution {values}")
    return tuple(round_distribution([v / total for v in floored]))


def _fmt_probs(probs: list[float] | tuple[float, ...]) -> str:
    return "  ".join(f"{b}={p:.3f}" for b, p in zip(BUCKETS, probs, strict=True))


def events_through(events: dict | None, as_of: str) -> str | None:
    """The newest event day a bet placed on `as_of` may read: published, and
    not after the anchor. Recorded in the seal so the information set behind
    every bet is visible afterwards (defect D1)."""
    days = [day["date"] for day in (events or {}).get("days", []) if day["date"] <= as_of]
    return max(days) if days else None


def assemble_brief(
    instrument: str,
    *,
    as_of: str,
    horizons: dict,
    track_records: list[dict],
    ladder: dict | None,
    events: dict | None,
    memory: str | None = None,
    market: dict | None = None,
) -> str:
    """The one prompt, assembled by code from the same data the dashboard reads.

    Deterministic: identical inputs give the identical string, which is what
    makes the recorded SHA-256 meaningful. Contains event *metadata* only —
    no URLs, no article text (REQ-1107) — and every number is derived work:
    percent moves, probabilities, scores, never raw price levels. The brief
    itself stays local under data/reasoning/; the seal publishes its hash.

    `market` (P8e) is `gold_poc_data.market_context`'s output: the target's own
    recent moves, every related market's 1-/5-session move, and realised moves
    for grading past bets — the covariate and history context the builder found
    missing from v1.

    Nothing in the assembled brief may postdate `as_of`: the market context is
    cut by its caller and the event shortlist is cut here (defect D1). The
    numeric rungs never see the future, and neither may this one.
    """
    lines: list[str] = []
    lines.append(
        "You are the reasoning rung of FinEvents, forecasting "
        f"{IDENTITY.get(instrument, instrument)} as of {as_of}."
    )
    lines.append(
        "For t+1 and t+5 trading sessions, output a five-bucket probability distribution "
        "AND point_pct — your single best estimate of the percent move, sign included. "
        "Buckets are sigma-relative to this instrument's own recent volatility; the "
        "distribution is scored by ranked probability score, so calibrated beats "
        "confident-and-wrong. The point estimate is published beside the realised move."
    )

    # Keyed by the ANCHOR day and the horizon, so a t+5 bet is graded against
    # the five-session move (defect D2: it was graded against whatever the
    # single landing day happened to do).
    horizon_moves: dict[str, dict[str, float]] = (market or {}).get("horizon_moves") or {}
    recent = (market or {}).get("recent") or []
    if recent:
        compounded = 1.0
        for _, pct in recent:
            compounded *= 1.0 + pct / 100.0
        lines.append(f"\n== Recent price action ({instrument} itself, daily % moves) ==")
        for day, pct in recent:
            lines.append(f"  {day}: {pct:+.2f}%")
        lines.append(
            f"  compounded over these {len(recent)} sessions: {(compounded - 1) * 100:+.2f}%"
        )

    related = (market or {}).get("related") or []
    if related:
        lines.append(
            "\n== Related markets (each at its own latest published date at or "
            "before this as-of; US series publish a day or more behind) =="
        )
        for row in related:
            unit = "pp" if row["kind"] == "pp" else "%"
            lines.append(
                f"  {row['name']:<13} {row['date']}:  "
                f"1-day {row['d1']:+.2f}{unit}, 5-day {row['d5']:+.2f}{unit}"
            )

    lines.append("\n== Today's bucket geometry ==")
    for h in ("1", "5"):
        sealed = horizons[h]
        edges = " / ".join(f"{p:+.2f}%" for p in sealed["edges_pct"])
        lines.append(f"t+{h}: sigma {sealed['sigma_pct']}%, edges {edges}")

    lines.append("\n== Today's bets from the other methods ==")
    for h in ("1", "5"):
        lines.append(f"t+{h}:")
        for rung, probs in sorted(horizons[h]["rungs"].items()):
            lines.append(f"  {rung:<18} {_fmt_probs(probs)}")

    lines.append("\n== The live track record so far ==")
    scored = [r for r in track_records if r.get("matured")]
    if not scored:
        lines.append(
            f"{len(track_records)} day(s) sealed, none matured yet — no live scores exist."
        )
    else:
        sums: dict[str, list[float]] = {}
        for record in scored:
            for matured in record["matured"].values():
                for rung, rps in matured["rps"].items():
                    sums.setdefault(rung, []).append(rps)
        lines.append(f"{len(track_records)} day(s) sealed; mean live RPS over matured horizons:")
        for rung, values in sorted(sums.items()):
            lines.append(f"  {rung:<18} {sum(values) / len(values):.4f}  ({len(values)} scored)")
        for record in scored[-5:]:
            for h, matured in sorted(record["matured"].items()):
                actual = horizon_moves.get(h, {}).get(record["as_of"])
                act = f" ({actual:+.2f}% over {h} session(s))" if actual is not None else ""
                ranked = sorted(matured["rps"].items(), key=lambda pair: pair[1])
                line = (
                    f"  {record['as_of']} t+{h}: realised '{BUCKETS[matured['outcome']]}'{act}; "
                    f"best {ranked[0][0]} {ranked[0][1]:.3f}"
                )
                rps = matured["rps"]
                yours = {r: rps[r] for r in ("llm_raw", "llm_mem") if r in rps}
                if yours:
                    line += "; yours " + ", ".join(f"{r} {v:.3f}" for r, v in sorted(yours.items()))
                lines.append(line)
        past_points: list[str] = []
        for record in scored[-5:]:
            llm = record.get("llm") or {}
            # The horizon is what the move is measured over; the matured block
            # itself is no longer needed here (D2 keys by anchor + horizon).
            for h in sorted(record["matured"]):
                actual = horizon_moves.get(h, {}).get(record["as_of"])
                if actual is None:
                    continue
                for variant in ("raw", "mem"):
                    point = ((llm.get(variant) or {}).get("point_pct") or {}).get(h)
                    if point is not None:
                        past_points.append(
                            f"  {record['as_of']} t+{h} llm_{variant}: "
                            f"you called {point:+.2f}%, it moved {actual:+.2f}%"
                        )
        if past_points:
            lines.append("Your own past point calls, graded:")
            lines.extend(past_points)

    if ladder:
        lines.append("\n== The offline ladder (2026 report window, before you existed) ==")
        for h in ("1", "5"):
            rows = ladder.get("ladder", {}).get(h, [])
            cells = ", ".join(
                f"{row['rung']} {row['mean']:.4f}"
                + ("" if row.get("baseline") else f" ({row.get('verdict', '')})")
                for row in rows
            )
            lines.append(f"t+{h}: {cells}")
        lines.append("Nothing has beaten the base rates detectably. That is the bar.")

    # Days after the anchor are not knowable when the bet is placed — the cut
    # is defect D1's other half, and it binds for any instrument whose own
    # series lags the wall clock.
    knowable = [day for day in (events or {}).get("days", []) if day["date"] <= as_of]
    if knowable:
        lines.append("\n== This week's world events (deterministic shortlist, metadata only) ==")
        newest_day = knowable[0]["date"]
        if newest_day < as_of:
            lines.append(
                f"Note: the newest event day available is {newest_day} — GDELT publishes a "
                f"day's file with a lag, so events after it (through {as_of} and today) are "
                "NOT YET AVAILABLE, not absent. Do not read the gap as a quiet period."
            )
        for day in knowable[:3]:
            lines.append(f"{day['date']}:")
            for event in day["events"]:
                place = f" — {event['place']}" if event.get("place") else ""
                lines.append(
                    f"  {event['label']}: {event['actors']}{place} "
                    f"[{event['mentions']} mentions, goldstein {event['goldstein']}]"
                )

    if memory is not None:
        lines.append("\n== Your memory page (P8d — statistics by code, lessons by you) ==")
        lines.append(memory)

    lines.append(
        "\n== Task ==\n"
        "Make your own forecast. The numeric methods above are evidence, not a menu — "
        "they read only price series, so anything you can infer from the events, the "
        "related markets or your memory is signal they cannot have; disagreement between "
        "them is itself information. When the evidence is thin, calibrated means staying "
        "near the base rates — say so in the rationale, and say what would have changed "
        "your mind. When you do see something, let the probabilities move and name the "
        "evidence. Give point_pct for each horizon: one number, the percent move you "
        "consider most likely. Fill the output schema exactly."
    )
    return "\n".join(lines)


def record_run(
    instrument: str, as_of: str, brief: str, response: dict, model: str, variant: str = "raw"
) -> dict:
    """Persist the full transcript locally; return the hashes the seal carries."""
    RECORDS.mkdir(parents=True, exist_ok=True)
    response_text = json.dumps(response, sort_keys=True)
    brief_sha = hashlib.sha256(brief.encode("utf-8")).hexdigest()
    response_sha = hashlib.sha256(response_text.encode("utf-8")).hexdigest()
    # Never overwrite (defect D4): a re-run after a crash must not destroy the
    # only record of the bet a previous attempt already made and paid for.
    stem = f"{instrument}_{as_of}_{variant}"
    path, attempt = RECORDS / f"{stem}.json", 1
    while path.exists():
        attempt += 1
        path = RECORDS / f"{stem}_attempt{attempt}.json"
    path.write_text(
        json.dumps(
            {
                "instrument": instrument,
                "as_of": as_of,
                "variant": variant,
                "attempt": attempt,
                "model": model,
                "recorded_utc": datetime.now(UTC).isoformat(timespec="seconds"),
                "brief": brief,
                "response": response,
                "brief_sha256": brief_sha,
                "response_sha256": response_sha,
            },
            indent=1,
        ),
        encoding="utf-8",
    )
    meta = {
        "model": model,
        "brief_sha256": brief_sha,
        "response_sha256": response_sha,
        "transcript": path.name,
    }
    if attempt > 1:
        meta["attempt"] = attempt
    return meta


def _structured_call(schema: type[BaseModel], system_prompt: str, prompt: str, model: str):
    """One bounded structured-output turn. The only path that needs the key."""
    from strands import Agent
    from strands.models.openai import OpenAIModel

    # OpenAIModel's final parameter is a **kwargs catcher (named model_config),
    # so model settings pass as direct keywords — found on first live contact.
    provider = OpenAIModel(
        client_args={"api_key": os.environ[ENV_KEY]},
        model_id=model,
    )
    agent = Agent(model=provider, system_prompt=system_prompt)
    return agent.structured_output(schema, prompt)


PREDICTOR_SYSTEM = (
    "You are a careful, calibrated financial forecaster who forms an independent view "
    "from all the evidence given — you are never limited to the other methods' numbers. "
    "You never invent conviction the evidence does not support."
)

CURATOR_SYSTEM = (
    "You are the memory curator, a separate role from the forecaster. You maintain a "
    "small page of falsifiable, evidence-cited lessons. You revise or retire lessons "
    "the evidence has turned against; you add nothing on quiet days; you never keep "
    "a lesson you cannot cite. A lesson's condition must be RARE enough to matter: if "
    "the digest's base rates show the condition holds on most days, the lesson is a "
    "coincidence, not knowledge — do not write it, and retire it if it already exists. "
    "Two agreeing days are a note, not a rule."
)


def predict(brief: str, model: str) -> Prediction:
    return _structured_call(Prediction, PREDICTOR_SYSTEM, brief, model)


def curate(
    instrument: str, as_of: str, page_text: str, evidence_text: str, model: str
) -> CuratorUpdate:
    """The curator's bounded turn (poc-mini-wiki.md): revise lessons, cite or die.

    `poc_wiki.apply_curation` re-checks every rule in code afterwards — the
    model proposes, the code disposes.
    """
    prompt = (
        f"You maintain the memory page for {instrument}. Today is {as_of}.\n\n"
        f"== The page as it stands ==\n{page_text}\n\n"
        f"== New evidence since the last curation ==\n{evidence_text}\n\n"
        "Rewrite the complete lesson list (at most 15). Every lesson must be "
        "falsifiable — 'when X, expect Y within Z sessions' — where X is a condition "
        "that is NOT met on most days (check the base rates in the evidence) and Y is "
        "something the base rates alone would not predict; cite the evidence dates that "
        "support it. Drop or revise anything the new evidence contradicts, and retire "
        "any existing lesson whose condition the base rates show to be near-universal. "
        "A quiet day deserves no new lessons; with fewer than five matured days, the "
        "honest list is usually empty. Optionally add one short day_note only if "
        "something notable happened."
    )
    update = _structured_call(CuratorUpdate, CURATOR_SYSTEM, prompt, model)
    record_run(instrument, as_of, prompt, update.model_dump(), model, variant="curator")
    return update


def reasoning_rung(
    instrument: str,
    *,
    as_of: str,
    horizons: dict,
    track_records: list[dict],
    ladder: dict | None,
    events: dict | None,
    memory_page: str | None = None,
    market: dict | None = None,
) -> tuple[dict[str, dict[str, tuple[float, ...]]] | None, dict | None]:
    """The runner's entry point: (per-horizon llm distributions, seal metadata).

    Two bets when a memory page exists: `llm_raw` (page withheld) and `llm_mem`
    (page included) — their paired difference is the running value of memory
    (poc-mini-wiki.md). Each call is isolated: one variant failing, or the key
    being absent, never blocks the other variant or the numeric seals. Failures
    are printed and carried in the seal metadata as errors, not hidden.
    """
    if not api_key_present():
        print(
            f"  {instrument:<9} llm rungs skipped — {ENV_KEY} not set "
            "(briefs still assemble; see --show-brief)"
        )
        return None, None

    model = model_id()
    variants: list[tuple[str, str | None]] = [("raw", None)]
    if memory_page is not None:
        variants.append(("mem", memory_page))

    additions: dict[str, dict[str, tuple[float, ...]]] = {"1": {}, "5": {}}
    meta: dict = {"model": model}
    # The information set behind the day's bets, in the seal (defect D1): a
    # reader can now see how far the brief's knowledge reached, and a page can
    # flag any row whose context ran past its own anchor.
    context_through = (market or {}).get("context_through")
    if context_through:
        meta["context_through"] = context_through
    seen_events = events_through(events, as_of)
    if seen_events:
        meta["events_through"] = seen_events
    for variant, page in variants:
        rung = f"llm_{variant}"
        brief = assemble_brief(
            instrument,
            as_of=as_of,
            horizons=horizons,
            track_records=track_records,
            ladder=ladder,
            events=events,
            memory=page,
            market=market,
        )
        try:
            prediction = predict(brief, model)
            additions["1"][rung] = clean_distribution(prediction.t1.as_tuple())
            additions["5"][rung] = clean_distribution(prediction.t5.as_tuple())
            meta[variant] = record_run(
                instrument, as_of, brief, prediction.model_dump(), model, variant=variant
            )
            # The rationale and the point bets are the model's own words and
            # numbers about its own bet — derived work we choose to publish
            # with the seal (the builder wants "what the LLM told" visible,
            # bet vs actual). Full transcript stays local.
            meta[variant]["rationale"] = prediction.rationale[:500]
            meta[variant]["point_pct"] = {
                "1": round(prediction.t1.point_pct, 2),
                "5": round(prediction.t5.point_pct, 2),
            }
            print(f"  {instrument:<9} {rung} sealed-ready (transcript recorded)")
        except Exception as error:  # noqa: BLE001 — first contact with a live API
            meta[variant] = {"error": f"{type(error).__name__}: {error}"[:300]}
            print(f"  {instrument:<9} {rung} FAILED — {type(error).__name__}: {error}")

    if not additions["1"] and not additions["5"]:
        return None, meta
    return additions, meta


def _read_payload(path: Path, prefix: str) -> dict | None:
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    if not text.startswith(prefix):
        return None
    return json.loads(text.removeprefix(prefix).removesuffix(";\n"))


def read_results(instrument: str) -> dict | None:
    """The instrument's offline ladder payload, when one exists.

    Gold ships as a bare `window.POC_DATA` global; the other instruments ship
    in `evaluate_gold_poc.registry_text`'s merge format — both parse here so
    every instrument's brief and memory page can carry its seeded ladder.
    """
    path = RESULTS.get(instrument)
    if not path or not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    if text.startswith("window.POC_DATA = "):
        return json.loads(text.removeprefix("window.POC_DATA = ").removesuffix(";\n"))
    anchor = text.find("|| {}, ")
    if anchor == -1:
        return None
    payload = json.loads(text[anchor + len("|| {}, ") :].rstrip().removesuffix(");"))
    return payload.get("results", payload)


def read_events() -> dict | None:
    return _read_payload(EVENTS, "window.POC_EVENTS = ")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--show-brief", metavar="INSTRUMENT", default=None)
    args = parser.parse_args(argv)

    if not args.show_brief:
        parser.print_help()
        return 0

    instrument = args.show_brief
    live = _read_payload(LIVE, "window.POC_LIVE = ") or {"instruments": {}}
    records = live["instruments"].get(instrument, {}).get("records", [])
    if not records:
        print(f"no sealed record for {instrument} — run scripts/run_poc_daily.py first")
        return 1
    newest = records[-1]
    try:
        # The same market context the live run reads (CSV loads only, no models);
        # briefs still assemble without it when the data files are absent.
        from gold_poc_data import market_context

        market = market_context(instrument, as_of=newest["as_of"])
    except Exception as error:  # noqa: BLE001 — inspection tool, degrade visibly
        print(f"(market context unavailable — {type(error).__name__}: {error})\n")
        market = None
    brief = assemble_brief(
        instrument,
        as_of=newest["as_of"],
        horizons=newest["horizons"],
        track_records=records,
        ladder=read_results(instrument),
        events=read_events(),
        market=market,
    )
    print(brief)
    print(
        f"\n--- {len(brief)} characters; key {'SET' if api_key_present() else 'not set'}; "
        f"model would be {model_id()} ---"
    )
    return 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    raise SystemExit(main())
