# bar.md — Design Loop reference teardown
Date: 2026-09-30 · Scope: full site, all routes · Bars: all three

Artifacts studied:
- Hero/entry: Better Stack hero via supahero.io/hero/better-stack
  ("Ship higher-quality software faster. Be the hero of your engineering teams."
  — one claim, one subline, product visual as proof). supahero.io itself is a
  300+ hero index; Better Stack chosen as closest in spirit (infrastructure × data).
- Funnel: Stripe web onboarding via pageflows.com
  (Homepage → Create account → one question per screen: email → name → password
  → business name → onboarding questions → task checklist → verify email →
  business info). Full video paywalled; step list is public and sufficient.
- Mobile: loadmo.re gallery thesis (mobile-first, alternative approaches).
  No single artifact — judged as checkable mobile mechanics + our own 390px
  measurements. Craft critic is semi-blind on mobile taste, fully sighted on
  the mechanics below.

System of record: BRAND.md (no design-system.md exists — System critic judges
against BRAND tokens, voice rules, CTA rules, status vocabulary).

## Mechanisms (checkable by looking — no adjectives)

1. Above the fold answers what/who/how in ≤10s: one headline ≤12 words naming
   the mechanism (not the category), one subline carrying the commercial
   boundary, one primary CTA. (Better Stack pattern)
2. Exactly one entry instruction per screen: a first-time visitor never sees
   two competing scroll/enter/start cues at once. (Fixed 30 Sep 2026 — regression bar)
3. One idea per screen, one primary action per screen: each section has a
   single headline, a single proof element, and ends in one primary CTA; a
   single secondary link is permitted (the reference heroes all pair one
   primary with one secondary). Funnel screens ask the minimum per step with
   the payoff restated. (Stripe / Better Stack pattern; calibrated 30 Sep
   2026 — the first wording banned all pairs, which the reference bars
   themselves use.)
4. Every input states its why and its next step: labels name the reason
   (qualification), errors name the fix and move focus to it, success states
   name what happens next and when. (Stripe verify + task-checklist pattern)
5. 390×844 clean on every route: document scrollWidth === clientWidth, tap
   targets ≥44px, body measure ≤80 chars/line, nothing below 10px mono-label
   or 12px body. (loadmo.re mobile-first)
6. Tokens only, one accent per screen: ink + paper carry the page, solar
   appears ≤2 times per screen as instrument not decoration; ≤3 type sizes per
   screen; no new components — reuse the BRAND vocabulary. (BRAND as system)
7. Every number wears its status: public figures are sourced + dated (BERC
   benchmark), Netso figures are qualified (indicative / screening /
   survey-confirms); no absolute Netso tariff anywhere; status vocabulary
   exact — PPA signed ≠ built ≠ operating. (Disclosure policy)

## Pieces (3, judged alone)

- Piece 1 — Entry + homepage: portal, hero, §§01–10, footer. (Bars 1 + 5 + 6 + 7)
- Piece 2 — Funnel: /estimate calculator + /start-a-project form, end to end. (Bars 3 + 4 + 5)
- Piece 3 — Editorial + system: /how-it-works, /about, /legal/*, /404, header/nav,
  mobile menu, reduced-motion, SEO/meta, console/network. (Bars 5 + 6 + 7)

## Progress note (live)

- Piece 1, round 1 (3 critics): 0/3 PASS. Gaps: entry stated zero of three
  facts; locked headline absent above fold; two competing entry cues.
- Piece 1, round 2 builder: support line carries mechanism
  ("Netso funds, owns and operates the system — you buy the power."),
  caption merged to single centered "Step inside ↓", dead hint CSS removed.
  Round 2 critics: 0/3 PASS. Remaining: brief fact-2 wording (fixed post-round
  with "funds, owns and operates"); system locked-headline-above-fold +
  craft mech-1 headline/CTA — structural, portal concept vs bar. ESCALATED.
- Piece 2, round 1 (3 critics): 0/3 PASS. Round-1 blank-instrument finding
  proven to be a fullPage-stitch artifact (verified live: 3 sliders render,
  results compute) — evidence method switched to scrolled viewports.
  Builder: estimate hero CTA relabelled to allowed SEE HOW IT WORKS.
- Piece 2, round 2: 0/3. Builder: form required/optional legend + aside
  timeframe; mechanism 3 calibrated (one primary + one secondary link, per
  the reference bars themselves); estimate results CTA moved above the
  disclaimer (24px below results grid, was ~140px + disclaimer).
  Residuals for user decision: TRY THE ESTIMATE label (BRAND amendment?) and
  single-screen vs stepped form (redesign?).
- Piece 3, round 1 (3 critics): 0/3 PASS, all converging on /about poster
  hero (giant type occluding thesis, banned panel-field imagery, no CTA).
  Builder: poster replaced with standard dark pagehero (thesis legible, bn
  line kept, START A PROJECT + SEE HOW IT WORKS); DL.editorialPoster + .poster
  CSS + 2 webp assets deleted; stale /projects links fixed on /404 and
  /about; README trued (sitemap, structure, dead-primitive note); automation:
  8 routes 200, one h1 each, alts present, zero stale links, 390px overflow
  clean, zero console errors.
- Piece 3, round 2: critics flagged (a) CTA pair in about hero — matches the
  calibrated pair pattern used on every hero sitewide, held as system;
  (b) text-only heroes vs facility-photo rule — company-gated (no approved
  C&I photography exists; stock/generic would violate honesty rules);
  (c) subnav truncation at 390px — VERIFIED real, fixed with edge-fade
  affordance, confirmed in render.
- Loop exit, 30 Sep 2026: user deferred all four structural calls —
  decisions taken and recorded: (1) portal sequence KEPT, blessed with a dated
  BRAND.md entry-gate ruling; (2) TRY THE ESTIMATE + CHAT ON WHATSAPP admitted
  as closed contextual CTAs + hero pair convention written into BRAND.md;
  (3) single-screen grouped form KEPT (stepped rebuild parked as future test);
  (4) text heroes STAND until real C&I photography (≥1600px) arrives — standing
  photo request, no stock/generic in the meantime. All three pieces builder-green.
- Standing inputs wanted from the company: facility rooftop photography;
  legal counsel sign-off (privacy/terms); production inbox + form endpoint
  (WhatsApp handoff works as interim); analytics choice; five 10-second-test strangers.
