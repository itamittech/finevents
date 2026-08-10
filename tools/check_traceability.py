#!/usr/bin/env python3
"""The traceability chain, asserted (T0.10, REQ-006, REQ-003).

ADR-0001 makes the chain a hard precondition rather than a preference:

    Requirement.md (REQ-xxx) -> Design.md / SystemDesign.md -> ADR -> Tasks.md -> test

Five assertions, all of which must hold:

  A0  One number, one requirement. A duplicate id makes every citation to it
      ambiguous, and the second row silently shadows the first downstream.
  A1  Every **Accepted** ADR is referenced by at least one requirement.
      Superseded ADRs are scoped out — they are history, not obligations.
  A2  Every requirement carries a verification code. Requirement.md says it
      itself: "a requirement with no verification code is not a requirement".
  A3  Every requirement is reachable from a task (REQ-006).
  A4  Every ADR carries a revisit trigger with an observable condition
      (REQ-003) — a `CI`-coded requirement that had no builder before this.

A3 is the one that has failed since the specification was written. The fix is
to cite the orphaned requirements on their owning tasks — the mapping is in
Tasks.md "Requirement coverage gaps" — **never to weaken the assertion**.

Usage:  python tools/check_traceability.py
Exit:   0 all assertions hold, 1 otherwise.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

DOCS = Path("docs")
REQUIREMENTS = DOCS / "Requirement.md"
TASKS = DOCS / "Tasks.md"
ADR_DIR = DOCS / "adr"

VERIFICATION_CODES = {"U", "P", "I", "CI", "C", "R"}

# Ids may carry a letter suffix — REQ-1113b is a distinct requirement inserted
# beside REQ-1113, not a typo. Matching only `\d+` silently drops it.
REQ_ROW = re.compile(r"^\|\s*(REQ-\d+[a-z]?)\s*\|(.*)$")
REQ_ID = re.compile(r"REQ-(\d+[a-z]?)")
ADR_ID = re.compile(r"ADR-(\d{4})")
ADR_FILE = re.compile(r"^(\d{4})-")
STATUS_LINE = re.compile(r"^-\s*\*\*Status:\*\*\s*(.+)$", re.MULTILINE)
REVISIT_HEADING = re.compile(r"^##\s*Revisit trigger\s*$", re.MULTILINE)


ESCAPED_PIPE = "\x00"


def _cells(row: str) -> list[str]:
    """Split a markdown row on unescaped pipes only.

    `\\|` is a literal pipe inside a cell — REQ-912's `agent \\| human \\| mixed`
    is one cell, not three. Splitting naively silently shifts every later column,
    which reads as a missing verification code rather than a parser bug.
    """
    row = row.replace(r"\|", ESCAPED_PIPE)
    return [c.strip().replace(ESCAPED_PIPE, "|") for c in row.strip().strip("|").split("|")]


# Tasks.md cites requirements in elided runs — `REQ-302, 307, 310, **408**` —
# where only the first carries the prefix. Reading just the prefixed one silently
# under-counts coverage and reports spec gaps that do not exist.
_CITATION = re.compile(
    r"REQ-(\d+[a-z]?)"  # the anchor
    r"((?:\s*[,/]\s*\*{0,2}\d{3,4}[a-z]?\*{0,2})*)"  # elided continuations
)
_RANGE = re.compile(r"REQ-(\d+)\s*[-–—]\s*(\d{3,4})\b")
_BARE = re.compile(r"\d{3,4}[a-z]?")

# The source column elides identically — `ADR-0053, 0010` is two ADRs.
_ADR_CITATION = re.compile(r"ADR-(\d{4})((?:\s*[,/]\s*\*{0,2}\d{4}\*{0,2})*)")
_BARE_ADR = re.compile(r"\d{4}")


def expand_adr_citations(text: str) -> set[str]:
    """Every ADR id cited in `text`, expanding elided runs."""
    found: set[str] = set()
    for anchor, tail in _ADR_CITATION.findall(text):
        found.add(anchor)
        found.update(_BARE_ADR.findall(tail))
    return {f"ADR-{n}" for n in found}


def expand_citations(text: str) -> set[str]:
    """Every REQ id cited in `text`, expanding elided runs and inclusive ranges."""
    found: set[str] = set()
    for anchor, tail in _CITATION.findall(text):
        found.add(anchor)
        found.update(_BARE.findall(tail))
    for lo, hi in _RANGE.findall(text):
        if int(hi) > int(lo):
            found.update(str(n) for n in range(int(lo), int(hi) + 1))
    return {f"REQ-{n}" for n in found}


def parse_requirements() -> tuple[dict[str, dict[str, str]], list[str]]:
    """REQ id -> {'adrs', 'code'}, plus any id defined more than once.

    A duplicate id is a traceability defect in its own right: two requirements
    under one number means a citation to that number is ambiguous, and the
    second silently shadows the first in every downstream check.
    """
    out: dict[str, dict[str, str]] = {}
    seen: list[str] = []
    for lineno, line in enumerate(REQUIREMENTS.read_text(encoding="utf-8").splitlines(), 1):
        match = REQ_ROW.match(line)
        if not match:
            continue
        req = match.group(1)
        cells = _cells(line)  # | id | statement | source | verification |
        if req in out:
            seen.append(f"{req}  (redefined at line {lineno})")
        out[req] = {
            "adrs": cells[2] if len(cells) > 2 else "",
            "code": cells[3] if len(cells) > 3 else "",
        }
    return out, seen


def parse_task_requirements() -> set[str]:
    """Every REQ id cited anywhere in Tasks.md."""
    return expand_citations(TASKS.read_text(encoding="utf-8"))


def parse_adrs() -> dict[str, dict[str, object]]:
    """ADR id -> {'accepted': bool, 'revisit': bool, 'path': Path}."""
    out: dict[str, dict[str, object]] = {}
    for path in sorted(ADR_DIR.glob("*.md")):
        match = ADR_FILE.match(path.name)
        if not match:
            continue  # README.md, TEMPLATE.md
        text = path.read_text(encoding="utf-8")
        status_match = STATUS_LINE.search(text)
        status = (status_match.group(1) if status_match else "").replace("*", "").strip().lower()
        out[f"ADR-{match.group(1)}"] = {
            "accepted": "accepted" in status and not status.startswith("superseded"),
            "revisit": bool(REVISIT_HEADING.search(text)),
            "path": path,
        }
    return out


def main() -> int:
    requirements, duplicates = parse_requirements()
    adrs = parse_adrs()
    task_reqs = parse_task_requirements()

    failures: list[tuple[str, list[str]]] = []

    # A0 — one number, one requirement.
    if duplicates:
        failures.append(("A0  requirement id defined more than once", duplicates))

    # A1 — every accepted ADR is served by a requirement.
    referenced = set().union(
        *(expand_adr_citations(meta["adrs"]) for meta in requirements.values())
    )
    orphan_adrs = sorted(
        adr for adr, meta in adrs.items() if meta["accepted"] and adr not in referenced
    )
    if orphan_adrs:
        failures.append(
            (
                "A1  accepted ADR referenced by no requirement",
                [f"{adr}  ({adrs[adr]['path'].name})" for adr in orphan_adrs],
            )
        )

    # A2 — every requirement carries a verification code.
    uncoded = sorted(
        req
        for req, meta in requirements.items()
        if not (set(re.findall(r"[A-Z]+", meta["code"])) & VERIFICATION_CODES)
    )
    if uncoded:
        failures.append(
            (
                "A2  requirement with no verification code",
                [f"{req}  (cell: {requirements[req]['code']!r})" for req in uncoded],
            )
        )

    # A3 — every requirement is reachable from a task.
    def _order(req: str) -> tuple[int, str]:
        digits = req.split("-")[1]
        return int(digits.rstrip("abcdefghijklmnopqrstuvwxyz")), digits

    unreachable = sorted(set(requirements) - task_reqs, key=_order)
    if unreachable:
        failures.append(
            (
                "A3  requirement reachable from no task",
                unreachable
                + [
                    "-> fix by citing each on its owning task; the mapping is in "
                    "Tasks.md 'Requirement coverage gaps'. Never weaken this assertion."
                ],
            )
        )

    # A4 — every ADR carries a revisit trigger (REQ-003).
    no_trigger = sorted(adr for adr, meta in adrs.items() if not meta["revisit"])
    if no_trigger:
        failures.append(
            (
                "A4  ADR with no revisit trigger",
                [f"{adr}  ({adrs[adr]['path'].name})" for adr in no_trigger],
            )
        )

    accepted_count = sum(1 for m in adrs.values() if m["accepted"])
    print(
        f"traceability: {len(requirements)} requirements, {len(adrs)} ADRs "
        f"({accepted_count} accepted), {len(task_reqs & set(requirements))} "
        f"requirements reachable from a task"
    )

    if failures:
        print(f"\n{len(failures)} assertion(s) failed:\n", file=sys.stderr)
        for title, items in failures:
            print(f"  {title}  [{len(items)}]", file=sys.stderr)
            for item in items:
                print(f"      {item}", file=sys.stderr)
            print(file=sys.stderr)
        return 1

    print("all five assertions hold")
    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main())
