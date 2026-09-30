#!/usr/bin/env python3
"""Copy the generated public site into an allowlisted deployment directory.

Usage: python3 tools/package_public.py [dist]

The repository root is a development/source tree. This command deliberately
copies only generated routes and public assets, never src/, tools/, reports,
README files or dotfiles.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "dist")

ROUTES = [
    "index.html", "404.html", "robots.txt", "sitemap.xml", "favicon.svg",
    "manifest.webmanifest", "how-it-works", "projects", "about",
    "start-a-project", "estimate", "legal",
]

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)
for item in ROUTES:
    source = ROOT / item
    if not source.exists():
        raise SystemExit(f"missing generated public item: {item}")
    target = DEST / item
    if source.is_dir():
        shutil.copytree(source, target)
    else:
        shutil.copy2(source, target)
shutil.copytree(ROOT / "assets", DEST / "assets")

for forbidden in ("src", "tools", ".git", "README.md", "PLAN-WORLD-CLASS.md"):
    if (DEST / forbidden).exists():
        raise SystemExit(f"forbidden source artifact copied: {forbidden}")
print(f"public package ready: {DEST} ({sum(1 for _ in DEST.rglob('*'))} files)")
