#!/usr/bin/env python3
"""Environment-file and credential pattern rule (T0.4, REQ-1101).

gitleaks carries the credential-entropy detection; this is the pattern rule
beside it, covering the two things gitleaks is weakest at — whole files that
should never be staged regardless of content, and AWS-shaped identifiers that
sit below an entropy threshold.

Usage:  python tools/check_secrets.py FILE [FILE ...]
Exit:   0 clean, 1 blocked.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Whole files that are never legitimate repository content.
BLOCKED_NAMES = {".env", "credentials.json", "credentials", ".netrc", ".pypirc"}
BLOCKED_SUFFIXES = {".pem", ".key", ".pfx", ".p12", ".keystore", ".jks"}
BLOCKED_GLOBS = (".env.*", "*_rsa", "*_dsa", "*_ed25519")

# Allowed because they carry names, never values.
ALLOWED_NAMES = {".env.example", ".env.template", ".env.sample"}

PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("AWS access key id", re.compile(r"\b(?:AKIA|ASIA|AIDA|AROA|AGPA|ANPA)[0-9A-Z]{16}\b")),
    (
        "AWS secret access key",
        re.compile(r"aws_secret_access_key\s*[=:]\s*['\"]?[A-Za-z0-9/+=]{40}"),
    ),
    ("AWS session token", re.compile(r"aws_session_token\s*[=:]\s*['\"]?[A-Za-z0-9/+=]{100,}")),
    ("private key block", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----")),
    ("Firecrawl API key", re.compile(r"\bfc-[0-9a-f]{32}\b")),
    (
        "generic assigned secret",
        re.compile(
            r"\b(?:api[_-]?key|secret[_-]?key|password|passwd|token)\s*[=:]\s*"
            r"['\"][^'\"\s${}<>]{12,}['\"]",
            re.IGNORECASE,
        ),
    ),
)

# This file states the patterns it looks for, so it would flag itself.
SELF = Path(__file__).name


def check_file(path: Path) -> list[str]:
    reasons: list[str] = []
    name = path.name

    if name in ALLOWED_NAMES:
        return reasons
    if name in BLOCKED_NAMES:
        reasons.append(f"{name} is an environment/credential file — never stage it")
    if path.suffix.lower() in BLOCKED_SUFFIXES:
        reasons.append(f"{path.suffix} is a key material format — never stage it")
    for pattern in BLOCKED_GLOBS:
        if path.match(pattern) and name not in ALLOWED_NAMES:
            reasons.append(f"{name} matches the blocked pattern {pattern!r}")
    if reasons or name == SELF:
        return reasons

    if not path.is_file():
        return reasons
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return reasons

    for label, pattern in PATTERNS:
        match = pattern.search(text)
        if match:
            line = text[: match.start()].count("\n") + 1
            reasons.append(f"line {line}: {label}")

    return reasons


def main(argv: list[str]) -> int:
    blocked = {p: r for p in map(Path, argv) if (r := check_file(p))}
    if blocked:
        print("BLOCKED — credentials or environment files staged (REQ-1101).", file=sys.stderr)
        for path, reasons in blocked.items():
            print(f"  {path}", file=sys.stderr)
            for reason in reasons:
                print(f"      - {reason}", file=sys.stderr)
        print(
            "\nIf this is a false positive, narrow the pattern in tools/check_secrets.py "
            "and say why in the commit. Do not use --no-verify: CI re-runs it (REQ-1104).",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main(sys.argv[1:]))
