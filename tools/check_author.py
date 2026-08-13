#!/usr/bin/env python3
"""Commit author identity (REQ-005).

The repository is intended to be open source and is already public. An author
identity that reaches history is not rewritable in practice once pushed, so this
blocks at commit time rather than reporting afterwards.

Three environments, three checks:

- a commit range given: every author in it (the pull-request gate);
- no range, identity configured: the configured identity — a workstation about
  to commit (the pre-commit hook's case);
- no range, **no identity configured**: a CI runner re-running the hooks over a
  checkout (ci.yml, REQ-1104). Nothing is about to be committed there, so the
  meaningful assertion is the author of the commit being validated — HEAD.
  This used to crash instead, which is how a green local gate turned into a
  red Gate G0 on every push.

Usage:  python tools/check_author.py [--range origin/main..HEAD]
Exit:   0 correct identity, 1 otherwise.
"""

from __future__ import annotations

import argparse
import subprocess
import sys

EXPECTED = "itamittech@gmail.com"

# The near-miss the brief calls out specifically. Worth naming, because the two
# addresses differ by three characters and the wrong one is the account default.
NEAR_MISS = "itamittech@live.com"


def _git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout.strip()


def _git_or_none(*args: str) -> str | None:
    """Like `_git`, but absence is an answer rather than an error."""
    result = subprocess.run(["git", *args], capture_output=True, text=True, check=False)
    value = result.stdout.strip()
    return value if result.returncode == 0 and value else None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--range",
        dest="rev_range",
        default=None,
        help="commit range to check, e.g. origin/main..HEAD. "
        "Without it, checks the configured identity for the commit about to be made.",
    )
    args = parser.parse_args(argv)

    if args.rev_range:
        authors = {a for a in _git("log", "--format=%ae", args.rev_range).splitlines() if a}
        wrong = sorted(authors - {EXPECTED})
        subject = f"commits in {args.rev_range}"
    else:
        configured = _git_or_none("config", "user.email")
        if configured is not None:
            wrong = [configured] if configured != EXPECTED else []
            subject = "git config user.email"
        else:
            head_author = _git_or_none("log", "-1", "--format=%ae")
            wrong = [head_author] if head_author is not None and head_author != EXPECTED else []
            subject = "HEAD author (no identity configured — CI checkout)"

    if wrong:
        print(f"REQ-005: {subject} is {', '.join(wrong)}; expected {EXPECTED}", file=sys.stderr)
        if NEAR_MISS in wrong:
            print(
                f"  {NEAR_MISS} is the wrong one — CLAUDE.md names this exact confusion.",
                file=sys.stderr,
            )
        print(f"  Fix with:  git config user.email {EXPECTED}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main())
