# Netso Cinematic Revenue Hero Design Specification

**Status:** Proposed design, approved in conversation for specification drafting  
**Date:** 2026-10-06  
**Repository:** `tazwarmahtab/netso_website_lmarena`  
**Base:** `master` at `cd949994fec064060c9f744a32ac55a9e9b35628`  
**Design branch:** `feature/cinematic-revenue-hero`

## 1. Objective

Upgrade the Netso homepage from a strong static C&I commercial site with micro-interactions into a coherent cinematic narrative that makes the commercial proposition physically legible:

```
INDUSTRIAL ROOF
    ↓
SOLAR ASSET
    ↓
POWER
    ↓
PPA
    ↓
CONTRACTED CASH FLOW
    ↓
OPERATING INFRASTRUCTURE
    ↓
FACILITY ASSESSMENT
```

The primary homepage proposition becomes:

> **YOUR ROOF. GENERATING REVENUE.**

This supersedes the earlier working preference for `YOUR ROOF. NOW AN ENERGY ASSET.` and the previously recorded rejection of the revenue direction. The change is intentional and user-approved. The supporting copy must immediately establish the contractual mechanism so the headline does not imply that every roof automatically produces revenue.

`THE ROOF. RE-WIRED.` remains the campaign/signature expression and may appear as a cinematic transition or secondary brand line.

## 2. Business truth and wording constraint

Netso is a C&I rooftop solar RESCO / asset-owner platform. It develops, finances, owns and operates qualifying distributed solar infrastructure. The facility uses the electricity under the final commercial agreement, typically a PPA/OPEX structure.

The phrase `YOUR ROOF. GENERATING REVENUE.` is therefore treated as a commercial framing, not a literal universal claim.

Required qualifier near the hero:

> Project eligibility, commercial terms and any revenue or savings outcome depend on site assessment, financing and final agreement.

The experience must never imply:
- guaranteed revenue
- guaranteed savings
- a fixed Netso tariff
- a fixed PPA duration unless verified for the specific context
- a specific debt rate unless approved evidence supports it
- an operating portfolio that does not exist
- live telemetry when the underlying data is illustrative
- customer project execution when the project status is pre-construction

Existing evidence/status conventions in `BRAND.md` remain authoritative.

## 3. Experience architecture

The homepage is one continuous narrative rather than a collection of unrelated animations.

### Chapter 0: Arrival

Minimal entry state. Bangladesh / C&I positioning. The existing portal/intro behavior may remain, but it must not delay useful content or become a second competing hero.

### Chapter 1: The roof

Show one real or art-directed Bangladesh industrial facility. The roof is the protagonist.

Camera movement approaches the roof. The primary headline resolves to:

> YOUR ROOF.  
> GENERATING REVENUE.

The visual must communicate that the physical roof is the starting asset.

### Chapter 2: Roof transformation

Use a matched-composition transformation:

```
ordinary industrial roof
        ↓
same roof + solar infrastructure
```

The visual technique should follow the ScrollDissolveReveal principle: two spatially matched states, progressively revealed through scroll.

### Chapter 3: Energy path

Reveal a restrained infrastructure flow:

```
SOLAR → INVERTER → FACILITY → POWER
```

This is architectural visualization, not live operational telemetry.

### Chapter 4: Semantic transformation

Use the FlipFadeText pattern selectively for one major semantic transformation:

```
ROOF
POWER
CASH FLOW
```

Avoid repeated animated adjectives or decorative text cycling.

### Chapter 5: Commercial model

Resolve the cinematic sequence into:

```
ROOF
  ↓
SOLAR ASSET
  ↓
POWER
  ↓
PPA
  ↓
CASH FLOW
```

This section bridges visual storytelling and the existing commercial explanation.

### Chapter 6: Indicative economics

Transition from physical roof to economic asset. Preserve the existing screening model and conservative self-consumption logic. Animation may explain the relationship between roof area, estimated capacity, generation, contractable energy and indicative value, but must not alter the financial model.

### Chapter 7: Operating architecture

Introduce the Netso operating layer:

```
FINANCING
    ↕
NETSO OPERATING LAYER
    ↕
ASSETS · INVERTERS · PAYMENTS · FIELD OPERATIONS
```

Label this as architecture unless backed by live system data.

### Chapter 8: Capital partners

Show the asset/cash-flow structure:

```
OFFTAKER
    ↓
PPA / PAYMENT OBLIGATION
    ↓
PROJECT SPV
    ↓
SOLAR ASSET
    ↓
ENERGY + COLLECTIONS
    ↓
DEBT SERVICE / INVESTOR CASH FLOW
```

Do not insert unsupported financing rates, returns, DSCRs, guarantees or project claims.

### Chapter 9: Conversion

End the cinematic experience and return to restrained UI:

> **SEE WHAT YOUR ROOF CAN SUPPORT.**

Primary CTA:

> **ASSESS A FACILITY ↗**

The conversion form remains functional HTML and does not depend on the cinematic layer.

## 4. Technical architecture

### GSAP / ScrollTrigger

Own:
- pinned cinematic stages
- scroll progress
- video/frame scrubbing
- major camera choreography
- section-level timeline sequencing
- large-scale transforms
- cinematic scene transitions

The existing GSAP hero/video implementation is retained where useful and extended rather than replaced blindly.

### Motion

The existing `assets/js/motion.js` remains responsible for:
- tactile button physics
- hover interactions
- small UI reveals
- numerical spring interpolation
- low-amplitude interface motion

Motion must not compete with GSAP for the same transform properties on the same cinematic elements.

### Three.js

Three.js is optional and must earn its weight.

Use it only for spatial infrastructure metaphors where real-time geometry materially improves comprehension or interaction. Do not convert the entire homepage into a WebGL application.

### Scroll-scrubbed video / image sequence

A pre-rendered cinematic sequence is permitted for the hero when it gives materially better visual fidelity than DOM/Three.js rendering.

The implementation should adopt the frame-continuity principle from `scroll-world`: adjacent visual states must be art-directed as a continuous camera movement rather than stitched together as unrelated clips.

### Vanilla architecture

Do not rewrite the site into React or Next.js solely for these components. The current static HTML/CSS/JS architecture remains the production architecture.

## 5. Asset direction

Hero imagery must center on Bangladesh C&I infrastructure:
- industrial rooftops
- RMG/factory architecture
- electrical infrastructure
- solar arrays
- inverter/electrical-room details
- aerial industrial clusters

Avoid:
- suburban homes
- generic residential solar
- generic green-energy stock
- futuristic cities
- fabricated customer/project photography
- decorative floating panels

The primary transformation should use matched camera composition wherever possible.

## 6. Motion language

The system has four levels:

1. **Cinematic narrative:** GSAP/video/ScrollTrigger
2. **Physical transformation:** matched-image dissolve
3. **Semantic transformation:** selective FlipFadeText pattern
4. **Interface physics:** Motion springs

Supporting state effects such as dither, morph or percentage loading are allowed only when they represent a real UI state.

No animation exists solely to demonstrate animation capability.

## 7. Mobile

Mobile is a first-class composition.

Desktop and mobile may use different:
- camera framing
- crop
- sequence length
- scene complexity
- typography scale
- energy-flow density

Do not simply crop a desktop cinematic sequence into a phone viewport.

The mobile narrative may compress to:

```
ROOF → SOLAR → POWER → ECONOMICS → ASSESS
```

## 8. Performance and fallback

The cinematic layer is progressive enhancement.

Required states:

### Normal motion
Full experience where hardware/network permits.

### prefers-reduced-motion
No scroll-scrubbed cinematic choreography. Static final states remain visible and content remains complete.

### Save Data
Existing Netso reduced-data behavior remains authoritative. Avoid downloading expensive cinematic assets unnecessarily.

### Slow connection
Poster/static imagery must appear before heavy assets. Cinematic media must never block primary content or navigation.

### WebGL unavailable
Three.js components fall back to DOM/SVG/static representations.

### Video unavailable
Use poster/static image and retain the narrative copy.

### JavaScript unavailable
Core HTML content, navigation, economics form and assessment path remain usable.

## 9. Accessibility

- All essential information exists in semantic HTML.
- Canvas/WebGL is enhancement only.
- Keyboard users can reach all CTAs.
- Focus-visible treatment remains intact.
- Reduced motion removes choreography, not meaning.
- No animation is required to understand the business model.
- No important claim is encoded only inside a visual effect.

## 10. Conversion rules

Primary CTA:

> **ASSESS A FACILITY**

Secondary:
> **CAPITAL PARTNERS**

The homepage should not add multiple competing CTAs inside the cinematic sequence.

WhatsApp remains a secondary handoff, not the principal commercial CTA.

The assessment flow must preserve calculator parameters when handed off from the economics section.

## 11. Data and truth rules

The cinematic system must not introduce unsupported factual claims.

All numbers must originate from existing verified/approved site logic or be explicitly labeled indicative.

Illustrative system visualizations must use language such as:
- Operating architecture
- Illustrative flow
- Indicative economics

Do not use:
- LIVE
- ACTIVE
- GENERATING
- INSTALLED
- OPERATING

unless the underlying status is actually verified.

## 12. Engineering boundaries

Create a dedicated cinematic layer rather than expanding `home.js` indefinitely.

Likely responsibilities:

```
assets/js/
  home.js                  existing page orchestration
  motion.js                existing interface physics
  cinematic-home.js        new cinematic scene controller
```

Potential CSS responsibilities:

```
assets/css/
  site.css                 existing global system
  cinematic-home.css       new cinematic-specific styles
```

Exact splitting should follow the existing source/build conventions. Do not create files that remain single-use dead abstractions.

## 13. Vertical-slice-first implementation

The first implementation must be only:

```
INDUSTRIAL ROOF
      ↓
CAMERA APPROACH
      ↓
SOLAR TRANSFORMATION
      ↓
YOUR ROOF.
GENERATING REVENUE.
      ↓
THE ROOF. RE-WIRED.
```

This slice must be evaluated for:
- visual continuity
- scroll feel
- copy clarity
- mobile behavior
- reduced-motion fallback
- performance
- transform ownership
- no false claims

Only after this slice passes should the remaining cinematic chapters be implemented.

## 14. Acceptance criteria

The completed experience is acceptable only when:

1. The hero communicates C&I positioning within the first viewport.
2. `YOUR ROOF. GENERATING REVENUE.` is supported by immediate contractual context.
3. The roof-to-solar transformation is visually continuous.
4. `THE ROOF. RE-WIRED.` functions as a signature expression rather than competing with the commercial headline.
5. The cinematic layer does not fight existing Motion or GSAP ownership.
6. The economics calculator remains mathematically unchanged.
7. No unsupported operational or financing claims are introduced.
8. Reduced-motion users receive the complete narrative without scroll choreography.
9. Mobile has an intentional composition.
10. Assessment conversion remains available and functional without the cinematic layer.
11. Static QA passes.
12. Production deployment is verified before claiming completion.

## 15. Non-goals

This project does not:
- replace the LMArena repository
- wholesale merge the Kimi repository
- clone any reference repository
- rewrite Netso into React
- build a fake live fleet dashboard
- create a real-time VPP platform
- expose unverified customer projects
- add unsupported financing terms
- turn the site into a generic Three.js showcase
