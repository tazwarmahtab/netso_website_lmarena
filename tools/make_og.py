#!/usr/bin/env python3
"""
make_og.py — generates the social share (Open Graph) images for the site.

    python3 tools/make_og.py

Writes 1200x630 JPEGs to assets/img/og/. These paths are referenced by
tools/build.py, so run this once (and again whenever a page title or the
hero/feature imagery changes) before deploying.

Fonts are converted at run time from the self-hosted woff2 files in
assets/fonts/, so the cards use the real brand faces and nothing is
downloaded. Requires: brotli + fonttools (pip), Pillow (already used by the
image tooling), and the local server for nothing at all — this is offline.
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_SRC = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(ROOT, "assets", "img", "og")
CACHE = "/tmp/ogfonts"

BEIGE = (245, 243, 239)
INK = (16, 18, 21)
MUTED = (110, 114, 118)
LINE = (16, 18, 21, 38)
SOLAR = (184, 95, 10)
WHITE = (255, 255, 255)

W, H = 1200, 630
MARGIN = 72
PANEL_X = 706           # image panel starts here
PANEL_W = W - PANEL_X

FACES = {
    "sans": ("Archivo-100-900-normal-latin.woff2", "Archivo.ttf"),
    "serif": ("InstrumentSerif-400-normal-latin.woff2", "Serif.ttf"),
    "serifitalic": ("InstrumentSerif-400-italic-latin.woff2", "SerifItalic.ttf"),
    "mono": ("IBMPlexMono-400-normal-latin.woff2", "Mono.ttf"),
}


def ensure_fonts():
    os.makedirs(CACHE, exist_ok=True)
    paths = {}
    for key, (src, dst) in FACES.items():
        out = os.path.join(CACHE, dst)
        if not os.path.exists(out):
            try:
                f = TTFont(os.path.join(FONT_SRC, src))
            except Exception as exc:                       # brotli missing
                sys.exit(f"cannot read {src}: {exc}\nRun: pip install brotli fonttools")
            f.flavor = None
            f.save(out)
        paths[key] = out
    return paths


def face(paths, key, size, weight=None):
    f = ImageFont.truetype(paths[key], size)
    if weight and key == "sans":
        try:
            f.set_variation_by_axes([weight, 100])
        except Exception:
            pass
    return f


def tracked(draw, xy, text, font, fill, tracking=1.6):
    """Draw mono-style letter-spaced text; returns the end x."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def cover(path, size):
    """Crop-to-fill an image into size (cover semantics)."""
    im = Image.open(path).convert("RGB")
    tw, th = size
    r = max(tw / im.width, th / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    left = (im.width - tw) // 2
    top = int((im.height - th) * 0.42)          # favour the upper-middle of the frame
    return im.crop((left, top, left + tw, top + th))


CARDS = [
    dict(name="home", eyebrow="NETSO ENERGY · DISTRIBUTED ENERGY INFRASTRUCTURE",
         title="Your roof.", accent="Now an energy asset.",
         foot="First asset contracted · PPA signed, pre-construction",
         image="assets/img/hero/roof-solar.webp"),
    dict(name="how-it-works", eyebrow="HOW IT WORKS",
         title="Develop. Finance.", accent="Own. Operate.",
         foot="One partner for the whole life of the asset.",
         image="assets/img/how-develop.jpg"),
    dict(name="projects", eyebrow="PROJECTS",
         title="Contracted, and", accent="in development.",
         foot="Every project is labelled with its real status.",
         image="assets/img/opportunity-roofs.jpg"),
    dict(name="about", eyebrow="ABOUT NETSO ENERGY",
         title="The asset-owner layer", accent="for distributed solar.",
         foot="Netso Energy Ltd. · Dhaka and Chattogram, Bangladesh",
         image="assets/img/team-siteprep.jpg"),
    dict(name="start", eyebrow="START A PROJECT",
         title="Bring us", accent="a roof.",
         foot="The assessment begins with basic site information.",
         image="assets/img/facility-textile.jpg"),
]


def render(paths, card):
    img = Image.new("RGB", (W, H), BEIGE)
    d = ImageDraw.Draw(img)
    col_w = PANEL_X - MARGIN * 2

    # image panel (right), hairline-separated from the text column
    panel = cover(os.path.join(ROOT, card["image"]), (PANEL_W, H))
    img.paste(panel, (PANEL_X, 0))
    d.line([(PANEL_X, 0), (PANEL_X, H)], fill=(16, 18, 21), width=1)

    tracked(d, (MARGIN, MARGIN), card["eyebrow"], face(paths, "mono", 15), MUTED, tracking=2.0)

    # headline: sans statement, then a serif-italic accent sized to fit 2 lines
    t_font = face(paths, "sans", 68, weight=620)
    t_lines = wrap(d, card["title"], t_font, col_w)
    best, a_lines = None, None
    for size in (80, 74, 68, 62, 56):
        f = face(paths, "serifitalic", size)
        lines = wrap(d, card["accent"], f, col_w)
        if best is None or len(lines) < len(a_lines):
            best, a_lines = f, lines
        if len(lines) == 1:
            break
    a_font = best

    y = 178
    for line in t_lines:
        d.text((MARGIN, y), line, font=t_font, fill=INK)
        y += int(t_font.size * 1.06)
    for line in a_lines:
        y += 4
        d.text((MARGIN, y), line, font=a_font, fill=INK)
        y += int(a_font.size * 1.0)

    # wordmark sits under the headline block, never overlapping it
    tracked(d, (MARGIN, y + 26), "NETSO", face(paths, "mono", 17), SOLAR, tracking=3.4)

    # footer: rule + status line pinned to the bottom of the text column
    fy = H - MARGIN - 30
    d.line([(MARGIN, fy - 28), (PANEL_X - MARGIN, fy - 28)], fill=(16, 18, 21), width=1)
    f_font = face(paths, "mono", 14)
    for i, line in enumerate(wrap(d, card["foot"], f_font, col_w)[:2]):
        d.text((MARGIN, fy + i * 19), line, font=f_font, fill=INK)

    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, card["name"] + ".jpg")
    img.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    return out, os.path.getsize(out)


if __name__ == "__main__":
    paths = ensure_fonts()
    for card in CARDS:
        out, size = render(paths, card)
        print(f"{card['name']:<14} -> {os.path.relpath(out, ROOT):<34} {size // 1024:>4} KB")
