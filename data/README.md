Local working data. Gitignored deliberately.

Why: this repository is public, and committing an acquired price series to it is
republication (ADR-0044, REQ-1107). That is the act that got FRED's LBMA series
deleted at ICE's request.

Put fetched data here. Commit the fetcher, not the output. If a source turns out to
be public-domain or CC-BY, committing its data is a deliberate exception recorded in
DATA_SOURCES.md with the licence quoted -- never a default.
