#!/usr/bin/env python3
"""Documentation-currency check, on the pull request (T0.6, REQ-1103, REQ-1116).

ADR-0014 rejected the post-commit hook the brief asked for: it fires after the
commit exists, so it can only warn. This runs on the pull request, where it can
still block.

The path -> doc mapping lives in `tools/docs_currency.toml`, never here — adding
a module must not mean editing this file.

Also implements T0.6b (REQ-1115): the pull request must reference a REQ-id or an
ADR, which is ADR-0001's traceability chain enforced at the point of change.

Usage:
    python tools/check_docs_currency.py --base origin/main [--body-file pr.md]

Exit: 0 clean, 1 blocked.
"""

from __future__ import annotations

import argparse
import fnmatch
import os
import re
import subprocess
import sys
import tomllib
from pathlib import Path

CONFIG = Path("tools/docs_currency.toml")

# REQ-1116. The em-dash form is what the requirement states; the hyphen and the
# ASCII double-hyphen are accepted because rejecting a PR over a dash character
# teaches contributors to bypass the whole hook rather than to write a reason.
EXEMPTION = re.compile(r"docs:\s*n/a\s*[—–\-]{1,2}\s*(?P<reason>\S.*)", re.IGNORECASE)

# T0.6b / REQ-1115.
TRACEABILITY = re.compile(r"\b(REQ-\d+[a-z]?|ADR-\d{4})\b")


def changed_files(base: str) -> list[str]:
    """Files this branch changes relative to the merge base."""
    try:
        merge_base = subprocess.run(
            ["git", "merge-base", base, "HEAD"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    except subprocess.CalledProcessError:
        merge_base = base

    result = subprocess.run(
        ["git", "diff", "--name-only", f"{merge_base}...HEAD"],
        capture_output=True,
        text=True,
        check=True,
    )
    return [line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()]


def matches_any(path: str, patterns: list[str]) -> bool:
    for pattern in patterns:
        if fnmatch.fnmatch(path, pattern):
            return True
        # fnmatch treats `**` as `*`, so `src/**/*.py` misses nested paths.
        # Expand the common prefix form explicitly.
        if "**/" in pattern:
            head, _, tail = pattern.partition("**/")
            if path.startswith(head) and fnmatch.fnmatch(path[len(head) :], tail):
                return True
    return False


def pr_body(body_file: str | None) -> str:
    if body_file and Path(body_file).is_file():
        return Path(body_file).read_text(encoding="utf-8")
    return os.environ.get("PR_BODY", "")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="origin/main")
    parser.add_argument(
        "--body-file", default=None, help="file holding the PR body; falls back to $PR_BODY"
    )
    args = parser.parse_args(argv)

    config = tomllib.loads(CONFIG.read_text(encoding="utf-8"))
    files = changed_files(args.base)
    if not files:
        print("no changed files; nothing to check")
        return 0

    body = pr_body(args.body_file)
    failures: list[str] = []

    # --- T0.6b, REQ-1115 ---
    if not TRACEABILITY.search(body):
        failures.append(
            "The pull request body references no REQ-id and no ADR (REQ-1115).\n"
            "      ADR-0001's chain is Requirement -> Design -> ADR -> Task -> test; a change\n"
            "      that cites none of it cannot be traced back to why it exists."
        )

    # --- T0.6, REQ-1103 ---
    exemption = EXEMPTION.search(body)
    triggered: list[dict] = []
    for rule in config.get("rule", []):
        if not any(matches_any(f, rule["sources"]) for f in files):
            continue
        if any(matches_any(f, rule["docs"]) for f in files):
            continue
        triggered.append(rule)

    if triggered and exemption:
        # REQ-1116: recorded, not silent. The exemption rate is meant to be
        # reviewable, so it is printed even when it passes.
        print(f"docs exemption claimed (REQ-1116): {exemption.group('reason').strip()}")
        for rule in triggered:
            print(f"  exempted rule: {rule['name']}")
    elif triggered:
        for rule in triggered:
            hit = [f for f in files if matches_any(f, rule["sources"])]
            failures.append(
                f"Rule {rule['name']!r}: changed {', '.join(hit[:4])}"
                f"{' ...' if len(hit) > 4 else ''}\n"
                f"      but no matching documentation changed.\n"
                f"      Expected one of: {', '.join(rule['docs'])}\n"
                f"      Why: {rule['why']}"
            )

    if failures:
        print(f"BLOCKED — {len(failures)} check(s) failed on this pull request:\n", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}\n", file=sys.stderr)
        print(
            "  If a change is genuinely doc-free, put `docs: n/a — <reason>` in the PR\n"
            "  body (REQ-1116). That exemption is recorded and its rate is reviewed.",
            file=sys.stderr,
        )
        return 1

    print(f"docs currency + traceability: clean over {len(files)} changed file(s)")
    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main())
