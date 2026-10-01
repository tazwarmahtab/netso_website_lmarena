# Design Memory

System of record for brand rules stays in `BRAND.md`. This file holds working
preferences discovered through design exploration (Homepage lab, Oct 2026).

## Brand Tone
- **Adjectives:** premium, spacious, engineered (not decorated)
- **Avoid:** fashion-loud fields, generic panel photography, residential framing, $ pricing logic, Get-Started vocab, cinematic darkness for its own sake

## Layout & Spacing
- **Density:** spacious; one idea + one proof + one CTA per screen (primary + single secondary link max)
- **Grid:** shell container, split/split__aside/split__media, sec-head eyebrow+index+title
- **Corner radius:** 10–16px cards/frames, 999px pills/chips
- **Shadows:** flat bands over elevation; hairlines over shadows

## Typography
- **Headings:** Instrument Serif, italic emphasis words; never dot-matrix
- **Body:** Archivo 400; headings Archivo 500 tight
- **Figures/data:** DotGothic16 numerals only (`--font-dot`)
- **Labels:** IBM Plex Mono uppercase; annotation codes (TX/FL/PX/BN) for sourced rows
- **Bilingual:** EN mono label + বাংলা line + `//` gloss as first-class pattern (`lang="bn"`)

## Color
- **Primary:** ink + paper carry every page
- **Accent:** solar marks live/active state only; never decoration or backgrounds
- **Neutral strategy:** alternating paper/paper-2/void bands; warm grade on photography
- **Semantic:** green verified chips; ENERGY_OS yellow `#FFE600` belongs to the portal theme, not this one

## Interaction Patterns
- **Reveal:** one registration (core-owned), ScrollTrigger, reduced-motion resolves visible
- **Disclosure:** accordions with open/closed/focus-visible states where detail-on-demand is needed
- **Funnel:** minimum per step, payoff restated, action directly under results
- **Feedback states:** live dot + status line for computed outputs

## Accessibility Rules
- **Focus:** 2px visible ring + offset
- **Labels:** every input states why; errors name fix + move focus
- **Motion:** `prefers-reduced-motion` kills choreography, never content

## Repo Conventions
- **Build:** `python3 tools/build.py` regenerates all pages from `src/`; edit source, never output
- **Treatments:** `.halftone-frame` one instance per page; `.grade-survey` for the rest
- **Existing primitives:** sec-head, statgrid/statcard, compare, flowmap, spec, phase, evidence chips, formcard, cluster/btn/chip
- **Dead code:** zero-hook runtime/CSS removed on sight; verify with `rg`

---
*Updated by Design Variations plugin*
