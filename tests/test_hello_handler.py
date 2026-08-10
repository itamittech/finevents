"""The walking-skeleton handler (Execution.md increment 0).

The behavioural assertion that matters is the negative one: this function writes
to no store. Increment 1 owns the bitemporal schema, and `knowledge_time` cannot
be reconstructed after the fact.
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path

import pytest

HELLO = Path(__file__).resolve().parents[1] / "src" / "lambda" / "hello"
sys.path.insert(0, str(HELLO))

from app import handler  # noqa: E402


class FakeContext:
    aws_request_id = "test-request-id"


def test_returns_a_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FINEVENTS_ENV", "dev")
    result = handler({"ping": True}, FakeContext())

    assert result["ok"] is True
    assert result["environment"] == "dev"
    assert result["increment"] == 0
    assert result["request_id"] == "test-request-id"
    assert result["echo"] == {"ping": True}


def test_reports_the_runtime_it_actually_ran_on() -> None:
    """ADR-0054's one irreversible choice is the Python version, so a real
    invocation returning it is what proves the deployed runtime matches the
    locked one rather than just the template."""
    result = handler({}, FakeContext())
    assert result["python"].startswith("3.13.")


def test_environment_defaults_to_unset(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("FINEVENTS_ENV", raising=False)
    assert handler({}, FakeContext())["environment"] == "unset"


def test_handler_imports_no_aws_client() -> None:
    """The skeleton must not acquire a store between now and increment 1.

    Asserted against the source rather than by mocking, because the failure mode
    is someone adding a write later and the test passing anyway.
    """
    tree = ast.parse((HELLO / "app.py").read_text(encoding="utf-8"))
    imported = {
        alias.name.split(".")[0]
        for node in ast.walk(tree)
        if isinstance(node, ast.Import)
        for alias in node.names
    } | {
        node.module.split(".")[0]
        for node in ast.walk(tree)
        if isinstance(node, ast.ImportFrom) and node.module
    }

    assert "boto3" not in imported
    assert "botocore" not in imported
