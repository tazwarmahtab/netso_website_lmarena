# Netso Energy — Deep Audit (post hero/portal merge)
**Date:** 2026-09-28 · **Scope:** full static site (`src/`, `assets/`, `tools/`, built output) with focus on fallout from the "merge hero into the glyph portal" change (`6d7ad11`) and the video-length change (`72001f0`).
**Method:** static analysis only. No headless browser is available in the sandbox, so scroll/GSAP behaviour and paint order were **not** run — those items are marked *(needs live verification)*. `tools/qa.py` (Playwright) and `tools/build.py` were attempted; qa.py cannot run here.

---

## 1. Verdict

The site is structurally healthy: all 9 routes build, all JS lints clean, every internal link resolves, every image has `alt`, one `<h1>` per page, canonical/OG/manifest/icons/font-preloads all present. The recent merge is wired correctly (single `<h1>`, portal→content hand-off, reduced-motion + video-stall fallbacks in place).

Two findings deserve a decision **before** more polish:

1. **Honesty / rate disclosure (HIGH)** — the Projects page publishes concrete ৳/kWh tariff figures (including an *indicative screening band for unsigned projects*). This is in direct tension with your standing rule: *"indicative savings RANGE only, hide any ৳/kWh everywhere; no fabricated portfolio/rates."*
2. **Homepage video weight (HIGH)** — the home page eagerly downloads **two** autoplay videos totalling **~16.5 MB**, heavy for a Bangladesh C&I audience.

Everything else is cleanup (dead code from the merge) or low-risk polish.

---

## 2. Findings by severity

| # | Severity | Area | Finding |
|---|----------|------|---------|
| F1 | **HIGH** | Honesty | Projects page discloses ৳/kWh rates + an indicative tariff band for *unsigned* projects |
| F2 | **HIGH** | Performance | Home loads 2 autoplay videos, `preload="auto"`, ~16.5 MB total |
| F3 | MED | Dead code | `.hero` layout CSS (~70 lines) + 5 keyframes orphaned by the merge |
| F4 | MED | Dead code | `home.js` `if (hero)` block (~130 lines) is now unreachable |
| F5 | MED | Consistency | `৳/kWh` BERC benchmark shown on Estimate + Projects vs the "hide any ৳/kWh" rule |
| F6 | LOW | Robustness | `dl:introPlayed` no longer fires on home (no consumer — currently harmless) |
| F7 | LOW | Robustness | `[data-header="dark"]` moved onto `[data-gp-content]` — header theme flip needs a visual check |
| F8 | LOW | Cleanup | `data-hero="title/sub/model"` attributes now read by nothing |
| — | GOOD | A11y / SEO / build | See §5 |

---

## 3. HIGH findings — detail

### F1 · Rate disclosure conflicts with the "no_rate" rule
Your standing constraint: *hide any ৳/kWh everywhere, indicative **savings range** only, no fabricated portfolio/rates.* The Projects page currently states:

- `projects/index.html:169` — `Tariff: ≈35% below the BERC grid benchmark (Tk 15.36/kWh, June 2026 tariff order)`
- `projects/index.html:204` — `…PPA signed at a tariff roughly a third below the BERC grid benchmark.`
- `projects/index.html:267` — `The contracted first asset prices roughly a third below the BERC grid benchmark of Tk 15.36 per kWh… **The tariff band across projects still in screening is Tk 11.50–12.00 per kWh.** That band is indicative, not an offer…`

Why it matters:
- **Derivable Netso rate:** "a third below Tk 15.36" ⇒ ~Tk 9.98/kWh for the CGS PPA. Even though phrased as a discount, it discloses the rate.
- **Indicative pricing for projects that don't exist yet:** the `Tk 11.50–12.00/kWh` band is for projects *"still in screening"* — i.e., unsigned. It is hedged ("indicative, not an offer"), but it is exactly the kind of concrete per-kWh number the rule says to withhold, and it edges toward the "no fabricated rates" line.

**Note the nuance:** the *BERC grid benchmark* itself (Tk 15.36/kWh, dated + sourced) is a public figure and is defensible as transparency. The concern is (a) the derivable Netso rate and (b) the screening band.

**Recommendation (needs your call):** keep the sourced BERC benchmark as context, but replace the derivable/indicative Netso rates with a **relative** statement only — e.g. *"priced below the grid tariff the customer already pays; final tariff set in the PPA after survey."* Remove the `Tk 11.50–12.00/kWh` screening band. I did **not** change this pending your decision, because it's a content/policy judgement, not a bug.

### F2 · Homepage ships ~16.5 MB of video, eagerly
- `assets/video/rooftop-night.mp4` — **6.7 MB** (portal hero, scrubbed) — justified, it's the headline moment.
- `assets/video/solar-aerial.mp4` — **9.8 MB** (mid-page `svhero`, `index.html:342`) — the single heaviest asset on the site.
- Both `<video>` tags use `preload="auto"` + `autoplay`, so both download immediately on load.

For a commercial/industrial audience in Bangladesh (often mobile, metered), ~16.5 MB before content is a real cost. Also, now that the hero *is* a full-screen scrubbed video, the mid-page `svhero` solar clip is arguably **redundant** (you'd flagged this as undecided earlier).

**Recommendations (pick any):**
1. Set the `svhero` video to `preload="none"` (or `metadata`) and load/play it only when it scrolls near view — biggest quick win, no visual loss above the fold.
2. Re-encode `solar-aerial.mp4` smaller (it's ~9.8 MB; the rooftop clip proves ~1440w H.264 can look good at ~1.3 MB/s).
3. Or drop the `svhero` section entirely as redundant with the new hero.

---

## 4. MEDIUM / LOW — detail

### F3 · Orphaned CSS from the merge
The hero **content** classes (`hero__title/sub/cta/model/proof/step/top`) are still used — the merged `.gp__hero` reuses them, so keep those. But the hero **layout/stage** rules no longer have any matching HTML:
- `assets/css/site.css` ~L515–539, L691–722, and parts of L727–807: `.hero`, `.hero__media`, `.hero__scrim`, `.hero__inner`, `.hero__stage`, `.hero__layer(.is-active)`, `.hero__survey`, `.hero__flow`, `.hero__foot`, `.hero__meta`, `.hero__scroll`, `.hero__dir`.
- Orphaned `@keyframes`: `scrollcue`, `hs-draw`, `hf-flow`, `hf-in`, `hf-pulse` (0 uses in built HTML).

Harmless (no matching elements) but ~70+ lines of confusing cruft. Safe to delete in a dedicated cleanup pass. **Careful:** do *not* remove the content-class rules that `.gp__hero` depends on.

### F4 · Dead JS block in `home.js`
`home.js` lines ~14–142 (`const hero = q('.hero'); if (hero) { … }`) are now unreachable — `.hero` doesn't exist on home. Inside it also references `.hero__layer--base/--solar` and `[data-hero-state]`, which don't exist anywhere (already-dead legacy). Guarded by `if (hero)`, so it can't throw, but it's ~130 dead lines. Recommend trimming to just what home still needs.

### F5 · `৳/kWh` benchmark also on Estimate
`estimate/index.html:140`: *"medium-voltage industrial tariffs of ৳12.5–16.4/kWh (BERC, June 2025)"*. Same category as F1's benchmark — a public, sourced grid figure used as the calculation basis (the rest of the Estimate page correctly shows **savings/investment ranges only**, no Netso per-kWh rate). Flagged for **consistency**: decide once whether the public BERC ৳/kWh benchmark is allowed sitewide (recommended: yes, keep — it's sourced and it's the *grid's* price, not Netso's) and apply that ruling uniformly. Also note the two pages cite different BERC vintages (Estimate: *June 2025, ৳12.5–16.4*; Projects: *June 2026, Tk 15.36*) — align the source date.

### F6 · `dl:introPlayed` no longer dispatched on home
It was fired inside the now-dead hero block. No code listens for it on home (other pages dispatch their own), so this is currently a **no-op, not a bug**. If any future home logic depends on it, it will need re-wiring.

### F7 · `data-header="dark"` on `[data-gp-content]`
`core.js:73` observes `[data-header="dark"]` sections to flip the header to its light-on-dark theme. The merged content now carries this attribute (good intent: light header over the dark hero). Because the content sits inside the sticky portal with a large negative `margin-top`, the IntersectionObserver trigger point may fire earlier/later than visual expectation. *(Needs live verification — confirm the header stays readable over the cream fly-through AND the dark hero.)*

### F8 · Vestigial `data-hero="…"` attributes
`data-hero="title|sub|model"` were ported into `.gp__hero` but the only reader (the dead home.js block) no longer runs. Purely cosmetic; remove during F4 cleanup.

---

## 5. What's healthy (verified)

- **Build:** all 9 routes emit; sitemap.xml (8 URLs) + robots.txt generated; total HTML 178 KB.
- **JS:** all 9 files pass `node --check`.
- **Links:** every internal `href` resolves to a real route; `/favicon.svg`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` all exist.
- **A11y:** 18/18 images have `alt`; one `<h1>` per page; form has honeypot (`_gotcha`), the consent checkbox is wrapped in a `<label>`, decorative video is `aria-hidden`.
- **SEO/meta:** canonical, OG (image 1200×630 declared), Twitter, manifest, multi-size icons, `viewport`, description all present; JSON-LD injected on home.
- **Perf hygiene (non-video):** fonts subset (92 KB total) + preloaded; hero poster preloaded with `fetchpriority="high"`; images all < 250 KB.
- **Merge correctness:** exactly one `<h1>` (moved, not duplicated); `data-gp-enter` repointed to `#gp-content`; `#opportunity` negative pull reset to 0; reduced-motion + motion-off/video-stall fallbacks render the hero on a clean opaque panel.

---

## 6. Suggested order of work

1. **Decide F1** (rate disclosure) — content/policy call; I'll edit Projects to relative-only + drop the screening band on your say-so.
2. **F2** — lazy-load or drop/compress `solar-aerial.mp4` (biggest measurable win).
3. **F5** — ratify the BERC-benchmark policy and align the source date across Estimate/Projects.
4. **F3 + F4 + F8** — one cleanup commit removing dead hero CSS/JS/attrs.
5. **F7** — eyeball header theme through the portal on a live preview.

Items 1–3 change what visitors see; 4 is hygiene; 5 needs the live server.
