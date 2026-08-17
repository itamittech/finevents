"""The mini-wiki's rules (P8d, scripts/poc_wiki.py, REQ-1303).

What matters here is the division of power: code computes every number and
enforces every rule; the model only ever proposes prose — and a proposal that
breaks the rules (uncited, over-long, mis-cited, past the cap) is dropped with
a named reason. Memory that cannot be audited is not memory, it is vibes.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "scripts"))

from poc_wiki import (  # noqa: E402
    MAX_LESSONS,
    append_version,
    apply_curation,
    compute_statistics,
    evidence_digest,
    label_base_rates,
    parse_wiki,
    render_page,
    serialize_wiki,
    valid_evidence_dates,
)


def matured_record(as_of: str = "2026-08-13", target: str = "2026-08-14") -> dict:
    return {
        "as_of": as_of,
        "matured": {
            "1": {
                "target_date": target,
                "outcome": 3,
                "rps": {"climatology": 0.12, "chronos_uni": 0.08, "all_flat": 0.4},
            }
        },
    }


# --- statistics: provenance never mixes ---------------------------------------


def test_statistics_split_observed_from_seeded_and_never_average_them() -> None:
    offline = {
        "window": {"days": 143},
        "ladder": {"1": [{"rung": "chronos_uni", "mean": 0.1401}], "5": []},
    }
    stats = compute_statistics([matured_record()], offline)
    assert stats["observed"]["chronos_uni"] == {"mean_rps": 0.08, "n": 1}
    assert stats["seeded"]["chronos_uni"]["mean_rps_by_h"]["1"] == 0.1401
    assert stats["seeded"]["chronos_uni"]["n"] == 143


# --- curation: the model proposes, the code disposes ---------------------------


def test_uncited_miscited_overlong_and_duplicate_lessons_are_dropped() -> None:
    known = {"2026-08-13", "2026-08-14"}
    proposed = [
        {"text": "when X, expect Y", "cites": ["2026-08-14"]},
        {"text": "no citation, no entry", "cites": []},
        {"text": "cites a day that never happened", "cites": ["2020-01-01"]},
        {"text": "x" * 300, "cites": ["2026-08-14"]},
        {"text": "when X, expect Y", "cites": ["2026-08-13"]},  # duplicate text
    ]
    kept, rejected = apply_curation([], proposed, known)
    assert [lesson["text"] for lesson in kept] == ["when X, expect Y"]
    assert len(rejected) == 4


def test_the_lesson_cap_holds() -> None:
    proposed = [{"text": f"lesson {i}", "cites": ["2026-08-14"]} for i in range(MAX_LESSONS + 5)]
    kept, rejected = apply_curation([], proposed, {"2026-08-14"})
    assert len(kept) == MAX_LESSONS
    assert any("cap" in reason for reason in rejected)


def test_an_empty_proposal_keeps_existing_lessons_rather_than_wiping() -> None:
    existing = [{"text": "hard-won", "cites": ["2026-08-13"]}]
    kept, rejected = apply_curation(existing, [], {"2026-08-13"})
    assert kept == existing
    assert any("kept" in reason for reason in rejected)


# --- versions: append-only ------------------------------------------------------


def test_versions_append_and_same_day_curation_is_a_no_op() -> None:
    wiki = {"instruments": {}}
    first = append_version(
        wiki,
        "gold",
        as_of="2026-08-13",
        statistics={"observed": {}, "seeded": {}},
        lessons=[],
        curator_note=None,
    )
    again = append_version(
        wiki,
        "gold",
        as_of="2026-08-13",
        statistics={"observed": {"x": 1}, "seeded": {}},
        lessons=[{"text": "t", "cites": ["2026-08-13"]}],
        curator_note="ignored",
    )
    assert first is again  # same day: the earlier version wins, nothing rewritten
    assert len(wiki["instruments"]["gold"]["versions"]) == 1

    append_version(
        wiki,
        "gold",
        as_of="2026-08-14",
        statistics={"observed": {}, "seeded": {}},
        lessons=[],
        curator_note=None,
    )
    assert [v["version"] for v in wiki["instruments"]["gold"]["versions"]] == [1, 2]


# --- rendering and the round trip ----------------------------------------------


def test_the_rendered_page_is_deterministic_and_names_its_provenance() -> None:
    version = {
        "version": 2,
        "as_of": "2026-08-14",
        "statistics": compute_statistics([matured_record()], None),
        "lessons": [{"text": "when X, expect Y", "cites": ["2026-08-14"]}],
        "curator_note": None,
    }
    once, twice = render_page("gold", version), render_page("gold", version)
    assert once == twice
    assert "observed — matured days only" in once
    assert "when X, expect Y" in once


def test_wiki_round_trip_and_evidence_dates() -> None:
    wiki = {"instruments": {"gold": {"versions": []}}}
    assert parse_wiki(serialize_wiki(wiki)) == wiki
    dates = valid_evidence_dates([matured_record()])
    assert dates == {"2026-08-13", "2026-08-14"}


def test_the_evidence_digest_reads_like_evidence() -> None:
    events = {
        "days": [
            {"date": "2026-08-14", "events": [{"label": "Fighting"}]},
            {"date": "2026-08-13", "events": [{"label": "Fighting"}, {"label": "Fighting"}]},
        ]
    }
    digest = evidence_digest([matured_record()], events)
    assert "realised 'small up'" in digest
    assert "best chronos_uni" in digest
    # The anchor day's mix (knowable when the bet was placed), never the target's.
    assert "events known on 2026-08-13 (the day the bet was placed): Fighting ×2" in digest
    assert evidence_digest([]) == "No newly matured evidence."


def test_the_digest_states_label_base_rates_so_coincidences_show() -> None:
    """The first live curation's lesson: 'when Fighting appears' — on a window
    where Fighting appeared every single day. The digest must make that visible."""
    events = {
        "days": [
            {
                "date": d,
                "events": [{"label": "Fighting"}]
                + ([{"label": "Protest"}] if d.endswith("4") else []),
            }
            for d in ("2026-08-12", "2026-08-13", "2026-08-14")
        ]
    }
    assert label_base_rates(events) == [("Fighting", 3, 3), ("Protest", 1, 3)]
    digest = evidence_digest([matured_record()], events)
    assert "Fighting on 3 of 3 days" in digest
    assert "Protest on 1 of 3 days" in digest
    assert "cannot be a lesson" in digest
    assert label_base_rates(None) == [] and label_base_rates({"days": []}) == []
