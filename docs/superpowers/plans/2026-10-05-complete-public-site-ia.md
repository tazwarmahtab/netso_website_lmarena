# Netso Public Site Information Architecture Implementation Plan

> For agentic workers: use superpowers subagent-driven development or executing-plans. Steps use checkbox syntax.

Goal: Turn the current Netso branch into a coherent, disclosure-disciplined C&I energy infrastructure website with a canonical route system, strong commercial journeys, useful industry depth, and no orphan or legacy public paths.

Architecture: Keep the existing static HTML architecture and visual system. Establish canonical human-readable routes, preserve legacy URLs through lightweight redirects, and make the public information architecture mirror the actual Netso sales and financing funnel: understand the thesis, understand the model, understand project qualification, understand capital, then act. Do not create fake portfolio, live telemetry, or speculative financing claims.

Tech Stack: Existing static HTML, CSS, vanilla JavaScript, GSAP/ScrollTrigger, Vercel deployment.

Global Constraints:
- Public positioning remains C&I rooftop solar / distributed energy infrastructure, not residential solar.
- Netso is presented as developer / asset owner / operator, not an EPC seller.
- No project-specific proof, installed capacity, revenue, financing approval, DSCR, tariff, savings, or live telemetry unless explicitly verified and disclosure-ready.
- Canonical customer CTA is Assess a facility.
- Canonical capital CTA is Capital partners.
- Existing legacy URLs must not become broken links.
- Public navigation stays compact. Do not create pages merely to increase page count.
- Every new page must earn its existence by serving a distinct buyer, capital, trust, or qualification job.
- Mobile navigation and footer must use the same canonical IA as desktop navigation.
- Sitemap must contain canonical indexable pages only.

Route architecture:
- / canonical homepage
- /our-model canonical model page
- /for-businesses industrial customer journey
- /technology-operations engineering and operating credibility
- /capital-partners capital and underwriting page
- /about company and thesis
- /assess-a-facility canonical conversion funnel
- /legal/privacy and /legal/terms
- /how-it-works and /start-a-project remain compatibility routes
- /estimate and /projects remain legacy compatibility routes only and should not be indexable

Task 1: Canonical route architecture
- Establish /our-model as canonical public model page while preserving /how-it-works.
- Establish /assess-a-facility as canonical assessment page while preserving /start-a-project.
- Update all internal links to canonical routes.
- Add compatibility handling for legacy routes.
- Verify every sitemap URL maps to a real canonical page.

Task 2: Industrial customer journey
- Create /for-businesses.
- Explain qualification, economics, engineering diligence, contracting, construction, and operations.
- Include RMG/manufacturing reality without unsupported customer logos or project claims.
- Link to the assessment funnel at the strongest conversion points.

Task 3: Engineering and operating credibility
- Create /technology-operations.
- Explain site screening, load matching, system design, interconnection, monitoring, O&M, collections, exceptions, and reporting.
- Present the Netso operating layer as architecture/capability until live assets exist.

Task 4: Trust and company surface
- Clean About, privacy, terms, and 404.
- Remove legacy labels and unresolved placeholders.
- Keep company-stage disclosure honest without making the site feel weak.

Task 5: Sitemap and navigation audit
- Audit every href for stale /projects, /estimate, and legacy CTA labels.
- Audit canonical tags.
- Audit desktop, mobile, and footer navigation parity.
- Remove or de-index obsolete public surfaces.
- Verify final route inventory against intended IA.

Task 6: Deployment verification
- Confirm latest Vercel deployment is READY.
- Verify canonical route files are deployed.
- Verify HTML integrity and no malformed tags.
- Review branch diff.
- Request code review before merge.
- Do not merge PR #7 in this pass.