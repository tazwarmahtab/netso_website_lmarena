# Audit to green: entry/overflow defects, density, code-doc drift

Written against: `e7c1f5c` (master)

## Evidence chain

- Surface: `/` entry portal; `/`, `/projects`, `/about` at 390px; home §04 proofbar; home §01/§04 body copy; shared runtime; README.
- Problem: (1) two identical "Scroll to enter" cues render simultaneously on the first screen; (2) `scrollWidth` = 391 vs 390 at 390px on 3 routes — README's own QA contract says "no horizontal overflow at 390 px on any route"; (3) `DL.reveal` has no idempotence guard while every page script re-registers the same selector — two competing tweens per element; (4) dead primitives and false documentation cap SPEC/QUALITY; (5) one 151-char/line paragraph, flush proofbar cells, 9px table headers, 44 em-dashes in home copy.
- Design evidence: `BRAND.md` `:root` tokens and voice rules ("short declaratives"); `README.md` QA contract (overflow claim) contradicted by measurement (391 > 390); duplicate copy contradiction (`glyph-portal.html:49` vs `:53`); README documents a removed hero toggle and a fake-`setTimeout` form that no longer exist in code.
- Owner: `src/partials/glyph-portal.html`, `assets/css/site.css`, `assets/js/core.js`, `assets/js/{home,projects,estimate,legal,start,how,about}.js`, `src/pages/home.html`, `tools/build.py`, `README.md`.
- Scope and affected surfaces: home entry + all routes' scroll width; shared reveal behaviour on every page; documentation of record; OG card for `/estimate`.
- Uncertainty: none for measurements (recorded live at 390×844). `.gp__scroll` removal changes the entry caption pairing — verified the remaining `data-gp-hint` + "Step inside" pair carries every state including reduced-motion (hint hidden under `data-gp-motion="off"`; `Step inside` anchor remains).

## Design decision

Nine surgical corrections, each reusing an existing pattern rather than introducing one:

1. Delete the `.gp__scroll` span and its CSS — the caption pair (hint + Step inside) already carries the entry decision.
2. Clip horizontal overflow at `main` (`overflow-x: clip`) — the documented fix point: `body` already clips, but decorative absolutes (`.record::before`, `.pagehero--media::after`) leak at `main`'s level; clipping there preserves the intentional −7% bleed while cutting the 1px leak.
3. Give `DL.reveal` the same `dataset` guard `DL.lines` already has, and drop the 7 redundant page-script re-registrations — one system, one registration.
4. Remove code with zero live hooks (`DL.marquee`, `DL.tabs`, `DL.maskedVideoHero` + `.mvhero` CSS, dead `const dark`, orphan `.gp__copy/title/lead/cat` CSS) and truth-up README (form paths, hero toggle section, dead-primitive note, sitemap row).
5. Typography density: constrain the 151-char paragraph with the existing `maxw-48` utility, constrain the §04 lead, inset proofbar cells (symmetric padding), raise `minitable thead th` from 9px to the site's 10px mono-label size, and split the heaviest em-dash sentences in home §01 into short declaratives per BRAND voice.

## Reuse

- `maxw-48` utility (site.css:66) for measure constraint.
- `DL.lines`' `dataset.split` idempotence pattern for `DL.reveal`.
- Site mono-label size `0.625rem` (used by `.tag`, `.difftable th`, `.prose th`) for the table header fix.
- Standard cell padding idiom (symmetric `1.25rem 1.5rem`) matching `.statcard`/`.plist__item`.
- OG card 1200×630 crop via `sips` from the existing `how-it-works.jpg` (same family, distinct file so `/estimate` stops reusing another route's card).

## Changes

1. `src/partials/glyph-portal.html:49`
   - Change: delete `<span class="gp__scroll">Scroll to enter ↓</span>`.
   - Preserve: `data-gp-hint` caption + `Step inside` link, reduced-motion hiding of the hint.
   - Verify: exactly one entry instruction visible on the portal screen; SR users hear one cue.
2. `assets/css/site.css` (~:1203-1204, :1205-1208, :713, :580, mvhero block ~:1290-1310, after body rule)
   - Change: delete `.gp__scroll`, `.gp__copy/title/lead/cat`, `.mvhero` block; `proofbar__cell` padding → `1.25rem 1.5rem`; `minitable thead th` → `0.625rem`; add `main { overflow-x: clip; }` beside the `body` rule.
   - Preserve: `--gp-caption`/`--gp-reveal` portal variables, `.record::before`/`.pagehero--media::after` −7% bleed.
   - Verify: `scrollWidth === clientWidth` at 390px on `/`, `/projects`, `/about`; proof cells inset; table headers 10px; no dead selectors.
3. `assets/js/core.js` (:66, DL.reveal ~:154, marquee ~:531, tabs ~:573, maskedVideoHero ~:640, boot :669-683, header comment :3-4)
   - Change: remove dead `const dark`, `DL.marquee`, `DL.tabs`, `DL.maskedVideoHero` + their boot calls; add `dataset.reveal` guard to `DL.reveal`; drop "marquee, tabs," from the file comment.
   - Preserve: `DL.accordion`, `DL.dither`, `DL.scrollVideo`, `DL.editorialPoster` (live hooks verified).
   - Verify: single ScrollTrigger tween per `[data-reveal]` element; zero console errors on all routes.
4. `assets/js/{home,projects,estimate,legal,start,how,about}.js`
   - Change: delete the page-level `DL.reveal('[data-reveal="up"]', …)` lines (now redundant with core).
   - Preserve: each script's `DL.lines`, `scrubReveal`, and page-specific logic.
   - Verify: reveals still fire once per element on `/`, `/about`, `/how-it-works`, `/projects`, `/start-a-project`, `/estimate`, `/legal/*`.
5. `src/pages/home.html` (:12 wordreveal paragraph, :229 §04 lead)
   - Change: add `maxw-48` to both.
   - Preserve: copy text (§01 paragraph also gets the em-dash split); evidence/status vocabulary.
   - Verify: body measure ≤ ~80 chars/line at desktop.
6. `tools/build.py` (estimate `og:`)
   - Change: point at `/assets/img/og/estimate.jpg` (new 1200×630 crop via `sips`).
   - Preserve: every other route's OG mapping.
   - Verify: built `estimate/index.html` head references the new card; file exists.
7. `README.md` (Forms §:139, QA §:162, hero-toggle section :314-359, DL.parallax bullet :369, sitemap table :79, structure listing)
   - Change: rewrite Forms to the real three-path handoff (WhatsApp primary, mailto, optional `data-endpoint`); correct the overflow claim; replace the removed hero-toggle section with the current portal-hero description; drop the `DL.parallax` note; add `/estimate` to sitemap + `estimate.js` to the structure tree.
   - Preserve: QA commands, placeholder table.
   - Verify: no README statement contradicts shipped code.

## Scope

- Inherit: all routes get the `main` clip, single-registration reveals, and the table-header size; `/` gets the entry fix and typographic changes.
- Verify: `/projects` + `/about` (decorative bleed routes), `/how-it-works` (accordion + minitable use), `/estimate` (OG + reveals), `/404`, `/legal/*`.
- Exclude: em-dash voice pass outside home (deliberate later pass site-wide); footer "Estimate your saving" label; proof strip chunk count (documented brand hierarchy); all-caps labels / cream palette / kicker pattern (BRAND-documented deliberate decisions).

## Validation

- Product: enter through the portal → one entry cue; scroll home §01 → readable measure; submit form → WhatsApp path message unchanged.
- Interface: `/`, `/projects`, `/about` at 390×844 with zero horizontal overflow; all 9 routes 0 console errors; reduced-motion entry shows `Step inside` only; keyboard path through portal radiogroup intact.
- System: `rg` confirms zero references to deleted classes/functions; reveals registered exactly once per element.
- Repository: `python3 tools/build.py` → all 9 pages build, assert_clean passes; detector `detect.mjs --json` over changed files → no new findings vs baseline.

## Stop conditions

- Stop if clipping at `main` visually truncates any intentional bleed (check `.record::before` edges on `/projects` at 390px and 1440px).
- Stop if `estimate.jpg` crop renders unusable (fall back to keeping `how-it-works.jpg` reference and a README note).
- Stop if removing page-script reveals changes entrance order/timing visibly (compare before/after screenshots on `/about`).

## Design documentation

- After acceptance and validation: append one dated section to `README.md` ("Audit green pass, 30 Sep 2026") recording the nine decisions; update the `.impeccable/critique` trend by re-running critique storage.
