#!/usr/bin/env python3
"""
prepare_video.py — turns a supplied video into web-weight assets for the hero.

    # 4 scroll-scrub keyframes + poster, sized for desktop
    python3 tools/prepare_video.py clip.mp4 --name roof --frames 4 --width 1440

    # a compressed autoplay loop instead (heavier: read the weight report first)
    python3 tools/prepare_video.py clip.mp4 --name roof --loop --seconds 5

    # just pull one still out of a clip (or convert a HEIC photo)
    python3 tools/prepare_video.py clip.mov --name shot --still 1.5

    # report only, write nothing
    python3 tools/prepare_video.py clip.mp4 --name roof --dry-run

WHY THE DEFAULT IS KEYFRAMES, NOT VIDEO
---------------------------------------
The hero sits on the critical path. Current first contentful paint on a 1.6 Mbps
connection is ~0.94 s, and the two hero WebPs total 371 KB. A 5-second 1080p loop
is typically 3-4 MB, which is ~19 s of download on that connection — it would
undo the performance work outright. Four cross-faded keyframes cost about the
same as the stills already in use and keep the scroll-driven feel.

This tool always prints the weight and the slow-connection estimate before you
commit, so the decision is made on numbers rather than on how it looks on a fast
machine.

Requires: ffmpeg (sudo apt-get install ffmpeg).
"""
import argparse
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "img", "video")
STILL_DIR = os.path.join(ROOT, "assets", "img")

# Slow-connection reference used across this project's measurements.
SLOW_MBPS = 1.6
STILL_BUDGET_KB = 420          # total across the frame set


def need_ffmpeg():
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found. Install it:  sudo apt-get install -y ffmpeg")


def probe(path):
    """Duration, dimensions and size of the input."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,duration,nb_frames",
         "-show_entries", "format=duration,size,format_name",
         "-of", "default=noprint_wrappers=1", path],
        capture_output=True, text=True).stdout
    d = {}
    for line in out.strip().splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            d[k] = v
    try:
        d["duration"] = float(d.get("duration") or 0)
    except ValueError:
        d["duration"] = 0.0
    d["size_mb"] = os.path.getsize(path) / (1024 * 1024)
    d["width"] = int(d.get("width") or 0)
    d["height"] = int(d.get("height") or 0)
    return d


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-800:], file=sys.stderr)
        sys.exit(f"ffmpeg failed: {' '.join(args[:3])} ...")


def kb(path):
    return os.path.getsize(path) // 1024


def report(paths, label):
    total = sum(os.path.getsize(p) for p in paths)
    total_kb = total / 1024
    secs = (total * 8) / (SLOW_MBPS * 1_000_000)
    print(f"\n  {label}")
    for p in paths:
        print(f"    {os.path.relpath(p, ROOT):<52} {kb(p):>5} KB")
    print(f"    {'TOTAL':<52} {total_kb:>5.0f} KB")
    print(f"    slow-connection ({SLOW_MBPS} Mbps) download: {secs:>5.1f} s")
    return total_kb


def keyframes(src, name, count, width, quality, dry):
    os.makedirs(OUT_DIR, exist_ok=True)
    info = probe(src)
    dur = info["duration"] or 1.0
    # sample inside the clip, avoiding the very first and last frame
    times = [dur * (i + 0.5) / count for i in range(count)]
    if dry:
        print(f"  would sample {count} frames at {[round(t,2) for t in times]} s")
        return []
    made = []
    for i, t in enumerate(times, start=1):
        out = os.path.join(OUT_DIR, f"{name}-f{i}.webp")
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", src,
             "-frames:v", "1",
             "-vf", f"scale={width}:-2:flags=lanczos",
             "-c:v", "libwebp", "-quality", str(quality), "-compression_level", "6",
             out])
        made.append(out)
    return made


def poster(src, name, width, quality, dry):
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, f"{name}-poster.webp")
    if dry:
        print(f"  would write {os.path.relpath(out, ROOT)}")
        return []
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-frames:v", "1",
         "-vf", f"scale={width}:-2:flags=lanczos",
         "-c:v", "libwebp", "-quality", str(quality), out])
    return [out]


def loop(src, name, width, seconds, dry):
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, f"{name}-loop.mp4")
    if dry:
        print(f"  would write {os.path.relpath(out, ROOT)}")
        return []
    # no audio, faststart so it can begin playing before fully downloaded
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-t", str(seconds),
         "-an", "-vf", f"scale={width}:-2:flags=lanczos",
         "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-crf", "30", "-preset", "slow", "-movflags", "+faststart", out])
    return [out]


def still(src, name, at, width, dry):
    """One frame out of a clip, or a straight conversion for a HEIC/PNG photo."""
    ext = os.path.splitext(src)[1].lower()
    out = os.path.join(STILL_DIR, f"{name}.webp")
    if dry:
        print(f"  would write {os.path.relpath(out, ROOT)}")
        return []
    if ext in (".heic", ".heif"):
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", src,
             "-vf", f"scale={width}:-2:flags=lanczos",
             "-c:v", "libwebp", "-quality", "82", out])
    else:
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(at), "-i", src,
             "-frames:v", "1", "-vf", f"scale={width}:-2:flags=lanczos",
             "-c:v", "libwebp", "-quality", "82", out])
    return [out]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--name", required=True, help="output basename, e.g. 'roof'")
    ap.add_argument("--frames", type=int, default=4, help="keyframes for scroll-scrub")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--quality", type=int, default=72, help="WebP quality (60-85)")
    ap.add_argument("--seconds", type=float, default=5.0)
    ap.add_argument("--at", type=float, default=1.0, help="timestamp for --still")
    ap.add_argument("--loop", action="store_true", help="also emit a compressed mp4 loop")
    ap.add_argument("--still", action="store_true", help="extract a single still instead")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    need_ffmpeg()
    if not os.path.exists(a.input):
        sys.exit(f"input not found: {a.input}")

    info = probe(a.input)
    print(f"\n  input: {a.input}")
    print(f"    {info['width']}x{info['height']}  {info['duration']:.1f}s  "
          f"{info['size_mb']:.1f} MB  ({info.get('format_name','?')})")
    if info["duration"] == 0:
        print("    note: no duration reported — treating as a still image")

    made = []
    if a.still or info["duration"] == 0:
        made = still(a.input, a.name, a.at, a.width, a.dry_run)
        label = "still"
    else:
        made = keyframes(a.input, a.name, a.frames, a.width, a.quality, a.dry_run)
        made += poster(a.input, a.name, a.width, a.quality, a.dry_run)
        label = f"{a.frames} keyframes + poster"
        if a.loop:
            made += loop(a.input, a.name, a.width, a.seconds, a.dry_run)

    if a.dry_run:
        print("\n  dry run — nothing written\n")
        return

    total = report(made, label)
    if label.startswith("4") or "keyframes" in label:
        if total > STILL_BUDGET_KB:
            print(f"\n  OVER the {STILL_BUDGET_KB} KB frame-set budget by "
                  f"{total - STILL_BUDGET_KB:.0f} KB — lower --quality or --width, "
                  f"or use fewer --frames.")
        else:
            print(f"\n  within the {STILL_BUDGET_KB} KB frame-set budget "
                  f"({STILL_BUDGET_KB - total:.0f} KB spare)")
    if any(p.endswith(".mp4") for p in made):
        print("  NOTE: the mp4 loop is on the critical path if autoplayed. Prefer "
              "scroll-driven keyframes; if the loop ships, it must not load before "
              "first paint.")
    print()


if __name__ == "__main__":
    main()
