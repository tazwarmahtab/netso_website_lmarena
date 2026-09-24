# Open inputs — waiting on the company

Recorded so these don't get lost between passes. None of them block the site as it stands.

## 1. Logo file — NEEDED
Requested, not received. `IMG_4853.PNG` is a **photograph of a cap** (white NETSO on navy); a logo
cannot be traced from a photograph of embroidered fabric without producing a subtly wrong mark.

The site currently ships a rooftop glyph + "NETSO" set in Archivo 600, 0.9375rem, 0.16em
tracking (`src/partials/header.html`, `.header__logo`, plus `favicon.svg` and the PNG icon set).
That is consistent with the cap in the photo, so nothing looks wrong today.

**To replace it:** drop an SVG into `assets/img/`, then update the inline `<svg>` in
`src/partials/header.html`, `favicon.svg`, and regenerate the PNG icons
(`assets/img/favicon-96.png`, `apple-touch-icon.png`, `icon-512.png`).

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
light strip under the panels) — not for the hero, and **never** in the Chittagong Grammar School
slot (see README, "What is placeholder").
