#!/usr/bin/env python3
"""Block raw acquired content from entering a public repository (T0.5, REQ-1102).

This implements the scraped-payload signature defined in Design §9 — every rule
and both carve-outs, nothing invented here. `.gitignore` is the first line of
defence; this is the enforced one.

The failure this prevents is silent and permanent: for a public repo, assume any
pushed content is public forever regardless of later removal. So the check errs
towards blocking, and the two carve-outs are deliberately narrow.

Usage:  python tools/check_payload_signature.py FILE [FILE ...]
        (pre-commit passes staged files; CI re-runs it over the diff, REQ-1104)
Exit:   0 clean, 1 blocked.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# --- Design §9, rule by rule -------------------------------------------------

BLOCKED_PATH_SEGMENTS = ("raw", "cassettes")
BLOCKED_SUFFIXES = (".parquet",)

FIRECRAWL_KEYS = {"sourceURL", "rawHtml", "screenshot", "markdown"}
ARTICLE_KEYS = {"article_text", "body_html", "content_html", "full_text"}
PROVENANCE_KEYS = {"scrape_id"}
PROVENANCE_PREFIXES = ("firecrawl_",)

BULK_HTML_MIN_BYTES = 50 * 1024
BULK_HTML_TAG_RATIO = 0.30

# --- the two carve-outs ------------------------------------------------------

SYNTHETIC_MARKER = re.compile(r"^#\s*synthetic:\s*\S+", re.MULTILINE)
FIXTURES_PREFIX = ("harness", "fixtures")
PUBLISHED_DIR = "published"

TAG_RE = re.compile(rb"<[^>]{1,4000}>")


def _parts(path: Path) -> tuple[str, ...]:
    return tuple(p.lower() for p in path.parts)


def _in_fixtures(path: Path) -> bool:
    """harness/fixtures/ at any depth — Design §9 carve-out one."""
    parts = _parts(path)
    for i in range(len(parts) - 1):
        if parts[i] == FIXTURES_PREFIX[0] and parts[i + 1] == FIXTURES_PREFIX[1]:
            return True
    return False


def _in_published(path: Path) -> bool:
    """published/ — Design §9 carve-out two, required by REQ-1106."""
    return PUBLISHED_DIR in _parts(path)


def _walk_keys(obj: object) -> set[str]:
    """Every key appearing anywhere in a decoded JSON document."""
    keys: set[str] = set()
    if isinstance(obj, dict):
        keys |= set(map(str, obj.keys()))
        for value in obj.values():
            keys |= _walk_keys(value)
    elif isinstance(obj, list):
        for item in obj:
            keys |= _walk_keys(item)
    return keys


def _json_keys(text: str) -> set[str] | None:
    """Keys from JSON or JSONL. None when the file is not JSON at all."""
    try:
        return _walk_keys(json.loads(text))
    except (json.JSONDecodeError, ValueError):
        pass
    keys: set[str] = set()
    decoded_any = False
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            keys |= _walk_keys(json.loads(line))
            decoded_any = True
        except (json.JSONDecodeError, ValueError):
            return None
    return keys if decoded_any else None


def check_file(path: Path) -> list[str]:
    """Reasons this file is blocked. Empty list means clean."""
    reasons: list[str] = []
    parts = _parts(path)

    # Rule: path. Applies even inside the carve-outs — a cassette is a cassette.
    for segment in BLOCKED_PATH_SEGMENTS:
        if segment in parts:
            reasons.append(f"path contains a {segment!r} segment (Design §9, path rule)")
    if path.suffix.lower() in BLOCKED_SUFFIXES:
        reasons.append(f"{path.suffix} is a blocked payload format (Design §9, path rule)")
    if reasons:
        return reasons

    if not path.is_file():
        return []

    data = path.read_bytes()

    # Rule: bulk HTML. Binary-safe, so it runs before any decode.
    if len(data) > BULK_HTML_MIN_BYTES:
        tag_bytes = sum(len(m) for m in TAG_RE.findall(data))
        ratio = tag_bytes / len(data)
        if ratio > BULK_HTML_TAG_RATIO:
            reasons.append(
                f"{len(data) // 1024} KB and {ratio:.0%} HTML tags — over the "
                f"{BULK_HTML_TAG_RATIO:.0%} bulk-HTML threshold (Design §9)"
            )

    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return reasons  # not text; the path and bulk rules are all that apply

    # Carve-out one: synthetic fixtures. Must *assert* it, not merely be located
    # in the right directory — the marker is what the hook requires.
    if _in_fixtures(path):
        if SYNTHETIC_MARKER.search(text):
            return reasons
        reasons.append(
            "under harness/fixtures/ but carries no `# synthetic: <reason>` header — "
            "Design §9 permits the carve-out only when it is asserted"
        )
        return reasons

    # Carve-out two: published derived artefacts (REQ-1106). These carry source
    # URLs and fetch timestamps (REQ-1108) but never source text, so the
    # provenance-key rules would false-positive on exactly what they must hold.
    if _in_published(path):
        return reasons

    keys = _json_keys(text)
    if keys is not None:
        if FIRECRAWL_KEYS & keys and "metadata" in keys:
            hit = sorted(FIRECRAWL_KEYS & keys)
            reasons.append(f"Firecrawl envelope: {hit} alongside `metadata` (Design §9)")
        if ARTICLE_KEYS & keys:
            reasons.append(f"article shape: {sorted(ARTICLE_KEYS & keys)} (Design §9)")
        provenance = {k for k in keys if k in PROVENANCE_KEYS or k.startswith(PROVENANCE_PREFIXES)}
        if provenance:
            reasons.append(f"provenance keys: {sorted(provenance)} (Design §9)")

    return reasons


def main(argv: list[str]) -> int:
    blocked: dict[Path, list[str]] = {}
    for raw in argv:
        path = Path(raw)
        reasons = check_file(path)
        if reasons:
            blocked[path] = reasons

    if blocked:
        print("BLOCKED — staged content matches the scraped-payload signature.", file=sys.stderr)
        print(
            "This repository is public (ADR-0044); pushed content is permanently public.\n",
            file=sys.stderr,
        )
        for path, reasons in blocked.items():
            print(f"  {path}", file=sys.stderr)
            for reason in reasons:
                print(f"      - {reason}", file=sys.stderr)
        print(
            "\nSee Design §9. Do not bypass with --no-verify: CI re-runs this "
            "identical scan (REQ-1104).",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main(sys.argv[1:]))
