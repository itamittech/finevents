#!/usr/bin/env python3
"""Dependency vulnerability gate (T0.6a, REQ-1114).

Audits what actually ships — the resolved lockfile — rather than whatever
happens to be installed in the current virtual environment.

That distinction matters twice. `pip-audit` run against the environment tries to
resolve `finevents` itself on PyPI, where it does not exist, and fails on the
project rather than on a vulnerability. And the environment can drift from the
lockfile, so auditing it answers a question nobody asked.

Usage:  python tools/check_dependencies.py
Exit:   0 no known CVEs, 1 otherwise.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path


def main() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        requirements = Path(tmp) / "locked.txt"

        export = subprocess.run(
            [
                "uv",
                "export",
                "--frozen",
                "--no-emit-project",  # the project is not on PyPI and is not a dependency
                "--no-hashes",
                "--format",
                "requirements-txt",
                "-o",
                str(requirements),
            ],
            capture_output=True,
            text=True,
        )
        if export.returncode != 0:
            print(f"could not export the lockfile:\n{export.stderr}", file=sys.stderr)
            return 1

        audit = subprocess.run(
            [
                "uv",
                "run",
                "pip-audit",
                "--requirement",
                str(requirements),
                "--strict",  # an unauditable dependency is a failure, not a shrug
                "--progress-spinner",
                "off",
            ],
            capture_output=True,
            text=True,
        )

    sys.stdout.write(audit.stdout)
    if audit.returncode != 0:
        sys.stderr.write(audit.stderr)
        print(
            "\nREQ-1114: a locked dependency has a known CVE. Bump it and re-lock "
            "with `uv lock --upgrade-package <name>`.",
            file=sys.stderr,
        )
        return 1

    print("dependencies: no known vulnerabilities in the locked set")
    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main())
