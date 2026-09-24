# Netso Energy — production readiness

Status as of **24 September 2026**. Nothing here is aspirational: an item is `DONE` only if it
was executed and checked, `PENDING` if it needs something the site cannot supply (a real photo, a
real endpoint, human eyes), and `N/A` if the item does not apply to this build.

Run order for a release:

```bash
cd netso
python3 tools/make_og.py        # only if page titles or feature images changed
python3 tools/build.py          # fails the build if any draft/internal text survives
python3 tools/serve.py 8100     # local preview at http://127.0.0.1:8100
```

---

## A. Checklist

| # | Item | Status | Evidence / what remains |
|---|---|---|---|
| 1 | Replace CGS placeholder with authentic imagery | **DONE (honestly)** | The stand-in photograph is **gone**. The slot now carries a status record panel (`.record`) stating LOI → PPA signed → construction not started → commissioning not started. **No image is used for a named, contracted project.** Real photography requires the system to be built. Substitution point marked in `home.html`, `projects.html`, `about.html`. |
| 2 | Verify every public numerical claim against its source | **DONE** | 80 kWp · PPA signed · ≈35% below BERC · Tk 15.36/kWh (June 2026 order) · 5,500 MW 2030 target · ~213 MW installed · Tk 11.50–12.00 band · first close ≈480 kWp · ~400 kWp · ~200–300 kWp · 10 sites. All trace to the Sept 2026 deck; approximate figures are labelled approximate. **One item to confirm:** CGS "Term — 20 years" (standard Netso term, stated in the teaser as ownership life; confirm it is the signed PPA term). |
| 3 | Verify every project status | **DONE** | Ladder applied per project and confirmed by the company for CGS. No project described as built, commissioned, generating or operational anywhere. |
| 4 | Remove all draft/internal comments from production output | **DONE** | `tools/build.py` strips `<!-- INTERNAL … -->` / `<!-- TO BE SUPPLIED … -->` and then fails the build if draft language survives. Verified on all 8 served routes: CLEAN. |
| 5 | Finalise Privacy Policy | **PENDING** | Needs counsel + the company's retention schedule, storage locations, processors and data-protection contact. Internal note remains in `src/pages/privacy.html` (stripped from output). No jurisdiction claimed. |
| 6 | Finalise Terms | **PENDING** | Needs governing law, jurisdiction, entity/registration details and the liability position confirmed by counsel. Internal note in `src/pages/terms.html`. |
| 7 | Replace placeholder email | **PENDING** | `hello@netso.energy` appears in header, footer, form success message and the capital CTA. The internal deck contact is `tazwar@netsoenergy.com` — publishing a personal address is the company's call. |
| 8 | Connect the enquiry form to a production endpoint | **PENDING** | By design. Form validates, normalises, shows success and dispatches `netso:leadSubmitted` with the full payload; nothing is transmitted. One swap point in `assets/js/core.js`. Payload keys: name, company, email, phone, facility_location, facility_type, rooftop_area, consumption, tariff, sanctioned_load, existing_solar, notes, consent. |
| 9 | Add analytics | **PENDING** | None installed. No third-party scripts of any kind load on the site (verified: zero external requests). Choose a tool before adding, and update the Privacy Policy in the same pass. |
| 10 | Add appropriate metadata / OG image | **DONE** | `tools/make_og.py` generates five 1200×630 cards using the real self-hosted brand fonts. `og:image` (all routes resolve), `og:image:width/height`, `twitter:card`, `twitter:image`, `og:locale`, canonical, per-page title/description. |
| 11 | Verify favicon / manifest | **DONE** | `favicon.svg` + 96px PNG + apple-touch-icon (all 200). `manifest.webmanifest` at root, linked from every page, name/short_name/theme/background/icons declared. |
| 12 | Test mobile | **DONE** | Slow-mobile re-measured after this pass: FCP 2,028 → 1,068 ms. | 390×844: all routes 200, errors=0, no horizontal overflow (hero proof strip bottom 826 ≤ 844; record panels and pipeline rows fit). |
| 13 | Test desktop | **DONE** | 1440×900: all routes 200, errors=0, hero content inside 900. |
| 14 | Test reduced motion | **DONE** | With `prefers-reduced-motion: reduce`, headline, CTA, proof strip and model steps all compute `opacity: 1` within 300 ms — nothing is hidden behind an animation. Sequence shows the installed state immediately. |
| 15 | Test form submission | **DONE** | Invalid submit blocked with 6 field errors and focus moved to the first; valid submit fires `netso:leadSubmitted` once with the complete payload; success panel replaces the form; empty optional fields pass through as empty strings. |
| 16 | Test 404 | **DONE** | Unknown paths return status 404 with the styled page and site chrome. |
| 17 | Run production build | **DONE** | 8 routes, ~148 KB total, build guard active. |
| 18 | Run final console/network check | **DONE** | Zero console errors, zero failed requests, **zero external network requests** across all routes. Vendor folder pruned (unused `rive.js`, `ScrambleTextPlugin.min.js` deleted). |
| 21 | Server compression + font subsetting | **DONE (added this pass)** | `serve.py` gzips text assets (it previously sent everything uncompressed — local measurements were ~3× pessimistic). `tools/subset_fonts.py` reduced the ten fonts from 254 KB to 68 KB with no glyph loss. **Re-run the subsetter if copy adds characters outside its set; `--restore` reverts.** |
| 22 | Hero image priority | **DONE (added this pass)** | The installed-state layer was competing with the first-paint layer at equal priority. It is now `fetchpriority="low"`. |
| 19 | Confirm no Daylight assets, fonts, copy or branding remain | **DONE** | No occurrence of "Daylight", `godaylight`, or any of its asset filenames anywhere in `src/`, `assets/`, `tools/` or built output (only a provenance mention in README). Fonts are self-hosted Archivo / IBM Plex Mono / Instrument Serif. No runtime CDNs. |
| 20 | 10-second comprehension test | **PENDING — needs 5 people** | Protocol and tally sheet in section B. |

**Release blockers:** 5, 6, 7, 8 (endpoint), 20. Items 1–4, 9–19, 21–22 are complete or
correctly deferred.

**Note on the deploy target:** the gzip added to `tools/serve.py` is a *local* fix so
measurements here are honest. Whatever hosts the real site (Netlify, Cloudflare, Nginx, S3+CDN)
must also serve the text assets compressed — verify that before launch, because uncompressed
CSS/JS/HTML is the single biggest avoidable cost in the numbers above.

---

## B. The 10-second test

The site's job is to make a stranger say *"they develop and operate solar infrastructure on
commercial rooftops, the customer buys the power"*. It cannot be self-assessed by anyone who built
it, so run it on five people who know nothing about Netso.

### Protocol

1. Open **https://the-site** on a laptop, home page at the top. Do not scroll, explain or
   introduce the company.
2. Say: *"Look at this for about ten seconds. Then I'll ask you three questions."*
3. After ten seconds, close the laptop or scroll away, and ask in this order. Write the answer
   down **word for word** before reacting.
4. Do not prompt, correct or help. A leading question invalidates the run.

### Questions and what counts as a pass

| Q | Target answer | Fail signal |
|---|---|---|
| 1. What does Netso do? | "develops and operates solar / energy infrastructure on commercial rooftops" (develop **and** operate, or develop/own/operate) | "installs solar panels" · "sells solar panels" · "sustainability company" · "helps companies go green" |
| 2. Who owns the system? | "Netso" or "Netso's project company / the project entity" | "the customer" · "the building owner" · "I don't know" |
| 3. What does the customer do? | "buys the electricity" · "pays per unit / kWh under a PPA" | "buys the panels" · "gets it installed for free" · "rents out their roof" |

**Score:** question 1 is the gate. If fewer than four of five answer Q1 correctly, the homepage
still needs work — the fix is almost always in the hero or the first full screen, not in adding
more sections. Q2 and Q3 confirm the model is understood rather than just the category.

### Tally sheet

| Tester (initials, no context) | Q1 (verbatim) | Q2 | Q3 | Q1 pass? |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |

**Result: ___ / 5 on Q1. Action: ______________ (date).**

### If Q1 fails

The likely causes, in order of probability:

1. The hero sub-line reads as a category description rather than a mechanism.
2. The first full screen shows the opportunity (a roof) without naming who carries the asset.
3. The four-step strip is below the fold on a small laptop (check 1280×720, not just 1440×900).

Record the verbatim answers in `tools/shots/` alongside the run date — the wrong answers are
more useful than the score.
