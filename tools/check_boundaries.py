#!/usr/bin/env python3
"""Import-boundary and forward-only lints (T0.9, T0.9a).

Two checks over one AST walk, because they share the module graph:

  boundaries  ADR-0004's dividing line, expressed as a lint (REQ-104, REQ-1005).
              No module outside ingest/ and repository/ constructs a storage
              client. No module outside events/, predict/ and wiki/ constructs a
              model client.

  forward-only  ADR-0037's largest consequence (REQ-601). No call site outside
              the allowlist constructs an as-of view of the past, and no replay
              entry point exists at any scope. **This is the only mechanical
              enforcement of forward-only** — until it runs, forward-only is
              aspirational rather than asserted.

Both report every violation rather than stopping at the first: a partial list
invites a fix-one-rerun loop that hides the shape of the problem.

Usage:  python tools/check_boundaries.py [path ...]
Exit:   0 clean, 1 violations found.
"""

from __future__ import annotations

import argparse
import ast
import sys
from dataclasses import dataclass
from pathlib import Path

PACKAGE_ROOT = Path("src/finevents")

# --- ADR-0004: the two import rules -----------------------------------------

STORAGE_SERVICES = {"dynamodb", "s3", "s3control", "athena", "glue"}
MODEL_SERVICES = {"bedrock", "bedrock-runtime", "bedrock-agentcore", "sagemaker-runtime"}

STORAGE_ALLOWED = {"ingest", "repository"}
MODEL_ALLOWED = {"events", "predict", "wiki"}

# --- ADR-0037: forward-only --------------------------------------------------

# Start closed. `harness/` needs historical as-of views to build leakage
# fixtures; nothing else does yet. When T6.12 lands the Lane A historical
# calibration run, add its module here **in the same commit as the ADR
# reference that justifies it** — widening this set is a design decision, not a
# lint adjustment.
AS_OF_ALLOWED = {"harness"}

# A replay entry point may not exist at any scope. `harness/` is exempt because
# Design §1 puts cassette record/replay there, which replays *model responses*,
# not pipeline dates.
REPLAY_TOKENS = ("backtest", "replay", "rewind", "time_travel", "historical_run")

# as_of values that are self-evidently "now" and so cannot look backwards.
NOW_NAMES = {"now", "utcnow", "today", "now_utc"}

# --- REQ-109: the wall clock is reachable from exactly one file --------------
#
# ADR-0016 requires that in Lane A calibration the only time is the injected
# as_of. `repository/clock.py` provides that as `now()` over a bound Clock; this
# rule stops anything else reaching around it. Without the lint the abstraction
# is a convention that a single `from datetime import datetime` defeats, and the
# resulting bug — a trailing window silently anchored on real time — produces a
# plausible number rather than an error.
WALL_CLOCK_CALLS = {
    ("datetime", "now"),
    ("datetime", "utcnow"),
    ("datetime", "today"),
    ("date", "today"),
    ("time", "time"),
}

# The one file allowed to read the real clock, as a path relative to the package.
CLOCK_MODULE = ("repository", "clock.py")


@dataclass(frozen=True)
class Violation:
    path: Path
    line: int
    rule: str
    detail: str

    def __str__(self) -> str:
        return f"{self.path}:{self.line}: [{self.rule}] {self.detail}"


def _module_of(path: Path) -> str:
    """Top-level finevents submodule a file belongs to, or '' if none."""
    try:
        rel = path.resolve().relative_to(PACKAGE_ROOT.resolve())
    except ValueError:
        return ""
    return rel.parts[0] if len(rel.parts) > 1 else ""


def _is_clock_module(path: Path) -> bool:
    """True for the single file permitted to call the wall clock."""
    try:
        rel = path.resolve().relative_to(PACKAGE_ROOT.resolve())
    except ValueError:
        return False
    return rel.parts[-len(CLOCK_MODULE) :] == CLOCK_MODULE


def _wall_clock_call(node: ast.Call) -> tuple[str, str] | None:
    """(receiver, method) when this call reads real time, else None.

    Resolves the receiver to its last attribute name, so `datetime.now()`,
    `datetime.datetime.now()` and `dt.datetime.now()` all report `datetime`
    while `clock.now()` and `self._clock.now()` report their own names and are
    left alone — the abstraction is the sanctioned path, not the target.
    """
    func = node.func
    if not isinstance(func, ast.Attribute):
        return None

    receiver = func.value
    if isinstance(receiver, ast.Name):
        name = receiver.id
    elif isinstance(receiver, ast.Attribute):
        name = receiver.attr
    else:
        return None

    pair = (name, func.attr)
    return pair if pair in WALL_CLOCK_CALLS else None


def _is_boto_factory(node: ast.Call) -> bool:
    """True for boto3.client(...) / boto3.resource(...) / session.client(...)."""
    func = node.func
    return isinstance(func, ast.Attribute) and func.attr in ("client", "resource")


def _service_arg(node: ast.Call) -> str | None:
    """The service name, or None when it is not a literal we can read."""
    if node.args and isinstance(node.args[0], ast.Constant) and isinstance(node.args[0].value, str):
        return node.args[0].value
    for kw in node.keywords:
        if kw.arg == "service_name" and isinstance(kw.value, ast.Constant):
            return str(kw.value.value)
    return None


def _looks_like_now(node: ast.expr) -> bool:
    """True when an as_of value provably cannot point at the past."""
    if isinstance(node, ast.Constant) and node.value is None:
        return True
    if isinstance(node, ast.Call):
        func = node.func
        if isinstance(func, ast.Attribute) and func.attr in NOW_NAMES:
            return True
        if isinstance(func, ast.Name) and func.id in NOW_NAMES:
            return True
    return isinstance(node, ast.Name) and node.id in NOW_NAMES


def check_file(path: Path) -> list[Violation]:
    source = path.read_text(encoding="utf-8")
    try:
        tree = ast.parse(source, filename=str(path))
    except SyntaxError as exc:  # a file that will not parse cannot be cleared
        return [Violation(path, exc.lineno or 0, "parse", f"cannot parse: {exc.msg}")]

    module = _module_of(path)
    clock_exempt = _is_clock_module(path)
    found: list[Violation] = []

    for node in ast.walk(tree):
        # --- REQ-109: no wall clock outside repository/clock.py ---
        if isinstance(node, ast.Call) and not clock_exempt:
            wall_clock = _wall_clock_call(node)
            if wall_clock is not None:
                receiver, method = wall_clock
                found.append(
                    Violation(
                        path,
                        node.lineno,
                        "wall-clock",
                        f"{receiver}.{method}() reads real time. Use "
                        f"finevents.repository.clock.now(), which resolves through the "
                        f"bound Clock — ADR-0016, REQ-109",
                    )
                )

        # --- ADR-0004 ---
        if isinstance(node, ast.Call) and _is_boto_factory(node):
            service = _service_arg(node)
            if service is None:
                # Unprovable is treated as a violation. A non-literal service
                # name defeats the lint entirely, so it must be refused rather
                # than assumed innocent.
                found.append(
                    Violation(
                        path,
                        node.lineno,
                        "boundary",
                        "boto3 client built from a non-literal service name — "
                        "the lint cannot prove which boundary this crosses",
                    )
                )
            elif service in STORAGE_SERVICES and module not in STORAGE_ALLOWED:
                found.append(
                    Violation(
                        path,
                        node.lineno,
                        "boundary",
                        f"storage client ({service!r}) outside "
                        f"{sorted(STORAGE_ALLOWED)} — ADR-0004, REQ-104",
                    )
                )
            elif service in MODEL_SERVICES and module not in MODEL_ALLOWED:
                found.append(
                    Violation(
                        path,
                        node.lineno,
                        "boundary",
                        f"model client ({service!r}) outside "
                        f"{sorted(MODEL_ALLOWED)} — ADR-0004, REQ-1005",
                    )
                )

        # --- ADR-0037: no historical as-of outside the allowlist ---
        if isinstance(node, ast.Call) and module not in AS_OF_ALLOWED:
            for kw in node.keywords:
                if kw.arg == "as_of" and not _looks_like_now(kw.value):
                    found.append(
                        Violation(
                            path,
                            node.lineno,
                            "forward-only",
                            "as_of= is not provably 'now' outside "
                            f"{sorted(AS_OF_ALLOWED)} — ADR-0037, REQ-601",
                        )
                    )

        # --- ADR-0037: no replay entry point at any scope ---
        is_definition = isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef)
        if is_definition and module not in AS_OF_ALLOWED:
            # Underscores are stripped from both sides so a CamelCase class
            # name cannot evade a snake_case token: `TimeTravelRunner` and
            # `time_travel_runner` are the same entry point.
            lowered = node.name.lower().replace("_", "")
            for token in REPLAY_TOKENS:
                if token.replace("_", "") in lowered:
                    found.append(
                        Violation(
                            path,
                            node.lineno,
                            "forward-only",
                            f"{node.name!r} reads as a replay entry point "
                            f"({token!r}) — ADR-0037 forbids these at any scope",
                        )
                    )
                    break

    return found


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", default=[str(PACKAGE_ROOT)])
    args = parser.parse_args(argv)

    files: list[Path] = []
    for raw in args.paths or [str(PACKAGE_ROOT)]:
        p = Path(raw)
        files.extend(sorted(p.rglob("*.py")) if p.is_dir() else [p])

    violations = [v for f in files if f.suffix == ".py" for v in check_file(f)]

    if violations:
        print(f"{len(violations)} boundary violation(s):\n", file=sys.stderr)
        for v in violations:
            print(f"  {v}", file=sys.stderr)
        return 1

    print(f"boundaries + forward-only: clean over {len(files)} file(s)")
    return 0


if __name__ == "__main__":
    from _console import use_utf8

    use_utf8()
    raise SystemExit(main())
