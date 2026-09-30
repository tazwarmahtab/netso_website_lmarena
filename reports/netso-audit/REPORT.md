# Netso website — end-to-end audit

**Date:** 30 September 2026 · **Repository:** tazwarmahtab/netso_website_lmarena
**Commit:** `c82f80f6474de9c2093a4ac8b7dc7a5c7f99c6be` · branch `master`

## Executive verdict

**Strong visual foundations; not ready for a dependable public acquisition launch.** The principal weakness is not the framework or appearance. It is the disconnect between source, shipped output, commercial claims, and executable release checks.

The most consequential discovery is that the documented build **does not reproduce the committed website**. It restores customer disclosure, a deleted-route link and site-wide search exclusion. A routine rebuild can undo the latest content decisions. Separately, the calculator can overstate self-consumption and value; navigation has verified keyboard failures; and a lightweight static site downloads approximately 17.8 MB on its opening page in the tested local configuration.

Do not rewrite this into React or introduce a CMS merely to solve these problems. Keep the static architecture, establish one authoritative content pipeline, separate business interactions from decorative animation, and make release criteria executable.

### Scope and confidence

- Reviewed the build/server/QA tools, first-party JavaScript, templates, generated pages, styles, repository documentation, routing, metadata and vendored dependencies.
- Ran the build, JavaScript syntax checks, Python compilation, 32 Chromium route/viewport checks, local internal-link checks, calculator boundary cases, form validation and simulated handoff, keyboard navigation, FAQ controls, no-JavaScript and missing-vendor cases, and reduced-motion checks.
- Viewports: 1440×900, 390×844, 320×700, 768×1024. These are Chromium viewport tests, **not physical iPhone/Safari certification**.
- Product source was not modified. Build-generated changes were captured in `evidence/build-drift.diff`, then restored to the committed versions before browser testing. The audit clone's Git status was clean afterward.
- No real customer messages, production writes, deployment or external browser requests were made. WhatsApp opening was stubbed and external browser requests blocked.
- No production origin was established or tested. Hosting headers, actual mailbox/WhatsApp ownership, delivery, field Core Web Vitals, current regulatory truth and customer contract evidence remain unverified.
- Graph indexing excluded `assets/` and `tools/`; direct source inspection covered those gaps. This is a shallow-commit audit, not a historical secret scan.

## Prioritized findings

### F01 · High — The build reverses approved website changes

**Evidence:** `tools/build.py:95–98`, `src/partials/glyph-portal.html:82–89`, `src/partials/footer.html`; `evidence/build-drift.diff`.

Running `python3 tools/build.py` changes all eight generated HTML files. Differences are semantic, not only formatting:

1. Every route gains `noindex, nofollow, noarchive`. The committed pages do not contain that directive. The sitemap generator nevertheless describes the public routes as indexable.
2. The homepage restores a named customer, capacity and contract state although the current production-readiness policy excludes named customers from public disclosure.
3. It restores `/projects`, which is absent from the build page table and repository route outputs.
4. It changes the published tariff reference and restores “Estimate your saving,” although the calculator explicitly does not calculate customer savings.
5. The homepage gains structured data missing from the committed output and its main landmark boundary changes.

**Impact:** Deploying the root and deploying a fresh build publish different businesses, claims and SEO behavior. This is a release-integrity blocker. Search exclusion may be intentional for staging, but there is no environment distinction in the builder.

**Fix:** Reconcile approved content into `src/`; generate into a dedicated public directory; explicitly configure staging/production indexing; add deterministic build-diff, route, disclosure and robots assertions. Do not solve only by editing root HTML again.

**Acceptance:** A clean rebuild has no unexpected diff, no forbidden customer disclosure and no missing local destinations. Production is indexable; staging is deliberately excluded. Use actual content-change dates rather than resetting every sitemap `lastmod` on each build.

### F02 · High — Calculator values generation beyond available load as displaced retail energy

**Evidence:** `assets/js/estimate.js:74–101`; `browser-checks.json`, `calculator_load_limited`.

At **10,000 kWh/month**, **20,000 m²**, **100% daylight load**, the UI shows **86–117% monthly load offset** and an upper annual value of **৳2,248,400**.

The upper capacity is sized using the low annual yield: `10,000 / (1,200/12) = 100 kWp`. That same capacity is then multiplied by the high yield: `100 × 1,400 = 140,000 kWh/year`, against total annual consumption of only `120,000 kWh`. All 140,000 kWh are valued at the upper retail rate. The stated model excludes export revenue, so this cannot be presented as entirely displaced load.

**Fix:** Distinguish generated, self-consumed and exported energy; cap self-consumption to available matching load; propagate consistent scenarios. Monthly daylight share is not proof of hourly coincidence. A display-only 100% clamp leaves the monetary overstatement intact. Map applicable time-of-use rates to generation/load periods instead of assuming all solar can displace peak-priced energy.

**Acceptance:** Across the input grid, self-consumption never exceeds generation or available consumption; export has its own explicit assumption; displayed value is derived from self-consumption, not uncapped generation. Validate sanctioned-load and AC/DC assumptions before any feasibility claim.

### F03 · High — Closed mobile navigation remains keyboard-focusable

**Evidence:** `assets/css/site.css:242–251`, `assets/js/core.js:81–99`, `src/partials/mobile-menu.html`; browser keyboard trace.

With `aria-expanded="false"`, Tab enters all seven links in the visually clipped menu. Opening does not move focus into it or isolate the covered content. Opening at 390 px then resizing to desktop leaves `overflow:hidden` and `aria-expanded=true` while the burger becomes invisible.

**Fix:** Make closed content inert/hidden; use an explicit disclosure or modal navigation pattern; move and restore focus consistently; close/unlock on breakpoint changes. Preserve Escape support, which passed.

**Acceptance:** Closed menu links are absent from the tab sequence; open navigation is usable without a pointer; resize and orientation changes cannot strand scroll lock.

### F04 · High — Decorative vendor failures disable business functionality

**Evidence:** `assets/js/core.js:11–14,34–45`; `start.js:5`, `estimate.js:13`; missing-vendor tests.

Blocking GSAP or ScrollTrigger causes reference errors and prevents form/calculator initialization. The selective plugin-registration guard does not cover the unconditional calls. Core ready callbacks also wait for `window.load` and fonts, unnecessarily coupling useful controls to unrelated assets.

**Fix:** Initialize navigation, validation and calculation on DOM readiness independently of animation. Guard each optional enhancement. Keep usable static content and truthful no-JS fallbacks.

**Acceptance:** Aborting any animation asset leaves the lead path, mobile navigation and calculator operational or explicitly unavailable—not silently stale.

### F05 · High — Opening experience prioritizes an entrance sequence over qualification

**Evidence:** `src/partials/glyph-portal.html:1,46–68`; `site.css:1118–1137`; homepage screenshots and layout measurements.

The opening viewport shows the wordmark and “Your roof is the way in,” not the ownership/PPA explanation or project CTA. The main heading begins around **3,093 px** down on desktop and **2,890 px** down at 390×844. This contradicts earlier documentation claiming the offer and proof fit above the fold. “Step inside” works, but introduces an extra step before the visitor can assess the offer.

**Recommendation:** Put the model explanation and primary CTA on the opening screen. Retain the portal as a shorter optional enhancement or secondary section. This is a conversion-risk assessment, not a measured conversion-rate claim; validate with the documented five-person comprehension test and real funnel data.

### F06 · High — Video delivery defeats the lightweight architecture

**Evidence:** Homepage resource totals of **17.80–17.84 MB** in the local tests; `glyph-portal.html:6`, `src/pages/home.html:167`; video files approximately 6.97 MB and 10.3 MB.

Both videos transferred in normal-motion homepage tests before scrolling. `autoplay` can initiate loading despite the lower video's `preload="none"`; removing autoplay later in JavaScript does not undo that cost. Reduced-motion testing still downloaded the approximately 6.97 MB portal video. These are local transferred-byte observations, not production LCP or field-performance measurements.

**Fix:** Deliver the poster first; attach video sources only on eligibility/visibility or user intent; respect reduced motion and data-saving preferences; create mobile encodes; stop offscreen playback. Adopt a first-view resource budget and measure on representative mobile networks.

The local server also returns **200 with the complete 6,966,940-byte file** for `Range: bytes=0-99`, despite advertising range support in its docstring. Verify actual 206/range support at the production host before relying on scroll seeking.

### F07 · Medium — Lead handoff is not lead delivery; privacy copy does not explain the transport

**Evidence:** `tools/build.py:29–36`, `assets/js/core.js:604–641`, `src/pages/start.html:25`, `src/pages/privacy.html:37–41`.

WhatsApp configuration takes precedence over the endpoint. Valid form input opens a `wa.me` URL containing the labelled enquiry. The UI correctly asks the visitor to press Send and does not display the endpoint-only “Enquiry received” state. **This is not the old fake-success implementation described in README.**

However, “Submit project enquiry” does not disclose this extra handoff in advance. A blocked popup produces the same “We've opened WhatsApp” text because there is no verified handoff receipt. There is no delivery record or conversion event for this path. The policy does not name WhatsApp/Meta as the transport and explicitly says retention/storage/contact details are still being finalized. The fallback inbox is still called a placeholder in repository documentation; actual mailbox readiness was not tested.

**Fix:** Label the button “Continue in WhatsApp”; explain the third-party handoff before consent; offer a copy-summary/direct-contact fallback; distinguish prepared, opened and received states. If durable lead capture is required, add a validated, abuse-protected server endpoint with explicit acknowledgement. Confirm recipient ownership and update the policy before collecting real enquiries. Do not log complete lead payloads: `start.js` currently does so on the endpoint-success path.

### F08 · Medium — No-JavaScript form and calculator are misleading or broken

**Evidence:** `start.html:25` has an empty endpoint action and `novalidate`; calculator outputs are hard-coded before JavaScript initializes.

With JavaScript disabled, changing the consumption slider leaves the output at its original 100,000 kWh. Submitting the form performs an empty-action POST to the static route; the tested local server returns **501**. Production's exact response depends on its host.

**Fix:** Use native validation; provide a real action or a clear no-JS direct-contact path. Disable unavailable calculation controls with an explanation rather than presenting stale outputs as responsive estimates.

### F09 · Medium — Reduced motion is incomplete; skip link does not move focus

**Evidence:** `core.js:51–55,101–109,115–174,668–677`, `site.css:734–747`.

Reduced-motion tests still create **11 scroll-linked animations** on the estimate page and **56** on home. CSS suppression of transitions does not stop GSAP inline transforms. Some specialized effects respect the preference, but generic reveals/counters do not.

Activating “Skip to content” leaves focus on the skip link with no hash update. The global anchor interceptor scrolls but does not focus the destination, so subsequent keyboard navigation still encounters the chrome.

**Fix:** Centralize the motion policy; render static final states under reduced motion and respond to preference changes. Exempt the skip link from decorative interception or focus a `tabindex="-1"` main landmark after navigation. Audit focus contrast on dark surfaces: the global outline token is dark.

### F10 · Medium — Commercial comparison misrepresents self-owned solar

**Evidence:** `src/pages/estimate.html:112–120`, also present in committed output.

“Buy it yourself” is described as paying “Grid price, after you've paid for the plant.” Self-generated electricity is not purchased from the grid; it has ownership, financing, maintenance and performance economics, with residual grid imports charged separately. “An asset and debt on the books” is also too absolute for a cash purchase, and the Netso “single operating line” description should not promise accounting treatment without contract-specific assessment.

**Fix:** Compare self-generated levelized cost plus residual imports against contracted PPA payments plus residual imports. Qualify capital, roof works, performance allocation and accounting treatment. Avoid universal “below grid” claims where the applicable avoided cost has not been established. Obtain commercial/legal/accounting sign-off; a generic disclaimer does not correct a misleading row.

### F11 · Medium — Numerical references are inconsistent and not auditable from primary evidence

**Evidence:** Committed homepage references **৳12.5–16.4, June 2025**; source homepage and calculator reference **৳11.56–16.06, June 2026**. Older README/readiness material uses another benchmark. The public methodology offers attribution but not exact source documents, tariff classes and sections.

This audit confirms inconsistency, **not which regulatory number is legally current**. No canonical tariff registry, signed contract or primary regulator evidence was supplied in this repository. The ~213 MW installed figure also needs a clear scope: rooftop, grid-connected solar or all solar cannot be silently interchanged.

**Fix:** Maintain a versioned claim register with authority URL/document, exact clause/table, tariff class, units, effective date, qualification and approval owner. Generate repeated values from the same source. Verify every numerical and regulatory claim against primary material before publication.

### F12 · Medium — Precision hides meaningful small-system results

**Evidence:** `estimate.js:61–67,117–126`; `calculator_small_roof` in browser evidence.

At 200 m² with high facility consumption, **24,000–40,000 kWh/year** renders as **0.0–0.0 GWh**, and the small offset rounds to **0–0%**. The annual value summary starts at **0.0 crore** even though the main rupee figure is nonzero.

**Fix:** Use adaptive kWh/MWh/GWh and taka/lakh/crore units; retain enough significant digits to preserve the range. Disclose rounding; do not make positive generation look like zero.

### F13 · Medium, deployment-dependent — Publishing the repository root can expose non-public artifacts

**Evidence:** Local requests to `/.git/HEAD`, `/README.md` and `/src/pages/privacy.html` returned **200**. `tools/serve.py` serves the repository root and defaults to `0.0.0.0`.

This confirms local server behavior, **not a vulnerability on an untested production host**. README contains material labelled deliberately not published, and source templates contain internal comments that the builder strips only from generated HTML. The GitHub repository itself is public, so removing those details from served pages does not make the repository material confidential.

**Fix:** Publish an allowlisted `dist/` containing public pages/assets only. Keep internal decision records outside the public repository. Default preview binding to localhost. Verify inaccessible dotfiles/source/docs and correct CSP, framing protection, referrer policy, MIME-sniffing protection, compression, caching and 404 behavior on the actual host. Robots directives are not access control.

### F14 · Medium — QA output is not an enforceable release gate

**Evidence:** `tools/qa.py:30–31` still includes `/projects` and omits `/estimate`; the runner prints failures but does not assert a release failure. No tracked CI workflow, dependency manifest or pinned Python tooling was found.

The existing smoke test can miss the primary interactive calculator and exit successfully while reporting errors. Historical “0 errors” documentation is not evidence of current correctness. The static build requires only standard Python, which is good; optional QA/media tooling still needs reproducible versions.

**Fix:** Derive routes from the build table; assert expected HTTP statuses, console errors, links, numerical invariants and focus behavior; make failures nonzero; run in CI. Pin Playwright and document vendored GSAP 3.13.0 / Lenis 1.3.4 provenance, checksums and licenses. No known-CVE clearance is claimed: a current advisory scan was not performed, and no package lock exists for these copied files.

### F15 · Low / follow-up — Layout and documentation hygiene

- Document width exceeded viewport width on home/about by **28 px at 768**, **10 px at 1440** and **1 px at 390**. The 768 px discrepancy persisted after settling. `body { overflow-x: clip }` may conceal overflow; the exact originating pseudo-element/transform remains unisolated. Do not call this proven visible horizontal scrolling without further measurement.
- README still documents the deleted projects route, an obsolete event-only form, earlier hero geometry and historic performance figures. OPEN-INPUTS says video was not received although two videos ship. Readiness items describe states no longer reliably reflected by the code.
- CSS has accumulated successive hero systems and overrides; shared core contains page-specific effects. There is duplicate reveal setup in core and page scripts, making ownership harder to reason about. Prune only after behavior tests exist.
- No complete font/license notices inventory was found among tracked files. Check redistribution obligations for fonts, Lenis and adapted effects; attribution comments alone should not be assumed sufficient. GSAP headers do retain license pointers.

## Architecture and product assessment

### What is worth preserving

1. **Appropriate architecture:** Python template assembly and static multi-page output are well suited to a small marketing site. There is no unnecessary server session, database or application API attack surface in the supplied code.
2. **Self-hosted dependencies:** Fonts and animation assets do not require runtime CDNs. This improves control over availability and external data flows.
3. **Readable commercial explanation:** “The customer buys the power—not the system” is a strong differentiator. It should lead the experience, not wait behind the entrance animation.
4. **Good foundational UI:** The serif/sans/mono hierarchy, warm neutral palette and restrained component borders give the site a coherent infrastructure identity. The calculator labels and value hierarchy are legible in the inspected mobile screenshot.
5. **Useful disclosure distinctions:** Screening rather than quotation, battery value separated from base economics, and pre-construction versus operating distinctions are correct instincts. They need enforcement across source and output.
6. **Working basics:** Explicit form labels, field-specific errors, first-invalid-field focus, FAQ toggling, battery switch state, local navigation, and real 404 status passed the targeted checks.

### Strategic improvements

- **Acquisition:** Lead with customer type, geography, ownership model, qualification and next action. Treat cinematic motion as supporting evidence, not the product.
- **Trust:** Publish only approved proof. If counterparties must remain private, provide an anonymized project-stage record and a clear technical diligence process instead of implying operating scale.
- **Conversion:** Make the estimate-to-enquiry transition preserve the visitor's inputs, with explicit consent and provenance, rather than requiring re-entry. This is an improvement opportunity, not a current security defect.
- **Measurement:** Distinguish calculator engagement, qualified enquiry, WhatsApp handoff and confirmed receipt. Do not count a popup as a captured lead. Deploy privacy-conscious analytics only after updating disclosures.
- **Maintainability:** Separate `navigation`, `lead-form`, `calculator` and optional `motion` modules, without adding a framework by default. Shared components and constants should have one owner.

## Executed verification ledger

| Check | Actual result | Interpretation |
|---|---|---|
| Build | Eight pages generated, eight HTML outputs differ | Build executes; release reproducibility fails |
| First-party JS syntax | All `node --check` invocations passed | Syntax only; not behavioral correctness |
| Python syntax | Tools compiled successfully | Does not establish deployment suitability |
| Route matrix | 32 observations; seven public routes 200 and unknown route 404 at four widths | Basic rendering/routing passes locally |
| Uncaught page errors | Zero in normal route matrix | Failure injection separately exposes defects |
| Internal linked routes | All discovered committed-output paths returned 200 | Rebuild-only `/projects` regression remains |
| Missing same-page fragment targets | None in route matrix | Focus handling still fails |
| Images | No completed broken-image entries | Lazy assets not loaded are not proven by this check |
| Empty form | Seven invalid fields, focus on name | Pass |
| Valid form | Encoded WhatsApp handoff with synthetic summary; form stays visible | Prepared handoff only, not delivery |
| Calculator boundary | 117% upper offset; small output rounds to zero | Fail |
| FAQ / battery | State transitions work | Pass for tested controls |
| Closed menu keyboard | Seven hidden links receive focus | Fail |
| Open menu desktop resize | Scroll remains locked, burger invisible | Fail |
| No JavaScript | Calculator stale; local form POST 501 | Fail |
| Missing GSAP/ScrollTrigger | Uncaught references; business initialization missing | Fail |
| Reduced motion | 11 estimate / 56 home scroll animations; portal video download | Incomplete |
| Step inside | Scrolls to offer | Pass; leaves focus at link and hash unchanged |
| Skip link | Focus remains on skip link | Fail |
| MP4 Range request | 200/full file, no Content-Range | Local range support absent |
| Local source/dotfile access | 200 | Do not publish this root/server as production |

### Important limits

No Lighthouse score, axe/WCAG certification, screen-reader test, physical-device test, production penetration test, current dependency-advisory clearance, delivery test, or verified regulator tariff conclusion is claimed. Browser byte totals are observed local resource transfers, not compressed production estimates or field Core Web Vitals. Visual inspection covered the supplied homepage/calculator screenshots; it was not a pixel-by-pixel inspection of every scrolled section. Other content and interaction conclusions are grounded in source and targeted DOM/browser checks.

## Remediation sequence and release gates

### 1. Release integrity and claims — first

**Owner:** engineering + commercial owner.

- Reconcile source and generated output at this commit; obtain disclosure decisions.
- Separate staging/production metadata and publishable assets from repository internals.
- Correct calculator self-consumption/value logic and the owned-solar comparison.
- Verify primary-source tariffs and claims; assign approval dates and owners.

**Gate:** A clean, deterministic build; no unapproved disclosures; no missing internal routes; explicit indexing policy; numerical invariants pass across the entire slider domain.

### 2. Lead reliability and accessibility

**Owner:** frontend + operations + privacy reviewer.

- Decouple functional code from animation and asset load.
- Correct mobile navigation focus, skip links, resize behavior and no-JS states.
- Make WhatsApp handoff explicit; confirm recipient/inbox; finalize data handling.
- Enforce reduced-motion behavior across all effects.

**Gate:** Keyboard walkthrough and vendor-failure tests pass; a controlled end-to-end receipt is confirmed by the operator; no client claims receipt before acknowledgement.

### 3. Opening experience and delivery performance

**Owner:** design/frontend + hosting.

- Put the actual offer and project CTA in the initial viewport.
- Poster-first video with deferred sources and responsive encodes.
- Validate media range support and production compression/cache/security headers.
- Resolve tablet width discrepancy and test 200% zoom, landscape, Safari and assistive technology.

**Gate:** Representative mobile performance measurements, accessible navigation, approved media budget, and comprehension-test results—not an old README assertion.

### 4. Continuous assurance

**Owner:** engineering.

- Add CI with build consistency, claim policy, route assertions, calculator unit/property tests, browser regressions and dependency inventory checks.
- Refresh README/readiness from the actual architecture; mark historical audits clearly.
- Add a release checklist covering legal approval, public content, asset licensing and rollback.

**Gate:** Failed checks block publication; release output is traceable to a commit and approved content version.

## Evidence and rerun instructions

All paths below are relative to `reports/netso-audit/`:

- `evidence/build-drift.diff` — full generated-versus-committed differences.
- `evidence/browser-checks.json` — route matrix and primary interaction/failure tests.
- `evidence/focused-checks.json` — linked routes, entrance, FAQ, focus and reduced-motion checks.
- `evidence/home-1440.png`, `evidence/home-390.png` — opening experience.
- `evidence/calculator-1440.png`, `evidence/calculator-390.png` — calculator layouts.
- `evidence/home-entered-768.png` — offer reached through entrance control.
- `audit_checks.py`, `focused_checks.py` — retained local test scripts. They collect observations rather than serve as an already-hardened CI suite.

Audit checkout: `/Users/tazwarmahtab/Developer/labs/research/netso_website_lmarena`.

Serve the committed checkout on **127.0.0.1:8100**, then run from the workspace:

```sh
python3 reports/netso-audit/audit_checks.py
python3 reports/netso-audit/focused_checks.py
```

The scripts require Python Playwright and its Chromium browser. They block external browser requests and stub WhatsApp opening in the lead test. No product fixes were applied by this audit.
