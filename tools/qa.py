#!/usr/bin/env python3
"""
qa.py — headless smoke test: loads each route, records console errors /
failed requests, scrolls through the page and saves screenshots to $SHOTS_DIR
(default /tmp/netso-shots). Curated contact sheets live in tools/shots/.

    python3 tools/qa.py [route ...] [--mobile] [--scroll N] [--wait MS]
"""
import asyncio
import os
import sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Screenshots go to /tmp by default (they are large); set SHOTS_DIR to override.
OUT = os.environ.get("SHOTS_DIR", "/tmp/netso-shots")
os.makedirs(OUT, exist_ok=True)
BASE = "http://localhost:8100"

args = [a for a in sys.argv[1:] if not a.startswith("--")]
MOBILE = "--mobile" in sys.argv
SCROLL = 0
WAIT = 2500
for a in sys.argv[1:]:
    if a.startswith("--scroll="):
        SCROLL = int(a.split("=")[1])
    if a.startswith("--wait="):
        WAIT = int(a.split("=")[1])
ROUTES = args or ["/", "/how-it-works", "/projects", "/about", "/start-a-project", "/legal/privacy", "/legal/terms", "/nope"]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": 390, "height": 844} if MOBILE else {"width": 1440, "height": 900},
            device_scale_factor=1, has_touch=MOBILE, is_mobile=MOBILE,
            user_agent=("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                        if MOBILE else None),
        )
        for route in ROUTES:
            page = await ctx.new_page()
            errors, failed = [], []
            page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
            page.on("requestfailed", lambda r: failed.append(f"{r.url} :: {r.failure}"))
            page.on("response", lambda r: failed.append(f"{r.status} {r.url}") if r.status >= 400 else None)
            resp = await page.goto(BASE + route, wait_until="load")
            await page.wait_for_timeout(WAIT)
            slug = (route.strip("/").replace("/", "_") or "home") + ("-m" if MOBILE else "")
            await page.screenshot(path=os.path.join(OUT, f"{slug}.png"))
            if SCROLL:
                h = await page.evaluate("document.documentElement.scrollHeight")
                step = max(300, h // SCROLL)
                for i in range(1, SCROLL + 1):
                    await page.mouse.wheel(0, step)
                    await page.wait_for_timeout(600)
                    await page.screenshot(path=os.path.join(OUT, f"{slug}-s{i:02d}.png"))
            print(f"== {route} -> {resp.status}  errors={len(errors)} failed={len(failed)}")
            for e in errors[:15]:
                print("   ", e[:220])
            for f in failed[:15]:
                print("   FAIL", f[:220])
            await page.close()
        await browser.close()


asyncio.run(main())
