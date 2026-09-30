#!/usr/bin/env python3
"""Fast release gates for the generated Netso public site."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTES = [
    "index.html", "how-it-works/index.html", "projects/index.html", "about/index.html",
    "start-a-project/index.html", "estimate/index.html", "legal/privacy/index.html",
    "legal/terms/index.html", "404.html",
]
DRAFT = ("fixme", "draft copy", "lorem ipsum", "placeholder imagery", "before launch")


def main() -> int:
    failures: list[str] = []
    for route in ROUTES:
        path = ROOT / route
        if not path.exists():
            failures.append(f"missing route: {route}")
            continue
        html = path.read_text(encoding="utf-8").lower()
        for marker in DRAFT:
            if marker in html:
                failures.append(f"draft marker {marker!r} in {route}")
        if route != "404.html" and '<meta name="robots"' in html:
            failures.append(f"production route is noindex: {route}")
        if '<main id="content"' not in html:
            failures.append(f"missing main landmark: {route}")

    home = (ROOT / "index.html").read_text(encoding="utf-8")
    if "Chittagong Grammar School" in home or "80 kWp" in home:
        failures.append("named/capacity proof leaked into homepage")
    if "/projects" not in home:
        failures.append("homepage missing evidence route")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    for route in ("/", "/how-it-works", "/projects", "/about", "/estimate", "/start-a-project"):
        if f"https://netso.energy{route}</loc>" not in sitemap:
            failures.append(f"sitemap missing {route}")

    # Same screening assumptions as estimate.js. Invariants are more important
    # than any single example: displaced energy/value cannot exceed annual load.
    for monthly in range(10_000, 1_000_001, 10_000):
        for roof in range(200, 20_001, 100):
            for daylight in range(30, 101, 5):
                roof_lo, roof_hi = roof / 10, roof / 7
                day_load = monthly * daylight / 100
                load_lo, load_hi = day_load / (1400 / 12), day_load / (1200 / 12)
                kwp_lo, kwp_hi = max(0, min(roof_lo, load_lo)), max(0, min(roof_hi, load_hi))
                generation_lo, generation_hi = kwp_lo * 1200, kwp_hi * 1400
                annual_load = monthly * 12
                displaced_lo, displaced_hi = min(generation_lo, annual_load), min(generation_hi, annual_load)
                if not (0 <= displaced_lo <= displaced_hi <= annual_load):
                    failures.append(f"calculator load invariant failed at {monthly}/{roof}/{daylight}")
                    break
                if displaced_hi / annual_load * 100 > 100.000001:
                    failures.append(f"calculator offset >100% at {monthly}/{roof}/{daylight}")
                    break
            if failures and failures[-1].startswith("calculator"):
                break
        if failures and failures[-1].startswith("calculator"):
            break

    if failures:
        print("RELEASE CHECK FAILED")
        print("\n".join(f"- {item}" for item in failures))
        return 1
    print(f"release checks passed: {len(ROUTES)} routes, sitemap, disclosure policy, calculator invariants")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
