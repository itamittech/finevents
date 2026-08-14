"""The environment-file rule, including the example-file carve-out (REQ-1101).

The carve-out is the part worth testing hard: `.env.example` is committed for
readers, and the hook's promise — "names, never values" — must be enforced,
not assumed. A template someone pastes a real key into has to fail the commit.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "tools"))

from check_secrets import check_file  # noqa: E402


def test_a_real_env_file_is_blocked_regardless_of_content(tmp_path: Path) -> None:
    env = tmp_path / ".env"
    env.write_text("# even a completely empty one\n", encoding="utf-8")
    assert any("never stage it" in reason for reason in check_file(env))


def test_an_example_with_names_only_passes(tmp_path: Path) -> None:
    example = tmp_path / ".env.example"
    example.write_text("# template\nOPENAI_API_KEY=\nFINEVENTS_LLM_MODEL=\n", encoding="utf-8")
    assert check_file(example) == []


def test_an_example_with_a_value_is_blocked(tmp_path: Path) -> None:
    example = tmp_path / ".env.example"
    # Assembled at runtime so no key-shaped literal exists in this file at
    # rest — the scanners guard THIS file too, which is exactly as it should be.
    fake = "sk-" + "placeholder" + "0" * 12
    example.write_text(f"OPENAI_API_KEY={fake}\n", encoding="utf-8")
    reasons = check_file(example)
    assert reasons and "never values" in reasons[0]
    assert "OPENAI_API_KEY" in reasons[0]


def test_quoted_and_spaced_values_do_not_slip_through(tmp_path: Path) -> None:
    example = tmp_path / ".env.template"
    example.write_text('TOKEN = "abc123"\n', encoding="utf-8")
    assert check_file(example)


def test_ordinary_files_still_get_the_pattern_scan(tmp_path: Path) -> None:
    source = tmp_path / "config.py"
    # Assembled at runtime for the same reason as above.
    fake_aws_id = "AKIA" + "ABCDEFGH" + "IJKLMNOP"
    source.write_text(f'aws_key = "{fake_aws_id}"\n', encoding="utf-8")
    assert any("AWS access key id" in reason for reason in check_file(source))
