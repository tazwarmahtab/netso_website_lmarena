#!/usr/bin/env python3
"""
trace_logo.py — turn the supplied PNG logo into a clean, tiny SVG.

    python3 tools/trace_logo.py ../uploads/netso_logo_black_transparent.png \
        --out assets/img/logo-mark.svg

WHY TRACE AT ALL
----------------
The supplied Netso mark is pure geometry: closed shapes made entirely of
straight edges. That vectorises *exactly* — the trace is the same shape, because
there are no curves or gradients to lose. The result is a few hundred bytes
instead of 28-280 KB, stays crisp at any size, and can be animated per-path (the
intro curtain draws the mark instead of fading a bitmap).

Only safe because the source is flat, single-colour and hard-edged. For a
photographic or gradient logo this would produce garbage.

Output is normalised to a viewBox with the mark's own aspect ratio; fill is left
as currentColor so CSS decides the colour.
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    sys.exit("opencv not available: pip install opencv-python-headless")

EPSILON = 2.2   # simplify tolerance in source px; long straight edges collapse cleanly


def build_mask(path, alpha_min=128, lum_min=128):
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    alpha = a[:, :, 3]
    if (alpha < 10).mean() > 0.05:          # genuinely transparent -> use alpha
        m = (alpha > alpha_min).astype(np.uint8)
    else:                                    # opaque file -> use luminance
        lum = a[:, :, :3].mean(2)
        m = (lum > lum_min).astype(np.uint8)
    return m


def poly(contour, eps):
    return cv2.approxPolyDP(contour, eps, True).reshape(-1, 2).astype(float)


def trace(m, eps=EPSILON, min_area=60):
    """All external shapes + their holes, simplified to straight segments."""
    contours, hier = cv2.findContours(m * 255, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    hier = hier[0] if hier is not None else []
    outers, holes = [], []
    for i, h in enumerate(hier):
        area = cv2.contourArea(contours[i])
        if area < min_area:
            continue
        (holes if h[3] != -1 else outers).append(poly(contours[i], eps))
    return outers, holes


def to_path(shapes, ox, oy, scale, prec=2):
    def fmt(pts):
        p = [(round((x - ox) * scale, prec), round((y - oy) * scale, prec)) for x, y in pts]
        d = f"M{p[0][0]} {p[0][1]}"
        for x, y in p[1:]:
            d += f"L{x} {y}"
        return d + "Z"
    return " ".join(fmt(s) for s in shapes)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--out", required=True)
    ap.add_argument("--fill", default="currentColor")
    ap.add_argument("--eps", type=float, default=EPSILON)
    ap.add_argument("--prec", type=int, default=2)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if not os.path.exists(a.input):
        sys.exit(f"input not found: {a.input}")

    m = build_mask(a.input)
    ys, xs = np.where(m)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w, h = x1 - x0 + 1, y1 - y0 + 1

    outers, holes = trace(m, a.eps)
    shapes = outers + holes
    scale = 100.0 / max(w, h)
    vw, vh = round(w * scale, a.prec), round(h * scale, a.prec)
    d = to_path(shapes, x0, y0, scale, a.prec)

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" '
           f'fill="{a.fill}" fill-rule="evenodd" aria-hidden="true">'
           f'<path d="{d}"/></svg>\n')

    pts = sum(len(s) for s in shapes)
    print(f"  source        {w}x{h} px  (aspect {w/h:.4f})")
    print(f"  shapes        {len(outers)} outer + {len(holes)} hole(s), {pts} anchor points")
    print(f"  viewBox       0 0 {vw} {vh}")
    print(f"  svg bytes     {len(svg)}")

    if a.dry_run:
        print("\n  dry run — nothing written")
        return
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w") as f:
        f.write(svg)
    print(f"  wrote         {a.out}")


if __name__ == "__main__":
    main()
