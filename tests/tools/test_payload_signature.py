"""The scraped-payload signature blocks what Design §9 says it blocks (REQ-1102).

Both halves matter. A check that never fires is indistinguishable from no check,
so every rule is tested for firing *and* the carve-outs are tested for not
firing.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))

from check_payload_signature import check_file  # noqa: E402


def write(tmp_path: Path, relative: str, content: str | bytes) -> Path:
    path = tmp_path / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, bytes):
        path.write_bytes(content)
    else:
        path.write_text(content, encoding="utf-8")
    return path


# --- path rule ---------------------------------------------------------------


@pytest.mark.parametrize(
    "relative",
    [
        "raw/gdelt/2026-08-10.json",
        "src/finevents/ingest/raw/sample.json",
        "cassettes/classify/abc123.json",
        "data/prices.parquet",
    ],
)
def test_path_rule_blocks(tmp_path: Path, relative: str) -> None:
    path = write(tmp_path, relative, "{}")
    assert check_file(path), f"{relative} should be blocked by the path rule"


# --- Firecrawl envelope ------------------------------------------------------


def test_firecrawl_envelope_blocks(tmp_path: Path) -> None:
    payload = {"metadata": {"title": "x"}, "markdown": "# headline", "sourceURL": "https://e.com"}
    path = write(tmp_path, "notes/capture.json", json.dumps(payload))
    reasons = check_file(path)
    assert any("Firecrawl envelope" in r for r in reasons)


def test_markdown_without_metadata_is_allowed(tmp_path: Path) -> None:
    """Design §9 requires the envelope keys *alongside a metadata object*.

    A config file with a `markdown` key and no metadata is not a scrape, and
    blocking it would make the rule so noisy it gets disabled.
    """
    path = write(tmp_path, "notes/config.json", json.dumps({"markdown": True}))
    assert check_file(path) == []


# --- article shape and provenance keys ---------------------------------------


@pytest.mark.parametrize("key", ["article_text", "body_html", "content_html", "full_text"])
def test_article_shape_blocks(tmp_path: Path, key: str) -> None:
    path = write(tmp_path, "notes/doc.json", json.dumps({key: "the text"}))
    assert any("article shape" in r for r in check_file(path))


@pytest.mark.parametrize("key", ["scrape_id", "firecrawl_job", "firecrawl_id"])
def test_provenance_keys_block(tmp_path: Path, key: str) -> None:
    path = write(tmp_path, "notes/doc.json", json.dumps({key: "abc"}))
    assert any("provenance keys" in r for r in check_file(path))


def test_nested_keys_are_found(tmp_path: Path) -> None:
    """Burying the key one level down must not evade the rule."""
    payload = {"results": [{"parsed": {"article_text": "..."}}]}
    path = write(tmp_path, "notes/deep.json", json.dumps(payload))
    assert any("article shape" in r for r in check_file(path))


def test_jsonl_is_scanned(tmp_path: Path) -> None:
    lines = "\n".join(json.dumps({"article_text": f"row {i}"}) for i in range(3))
    path = write(tmp_path, "notes/rows.jsonl", lines)
    assert any("article shape" in r for r in check_file(path))


# --- bulk HTML ---------------------------------------------------------------


def test_bulk_html_blocks(tmp_path: Path) -> None:
    body = ("<div class='story'><p>text</p></div>" * 3000).encode()
    assert len(body) > 50 * 1024
    path = write(tmp_path, "notes/page.html", body)
    assert any("bulk-HTML" in r for r in check_file(path))


def test_small_html_is_allowed(tmp_path: Path) -> None:
    """Under the 50 KB floor the rule does not apply — a template is not a scrape."""
    path = write(tmp_path, "web/index.html", "<html><body><p>hi</p></body></html>")
    assert check_file(path) == []


# --- the two carve-outs ------------------------------------------------------


def test_synthetic_fixture_allowed_when_asserted(tmp_path: Path) -> None:
    content = "# synthetic: hand-written GDELT row for the pre-filter test\n" + json.dumps(
        {"article_text": "invented"}
    )
    path = write(tmp_path, "harness/fixtures/gdelt.json", content)
    assert check_file(path) == []


def test_fixture_without_marker_is_blocked(tmp_path: Path) -> None:
    """Location is not the carve-out; the assertion is.

    Design §9 permits synthetic fixtures *only if* they say so. Without this,
    the fixtures directory becomes a laundering path for real scraped content.
    """
    path = write(tmp_path, "harness/fixtures/gdelt.json", json.dumps({"article_text": "real?"}))
    reasons = check_file(path)
    assert any("synthetic" in r for r in reasons)


def test_published_derived_artefact_allowed(tmp_path: Path) -> None:
    """REQ-1106 requires publishing derived data; REQ-1108 requires it carry
    source URLs and fetch timestamps — exactly what the envelope rule looks for."""
    payload = {
        "metadata": {"generated": "2026-08-10"},
        "sourceURL": "https://fred.stlouisfed.org/series/SP500",
        "series": [1, 2, 3],
    }
    path = write(tmp_path, "published/sp500.json", json.dumps(payload))
    assert check_file(path) == []


def test_cassette_under_published_is_still_blocked(tmp_path: Path) -> None:
    """The path rule outranks both carve-outs.

    A cassette is keyed by prompt hash and the curator's prompt contains source
    material — committing one puts scraped text in through the back door.
    """
    path = write(tmp_path, "published/cassettes/x.json", "{}")
    assert check_file(path)


# --- clean content -----------------------------------------------------------


@pytest.mark.parametrize("relative", ["src/finevents/ingest/__init__.py", "docs/Design.md"])
def test_ordinary_repository_content_passes(tmp_path: Path, relative: str) -> None:
    path = write(tmp_path, relative, "ordinary project content\n")
    assert check_file(path) == []
