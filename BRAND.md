# Netso brand & content notes (v1 working system)

This is the working identity the first prototype uses. It is a proposal, not a final
identity — everything here is a token or a file that can be swapped in one place.

## Positioning

> **Netso builds the asset-owner layer for distributed C&I solar.**

Not an EPC-first company. Not an equipment retailer. Not a sustainability consultancy.
We develop and operate contracted energy assets. *You use the power. We build and operate
the asset.*

## Voice rules used across the site

The audience is a managing director, owner, CFO, operations or energy lead at a facility
in Bangladesh. They understand electricity cost, capital allocation and infrastructure.
So: commercial and technical, never aspirational; specific over evocative; short
declaratives; no "revolutionise", no "green future", no claims without a source.

## Lines

| Line | Role | Where it is used |
|---|---|---|
| **YOUR ROOF. NOW AN ENERGY ASSET.** | Primary (working) — direction A | Home hero (default), footer, meta titles. Directions B and C are rendered for review at `/?hero=B` / `/?hero=C`. |
| *The roof. Re-wired.* | Secondary / campaign expression | Not on the site yet — kept for campaigns |
| *Your roof generates revenue.* | Direction B — rendered for review only | Available at `/?hero=B` with sub-copy that states the mechanism precisely (electricity metered and sold under a signed PPA; revenue comes from the agreement, not from the roof). **Default remains direction A**; do not switch the default until conversion testing justifies it. |
| *Most people see a roof. Netso sees an energy asset.* | Narrative device | Home §01 headline |
| *You use the power. We build and operate the asset.* | Model thesis | /how-it-works hero, home §02–03 |

## Palette (tokens in `assets/css/site.css`)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#101215` | Primary text, dark buttons |
| `--ink-2` | `#22262B` | Body copy |
| `--muted` | `#6E7276` | Secondary text, mono labels |
| `--paper` | `#F5F3EF` | Base surface (warm off-white, not cream) |
| `--paper-2` | `#EDEAE4` / `--paper-3` `#E4E0D8` | Alternating section bands, media placeholders |
| `--void` | `#0C0E11` | Dark panels: pilot, vision, CTA, footer |
| `--solar` | `#E3841B` (deep `#B85F0A`) | The only warm accent: links, rules, data marks |
| `--sky` | `#1B5FA8` / `--blueprint` `#1747C8` | Technical/informational accents |
| `--green` | `#1F7A5A` | Verified-evidence state |

Rule of thumb: **ink + paper carry the site, solar is an instrument, not decoration.**
No gradients except the hero scrim and the blueprint grid.

## Type

| Role | Face | Notes |
|---|---|---|
| Display / headlines | **Instrument Serif** | Used for big statements only, with italic for emphasis words (`energy asset`, `asset-owner layer`) |
| UI + body | **Archivo** (variable, 100–900, 62–125% width) | Weight 500 for headings, 400 for body, tight tracking (-0.02em) |
| Labels / data | **IBM Plex Mono** | Uppercase eyebrows, section indices, spec tables, tags, numbers |

All three are open source (SIL OFL) and self-hosted in `assets/fonts/`, so nothing is
licensed from another company. To swap in brand fonts, edit `assets/css/fonts.css` and the
`--font-*` tokens — nothing else references font names.

## Visual language

**Infrastructure × Architecture × Energy × Capital × Data.** In practice:

* Arial/drone photography of real industrial environments — factory rooftops, RMG
  facilities, commercial buildings, aerial cluster views, technical infrastructure.
* Diagrams over decoration: the flow map (Develop → Finance + Build → Own + Operate →
  Buy the Power), the phase pipeline, spec tables, evidence chips.
* Blueprint grid backgrounds for dark "engineering" sections.
* Mono uppercase labels with section indices (`01 — THE ROOFTOP OPPORTUNITY`) acting as
  the site's wayfinding system.
* Avoid entirely: green leaves, stock solar close-ups, happy-executive handshakes,
  sustainability clichés, gradient/glow startup aesthetics.
* **Hero:** one facility, roof as the subject — never a generic field of panels. The opening
  sequence is *ordinary rooftop → site assessed → infrastructure deployed → energy flowing*,
  with the survey overlay drawn as vector (not baked into the photo) so it stays editable.

## Component vocabulary

`hero` · `pagehero` · `sec-head` (index + eyebrow + title) · `flowmap` (4-cell model) ·
`statgrid` / `statcard` · `pipeline` (numbered steps) · `compare` (two-column contrast) ·
`difftable` · `spec` (definition list) · `phase` (how-it-works sections) · `beliefs` ·
`roadmap` · `evidence` chips · `tag` (active/pipeline/dark) · `note` (callout) ·
`accordion` · `subnav` (sticky scrollspy) · `formcard` + `form-status` · `cta` band.

## Headline (locked)

**Your roof. / *Now an energy asset.*** — direction A, fixed in markup. Support line: *Netso
develops, finances, owns and operates distributed energy infrastructure for Bangladesh's
businesses.* Kept above the fold: *You use the power. We build and operate the asset.*

Above the fold with the headline: the four-step model (you have a roof → we develop → we finance,
own and operate → you buy the electricity under a long-term PPA), and the line *"You use the power.
We build and operate the asset — Netso funds the system. Qualifying projects only."* The
qualification clause goes in the same sentence as the financing claim, never as a footnote.

Recorded alternatives, re-tested and rejected 24 Sep 2026: **"Your roof generates revenue."**
— its supporting copy has to explain qualification and contracting before the claim is true, and
that walk-back runs to five lines on a 390 px screen, so the caveat becomes the hero.
**"Turn your roof into an energy asset."** — implies nothing false, but describes the visitor's
action rather than the company's. Also tested and rejected: **A + an explicit financing headline
cue** — two variant ideas stacked in one hero. Do not revive any of them without a reason.

## Contested claims in visual form

A photograph placed under a named project reads as documentary evidence. The contracted project
therefore carries a **status record panel, not a picture**, until the system is built and can be
photographed. Never fill that slot with stock, generated or "representative" imagery. The same
applies to any future project page: the picture must be the actual site, or there is no picture.

## Status vocabulary (use exactly)

Asset states are stated in contractual terms, never aspirational ones:

**Screened → proposal → MOU signed → LOI executed → PPA signed → built → commissioned → operating.**

A Letter of Intent or MOU is not a contract; a signed PPA is a contract but not a built asset; and
contracting is not commissioning. Never write "operational", "generating", "running", "in service",
"validated pilot" or "installed" for an asset that is contracted but pre-construction — say "signed"
and say "pre-construction". The first asset is currently **PPA signed, pre-construction**: describe
it that way everywhere until construction completes. Approximate capacities are always marked
approximate and attributed to screening, with the survey named as the thing that confirms them.
Indicative tariffs are labelled indicative, never offered.

## Evidence convention (keep this)

Every factual claim carries one of four states — **Verified · Corroborated ·
Interpretive · Unresolved** — rendered as a chip next to the claim, with the definition
table published on `/projects`. Pipeline entries are labelled *not operational*
everywhere they appear. Read this as brand behaviour, not just a content rule: it is how
the site stays credible with both facility owners and capital partners.

## CTA rules

Primary: **START A PROJECT** (header, hero, section ends, footer).
Secondary: **SEE HOW IT WORKS**. Contextual: **WHAT CAN YOUR ROOF DO?**
Never: Buy Now · Get a Quote · Book a Demo · Request a Solar Installation.
