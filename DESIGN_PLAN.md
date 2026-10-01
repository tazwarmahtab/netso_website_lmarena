# Design Implementation Plan: Homepage synthesis (Variant G)

## Summary
- **Scope:** page (redesign of `src/pages/home.html` narrative spine + sitewide treatments)
- **Target:** `src/pages/home.html`, `assets/css/site.css`, `assets/js/estimate.js` (results panel), `assets/fonts/` (one addition)
- **Winner variant:** G — A structure (one idea, one proof, one CTA per screen) + F expression at 30% dose
- **Key improvements:** decluttered section hierarchy; halftone feature-visual treatment; dot-matrix numerals for figures; bilingual EN/বাংলা spec rows; pixel icon set; estimate results as energy-widget card; Survey photographic grade + commissioning brief; Energy-OS transfers fenced to brand tokens

## Files to Change
- [ ] `src/pages/home.html` — trim to spine: hero → opportunity (+halftone visual) → sourced figures (dot-matrix + spec rows) → 4-phase model line → proof chip → void CTA; cut or fold secondary modules per section audit below
- [ ] `assets/css/site.css` — add: `.halftone-frame` (+paper variant), `--font-dot` token + `.dotnum`, `.specrow`/`.annot`/`.bnline`, `.pxcell` icon set, `.wcard` widget card, `.subnav`-style edge fade reused where needed; grade utility `.grade-survey`
- [ ] `assets/js/estimate.js` — restyle results panel into widget-card anatomy (figure + live dot + indicative chip); no logic change
- [ ] `assets/fonts/` — self-host DotGothic16 woff2 (SIL OFL) + `@font-face` in `assets/css/fonts.css`; numerals/data-only usage
- [ ] `assets/img/` — replace generated placeholders per Survey shot list as photography arrives; immediate: apply warm grade to existing section media
- [ ] `BRAND.md` — record: `--font-dot` numerals-only rule, halftone one-per-page rule, bilingual spec-row pattern, pixel icon set, Survey grade + commissioning brief, ENERGY_OS as separate theme
- [ ] `src/pages/estimate.html`, `src/pages/about.html`, `src/pages/how-it-works.html` — one halftone feature visual each; dot-matrix numerals on figures

## Implementation Steps
1. Fonts: download DotGothic16 woff2, add to `assets/fonts/`, `@font-face` + `--font-dot` token; restrict to `.dotnum` (figures, results, dates)
2. CSS system: add treatment classes listed above to `site.css` (single pass, reuse lab CSS verbatim from `__design_lab` reference before deletion — key blocks: halftone-frame, dotnum, specrow, pxrow, wcard, grade filter)
3. Home spine: rewrite `src/pages/home.html` sections in order, one CTA per screen (primary + single secondary link max), fold cut modules' essential claims into surviving sections
4. Pixel icons: inline the 6 lab SVs (bolt/sun/battery/panel/site/yield) as a shared partial or inline where used; `shape-rendering: crispEdges`, currentColor
5. Estimate widget: restyle `.instrument__results` into `.wcard` anatomy; verify `aria-live` + slider updates unchanged
6. Grade pass: apply Survey grade (sepia .28 / contrast 1.06 / warm overlay) to remaining section media; halftone to the single feature visual per page
7. Bilingual rows: add BN01-style spec row wherever sourced figures appear; keep `lang="bn"`
8. Verify: `python3 tools/build.py`, per-route 200s, 390px overflow, zero console errors, reduced-motion check, `rg` for dead classes
9. Photography program: commission per shot list (2 dawns + 2 dusks, Dhaka + Chattogram); contracted slots get their own site or nothing

## Section Audit (cut / keep / fold)
- Keep: hero (locked), opportunity, sourced figures, 4-phase model, proof + CTA
- Fold: statgrid claims → spec rows; compare table → single contrast line + link to /how-it-works; beliefs/roadmap teasers → /about links
- Keep portal entry untouched (must-keep, separately governed)

## Component API
- **`.halftone-frame`** (wrapper div, no props): grayscale + contrast img + dot overlay pseudo-element; one instance per page
- **`.dotnum`**: DotGothic16 figures only; never body/headlines
- **`.wcard`**: dark card; children: mono label, dotnum figure, live-dot + status line, chip
- **Pixel icons**: inline SVG, `currentColor`, 2rem default; states inherit text color
- **State:** accordions (D-pattern, if used): open/closed/focus-visible; toggle switch: on=solar dot, off=muted
- **Events:** none new; estimate sliders keep existing handlers

## Required UI States
- **Loading:** fonts swap (fallback monospace for dotnum); images lazy below fold
- **Empty:** n/a (static content)
- **Error:** estimate JS failure → static fallback outputs already in markup (keep)
- **Disabled:** n/a
- **Validation:** n/a (no form changes in this plan)

## Accessibility Checklist
- [ ] Halftone images keep meaningful `alt`; decorative overlays `aria-hidden`
- [ ] Dot-matrix numerals remain real text (selectable, screen-reader legible)
- [ ] বাংলা rows carry `lang="bn"`
- [ ] Keyboard: accordions/toggles focus-visible with 2px ring + offset
- [ ] Contrast: mono labels ≥4.5:1, chips ≥3:1 on all surfaces
- [ ] Touch targets ≥44px (pills, toggles, CTA buttons)
- [ ] `prefers-reduced-motion`: transitions off, reveals resolve visible

## Testing Checklist
- [ ] Build passes with assert_clean; 8 routes 200
- [ ] 390×844 + 1440×900 screenshots per changed route, zero overflow
- [ ] Zero console errors, zero failed requests per route
- [ ] Estimate slider → results update + aria-live announcement
- [ ] Reduced-motion pass: content visible, no hidden-behind-animation states

## Design Tokens
- Add `--font-dot: "DotGothic16", monospace` (new, numerals only)
- Add grade values as documented filter stack (not tokens — treatment)
- Reuse existing: ink/paper/void/solar/solar-soft/green, serif/sans/mono, shell/split/sec-head/cluster/chip/btn
- ENERGY_OS yellow `#FFE600` stays out of this theme (separate surface)

---
*Generated by Design Variations plugin (static-site adaptation: lab at `/__design_lab/`, preview at `/__design_preview/`, both removed on finalize)*
