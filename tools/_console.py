"""Make check output readable on the development host.

The primary development platform is Windows, where the console defaults to a
legacy code page. Every message these checks print contains em-dashes and `§`
references into Design, and on cp1252 they arrive as mojibake — which makes a
blocking message look like a broken tool rather than a finding.

CI runs UTF-8 already, so this only ever matters locally, which is exactly where
the messages need to be legible enough that nobody reaches for `--no-verify`.
"""

from __future__ import annotations

import sys


def use_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            reconfigure(encoding="utf-8", errors="replace")
