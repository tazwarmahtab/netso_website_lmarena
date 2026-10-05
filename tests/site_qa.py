#!/usr/bin/env python3
"""Static launch-readiness checks for the Netso public site.

Run from the repository root with: python3 tests/site_qa.py
The suite intentionally uses only the Python standard library so it can run in CI.
"""
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

CANONICAL = [
    "/", "/our-model", "/for-businesses", "/technology-operations",
    "/capital-partners", "/about", "/assess-a-facility",
    "/legal/privacy", "/legal/terms",
]
LEGACY = {
    "/how-it-works": "/our-model",
    "/start-a-project": "/assess-a-facility",
    "/estimate": "/assess-a-facility",
    "/projects": "/capital-partners",
}
DENY = [
    "20-year fixed PPA", "20 year fixed PPA", "100% of CAPEX",
    "64.8 kW active", "98% daytime load matching", "I-REC certificates",
    "CGS 80 kWp flagship executed", "Four H installed",
]
errors = []

def page_path(route):
    return ROOT / "index.html" if route == "/" else ROOT / route.strip("/") / "index.html"

def read(route):
    p = page_path(route)
    if not p.exists():
        errors.append(f"missing canonical page: {route} -> {p}")
        return ""
    return p.read_text(encoding="utf-8")

def assert_contains(text, needle, where):
    if needle not in text:
        errors.append(f"{where}: missing {needle!r}")

def main():
    for route in CANONICAL:
        html = read(route)
        if not html:
            continue
        assert_contains(html, f'rel="canonical" href="https://netso.energy{route}"', route)
        assert_contains(html, f'<meta property="og:url" content="https://netso.energy{route}"', route)

    redirects = (ROOT / "vercel.json").read_text(encoding="utf-8")
    for source, destination in LEGACY.items():
        assert_contains(redirects, f'"source": "{source}"', "vercel.json")
        assert_contains(redirects, f'"destination": "{destination}"', "vercel.json")

    sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [e.text.replace("https://netso.energy", "") for e in sitemap.findall("sm:url/sm:loc", ns)]
    if urls != CANONICAL:
        errors.append(f"sitemap route inventory mismatch: {urls!r}")

    home = read("/")
    for field in ["spend", "roof", "hours", "tariff"]:
        assert_contains(home, f'name="{field}"', "homepage economics")
    assert_contains(home, 'monthly_spend', "homepage assessment handoff")
    assert_contains(home, 'roof_area', "homepage assessment handoff")
    assert_contains(home, 'operating_hours', "homepage assessment handoff")
    assert_contains(home, 'tariff', "homepage assessment handoff")
    assert_contains(home, 'data-cinematic-scrub', "homepage hero")
    if 'data-cinematic-scrub autoplay' in home:
        errors.append("homepage hero: cinematic video must not autoplay before motion policy is evaluated")

    js = (ROOT / "assets/js/home.js").read_text(encoding="utf-8")
    assert_contains(js, "if (DL.reduceMotion)", "home.js cinematic hero")
    assert_contains(js, "media.pause()", "home.js reduced-motion hero")
    assert_contains(js, "media.play().catch", "home.js no-motion fallback")

    core = (ROOT / "assets/js/core.js").read_text(encoding="utf-8")
    assert_contains(core, "mailtoFallback(data)", "core.js form fallback")
    assert_contains(core, "WhatsApp was blocked", "core.js popup fallback")

    form = read("/assess-a-facility")
    for field in ["f-name", "f-company", "f-role", "f-email", "f-phone", "f-location", "f-type"]:
        assert_contains(form, f'id="{field}"', "assessment form")
    assert_contains(form, 'name="consent" required', "assessment consent")
    assert_contains(form, "No message is treated as received", "assessment handoff disclosure")

    all_html = []
    for route in CANONICAL:
        p = page_path(route)
        if p.exists():
            all_html.append((route, p.read_text(encoding="utf-8").lower()))
    for route, html in all_html:
        for phrase in DENY:
            if phrase.lower() in html:
                errors.append(f"{route}: unsupported public claim detected: {phrase!r}")

    href_pattern = re.compile(r'href\s*=\s*["\']([^"\']*)["\']')
    malformed = re.compile(r'href\s*=\s*["\'][^"\']*$')
    for route in CANONICAL:
        p = page_path(route)
        if not p.exists():
            continue
        raw = p.read_text(encoding="utf-8")
        if malformed.search(raw):
            errors.append(f"{route}: malformed href attribute detected")
        for href in href_pattern.findall(raw):
            if href.startswith("/") and not href.startswith("//"):
                target = href.split("#", 1)[0].split("?", 1)[0]
                if target and target not in LEGACY and target not in CANONICAL:
                    errors.append(f"{route}: internal href has no canonical/legacy target: {href}")

    if errors:
        print("FAIL")
        for e in errors:
            print(" -", e)
        return 1
    print(f"PASS: {len(CANONICAL)} canonical routes, {len(LEGACY)} legacy redirects, metadata, calculator, hero motion policy, form handoff, claims, and internal href integrity")
    return 0

if __name__ == "__main__":
    sys.exit(main())
