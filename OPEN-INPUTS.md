# Open inputs — waiting on the company

Recorded so these don't get lost between passes. None of them block the site as it stands.

## 1. Logo file — ✅ DELIVERED (28 Sep 2026)
Received `netso_logo_black_transparent.png` / `netso_logo_transparent.png` /
`netso_logo_yellow_on_black.png` (1600×1600, transparent). The real mark is a bold geometric
"N" built from two slanted strokes — **not** the old rooftop glyph placeholder.

Because it is pure straight-edged geometry it was traced to a true vector (not an embedded
bitmap): `tools/trace_logo.py` → `assets/img/logo-mark.svg`, a single 14-point path, 303 bytes,
verified at **IoU 0.988** against the source (residual is anti-alias only). Installed across:
- `src/partials/header.html` — `.header__logo` glyph (15px, `currentColor`)
- `src/partials/intro.html` — intro-curtain mark (sun-circle removed; `introSun` keyframe deleted)
- `favicon.svg` — mark on a rounded brand-dark tile
- `assets/svg/logo-dark.svg` / `logo-light.svg` — mark + NETSO wordmark lockups
- PNG app icons regenerated from the mark: `favicon-96.png`, `apple-touch-icon.png`, `icon-512.png`

Committed at `ecd15e8`. To re-trace after a new logo file: `python3 tools/trace_logo.py <png>
--out assets/img/logo-mark.svg --eps 3.0`, then re-run the icon generation block.

Open sub-item: the wordmark still reads **NETSO** (not "NETSO ENERGY") to keep the header compact;
flip in `header.html` + the two lockup SVGs if the full name is preferred.

## 2. The video — NOT RECEIVED
No `.mp4`, `.mov` or `.webm` exists anywhere in the workspace. The file did not upload.

If it is still wanted, the constraint is weight: a 5-second 1080p loop is roughly 3–4 MB, which is
**~19 seconds on a 1.6 Mbps connection** against a current first-contentful-paint of ~0.94 s. The
workable version is scroll-driven keyframe cross-fades (three stills ≈ 400 KB), not autoplay.
The layered hero stage now implemented already produces the depth effect without any video.

## 3. The copy change — NOT RECEIVED
Referred to as "change the copy first", but no replacement text arrived, and the hero is locked by
an earlier instruction, so nothing was rewritten on a guess. Send the text and it can be applied
in one pass.

## 4. `Screenshot 2026-04-18 at 12.20.25 AM.PNG` — NOT RECEIVED
Four of the five attached images arrived. This one did not.

## 5. Imagery supplied on 24 Sep — reviewed, not yet used
| File | What it is | Verdict |
|---|---|---|
| `IMG_4853.PNG` | Cap with NETSO wordmark | Logo reference — see §1 |
| `IMG_5552.jpg` | Rooftop solar over a mid-rise at dusk | **Reads residential.** AC units, terrace furniture, plants. Not a C&I facility — would undercut the positioning if used as a project image. |
| `IMG_5486.JPG` | Narrow, low-resolution rooftop frame | Too small for hero or media use (680×383) |
| `ChatGPT Image…PNG` | Glass-balustraded solar terrace | **Reads residential/luxury villa.** Same caution. |

Both rooftop renders are good source material for the *energy asset* story (canopy structure,
light strip under the panels) — not for the hero, and **never** in a contracted-project
slot (see README). No counterparty imagery, stock or otherwise, is used for any contracted project.

---

## 6. Image resolution requirements (added 24 Sep 2026)

Measured from the live site at 2× device pixel ratio. Send files **at or above the "needs" figure**:

| Slot | Renders | Needs (retina) |
|---|---|---|
| Hero photograph (full-bleed) | 1526 css px | **~3050 px wide** |
| Split-column images (desktop) | 672 css px | **~1344 px wide** |
| Split-column images (mobile) | 346 css px | **~692 px wide** |

Minimum acceptable for any full-width slot is **1600 px wide**; 2400 px is comfortable.

### `hero-poster-480.jpg` — received 480×268, cannot be used
It would need a **2.8×** upscale in the smallest desktop slot and **6.4×** in the hero — visibly
soft at both. It could not be matched to any earlier upload, so it is not a downscale of something
already here: the larger original exists on the company side and has not been sent.

It looks like an export from a generator tool, which typically caps poster frames at 480–720 px.
**Ask the tool for a 2400 px export, or send the original file.**

### ⚠ `ChatGPT Image Dec 17, 2025, 02_27_54 AM.PNG` — must never ship
The image has **"Installation: BDT 0 / Upfront: BDT 0 / Maintenance: BDT 0"** baked into the
pixels. This directly contradicts the standing instruction that Netso makes no zero-investment
claim. It cannot be cropped out, and it cannot be used anywhere on the site — including as
background atmosphere, where a reader could still read the numbers.

If that framing is wanted as a message, it needs the qualified wording already in use
("Netso funds the system. Qualifying projects only.") — not an image claim.

---

## 7. Why video uploads fail (diagnosed 24 Sep 2026)

Part of the media checklist is now answered rather than pending. See `ANIMATION-AUDIT.md` §1 for
the full evidence and workarounds. Summary:

* **Zero video files have ever arrived** in 65 uploads. Largest file that *has* arrived: 6.5 MB.
* Sending `/private/tmp/....MP4` sends the *path text*, not the file — my sandbox is a different
  machine and that directory does not exist there.
* Workarounds, best first: (1) send a single high-resolution **frame** grabbed from the clip —
  enough for art direction at a fraction of the size; (2) re-encode small
  (`ffmpeg -i in.mp4 -t 6 -vf scale=1280:-2 -an -crf 32 out.mp4`, typically 1–2 MB);
  (3) put it behind a public link I can fetch; (4) describe it and I build the equivalent from
  assets already in the workspace — which is how the intro curtain was made.
