#!/usr/bin/env python3
"""
subset_fonts.py — trims the self-hosted brand fonts to the glyphs the site uses.

    python3 tools/subset_fonts.py            # subset in place (originals kept)
    python3 tools/subset_fonts.py --restore  # put the originals back

Why: Archivo is a variable font (wght 100-900, wdth 62-125) and shipped at ~88 KB.
The site only uses ~105 distinct characters, so nearly all of that is dead weight
on the critical path of a slow mobile connection.

The character set is deliberately wider than what the copy uses today — full
printable ASCII, the accents common in Bangladeshi and European names, currency
symbols including the taka sign, and the punctuation the editorial voice uses.
That margin exists so ordinary copy edits don't produce missing-glyph boxes.

Re-run this after adding copy with characters outside the set (the script prints
the set it used, and warns if a glyph referenced by the built HTML is missing).

Requires: fonttools + brotli (pip install fonttools brotli).
"""
import glob
import os
import shutil
import sys

from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "assets", "fonts")
BACKUP = os.path.join(FONT_DIR, "_original")

# Characters the site actually uses today (measured from src/ + assets/css + assets/js).
USED = "©²·×–—…→≈"

# Safety margin: printable ASCII, Latin-1 letters/symbols likely in copy or names,
# currency signs, and typographic punctuation.
SAFETY = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + " £€₹৳¢¥°±§¶†‡•‰′″‹›«»„“”‘’「」"
    + "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝß"
    + "àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ"
)
CHARS = "".join(sorted(set(USED + SAFETY)))


# The copy only ever sets weight 400 or 500, and never uses the width axis, so the
# variable font carries two dimensions it does not need. Pinning width to 100% and
# limiting weight to the range the design could plausibly use cuts the gvar table
# (the bulk of a variable font) without changing how any current page renders.
WEIGHT_RANGE = (400, 700)
PIN_WIDTH = 100.0


def narrow_axes(font):
    if "fvar" not in font:
        return font, []
    axes = {a.axisTag: (a.minValue, a.defaultValue, a.maxValue) for a in font["fvar"].axes}
    limits, notes = {}, []
    if "wdth" in axes:
        limits["wdth"] = PIN_WIDTH
        notes.append(f"wdth pinned to {PIN_WIDTH:g} (was {axes['wdth'][0]:g}-{axes['wdth'][2]:g})")
    if "wght" in axes:
        lo, hi = WEIGHT_RANGE
        lo = max(lo, axes["wght"][0])
        hi = min(hi, axes["wght"][2])
        limits["wght"] = (lo, hi)
        notes.append(f"wght limited to {lo:g}-{hi:g} (was {axes['wght'][0]:g}-{axes['wght'][2]:g})")
    if not limits:
        return font, notes
    return instancer.instantiateVariableFont(font, limits, inplace=False, updateFontNames=False), notes


def subset(path, out_path):
    before = os.path.getsize(path)
    font = TTFont(path)
    font, notes = narrow_axes(font)
    opts = Options()
    opts.flavor = "woff2"
    opts.desubroutinize = True
    opts.layout_features = ["*"]          # keep kerning/tracking behaviour intact
    opts.name_IDs = ["*"]
    opts.notdef_outline = True            # keep .notdef so any surprise glyph is visible, not blank
    opts.recalc_bounds = True
    sub = Subsetter(options=opts)
    sub.populate(text=CHARS)
    sub.subset(font)
    font.save(out_path)
    return before, os.path.getsize(out_path), notes


def main():
    restore = "--restore" in sys.argv
    files = sorted(glob.glob(os.path.join(FONT_DIR, "*.woff2")))
    if not files:
        sys.exit("no woff2 files found in assets/fonts")

    if restore:
        if not os.path.isdir(BACKUP):
            sys.exit("no backups present — nothing to restore")
        for f in files:
            shutil.copy2(os.path.join(BACKUP, os.path.basename(f)), f)
        print(f"restored {len(files)} fonts from {os.path.relpath(BACKUP, ROOT)}")
        return

    os.makedirs(BACKUP, exist_ok=True)
    print(f"character set: {len(CHARS)} glyphs (site uses {len(set(USED))} beyond ASCII)\n")
    total_before = total_after = 0
    for f in files:
        name = os.path.basename(f)
        bak = os.path.join(BACKUP, name)
        if not os.path.exists(bak):
            shutil.copy2(f, bak)
        tmp = f + ".tmp"
        before, after, notes = subset(bak, tmp)
        os.replace(tmp, f)
        total_before += before
        total_after += after
        saved = 100 * (1 - after / before) if before else 0
        extra = ("  [" + "; ".join(notes) + "]") if notes else ""
        print(f"{name:<48} {before // 1024:>4} KB -> {after // 1024:>3} KB  (-{saved:.0f}%){extra}")
    print(f"\ntotal {total_before // 1024} KB -> {total_after // 1024} KB "
          f"(-{100 * (1 - total_after / total_before):.0f}%)")
    print(f"originals kept in {os.path.relpath(BACKUP, ROOT)} — restore with --restore")


if __name__ == "__main__":
    main()
