# Netso Energy — website v1

Static marketing site for Netso Energy: *the asset-owner layer for distributed C&I solar
in Bangladesh.* Built from scratch as its own project — the interaction engine (smooth
scroll, scroll-driven reveals, sticky/scrub sections, form handling) is reused from the
Daylight reference build; every colour, font, photograph, sentence and logo here is
Netso's own.

## Hero — locked (re-tested 24 Sep 2026)

**Direction A is the headline. The switching UI is gone.**

> **Your roof. / *Now an energy asset.***
> Netso develops, finances, owns and operates distributed energy infrastructure for Bangladesh's businesses.
> *You use the power. We build and operate the asset.*

The `?hero=` query parameter, the `.hero__variant` review badge and the `DIRECTIONS` map in
`assets/js/home.js` were removed in this pass, so the headline now lives only in
`src/pages/home.html`. Directions B and C are recorded in `BRAND.md` as rejected-for-now, with
the reason (C is the most literal and least owned; B needs the walk-back sub-line).

Hero proof strip reads, left to right: **Contracted · 80 kWp Chittagong Grammar School ·
PPA signed, pre-construction** — the category label, the asset, then the exact contract and
build state, above the fold.

**Direction A/B/C were re-rendered and compared this pass** (`tools/shots/compare-desktop.jpg`,
`compare-mobile.jpg`). Result: A holds. B's supporting copy needs to explain qualification and
contracting before the revenue claim is true, and that walk-back runs to five lines on a 390 px
screen — the qualification becomes the hero. C implies nothing false but describes the visitor's
action rather than the company's. **A + the financing cue** was also tested and rejected: two
variant ideas stacked in one hero.

The hero now also carries, in place of a bare ``You use the power…``, the mechanism and its
boundary — ``…We build and operate the asset — Netso funds the system. Qualifying projects
only.`` — so the financing question is answered above the fold without a promise that every roof
qualifies.

## Source material (Sept 2026 intake) — what it changed

The 51 MB upload in `uploads/` was read for company facts: **`Netso energy Pitch Deck VC.pdf`**
(primary), the three `4H-*` proposal decks, and `Pink & Black Personal Name Logo.pdf`. The
remaining files are third-party reference material (Indian RTS/RESCO decks, CAPEX-vs-RESCO
comparisons, funding articles) and design references — not Netso sources.

**Facts now on the site, from source:**

| Fact | Source | Where |
|---|---|---|
| Founder & CEO: Tazwar Mahtab; the company is Netso Energy Ltd., based in Dhaka, working across Dhaka and Chattogram | 4H proposal decks (16–18 Sep 2026), VC teaser | `/about` §06 Origin |
| CGS: 80 kWp, **LOI executed at a tariff below the BERC benchmark, PPA in finalisation** | VC teaser, Traction table ("LOI SIGNED" / "PPA TO BE AGREED") | hero proof strip, home §04, `/projects` |
| Pipeline: ~400 kWp commercial programme (proposal stage) · ~200–300 kWp plastic-recycling plant (MOU signed) · 10 further Chattogram sites (early origination) · first close ≈480 kWp | VC teaser, Traction table | home §07, `/projects` §pipeline |
| Tk 15.36/kWh BERC grid benchmark (June 2026 tariff order) · 5,500 MW 2030 target · ~213 MW installed (3.9%) | VC teaser, market slides | home §01 |
| Tk 11.50–12.00/kWh indicative PPA band | VC teaser ("INDICATIVE") | `/projects` §pipeline |

**Status of the first asset — settled with the company, 24 Sep 2026.** The VC teaser records
CGS as *LOI signed / PPA to be agreed* and calls it the *nearest-term* asset; the 4H sales decks
call it "closed — first operating reference". Those disagree, so the site was put on the
teaser's conservative reading and then confirmed by the company: **the PPA is signed, the system
is pre-construction.** The site now says exactly that on the home proof strip, home §04,
`/projects` §active and §pipeline, and `/about` §05–06, with "the system is not yet built —
construction follows the agreement" stated once rather than implied.

**When construction completes or commissioning is recorded, three edits flip the site to
"operating":** the home hero proof strip chip, the home §04 lead, and the CGS block + pipeline row
on `/projects`. Nothing else changes — the copy was written so status is the only variable.

**Publishing decisions taken 24 Sep 2026:** Four H Group is **named** in the ~400 kWp pipeline
row (source-backed; it is their third-party proposal, not a Netso claim). The CGS tariff is
published as **≈35% below the BERC grid benchmark** rather than the absolute Tk 10.00/kWh figure.
The plastic-recycling MOU counterparty stays **unnamed** — the name does not appear anywhere in
the source material; add it in the third `plist__item` block when the company supplies it.

**Deliberately not published** (internal financial material, no place on a public site): the
US$500k SAFE / US$3M cap / 20% discount raise, equity IRR and DSCR by project (~20% sponsor equity,
IDCOL SPV applicability), platform/sponsor structure, screening model outputs, the absolute
first-asset tariff, and the 4H data-room figures (2,500 kWp programme economics, per-100 kWp
values, I-REC position).

## V1 sitemap

| Route | File | Purpose |
|---|---|---|
| `/` | `index.html` | The commercial narrative: what Netso is → the problem → the model → why us → who we serve → proof → pipeline → vision → about → CTA |
| `/how-it-works` | `how-it-works/index.html` | The four phases: Develop · Finance + Build · Own + Operate · Buy the Power |
| `/projects` | `projects/index.html` | Validated/active projects, then development pipeline (clearly separated) |
| `/about` | `about/index.html` | Beliefs, why Bangladesh, why distributed C&I, asset-owner thesis, company today, origin, roadmap, capital |
| `/start-a-project` | `start-a-project/index.html` | Primary conversion page — facility assessment enquiry form |
| `/legal/privacy` | `legal/privacy/index.html` | Privacy policy (draft) |
| `/legal/terms` | `legal/terms/index.html` | Terms of service (draft) |
| `/404` | `404.html` | Not found |

## Run it

```bash
cd netso
python3 tools/build.py         # regenerate all pages from src/
python3 tools/serve.py 8100    # http://localhost:8100
```

Deploy: any static host (Netlify / Vercel / S3 / nginx). `tools/serve.py` shows the two
rules you need in production: directory paths resolve to `index.html`, and unknown paths
serve `404.html` **with a 404 status**.

## Structure

```
netso/
├── src/partials/   skip · header · mobile-menu · footer
├── src/pages/      home · how-it-works · projects · about · start · privacy · terms · 404
├── assets/css/     fonts.css (Archivo, IBM Plex Mono, Instrument Serif — SIL OFL, self-hosted)
│                   site.css (the whole design system)
├── assets/js/      core.js (runtime) · home.js · how.js · projects.js · about.js · start.js · legal.js
│                   vendor/ (gsap, ScrollTrigger, SplitText, lenis)
├── assets/img/     generated placeholder photography + brand/ + og/ social cards
├── assets/svg/     logo lockups · favicon.svg
└── tools/          build.py · serve.py · qa.py · shots/
```

`tools/build.py` holds the page table (route, title, description, OG image, page script).
Edit content in `src/pages/*.html`, then rebuild. Don't add whitespace between top-level
tags in partials/pages — the builder concatenates fragments so the DOM stays free of
stray line boxes.

## Editing the site

* **Copy** → `src/pages/*.html` (each section is a `<section>` with an `id`).
* **Design tokens** → `:root` in `assets/css/site.css` (colours, type stacks, spacing, header height).
* **Navigation / footer / CTA labels** → `src/partials/`.
* **Photos** → drop replacements into `assets/img/` keeping the same filenames, then delete
  the "Representative imagery" credit captions in the markup.
* **Meta / OG images** → the `PAGES` table in `tools/build.py` and `assets/img/og/`.

## Forms

`/start-a-project` collects the full facility enquiry (contact, location, facility type,
rooftop area, consumption, tariff, sanctioned load, existing solar, notes, consent) with
field-level validation, phone normalisation and a success state.

**There is no backend.** On submit, `DL.initForm` (in `core.js`) validates, reveals
`.form-status`, and dispatches `netso:leadSubmitted` with the payload. To go live, either

1. listen for the event somewhere in your stack —
   `document.addEventListener('netso:leadSubmitted', e => fetch('/api/lead', {method:'POST', body: JSON.stringify(e.detail)}))`, or
2. replace the `setTimeout` block inside `DL.initForm` with your real POST.

Hook candidates: your CRM (HubSpot/Zoho), a transactional mail endpoint, or a serverless
function. The capital/partner enquiry at `/start-a-project#capital` uses `mailto:` today —
swap it for the same endpoint once CRM routing exists.

## QA

```bash
pip install playwright && python3 -m playwright install chromium
python3 tools/qa.py                       # all routes, desktop: console errors + failed requests
python3 tools/qa.py / /about --mobile     # 390×844 pass
python3 tools/qa.py / --scroll=12         # scroll through and capture screenshots
```

Screenshots land in `$SHOTS_DIR` (default `/tmp/netso-shots`); curated contact sheets are
in `tools/shots/`. Current state: **0 console errors, 0 failed requests, no horizontal overflow at 390 px on any
route.** Production notes for this pass:

* The hero headline, sub-line, model line, CTAs, model steps and proof strip all fit inside the
  first viewport at 1440×900 and 390×844 (verified: proof strip bottom at 824 px in an 844 px viewport).
* **Understanding never waits on assets.** Headlines use transform-only introductions, an inline
  failsafe removes the animation state after 4.5 s, and the hero script runs at DOMContentLoaded
  rather than `window.load`. A headline is readable from the first paint even at 1.6 Mbps with
  4× CPU throttling, and with JavaScript disabled entirely.
* Hero media is WebP (211/220 KB desktop, 143/155 KB mobile crops) and preloaded; everything
  below the fold is `loading="lazy"`.
* `prefers-reduced-motion: reduce` disables Lenis, the rooftop sequence (the installed state is
  shown immediately), the survey/flow animations, marquee and counters.

## What is placeholder

| Type | Where | Status |
|---|---|---|
| Photography — general | `assets/img/*.jpg` | AI-generated placeholders (no stock licences), each flagged with an `INTERNAL` comment in the source at the point of use. Replace with commissioned photography as it becomes available. |
| Photography — CGS | home §04 · `/projects` §active · `/about` §05 | **No photograph is used for the contracted project at all.** The slot carries a `.record` status panel instead, because there is no installed system to photograph and a stand-in image under a named project reads as documentary evidence. `school-campus.jpg` has been deleted so the stand-in cannot creep back. When the system is built, replace the `.record` block with a `<figure>` — the substitution point is marked in each source file. **Do not put stock or generated imagery in this slot.** |
| Founder story | `/about` §06 Origin | **Founder facts now published** from source: Tazwar Mahtab, Founder & CEO; Netso Energy Ltd.; Dhaka base, Dhaka + Chattogram. Still **not** stated, because the sources do not contain them: founding year, company registration number, the founder's own background. An `INTERNAL` comment in `src/pages/about.html` lists them. Do not invent them. |
| Legal | `/legal/*` | No visible "draft" copy. Review items (retention schedule, processor list, governing law, entity details) are held as HTML comments under `INTERNAL — before launch` in `src/pages/privacy.html` and `terms.html`. The pages deliberately state no jurisdiction, registration detail or contractual term that hasn't been confirmed. |
| Pipeline | `/projects` §pipeline + home §07 | **Published this pass**, every row checked against the Sept 2026 deck: stage + capacity + evidence state per project, approximate capacities marked approximate, unnamed counterparties until contract. New component: `.plist` in `site.css`. |
| Metrics | home hero + §01 + §04, `/projects` | Only source-backed figures: 80 kWp, LOI executed, PPA in finalisation, Tk 15.36/kWh BERC benchmark (June 2026), 5,500 MW 2030 target, ~213 MW installed, Tk 11.50–12.00/kWh indicative band. Add more only when sourced. |
| `hello@netso.energy` | header, footer, forms, capital CTA | Placeholder address — replace with the real one. |
| Fonts | `assets/css/fonts.css` | Archivo + IBM Plex Mono + Instrument Serif (Google Fonts, SIL OFL, self-hosted). Swap for licensed brand fonts when they exist; see `BRAND.md`. |

## Layered hero stage (added 24 Sep 2026)

The hero photograph now **pins while the opening argument rises over it** — the depth effect,
built from the two hero WebPs already on the site. No new assets, no video file.

How it works (`assets/css/site.css`, block headed "LAYERED HERO STAGE"):

* `.hero` is `min-height: 175svh` (140svh mobile). **The extra height is the dwell** — sticky
  travel comes from free space in the content box, so it must be `min-height`, never
  `padding-bottom` (padding puts the space outside the content box and the stage gets zero
  travel).
* `.hero__stage { position: sticky; inset: auto; top: 0; }` — **`inset` must come before `top`**,
  or `inset: auto` resets it and sticky silently does nothing.
* `.hero__inner` is pulled back over the stage with `margin-top: -100svh` so the copy sits in the
  first viewport exactly where it did before.
* `#opportunity` carries `margin-top: -75svh` (-40svh mobile) so it overlaps the pinned stage.
* `.hero` gets `isolation: isolate`, so `.hero__inner` (z-index 2) cannot paint over the incoming
  section (z-index 1) if the geometry ever changes.
* The parallax moved from `.hero__stage` to the `<img>` elements inside it — translating a sticky
  element would expose its edge. Image scale went 1.08→1.12 at rest so a 3% drift never reveals a
  border.
* `prefers-reduced-motion: reduce` restores the plain one-viewport hero: no dwell, stage back to
  `position: absolute`.

Verified: hero copy is inside the first viewport at both 1440×900 (proof strip bottom 872) and
390×844 (824), the argument paints over the pinned roof (`elementFromPoint` returns the section),
and FCP on slow mobile is unchanged at ~940 ms. Capture sheet: `tools/shots/hero-layers.jpg`.

## Performance (measured, 24 Sep 2026)

Slow-mobile profile: **1.6 Mbps / 150 ms RTT / 4× CPU throttle**, 390×844.

| | Before | After |
|---|---|---|
| First contentful paint | 2,028 ms | **1,068 ms** |
| DOMContentLoaded | 3,399 ms | 1,740 ms |
| Total transfer | 864 KB | 605 KB |
| Fonts (10 files) | 254 KB | **68 KB** |

What produced it:

* **Server compression.** `tools/serve.py` had no gzip at all, so local testing was pessimistic:
  `site.css` went over the wire at 51 KB and the home page HTML at 36 KB. Text assets are now
  gzipped on the fly (CSS → 10 KB, HTML → 10 KB). `Content-Encoding: gzip` + `Vary` are set, and
  the 404-routing behaviour is unchanged.
* **Font subsetting.** `tools/subset_fonts.py` trims the ten self-hosted faces to the glyphs the
  site uses (189-character set with a safety margin; the site uses ~105 today). Archivo is a
  variable font carrying a width axis the design never uses and weights up to 900 the CSS never
  asks for (~600 max) — pinning `wdth` to 100% and limiting `wght` to 400–700 is most of the
  73% saving. Verified: **no glyph the site uses was lost**, and only `→` and `≈` are absent,
  which the originals never had either. Originals are kept in `assets/fonts/_original/`;
  `--restore` puts them back. If copy ever needs a character outside the set, re-run the script.
* **Hero image priority.** The installed-state layer sits above the fold in the DOM and was
  downloading at the same priority as the ordinary-roof layer, competing for bandwidth on a slow
  link even though it isn't needed until ~3 s. It is now `fetchpriority="low"`; the first paint
  layer keeps `fetchpriority="high"`.
* **Image right-sizing.** Split-column photos were 1408 px wide for a ~640 px slot; they are now
  1200 px (sharp to DPR 1.9, and they are placeholders). Orphans removed:
  `hero-rooftops.jpg` (286 KB) and `school-campus.jpg` (332 KB), the latter superseded by the
  project-record panels.

Lazy-loading audit: 6 of 8 images on the home page carry `loading="lazy"` — the two exceptions
are the hero layers, which must be eager. All images carry explicit `width`/`height`.

## Build output hygiene

Internal notes live in `src/` so the company can find them, and are stripped at build:

* `tools/build.py` removes every `<!-- INTERNAL … -->` and `<!-- TO BE SUPPLIED … -->` block
  before writing a page, then runs `assert_clean()`, which **fails the build** if draft
  language (`<!-- internal`, `todo:`, `draft copy`, `lorem ipsum`, …) survives into output.
* Verified on the served site: no route contains an internal comment.
* Vendor folder was pruned this pass — `rive.js` and `ScrambleTextPlugin.min.js` were unused.
  `assets/js/vendor/` now holds only what the pages import: gsap, ScrollTrigger, SplitText, lenis.

## Social cards & manifest

`tools/make_og.py` generates the five 1200×630 Open Graph cards into `assets/img/og/`
(one per route; the 404 and legal pages reuse `home.jpg`). It converts the **self-hosted
woff2 brand fonts** at run time via fonttools+brotli, so the cards use the real Archivo and
Instrument Serif faces and nothing is fetched. Re-run it whenever a page title or the
featured image changes:

```
pip install brotli fonttools      # once
python3 tools/make_og.py
```

`manifest.webmanifest` is written to the site root and linked from every page head, with
`og:image:width/height`, `twitter:image` and the existing favicon set.

## Evidence discipline

`/projects` defines four evidence states — **Verified · Corroborated · Interpretive ·
Unresolved** — and every claim on the site is labelled accordingly (chips in the UI).
Pipeline projects are never presented as installed or operational. Keep this convention
when you add content: it is doing real work for credibility with facility owners *and*
with capital partners.

## Hero sub-line (changed 24 Sep 2026) — the comprehension lever

The headline was never the problem. The **sub-line** was: "distributed energy infrastructure for
Bangladesh's businesses" is a category phrase that names no roof, no ownership and no PPA — the
three things the 10-second test measures. A visitor reading only that line has no path to
"they develop and operate solar infrastructure on commercial rooftops."

Four candidates were rendered in the live hero at 1440 and 390 (`tools/shots/subline-candidates.jpg`,
`subline-mobile.jpg`) and measured for line count and first-viewport fit. All four fit; V2 was
chosen on content:

> **Netso develops, finances, owns and operates solar infrastructure on commercial and industrial
> rooftops. The customer buys the power — not the system.**

Why it wins:

* **"commercial and industrial rooftops"** supplies the missing noun. The headline says *your roof*;
  without this, "roof" could read residential, and "energy asset" is abstract.
* **"The customer buys the power — not the system"** is the distinction the model rests on, stated
  as a contrast the way the comparison table states it. It is what stops the answer being
  "they install solar panels."
* "develops, finances, owns and operates" is kept verbatim — it is the ownership signal.
* V4 (adding "under a long-term PPA") was rejected as one word too many: 3 lines desktop and 4 on
  mobile, and the PPA is already in the model line and the four-step strip below it.

Note the deliberate non-change: the sub-line does **not** try to carry the headline idea as well.
The four-step strip one line below already names the mechanism, and the model line carries
financing and its qualification. Each element holds one job.


## Hero state control + scroll-driven sequence (24 Sep 2026)

Two additions to the hero, both reusing the layers already on the page — **no new media and no
additional bytes**.

### 1. "Today / With Netso" control

A two-state toggle in the hero's top row, in the dead space opposite the eyebrow. It switches the
same roof between **as it is today** and **developed and operating**.

The mechanic is borrowed from a reference hero (`motionsites.ai` reposit) that toggles one building
between Morning and Night. Two things from that reference were deliberately **not** copied:

* **The dark, cinematic treatment.** It conflicts with the standing instruction for a clean, calm,
  component-showcase feel rather than cinematic dark pages.
* **The residential house.** Netso's hero must read as a large commercial/industrial building in
  Bangladesh, not a house — that is the whole positioning.

What was worth taking is the *structure*: one building, one control, one outcome line.

Implementation notes:

* Wired **outside** the `reduceMotion` branch on purpose. It is a static comparison, not motion, so
  reduced-motion visitors get it too — under reduce the hero opens on the installed state and the
  control switches between the two with no animation.
* **Scrolling always wins.** A manual choice holds until the visitor scrolls; the next scroll event
  clears it and the scroll sequence resumes, so the control and the sequence never fight.
* At the middle stage (site assessed) neither button reads as selected, which is accurate — that
  moment is between the two states.

### 2. Scroll drives the rooftop sequence

The rooftop → surveyed → solar → energy-flow sequence is now driven by scroll progress through the
hero's dwell zone, and **reverses when you scroll back up**.

A timed fallback (1.6 s delay) still advances the story for a visitor who never scrolls, and stands
down the instant they do. Without it, anyone who only looks at the first screen — the majority —
would never see the roof become an asset.

Both paths verified: scroll-driven advance and reverse, no-interaction fallback, manual control,
control-to-scroll handoff, and reduced motion. Capture: `tools/shots/hero-compare-toggle.jpg`,
`hero-compare-toggle-mobile.jpg`. First-viewport proof strip still fits at 1440×900 and 390×844;
no horizontal overflow on either.

## Intro curtain + animation audit (24 Sep 2026)

* **`ANIMATION-AUDIT.md`** — every animation on the reference site (godaylight.com) inventoried from
  our own clone's architecture notes, side by side with what Netso has, with a gap table and a
  recommended order. 34 reference behaviours: 13 have equivalents, 9 are missing and worth building
  in priority order, 12 are deliberately skipped with reasons.
* **Intro curtain** — logo over a live brand gradient that dissolves into the hero. Built to the
  standing constraints: pure CSS, ends by itself at 1.56 s, `display: none` under reduced motion,
  skipped on repeat views via a pre-paint `sessionStorage` check, `pointer-events: none`, and any
  scroll/key/click removes it instantly. Cost measured and minimised: **+56 ms FCP** on a throttled
  mobile connection (from +160 ms in the first version). Profile in `ANIMATION-AUDIT.md` §8.
* **One dead primitive:** `DL.parallax` is defined in `core.js` with zero call sites. Wire it or
  delete it — dead code in a shared runtime is a trap.

