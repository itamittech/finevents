#!/usr/bin/env python3
"""Fetch daily precious-metals price history into the gitignored data/ directory.

**This is a one-off acquisition helper, not the production ingest path.** The real
fetchers are T3.x and carry validation, bitemporal stamping and the AsOfRepository
write path. This script exists to answer one question — can the project obtain daily
metals history at all — and to populate the wiki seed's input.

Run:  python scripts/fetch_metals_history.py
Out:  data/metals_*.csv   (gitignored — the fetcher is committed, the data is not)

SOURCES, and why these ones
---------------------------
Bank of Russia (CBR) — the only free, keyless source found carrying ALL FOUR metals
    daily with history back to the 1990s, and it is current. Quoted RUB per gram.
    Cross-checked against the world price: 2464.8 RUB/g on 2015-01-13 converts to
    ~$1,237/oz against an actual ~$1,230/oz. Real, and tracking world prices.

Bank of England — series XUDLGPD, gold in USD/oz directly, daily from 1979.
    DISCONTINUED after 2017-05-26, so it cannot carry the live series. Fetched as an
    independent USD cross-check for the overlapping period, which is what lets the
    RUB conversion be validated rather than trusted.

National Bank of Poland — gold only, PLN/gram, 2013 to present. A second independent
    cross-check.

KNOWN LIMITATIONS — read before relying on this
-----------------------------------------------
1. CBR quotes are the central bank's own accounting buy/sell rates, derived from world
   prices. They are not LBMA auction prints and will not match them exactly.
2. CBR is RUB-denominated, so a USD series needs the USD/RUB leg (fetched here from the
   same API). That conversion imports FX noise into the metal's return series — RUB was
   extremely volatile in 2014-15. Anyone using these for returns must decide whether the
   FX leg belongs in the signal or should be divided out.
3. Terms of use for CBR were NOT verified. Before any derived aggregate built on this is
   published (REQ-1106, ADR-0050), that must be checked and recorded in DATA_SOURCES.md.
4. A dependency on one national central bank is an availability risk worth naming.
"""

from __future__ import annotations

import csv
import io
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data"
UA = {"User-Agent": "FinEvents-research/0.1 (+https://github.com/itamittech/finevents)"}
CBR_METALS = {"1": "gold", "2": "silver", "3": "platinum", "4": "palladium"}
START = date(2015, 1, 1)  # GDELT 2.0 begins Feb 2015; a month of run-up for sigma


def get(url: str, encoding: str = "utf-8") -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode(encoding, errors="replace")


def chunks(start: date, end: date, days: int = 365):
    cur = start
    while cur < end:
        nxt = min(cur + timedelta(days=days), end)
        yield cur, nxt
        cur = nxt + timedelta(days=1)


def fetch_cbr_metals(end: date) -> list[dict]:
    rows: list[dict] = []
    pat = re.compile(r'<Record Date="([^"]+)" Code="(\d)"><Buy>([\d,]+)</Buy><Sell>([\d,]+)</Sell>')
    for a, b in chunks(START, end):
        url = (
            "https://www.cbr.ru/scripts/xml_metall.asp"
            f"?date_req1={a:%d/%m/%Y}&date_req2={b:%d/%m/%Y}"
        )
        try:
            xml = get(url, "cp1251")
        except urllib.error.URLError as e:
            # Fatal, not skipped (defect D3, 2026-08-18): a swallowed chunk used
            # to rewrite the CSV with whatever survived, and the daily runner
            # would then seal — and bet — "as of" whatever stale date remained.
            raise SystemExit(
                f"CBR metals {a:%Y-%m-%d}..{b:%Y-%m-%d} failed: {e} — "
                "refusing to write a partial series"
            ) from e
        for d, code, buy, sell in pat.findall(xml):
            dd, mm, yy = d.split(".")
            rows.append(
                {
                    "date": f"{yy}-{mm}-{dd}",
                    "metal": CBR_METALS[code],
                    "buy_rub_g": buy.replace(",", "."),
                    "sell_rub_g": sell.replace(",", "."),
                }
            )
        print(f"    {a:%Y-%m-%d}..{b:%Y-%m-%d}  {len(rows):>6} rows", end="\r", flush=True)
    return rows


def fetch_cbr_usdrub(end: date) -> list[dict]:
    rows: list[dict] = []
    pat = re.compile(r'<Record Date="([^"]+)"[^>]*><Nominal>(\d+)</Nominal><Value>([\d,]+)</Value>')
    for a, b in chunks(START, end):
        url = (
            "https://www.cbr.ru/scripts/XML_dynamic.asp"
            f"?date_req1={a:%d/%m/%Y}&date_req2={b:%d/%m/%Y}&VAL_NM_RQ=R01235"
        )
        try:
            xml = get(url, "cp1251")
        except urllib.error.URLError as e:
            raise SystemExit(
                f"CBR USD/RUB {a:%Y-%m-%d}..{b:%Y-%m-%d} failed: {e} — "
                "refusing to write a partial series"
            ) from e
        for d, nom, val in pat.findall(xml):
            dd, mm, yy = d.split(".")
            rows.append(
                {
                    "date": f"{yy}-{mm}-{dd}",
                    "usd_rub": f"{float(val.replace(',', '.')) / int(nom):.4f}",
                }
            )
    return rows


def fetch_boe_gold() -> list[dict]:
    url = (
        "https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp"
        "?csv.x=yes&Datefrom=01/Jan/1979&Dateto=31/Dec/2026"
        "&SeriesCodes=XUDLGPD&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N"
    )
    txt = get(url)
    if not txt.lstrip().upper().startswith("DATE"):
        print("    ! BoE returned HTML, not CSV — skipped", file=sys.stderr)
        return []
    out = []
    for r in csv.DictReader(io.StringIO(txt)):
        try:
            out.append(
                {
                    "date": f"{datetime.strptime(r['DATE'], '%d %b %Y'):%Y-%m-%d}",
                    "gold_usd_oz": r["XUDLGPD"],
                }
            )
        except (ValueError, KeyError):
            continue
    return out


def fetch_nbp_gold(end: date) -> list[dict]:
    rows = []
    for a, b in chunks(START, end, days=350):  # NBP caps a request at 367 days
        try:
            import json

            txt = get(f"https://api.nbp.pl/api/cenyzlota/{a:%Y-%m-%d}/{b:%Y-%m-%d}/?format=json")
            rows += [{"date": r["data"], "gold_pln_g": r["cena"]} for r in json.loads(txt)]
        except Exception as e:
            print(f"    ! {a:%Y-%m} {e}", file=sys.stderr)
    return rows


def write(name: str, rows: list[dict]) -> None:
    if not rows:
        print(f"  {name:<28} EMPTY — not written")
        return
    OUT.mkdir(exist_ok=True)
    p = OUT / name
    # History only grows. A file that would end earlier, or hold fewer rows,
    # than the one already on disk is the signature of a partial fetch — and
    # the runner seals from `dates[-1]`, so letting it through backdates the
    # ledger (defect D3).
    if p.exists():
        prior = [r["date"] for r in csv.DictReader(p.open(encoding="utf-8"))]
        fresh = sorted(r["date"] for r in rows)
        if prior and (fresh[-1] < max(prior) or len(rows) < len(prior)):
            raise SystemExit(
                f"{name}: refusing to overwrite — the fetched series ends {fresh[-1]} with "
                f"{len(rows)} rows, the existing file ends {max(prior)} with {len(prior)}. "
                "A partial fetch must not shrink history."
            )
    with p.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    ds = sorted(r["date"] for r in rows)
    print(f"  {name:<28} {len(rows):>7} rows   {ds[0]} -> {ds[-1]}")


def main() -> int:
    end = date.today()
    print(f"Fetching {START} -> {end} into {OUT}/\n")
    print("  Bank of Russia — four metals, daily")
    write("metals_cbr_rub.csv", fetch_cbr_metals(end))
    print("  Bank of Russia — USD/RUB")
    write("fx_usdrub_cbr.csv", fetch_cbr_usdrub(end))
    print("  Bank of England — gold USD/oz (discontinued 2017)")
    write("gold_boe_usd.csv", fetch_boe_gold())
    print("  National Bank of Poland — gold PLN/g")
    write("gold_nbp_pln.csv", fetch_nbp_gold(end))
    print("\nThe data is gitignored. Commit this fetcher, never its output (ADR-0044).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
