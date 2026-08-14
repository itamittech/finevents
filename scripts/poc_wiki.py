"""The mini-wiki: accreting memory for the reasoning layer (P8d, REQ-1303).

The design is `docs/design/poc-mini-wiki.md`, agreed 2026-08-13 — the Karpathy
WikiLLM idea in miniature. One page per instrument, three layers, one principle:
**numbers are computed by code; the model writes only prose; the two never mix.**

- **Evidence** is `ui/data/live.js` itself — sealed bets and matured outcomes,
  written by code. The wiki stores none of it; it reads it.
- **Statistics** are recomputed here after each maturation, provenance-tagged:
  `seeded` (the 143-day offline Lane-A record — a permitted use of history)
  versus `observed` (live matured days only). ADR-0038's split, in miniature.
- **Lessons** are model-written by the curator, and this module enforces the
  rules the model cannot be trusted to keep: at most 15, every one citing at
  least one evidence date that actually exists, uncited or over-long lessons
  dropped on sight. Lessons start empty and accrue live only (ADR-0037).

Pages are versioned append-only: every curation appends a new version, so the
memory's own churn is plottable later. `ui/data/wiki.js` is committed — it is
derived work plus our own model's prose, no article text (REQ-1106/1107).
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "ui" / "data" / "wiki.js"
PREFIX = "window.POC_WIKI = "

MAX_LESSONS = 15
MAX_LESSON_CHARS = 220

BUCKET_LABELS = ("large down", "small down", "flat", "small up", "large up")


def evidence_digest(records: list[dict], events: dict | None = None, limit: int = 5) -> str:
    """What the curator reads: the last few matured days, plain and cited-able."""
    entries = []
    for record in records:
        for h, matured in sorted(record.get("matured", {}).items()):
            entries.append((matured["target_date"], record["as_of"], h, matured))
    entries.sort()
    lines: list[str] = []
    for target, anchor, h, matured in entries[-limit:]:
        ranked = sorted(matured["rps"].items(), key=lambda pair: pair[1])
        best = ", ".join(f"{rung} {rps:.3f}" for rung, rps in ranked[:2])
        worst_rung, worst_rps = ranked[-1]
        lines.append(
            f"{anchor} → t+{h} (landed {target}): realised "
            f"'{BUCKET_LABELS[matured['outcome']]}'; best {best}; "
            f"worst {worst_rung} {worst_rps:.3f}"
        )
        if events:
            labels = [
                event["label"]
                for day in events.get("days", [])
                if day["date"] == target
                for event in day["events"][:4]
            ]
            if labels:
                lines.append(f"   events that day: {', '.join(labels)}")
    return "\n".join(lines) if lines else "No newly matured evidence."


def parse_wiki(text: str) -> dict:
    if not text.startswith(PREFIX):
        return {"instruments": {}}
    return json.loads(text.removeprefix(PREFIX).removesuffix(";\n"))


def serialize_wiki(payload: dict) -> str:
    return PREFIX + json.dumps(payload, indent=1) + ";\n"


def load_wiki() -> dict:
    return parse_wiki(WIKI.read_text(encoding="utf-8")) if WIKI.exists() else {"instruments": {}}


def save_wiki(payload: dict) -> None:
    WIKI.parent.mkdir(parents=True, exist_ok=True)
    WIKI.write_text(serialize_wiki(payload), encoding="utf-8")


def compute_statistics(records: list[dict], offline: dict | None) -> dict:
    """The numbers layer — code only, provenance split per ADR-0038.

    `observed`: mean RPS per rung over live matured horizons. `seeded`: the
    offline ladder's per-rung means, carried as-is with its day count. The two
    are never averaged together; the page shows both and says which is which.
    """
    observed: dict[str, dict] = {}
    sums: dict[str, list[float]] = {}
    for record in records:
        for matured in record.get("matured", {}).values():
            for rung, rps in matured["rps"].items():
                sums.setdefault(rung, []).append(rps)
    for rung, values in sorted(sums.items()):
        observed[rung] = {"mean_rps": round(sum(values) / len(values), 4), "n": len(values)}

    seeded: dict[str, dict] = {}
    if offline:
        for h in ("1", "5"):
            for row in offline.get("ladder", {}).get(h, []):
                entry = seeded.setdefault(
                    row["rung"], {"mean_rps_by_h": {}, "n": offline["window"]["days"]}
                )
                entry["mean_rps_by_h"][h] = row["mean"]

    return {"observed": observed, "seeded": seeded}


def valid_evidence_dates(records: list[dict]) -> set[str]:
    dates = {record["as_of"] for record in records}
    for record in records:
        for matured in record.get("matured", {}).values():
            dates.add(matured["target_date"])
    return dates


def apply_curation(
    current_lessons: list[dict],
    proposed: list[dict],
    known_dates: set[str],
) -> tuple[list[dict], list[str]]:
    """Enforce the lesson rules on whatever the curator proposed.

    Returns (kept lessons, rejection reasons). The curator's proposal REPLACES
    the lesson list — revision and retirement are its job — but only lessons
    that survive these checks make it in; everything else is named and dropped.
    """
    kept: list[dict] = []
    rejected: list[str] = []
    for lesson in proposed:
        text = str(lesson.get("text", "")).strip()
        cites = [c for c in lesson.get("cites", []) if isinstance(c, str)]
        if not text:
            rejected.append("empty lesson dropped")
            continue
        if len(text) > MAX_LESSON_CHARS:
            rejected.append(f"over-long lesson dropped ({len(text)} chars): {text[:40]}…")
            continue
        unknown = [c for c in cites if c not in known_dates]
        if not cites or unknown:
            rejected.append(f"uncited or mis-cited lesson dropped: {text[:40]}…")
            continue
        if any(k["text"] == text for k in kept):
            rejected.append(f"duplicate lesson dropped: {text[:40]}…")
            continue
        kept.append({"text": text, "cites": sorted(cites)})
        if len(kept) == MAX_LESSONS:
            rejected.append("lesson cap reached — remainder dropped")
            break
    if not proposed and current_lessons:
        # An empty proposal wipes memory; that is a decision, not a default.
        rejected.append("curator proposed nothing — existing lessons kept")
        return current_lessons, rejected
    return kept, rejected


def render_page(instrument: str, version: dict) -> str:
    """The page as the model reads it — deterministic text from one version."""
    lines = [f"MEMORY PAGE — {instrument} (version {version['version']}, {version['as_of']})"]
    stats = version["statistics"]
    if stats["observed"]:
        lines.append("Live scores (observed — matured days only):")
        for rung, entry in sorted(stats["observed"].items()):
            lines.append(f"  {rung:<18} mean RPS {entry['mean_rps']:.4f} over {entry['n']}")
    else:
        lines.append("Live scores: none matured yet.")
    if stats["seeded"]:
        lines.append("Offline ladder (seeded — deterministic history, pre-dates you):")
        for rung, entry in sorted(stats["seeded"].items()):
            by_h = "  ".join(f"t+{h}={m:.4f}" for h, m in sorted(entry["mean_rps_by_h"].items()))
            lines.append(f"  {rung:<18} {by_h}  ({entry['n']} days)")
    lessons = version["lessons"]
    if lessons:
        lines.append("Your lessons (yours to revise or retire; every one cites evidence dates):")
        for i, lesson in enumerate(lessons, 1):
            lines.append(f"  {i}. {lesson['text']}  [cites: {', '.join(lesson['cites'])}]")
    else:
        lines.append("Your lessons: none yet — you have earned no opinions.")
    return "\n".join(lines)


def append_version(
    wiki: dict,
    instrument: str,
    *,
    as_of: str,
    statistics: dict,
    lessons: list[dict],
    curator_note: str | None,
) -> dict:
    """Append-only, like everything here: a version per curation, never edits."""
    page = wiki["instruments"].setdefault(instrument, {"versions": []})
    versions = page["versions"]
    if versions and versions[-1]["as_of"] == as_of:
        return versions[-1]  # one version per day; re-runs are no-ops
    version = {
        "version": len(versions) + 1,
        "as_of": as_of,
        "statistics": statistics,
        "lessons": lessons,
        "curator_note": curator_note,
    }
    versions.append(version)
    return version


def latest_page_text(wiki: dict, instrument: str) -> str | None:
    versions = wiki["instruments"].get(instrument, {}).get("versions", [])
    return render_page(instrument, versions[-1]) if versions else None
