# Animation & transition audit — godaylight.com vs Netso

**Purpose:** a single honest inventory of every motion behaviour on the reference site, what
Netso has today, and what is genuinely missing — so the gap can be closed deliberately instead
of by imitation.

Source of truth for the reference column: `/home/user/daylight/SITEMAP-ARCHITECTURE.md` §3 and §7,
which is our own byte-accurate clone of godaylight.com (every route, section, animation and
interaction, with the original timings and easings recorded).

---

## 1. Why the video will not upload

**Nothing is wrong with your files and nothing is wrong with the site.** Evidence from the
workspace:

| Fact | Value |
|---|---|
| Largest file that has ever arrived | **6.5 MB** (a PDF) |
| Largest image that has arrived | 3.6 MB PNG, 2.4 MB PNG |
| Largest video that has arrived | **none — zero video files in 65 uploads** |
| Accepted types so far | `.png` (40), `.html` (20), `.pdf` (4), `.jpg` (3) |

There are two separate failures, and it is worth separating them:

1. **Paths instead of files.** Four times you sent `/private/tmp/....MP4`. That is a path on your
   Mac. Pasting it into chat sends the *text of the path*; my sandbox is a different machine and
   `/private/tmp` does not exist there. Nothing can fetch from your disk.
2. **Type or size rejection.** Even when a file is genuinely attached, the upload transport has an
   effective size ceiling somewhere between 6.5 MB and the size of your clips. Phone and
   screen-recorded 1080p video is routinely 20–200 MB. So the pattern fits **size**, and possibly
   also an extension/MIME allowlist that excludes `.mp4`/`.mov`.

**What works reliably:** images under ~4 MB, PDFs, HTML. What has never worked: video.

**Practical workarounds, best first:**

1. **Send one frame instead.** A single high-resolution still extracted from the clip (screengrab
   a clean frame, then crop) gives me 90 % of the art direction value at 1 % of the size. If you
   want the *motion*, this is enough for me to match its look.
2. **Re-encode small.** If you can run one terminal command, this produces something that should
   pass: `ffmpeg -i input.mp4 -t 6 -vf scale=1280:-2 -an -crf 32 out.mp4` — typically lands near
   1–2 MB.
3. **Put it somewhere I can fetch.** A public link (Drive/WeTransfer with a direct URL, or any
   static host) — then I download it myself and the upload ceiling is irrelevant.
4. **Describe it and I build it.** I can render the equivalent motion from the assets already
   here. The intro below was built exactly that way.

---

## 2. Reference inventory — every animation on godaylight.com

### 2.1 Global runtime

| # | Behaviour | Detail recorded from the reference |
|---|---|---|
| R1 | **Smooth scroll** | Lenis, `lerp: .12`, driven by the GSAP ticker, `lenis.on('scroll', ScrollTrigger.update)` |
| R2 | **Scroll lock** | Destroys Lenis and pins `<body>` at `-scrollY` (mobile menu); modals use `overflow:hidden` + `lenis.stop()` |
| R3 | **Font-gated start** | All page scripts wait for 4 brand fonts (3 s timeout) *before* splitting text, then `ScrollTrigger.refresh()` |
| R4 | **Anchor scrolling** | `a[href^="#"]` routed through `lenis.scrollTo` |
| R5 | **Scale-to-fit hook** | `DL.scrollAnimation` — ratio `(scrollY-(n+top))/(l-n)`, offsets `[[.5,.5],[1,0]]`, `scaleToFit` |

### 2.2 Header & navigation

| # | Behaviour | Detail |
|---|---|---|
| R6 | **Header pill slide-in** | `y:0` from off-screen, `delay .5`, `1.2 s`, `expo-out`. On the home page it *waits for `dl:introPlayed`* |
| R7 | **Nav hover** | opacity 60 % |
| R8 | **CTA button** | background is a looping video (`daylight-button.mp4`) |
| R9 | **Mobile menu** | card radius 12→20, shadow `.1`→`.15`, 72 px bar, hamburger↔X swap (opacity .22 s / rotate .3 s), menu `max-height 0→420 px`, rows 18 px/500 with `#E8E8E4` borders, overlay `rgba(10,8,4,.5)` `.35 s`, body locked |
| R10 | **Footer** | `min-h-lvh`, background video + poster |

### 2.3 Hero (shared across `/`, `/product`, `/about`, `/partners`)

| # | Behaviour | Detail |
|---|---|---|
| R11 | **Logo intro** | Rive `logo-intro.riv` — a *timeline-animated vector logo*, not a CSS fade |
| R12 | **Split-line title reveal** | eyebrow / title / sub revealed as masked lines via SplitText |
| R13 | **Clip window** | A coloured panel whose `clip-path: inset()` animates `[30,15,30,67.15] → [35,20,35,72]` desktop, `[22.29,28.27,53.83,36] → [26,32,57,41]` mobile, **with four frame lines**, scrubbed by scroll |
| R14 | **Mouse parallax** | on hover-capable devices only |
| R15 | **Info labels** | live technical readouts (kWh generated, battery level) |
| R16 | **Video background** | Mux streamed, rendition chosen by container width (low/medium/high), IntersectionObserver play/pause, poster fallback, fires `dl:videoready`; **home waits for the video before starting** |
| R17 | **Completion event** | dispatches `dl:introPlayed`, which releases the header reveal |

### 2.4 Section components

| # | Behaviour | Detail |
|---|---|---|
| R18 | **USP sticky media** | sticky media column; three media panels cross-fade **and scale** as copy scrolls past |
| R19 | **Diptych clip window** | `DL.clipWindow` — panel inset + four frame lines scrubbed by scroll, plus mouse parallax (used on Step-into, two About diptychs, Partners) |
| R20 | **Sticky step stack** | phone UI, Rive **install scrub**, Rive **power-on + chart draw** |
| R21 | **Horizontal pinned explainer** | product page: section pinned, content `translateX` by scroll |
| R22 | **121-frame canvas sequence** | product page image-sequence scrubbed by scroll |
| R23 | **Network Rive canvas** | `network.riv` scrubbed by scroll |
| R24 | **Stats + video parallax** | Why-Daylight section |
| R25 | **Investors marquee** | 40 px/s, pauses on hover |
| R26 | **CEO letter → canvas** | text rendered into `<canvas>` |
| R27 | **Video sound toggle** | About page |

### 2.5 Micro-interactions

| # | Behaviour | Detail |
|---|---|---|
| R28 | **Footer scramble links** | brackets nudge ±5 px, label scrambles (`ScrambleTextPlugin`, upperCase, .5 s) |
| R29 | **FAQ accordion** | height tween on `(0.16,1,0.3,1)`, `aria-expanded` |
| R30 | **Qualify modal** | 2 steps, validation, address prefill, Esc/backdrop close, scroll restore |
| R31 | **Partner form** | phone mask `(555) 000-0000`, "Sending…", success card |
| R32 | **Cookie banner + settings modal** | consent object persisted to a cookie |
| R33 | **Brand playground** | physics, drag, paint, palettes, copy/download, flash, screensaver, mobile card |
| R34 | **Brand hero ping-pong video** | reverses on end |

---

## 3. Netso today

### 3.1 Primitives (`assets/js/core.js`) — all auto-initialised at load

| Primitive | Behaviour | Where used |
|---|---|---|
| `DL.lines` | masked split-line reveal | 39 `[data-lines]` across all pages |
| `DL.reveal` | fade/translate reveal | 25 `[data-reveal]` |
| `DL.scrubReveal` | scrubbed reveal tied to scroll | home ×2, how ×2, about ×3, start ×1 |
| `DL.countUp` | number count-up on enter | home proof bar |
| `DL.marquee` | continuous marquee | wired, available |
| `DL.accordion` | FAQ open/close + `aria-expanded` | `/how-it-works` (7 items) |
| `DL.tabs` | tab groups | wired, available |
| `DL.initForm` | validation + submit + `netso:leadSubmitted` | `/start-a-project` |
| `DL.parallax` | **defined, zero call sites** ← the only unused primitive |
| Lenis smooth scroll, `DL.lockScroll`, `DL.scrollTo`, header reveal | | global |

### 3.2 Hero

| Behaviour | Status |
|---|---|
| Layered sticky stage (roof pins; argument rises over it) | **built** |
| Rooftop → assessed → deployed → energy flowing sequence | **built**, scroll-driven + reversible |
| Timed fallback so a non-scrolling visitor still sees the transformation | **built** |
| "Today / With Netso" state control | **built** (works under reduced motion) |
| Image parallax (3 % on the `<img>` inside the sticky stage) | **built** |
| **Intro curtain — logo over a live gradient, dissolving into the hero** | **built** (see §5) |

---

## 4. Gap table

Legend: **have** = equivalent exists · **missing** = worth building · **skip** = deliberately not
copying.

| Ref | Behaviour | Netso | Note |
|---|---|---|---|
| R1 | Lenis smooth scroll | **have** | same library, same lerp |
| R2 | Scroll lock | **have** | `DL.lockScroll` |
| R3 | Font-gated start | **have (deliberately weaker)** | we do *not* gate on fonts — nothing may delay first meaning |
| R4 | Anchor scrolling | **have** | `DL.scrollTo` |
| R5 | Scale-to-fit hook | **skip** | exists only to serve the reference's decorative panels |
| R6 | Header slide-in | **have** | `.header.is-in` |
| R7 | Nav hover opacity | **have** | |
| R8 | Video CTA button | **skip** | a video inside a button is decoration with a byte cost |
| R9 | Mobile menu choreography | **have (simpler)** | clean open/close, no radius morph |
| R10 | Video footer | **skip** | weight, and no narrative job |
| R11 | **Rive logo intro** | **missing (UNBLOCKED — see the note)** | needs the vector logo. Our curtain is the CSS equivalent of R11 and already ships |
| R12 | Split-line title reveal | **have** | `DL.lines` |
| R13 | **Clip-window diptych** | **missing** | the single most transferable idea on the reference. See §6 |
| R14 | Mouse parallax | **partial** | hero image only; the reference applies it per-section |
| R15 | Info labels | **have** | the four-step model strip |
| R16 | Video hero background | **skip** | measured: a 5 s loop is ~3–4 MB ≈ 19 s on 1.6 Mbps vs 0.94 s FCP today |
| R17 | `dl:introPlayed` event | **have** | `dl:introPlayed` dispatched already |
| R18 | USP sticky media cross-fade | **missing (worth building)** | we have sticky (hero) but no sticky-media-plus-copy column |
| R19 | Diptych clip window | **missing** | = R13 |
| R20 | Sticky step stack w/ scrubbed Rive | **partial** | `/how-it-works` has steps; no scrub-linked install animation |
| R21 | Horizontal pinned explainer | **skip (until P0 locked)** | high cost, and P2 by your own priority order |
| R22 | 121-frame canvas sequence | **skip** | 121 frames is megabytes for decoration |
| R23 | Network Rive canvas | **missing (cheap, on-brand)** | a scrubbed vector network map fits the infrastructure story |
| R24 | Stats + video parallax | **have** | `DL.scrubReveal` on the stat grid |
| R25 | Investors marquee | **skip** | no investor list to show |
| R26 | CEO letter → canvas | **skip** | we have the founder story as type, which is better |
| R27 | Video sound toggle | **skip** | no video |
| R28 | Footer scramble | **missing (cheap, characterful)** | `ScrambleTextPlugin` isn't vendored; a ~15-line vanilla version does it |
| R29 | FAQ accordion | **have** | verified live: 7 items, opens, `aria-expanded` flips |
| R30 | Qualify modal | **have (as a page)** | `/start-a-project` is a full page by your direction, not a modal |
| R31 | Partner form masking | **have** | `DL.initForm` |
| R32 | Cookie banner | **missing (P1 legal)** | ships with the final privacy policy |
| R33 | Brand playground | **skip** | that is a brand-kit curiosity, not commercial clarity |
| R34 | Brand ping-pong video | **skip** | no brand film |

---

## 5. The intro, as built

Matches your request — *logo over a live gradient background that dissolves into the hero* — and
scoped to the standing constraints.

**Runtime contract (measured on the live site, from the `load` event):**

| t | State |
|---|---|
| 0 ms | Curtain opaque, gradient drifting, logo and wordmark visible |
| 140–420 ms | Logo rises with a blur-out; the sun dot scales in |
| 220–1370 ms | The rule under the logo fills left→right |
| **800 ms** | Hold ends, **dissolve begins** |
| 1218 ms | opacity 0.12 |
| ~1400 ms | opacity 0.02 |
| **1564 ms** | Node removed from the DOM |

**How it stays honest:**

* **It ends by itself.** Pure CSS `animation` with `forwards`; no JavaScript gate. If every script
  fails, the curtain still clears at 1.7 s.
* **It never delays meaning.** 1.56 s to gone, versus the reference's video-gated hero which starts
  only after the video loads.
* **Reduced motion:** `display: none`. It does not exist.
* **Repeat views:** `sessionStorage` flag + `html.no-intro` set in `<head>` before first paint, so
  there is no flash on the second page.
* **Any interaction skips it:** wheel, touch, key or pointer removes it immediately.
* **`pointer-events: none`** throughout — the visitor can always click through it.
* **`aria-hidden`, no focusable content** — it never reaches a screen reader or the tab order.
* **Brand colours only:** solar orange, lime, flag green, flag red family, plus the mark's own
  `#E3841B`. No new palette.

**To tune it,** everything lives in the `INTRO CURTAIN` block at the end of `assets/css/site.css`:
`introLift`'s `800ms` delay is the hold, its `900ms` duration is the dissolve length, and the four
`radial-gradient` stops in `.intro__grad` are the palette.

Captures: `tools/shots/intro-dissolve.jpg`, `tools/shots/intro-mobile.jpg`.

---

## 6. Recommended order for reverse-engineering the rest

**P0 — no new motion (your own priority order stands).** The hero, the evidence layer and the
founder facts are the acceptance criteria; nothing below changes that.

**P1 — cheap, high-character, on-brand**

1. **Footer scramble links (R28).** ~15 lines of vanilla JS, no plugin. The reference's single most
   recognisable micro-interaction, and it costs nothing.
2. **Network scrub canvas (R23).** A vector network of sites, drawn on scroll. Directly on-brand for
   *infrastructure portfolio*, and it is vector — a few KB.
3. **`DL.parallax` — wire it or delete it.** It is currently the only primitive with zero call
   sites. Either use it for per-section depth or remove it; dead code in a shared runtime is a trap
   for the next person.

**P2 — the genuinely good idea (R13/R19, the clip window).** This is the one to transplant. A panel
whose `clip-path: inset()` opens as you scroll, with frame lines, applied to the project record —
the roof revealed through an aperture. It is the reference's best contribution to the *category*,
and it needs no video, no Rive and no new assets.

**Never copy:** the dark cinematic treatment, the residential framing, and — most importantly — the
video-gated hero. The reference makes the visitor wait for a video before the page means anything.
That is precisely the behaviour the "no animation may delay understanding" constraint forbids.

---

## 7. What the reference cannot give us

Worth saying plainly, because an audit that only lists gaps is misleading. godaylight.com is a
**consumer solar brand**: it sells to homeowners, with a promise of "$0 electricity bills." Its
motion is built to make a residential product feel effortless and desirable.

Netso sells **infrastructure to businesses**, and the thing that has to land in ten seconds is
ownership plus a PPA. A lot of the reference's density would actively work against that: the
clip window, the marquees, the Rive scenes and the 121-frame sequence all add *atmosphere*, and
atmosphere is the enemy of a commercial argument. The reason to take R13 and R28 is not that they
look good — it is that they can be made to **carry a fact** (the record, the portfolio size).
Anything that cannot carry a fact stays out.

---

## 8. Intro performance — how it was kept off the critical path

The intro is a full-viewport overlay, so it had to be paid for honestly. Measured on the live site
at 390×844, 1.6 Mbps / 150 ms latency / **4× CPU throttling**, median of 3 runs:

| Build | FCP with intro | FCP without | Cost |
|---|---|---|---|
| First version (`filter: blur(62px)`, masked grid, oversized layer) | 1128 ms | 968 ms | **+160 ms** |
| Blur removed — softness moved into the gradient stops | 1088 ms | 960 ms | +128 ms |
| Full-viewport `mask-image` on the grid also removed | 1012 ms | 972 ms | +40 ms |
| Grid folded into the gradient element as extra `background-image` layers | **1016 ms** | 960 ms | **+56 ms** |

**What was learned and is worth keeping:** on a throttled device the cost of an overlay scales with
the number of full-viewport layers that need rasterising, and a `filter: blur()` over the viewport is
expensive — but a full-viewport `mask-image` was **more** expensive still (+120 ms on its own, more
than the blur). The final build uses **two elements** (gradient, logo), gets its softness from
gradient falloff rather than a blur, and carries the grid as two extra `background-image` layers
on the element that already exists — so the grid is visually present at almost no cost.

Total added cost: **~56 ms of first contentful paint, once per session.** Base FCP on this build is
960 ms against a 2028 ms starting point. The intro is not on the critical path for meaning: the
hero headline is in the markup and the curtain is `pointer-events: none` throughout.
