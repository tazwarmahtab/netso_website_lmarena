# Netso Launch Readiness Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `tazwarmahtab/netso_website_lmarena` launch-ready by completing a disciplined end-to-end QA pass across every canonical and legacy route, fixing verified functional, accessibility, responsive, performance, SEO, and claim-integrity defects, then re-verifying the production deployment.

**Architecture:** Preserve the existing static multi-page architecture, commercial C&I RESCO positioning, progressive-enhancement motion system, and zero-backend WhatsApp/email lead handoff. Add only narrowly scoped QA/test utilities where they materially improve repeatability. Do not introduce a framework migration, authentication, live telemetry, unsupported financing claims, or new public product surfaces.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, GSAP/ScrollTrigger/Lenis/SplitText where already present, Vercel, GitHub.

**Spec:** The approved Netso C&I commercial-site direction and the current canonical route/claim ground truth in the project context.

## Global Constraints

- Netso remains positioned as a Bangladesh C&I rooftop-solar RESCO/OPEX/PPA developer.
- Do not publish CGS, Four H, DRS, IDCOL debt terms, project returns, installed portfolio metrics, live telemetry, or other non-disclosure-approved maturity claims.
- Keep the economics calculator explicitly indicative and independent of optional motion dependencies.
- Preserve reduced-motion behavior and no-JS readability.
- Preserve the current canonical route inventory and legacy redirects.
- Do not expose a public fleet-monitoring dashboard or fake live operational data.
- No customer claim may imply guaranteed savings, fixed contract tenor, balance-sheet treatment, or financing terms unless explicitly qualified.
- Any form success state must correspond to a real confirmed delivery. WhatsApp handoff is a handoff, not confirmed delivery.
- Mobile must not require hover or desktop-only interaction.
- Production claims require fresh verification evidence from the deployed site.

## Review Focus

1. **Hero motion failure:** video metadata failure, reduced motion, save-data, or blocked vendor assets must leave the hero readable and visually coherent.
2. **Mobile navigation:** opening, closing, Escape, focus restoration, inert/hidden state, and route navigation must remain usable without motion dependencies.
3. **Calculator integrity:** outputs must be monotonic and economically conservative, and query-string handoff must preserve values without creating invalid form states.
4. **Lead handoff:** validation must block incomplete submissions, WhatsApp handoff must contain the entered data, and mail fallback must remain reachable if the popup is blocked.
5. **Route integrity:** every canonical route must resolve, every legacy route must redirect to its canonical target, and canonical/OG metadata must match.
6. **Claim integrity:** public copy must describe the actual maturity of Netso and must not imply executed projects, guaranteed economics, live systems, or financing approvals.
7. **Responsive overflow:** no horizontal page overflow, clipped critical copy, or inaccessible CTA/form control at mobile widths.
8. **Accessibility:** focusable controls, labels, error announcements, reduced motion, skip navigation, and hidden mobile-menu content must remain coherent.
9. **Asset/runtime resilience:** missing optional motion/vendor assets must not blank content or disable core conversion paths.
10. **Deployment parity:** fixes must be verified against the actual Vercel deployment, not only repository source.

---

### Task 1: Establish the QA baseline and repeatable static checks

**Files:**
- Create: `tests/site-qa.py`
- Create: `docs/superpowers/plans/2026-10-05-netso-launch-readiness.md` (this plan)

**Interfaces:**
- Produces a standard-library-only static QA command that can scan checked-out repository files without requiring third-party packages.

- [ ] **Step 1: Write failing assertions for the known integrity requirements.**
  - Assert canonical routes exist.
  - Assert the four legacy redirect mappings exist.
  - Assert sitemap contains only the nine canonical indexable routes.
  - Assert the homepage calculator contains the four expected inputs and assessment handoff parameters.
  - Assert no disallowed maturity/financing/live-telemetry phrases occur in public HTML.
  - Assert canonical and OG URL pairs are consistent on canonical pages.

- [ ] **Step 2: Run the test against the current source and verify any failures are genuine gaps rather than test errors.**

- [ ] **Step 3: Implement the minimal Python scanner using only the standard library.**

- [ ] **Step 4: Run the scanner again and require zero unexpected findings.**

- [ ] **Step 5: Commit the QA harness.**

---

### Task 2: Audit and harden homepage interaction behavior

**Files:**
- Modify: `index.html`
- Modify: `assets/js/home.js`
- Modify: `assets/js/core.js`
- Modify: `assets/css/site.css` only if a verified visual/interaction defect requires it
- Test: `tests/site-qa.py`

**Interfaces:**
- Keep `initEconomics()`, `initCinematicHero()`, and `DL.initForm()` behavior compatible with existing pages.
- No new dependency may become required for basic page readability or conversion.

- [ ] **Step 1: Add regression assertions for reduced-motion hero behavior, calculator independence from motion, and mobile menu state attributes.**
- [ ] **Step 2: Run and watch the new assertions fail if the current source does not satisfy them.**
- [ ] **Step 3: Fix only verified defects.**
  - Ensure hero video does not remain in an actively playing state when cinematic scrubbing takes ownership.
  - Ensure reduced-motion and failed-motion paths leave the poster/content visible.
  - Ensure mobile-menu hidden/inert/ARIA state transitions are mutually consistent.
  - Ensure focus restoration cannot point to a removed or hidden element.
- [ ] **Step 4: Re-run static checks and perform live deployed checks for homepage navigation and calculator query-string handoff.**
- [ ] **Step 5: Commit the homepage hardening.**

---

### Task 3: Verify and harden the assessment conversion path

**Files:**
- Modify: `assets/js/start.js` only if a verified defect exists
- Modify: `assets/js/core.js` only if a verified defect exists
- Modify: `assess-a-facility/index.html` only if a verified defect exists
- Test: `tests/site-qa.py`

**Interfaces:**
- Preserve the existing WhatsApp-first, mailto-fallback flow.
- Never represent a WhatsApp handoff as confirmed submission.

- [ ] **Step 1: Add regression assertions for required-field validation, phone/email validation, calculator prefill fields, and WhatsApp/mail fallback configuration.**
- [ ] **Step 2: Run and verify the regression assertions fail where current behavior is deficient.**
- [ ] **Step 3: Implement only the minimal fixes needed.**
- [ ] **Step 4: Live-test the form without sending a real enquiry.**
  - Confirm empty required fields are rejected.
  - Confirm calculator parameters populate the corresponding fields.
  - Confirm the generated WhatsApp URL contains the entered enquiry data.
  - Confirm popup-blocked behavior exposes the direct contact fallback.
- [ ] **Step 5: Re-run the full QA suite and commit.**

---

### Task 4: Canonical route, redirect, SEO, and metadata verification

**Files:**
- Modify canonical route HTML only where a verified defect exists.
- Modify: `sitemap.xml` only if route inventory is inconsistent.
- Modify: `robots.txt` only if required by verified crawl behavior.
- Test: `tests/site-qa.py`

- [ ] **Step 1: Add assertions for every canonical route, canonical URL, OG URL, title, description, and sitemap membership.**
- [ ] **Step 2: Run the checks and record any mismatches.**
- [ ] **Step 3: Fix verified mismatches without changing the approved IA.**
- [ ] **Step 4: Live-check all nine canonical routes and all four legacy routes.**
- [ ] **Step 5: Confirm legacy routes resolve to the intended canonical paths and do not appear in the sitemap.**
- [ ] **Step 6: Commit route/SEO fixes.**

---

### Task 5: Responsive and accessibility hardening

**Files:**
- Modify: `assets/css/site.css` only for observed responsive/accessibility defects.
- Modify relevant HTML/JS only where the defect originates there.
- Test: `tests/site-qa.py`

- [ ] **Step 1: Add static assertions for skip-link target, form labels, button names, mobile-menu ARIA state, hidden navigation, and image alt coverage where applicable.**
- [ ] **Step 2: Run the assertions and confirm expected failures before fixes.**
- [ ] **Step 3: Fix observed defects at mobile widths and keyboard interaction points.**
- [ ] **Step 4: Live-check homepage and assessment page at mobile and desktop viewports for horizontal overflow and critical CTA visibility.**
- [ ] **Step 5: Live-check reduced-motion rendering behavior.**
- [ ] **Step 6: Commit accessibility/responsive fixes.**

---

### Task 6: Performance and resilience pass

**Files:**
- Modify: HTML/CSS/JS only for verified performance or resilience defects.
- Test: `tests/site-qa.py`

- [ ] **Step 1: Add assertions for local asset references, missing critical assets, duplicate script initialization, and independent calculator initialization.**
- [ ] **Step 2: Run the assertions and verify failures are meaningful.**
- [ ] **Step 3: Fix only verified issues.**
  - Do not add speculative libraries.
  - Do not replace the cinematic hero with a heavier asset unless the current implementation is demonstrably unusable.
  - Keep optional motion progressively enhanced.
- [ ] **Step 4: Live-check asset loading and page content with motion dependencies unavailable or degraded where the browser tool permits.**
- [ ] **Step 5: Commit resilience/performance fixes.**

---

### Task 7: Claim and content red-team

**Files:**
- Modify affected page HTML only when a claim is demonstrably too broad, unsupported, or inconsistent with Netso ground truth.
- Test: `tests/site-qa.py`

- [ ] **Step 1: Build a machine-checkable denylist for unsupported public claims, with exact phrases and variants.**
- [ ] **Step 2: Run it across all public HTML.**
- [ ] **Step 3: Review every finding in context, distinguishing legitimate qualified language from unsupported claims.**
- [ ] **Step 4: Fix unsupported claims and leave verified conditional language intact.**
- [ ] **Step 5: Re-run the claim scan and commit.**

---

### Task 8: Full production verification

**Files:** none unless a preceding verification discovers a defect.

- [ ] **Step 1: Run the full repository QA command.**
- [ ] **Step 2: Verify the resulting Vercel deployment reaches READY.**
- [ ] **Step 3: Fetch every canonical route from production and confirm HTTP success.**
- [ ] **Step 4: Verify all legacy redirects in production.**
- [ ] **Step 5: Verify homepage calculator output and assessment handoff with representative inputs.**
- [ ] **Step 6: Verify form validation and non-submitting WhatsApp handoff behavior.**
- [ ] **Step 7: Verify reduced-motion and mobile behavior with the available browser/scrape tooling.**
- [ ] **Step 8: Verify no malformed href/tag patterns remain.**
- [ ] **Step 9: Verify no unsupported public claims remain.**
- [ ] **Step 10: Record exact deployment SHA, deployment URL, test command, test result, route results, and any deferred minor findings.**

---

## Completion Gate

The work is complete only when:

1. The QA command exits successfully with zero unexpected findings.
2. Every canonical route returns successfully in production.
3. Every legacy route redirects to the approved canonical destination.
4. Homepage calculator is functional and its assessment handoff preserves inputs.
5. Assessment validation and handoff behavior are verified without falsely claiming delivery.
6. Mobile navigation and reduced-motion behavior are verified.
7. No horizontal overflow or critical accessibility defect remains in the tested viewports.
8. No unsupported maturity, financing, savings, live telemetry, or executed-project claims remain.
9. Production deployment is READY and matches the verified branch.
10. A final independent review is performed if a reviewer tool is available. If not, explicitly report that the final review is an author self-review.

## Review Focus for Final Review

The final reviewer must specifically challenge:
- whether any copy still makes Netso appear more mature than pre-revenue/zero-install reality
- whether the hero motion can fail without blanking the page
- whether mobile navigation can trap focus or scroll
- whether the calculator can produce misleading economics
- whether form handoff is accurately described
- whether route metadata and redirects are internally consistent
- whether the public operating-layer page is clearly architectural rather than live telemetry
