"""The reasoning rung's key-independent parts (P8c, scripts/poc_reasoning.py).

Everything here runs without an API key on purpose: the brief must be
deterministic (its SHA-256 is what the seal carries), must never leak article
text or URLs into the prompt, and the schema plus cleaner must make a malformed
model answer impossible to seal. The one thing not testable offline — the live
call — is exactly one function, and it is recorded in full when it runs.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

import poc_reasoning  # noqa: E402
from poc_live_track import seal  # noqa: E402
from poc_reasoning import (  # noqa: E402
    HorizonBet,
    Prediction,
    assemble_brief,
    clean_distribution,
    record_run,
)


def horizons_fixture() -> dict:
    return {
        "1": {
            "sigma_pct": 1.796,
            "edges": [-0.0267, -0.0089, 0.0089, 0.0267],
            "edges_pct": [-2.64, -0.89, 0.89, 2.71],
            "rungs": {
                "climatology": [0.11, 0.22, 0.35, 0.21, 0.11],
                "chronos_uni": [0.12, 0.22, 0.32, 0.22, 0.12],
            },
        },
        "5": {
            "sigma_pct": 3.923,
            "edges": [-0.058, -0.019, 0.019, 0.058],
            "edges_pct": [-5.61, -1.91, 1.94, 5.94],
            "rungs": {
                "climatology": [0.12, 0.2, 0.33, 0.22, 0.13],
                "chronos_uni": [0.08, 0.26, 0.37, 0.21, 0.07],
            },
        },
    }


def events_fixture() -> dict:
    return {
        "days": [
            {
                "date": "2026-08-12",
                "events": [
                    {
                        "label": "Fighting",
                        "actors": "A / B",
                        "place": "Somewhere",
                        "country": "XX",
                        "goldstein": -10.0,
                        "mentions": 1234,
                        "tone": -8.0,
                        "url": "https://example.com/article",
                    }
                ],
            }
        ]
    }


# --- the distribution cleaner -------------------------------------------------


def test_clean_distribution_renormalises_and_floors() -> None:
    cleaned = clean_distribution((0.5, 0.5, 0.5, 0.5, 0.0))
    assert sum(cleaned) == pytest.approx(1.0, abs=1e-6)
    assert clean_distribution((-0.2, 0.5, 0.5, 0.0, 0.0))[0] == 0.0
    with pytest.raises(ValueError, match="degenerate"):
        clean_distribution((0.0, 0.0, 0.0, 0.0, 0.0))


# --- the brief ------------------------------------------------------------------


def test_the_brief_is_deterministic_and_carries_every_block() -> None:
    build = lambda: assemble_brief(  # noqa: E731
        "gold",
        as_of="2026-08-13",
        horizons=horizons_fixture(),
        track_records=[{"as_of": "2026-08-13", "matured": {}}],
        ladder={
            "ladder": {
                "1": [{"rung": "climatology", "mean": 0.1368, "baseline": True}],
                "5": [{"rung": "climatology", "mean": 0.1443, "baseline": True}],
            }
        },
        events=events_fixture(),
    )
    first, second = build(), build()
    assert first == second  # the recorded SHA-256 is only meaningful if this holds
    for required in ("sigma 1.796", "chronos_uni", "base rates", "Fighting", "1234 mentions"):
        assert required in first


def test_the_brief_never_carries_urls_or_article_text() -> None:
    brief = assemble_brief(
        "gold",
        as_of="2026-08-13",
        horizons=horizons_fixture(),
        track_records=[],
        ladder=None,
        events=events_fixture(),
    )
    assert "http" not in brief  # metadata only — the prompt gets no links, no text
    assert len(brief) < 8000


def test_the_brief_survives_an_empty_history() -> None:
    brief = assemble_brief(
        "gold",
        as_of="2026-08-13",
        horizons=horizons_fixture(),
        track_records=[{"as_of": "2026-08-13", "matured": {}}],
        ladder=None,
        events=None,
    )
    assert "none matured yet" in brief


# --- the schema -----------------------------------------------------------------


def test_the_schema_refuses_out_of_range_probabilities() -> None:
    with pytest.raises(ValidationError):
        HorizonBet(large_down=1.5, small_down=0, flat=0, small_up=0, large_up=0)
    with pytest.raises(ValidationError):
        Prediction(
            t1=HorizonBet(large_down=0.2, small_down=0.2, flat=0.2, small_up=0.2, large_up=0.2),
            t5=HorizonBet(large_down=0.2, small_down=0.2, flat=0.2, small_up=0.2, large_up=0.2),
            rationale="x" * 700,
        )


# --- the audit record -----------------------------------------------------------


def test_record_run_hashes_exactly_what_it_writes(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(poc_reasoning, "RECORDS", tmp_path)
    response = {"t1": {"flat": 1.0}, "rationale": "test"}
    meta = record_run("gold", "2026-08-13", "the brief", response, "gpt-5.6-sol")

    assert meta["brief_sha256"] == hashlib.sha256(b"the brief").hexdigest()
    expected = hashlib.sha256(json.dumps(response, sort_keys=True).encode()).hexdigest()
    assert meta["response_sha256"] == expected

    stored = json.loads((tmp_path / "gold_2026-08-13.json").read_text(encoding="utf-8"))
    assert stored["brief"] == "the brief"
    assert stored["model"] == "gpt-5.6-sol"


# --- the .env loader -------------------------------------------------------------


def test_env_file_loads_but_never_overrides_and_skips_placeholders(tmp_path, monkeypatch) -> None:
    from poc_env import load_env_file

    env_file = tmp_path / ".env"
    env_file.write_text(
        "# comment\n"
        "OPENAI_API_KEY=\n"  # placeholder — must set nothing
        "FINEVENTS_LLM_MODEL='gpt-5.6-terra'\n"
        "ALREADY_SET=from-file\n",
        encoding="utf-8",
    )
    monkeypatch.delenv("FINEVENTS_LLM_MODEL", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("ALREADY_SET", "from-environment")

    loaded = load_env_file(env_file)

    assert loaded == 1  # only the model line: placeholder empty, ALREADY_SET taken
    assert os.environ["FINEVENTS_LLM_MODEL"] == "gpt-5.6-terra"  # quotes stripped
    assert "OPENAI_API_KEY" not in os.environ
    assert os.environ["ALREADY_SET"] == "from-environment"  # the real env wins


# --- the seal integration --------------------------------------------------------


def test_seal_carries_llm_metadata_only_when_given() -> None:
    with_llm, _ = seal(
        [],
        as_of="2026-08-13",
        horizons={},
        rw_seed=1,
        llm={"model": "gpt-5.6-sol", "brief_sha256": "a", "response_sha256": "b"},
    )
    assert with_llm[0]["llm"]["model"] == "gpt-5.6-sol"

    without, _ = seal([], as_of="2026-08-13", horizons={}, rw_seed=1)
    assert "llm" not in without[0]
