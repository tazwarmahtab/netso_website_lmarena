# Netso Energy world-class rebuild plan

## Product direction

Keep the static multi-page architecture and the existing Netso visual language: infrastructure, architecture, energy, capital and data. Move the opening experience from a spectacle-first portal to a qualification-first narrative. Motion supports comprehension and remains optional.

## Acceptance criteria

- A clean build reproduces committed generated output byte-for-byte and emits only intended public routes.
- Production HTML is indexable by default; local/staging builds can opt into `noindex` without source drift.
- Home clearly states who Netso serves, who owns the asset, who buys the power and that projects are qualified individually within the initial viewport.
- No named customer, fabricated portfolio, or Netso tariff is published without an approved evidence record. Public regulatory context is consistent across pages and never presented as a Netso offer.
- The estimate caps self-consumed energy and value at available annual facility consumption, preserves small values with adaptive units, and labels generation versus displaced grid energy.
- Mobile navigation is inert while closed, moves focus on open, restores focus on close, handles Escape, and unlocks scroll on breakpoint changes.
- Animation and video are progressive enhancements. Missing GSAP/ScrollTrigger/Lenis cannot break navigation, forms, or the estimate.
- Reduced-motion users receive static final states and no scroll-linked motion or autoplay video.
- Enquiry handoff clearly distinguishes prepared, opened, sent, and received states. No success claim is shown for a WhatsApp or mailto handoff.
- Add the missing `/projects` route as an honest evidence standard page, and keep route links and sitemap synchronized.
- Build, source lint, route/link checks, calculator invariants and static security checks pass before delivery.

## Implementation shape

1. Reconcile `tools/build.py` with `src/` and add deterministic indexing/sitemap behavior.
2. Refactor shared runtime initialization so functional modules do not depend on animation vendors.
3. Repair estimate math and output copy.
4. Repair navigation, skip-link focus, reduced-motion and media loading.
5. Add `/projects` evidence route and update navigation/content consistency.
6. Rebuild all output, run the repository checks plus targeted invariants, review animation code, then commit the isolated branch.

## Serving arrangement

Static HTML and assets remain the deployment target. The repository root is a development source tree; production output should be an allowlisted generated directory or platform static output, never a raw checkout containing source, reports, or dotfiles. Versioned assets can be long-lived; HTML and sitemap should revalidate.
