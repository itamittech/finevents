"""The import-boundary and forward-only lints catch what they claim to.

The forward-only half is the one that matters most: ADR-0037 is the project's
largest decision and this lint is its *only* mechanical enforcement. Until these
tests pass, forward-only is aspirational rather than asserted (T0.9a).
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[2] / "tools"
sys.path.insert(0, str(TOOLS))

import check_boundaries  # noqa: E402
from check_boundaries import check_file  # noqa: E402


@pytest.fixture
def in_package(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Write a file as though it were `src/finevents/<module>/mod.py`."""
    root = tmp_path / "src" / "finevents"
    monkeypatch.setattr(check_boundaries, "PACKAGE_ROOT", root)

    def _write(module: str, source: str) -> Path:
        path = root / module / "mod.py"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(source, encoding="utf-8")
        return path

    return _write


def rules(violations) -> set[str]:
    return {v.rule for v in violations}


# --- ADR-0004: storage clients ----------------------------------------------


def test_storage_client_outside_allowed_modules_is_flagged(in_package) -> None:
    path = in_package("features", 'import boto3\ntable = boto3.resource("dynamodb")\n')
    found = check_file(path)
    assert "boundary" in rules(found)
    assert "REQ-104" in found[0].detail


@pytest.mark.parametrize("module", ["ingest", "repository"])
def test_storage_client_is_allowed_in_ingest_and_repository(in_package, module: str) -> None:
    path = in_package(module, 'import boto3\ntable = boto3.resource("dynamodb")\n')
    assert check_file(path) == []


# --- ADR-0004: model clients -------------------------------------------------


def test_model_client_outside_allowed_modules_is_flagged(in_package) -> None:
    path = in_package("score", 'import boto3\nc = boto3.client("bedrock-runtime")\n')
    found = check_file(path)
    assert "boundary" in rules(found)
    assert "REQ-1005" in found[0].detail


@pytest.mark.parametrize("module", ["events", "predict", "wiki"])
def test_model_client_is_allowed_in_its_three_modules(in_package, module: str) -> None:
    path = in_package(module, 'import boto3\nc = boto3.client("bedrock-runtime")\n')
    assert check_file(path) == []


def test_ssm_is_not_a_storage_client(in_package) -> None:
    """`config/` resolves SSM parameters (Design §1). Flagging every boto3 call
    rather than the storage and model services would make the lint unusable
    exactly where it is needed."""
    path = in_package("config", 'import boto3\nc = boto3.client("ssm")\n')
    assert check_file(path) == []


def test_non_literal_service_name_is_refused(in_package) -> None:
    """A computed service name defeats the lint, so it cannot be assumed innocent."""
    path = in_package("features", 'import boto3\nsvc = "dyna" + "modb"\nc = boto3.client(svc)\n')
    found = check_file(path)
    assert "boundary" in rules(found)
    assert "non-literal" in found[0].detail


# --- ADR-0037: forward-only --------------------------------------------------


def test_historical_as_of_is_flagged(in_package) -> None:
    path = in_package("predict", "repo = AsOfRepository(as_of=some_past_date)\n")
    found = check_file(path)
    assert "forward-only" in rules(found)
    assert "REQ-601" in found[0].detail


@pytest.mark.parametrize(
    "expression",
    [
        "AsOfRepository(as_of=None)",
        "AsOfRepository(as_of=now())",
        "AsOfRepository(as_of=datetime.now(UTC))",
        "AsOfRepository(as_of=date.today())",
    ],
)
def test_as_of_now_is_permitted(in_package, expression: str) -> None:
    """The forward-only rule accepts any provably-present instant.

    Asserted against the forward-only rule alone rather than a clean file: the
    last two expressions are fine *here* and separately flagged by the REQ-109
    wall-clock rule, which wants `now()` from the clock module. Two rules, two
    verdicts, and conflating them would let a fix for one silently disable the
    other.
    """
    found = check_file(in_package("predict", expression + "\n"))
    assert "forward-only" not in rules(found)


def test_harness_may_look_backwards(in_package) -> None:
    """`harness/` builds leakage fixtures, which requires historical as-of views."""
    assert check_file(in_package("harness", "repo = AsOfRepository(as_of=past)\n")) == []


@pytest.mark.parametrize(
    "name",
    ["run_backtest", "replay_day", "TimeTravelRunner", "rewind_to", "historical_run_all"],
)
def test_replay_entry_points_are_flagged_at_any_scope(in_package, name: str) -> None:
    keyword = "class" if name[0].isupper() else "def"
    path = in_package(
        "eval",
        f"{keyword} {name}:\n    pass\n"
        if keyword == "class"
        else f"{keyword} {name}():\n    pass\n",
    )
    found = check_file(path)
    assert "forward-only" in rules(found)


def test_cassette_replay_in_harness_is_permitted(in_package) -> None:
    """Design §1 puts cassette record/replay in `harness/`. That replays model
    responses, not pipeline dates — a different thing wearing the same word."""
    assert check_file(in_package("harness", "def replay_cassette():\n    pass\n")) == []


def test_ordinary_module_is_clean(in_package) -> None:
    source = "def sigma(closes):\n    return sum(closes) / len(closes)\n"
    assert check_file(in_package("features", source)) == []


# --- REQ-109: the wall clock is reachable from exactly one file --------------


@pytest.mark.parametrize(
    "source",
    [
        "t = datetime.now(UTC)",
        "t = datetime.utcnow()",
        "t = datetime.today()",
        "t = date.today()",
        "t = time.time()",
        "t = datetime.datetime.now()",
        "import datetime as dt\nt = dt.datetime.now()",
    ],
)
def test_wall_clock_calls_are_flagged(in_package, source: str) -> None:
    """A trailing window anchored on real time produces a plausible number, not
    an error — which is why this is a lint and not a code review item."""
    found = check_file(in_package("features", source + "\n"))
    assert "wall-clock" in rules(found)
    assert "REQ-109" in found[0].detail


@pytest.mark.parametrize(
    "source",
    [
        "t = clock.now()",
        "t = self._clock.now()",
        "t = now()",
        "t = repo.as_of",
    ],
)
def test_the_sanctioned_time_paths_are_left_alone(in_package, source: str) -> None:
    """The abstraction is the target of the rule, not its victim.

    Flagging `clock.now()` would make the rule unusable in exactly the code that
    exists to satisfy it, and a rule people cannot satisfy gets deleted.
    """
    assert check_file(in_package("features", source + "\n")) == []


def test_the_clock_module_itself_may_read_real_time(tmp_path, monkeypatch) -> None:
    """`repository/clock.py` is the single exemption — someone has to call it."""
    root = tmp_path / "src" / "finevents"
    monkeypatch.setattr(check_boundaries, "PACKAGE_ROOT", root)
    path = root / "repository" / "clock.py"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("from datetime import UTC, datetime\nt = datetime.now(UTC)\n", encoding="utf-8")

    assert check_file(path) == []


def test_another_repository_file_may_not(tmp_path, monkeypatch) -> None:
    """The exemption is the file, not the package."""
    root = tmp_path / "src" / "finevents"
    monkeypatch.setattr(check_boundaries, "PACKAGE_ROOT", root)
    path = root / "repository" / "store.py"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("from datetime import datetime\nt = datetime.now()\n", encoding="utf-8")

    assert "wall-clock" in rules(check_file(path))
