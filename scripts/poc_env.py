"""A ten-line .env loader, because the key lives in a file the repo can never see.

The builder keeps `OPENAI_API_KEY` in `E:\\FinEvents\\.env` — gitignored, and
additionally blocked by the pre-commit environment-file hook. Python does not
read `.env` on its own, so `poc_reasoning` calls this at import.

Rules, deliberately boring:
- `KEY=VALUE` lines only; blanks and `#` comments ignored; optional quotes stripped;
- a variable already set in the real environment **wins** — the file is a
  fallback, never an override;
- empty values are skipped, so a placeholder line sets nothing;
- values are never logged, printed, or returned.
"""

from __future__ import annotations

import os
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def load_env_file(path: Path = ENV_FILE) -> int:
    """Load KEY=VALUE pairs into os.environ; returns how many were set."""
    if not path.exists():
        return 0
    loaded = 0
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip("'\"")
        if not key or not value or key in os.environ:
            continue
        os.environ[key] = value
        loaded += 1
    return loaded
