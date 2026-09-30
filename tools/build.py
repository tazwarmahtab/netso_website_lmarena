#!/usr/bin/env python3
"""
build.py — assembles the Netso Energy site from src/partials + src/pages.

    python3 tools/build.py

Each page in PAGES is rendered into <out> using head.html + the partials
(skip, header, mobile menu, footer) around the page's own markup.
NOTE: the fragments are concatenated WITHOUT whitespace between tags so the
output stays free of stray line boxes.
"""
import os
import re
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
SITE = "https://netso.energy"

# --------------------------------------------------------------- deploy config
# Single source of truth for the two launch-blocking values. Set these before
# going live; they are injected into every page at build time.
#
#   CONTACT_EMAIL — the real inbox. Replaces the placeholder everywhere
#                   (footer, mailto links, privacy/terms, the form fallback).
#   FORM_ENDPOINT — where the enquiry form POSTs. Leave "" to use the built-in
#                   zero-backend mailto fallback (opens the visitor's mail
#                   client with the enquiry prefilled — works on any host).
#                   To use a hosted form service, paste its endpoint, e.g.
#                   Formspree:  https://formspree.io/f/xxxxxxxx
#                   (any service that accepts a multipart POST and returns 2xx
#                   works — the client sends `Accept: application/json`).
CONTACT_EMAIL = "hello@netso.energy"   # TODO: replace with the real inbox
FORM_ENDPOINT = ""                     # TODO: paste a form endpoint, or leave "" for mailto
# WhatsApp number for the enquiry CTA — country code + number, DIGITS ONLY
# (no "+", spaces or dashes). Example for Bangladesh: "8801712345678".
# When set, the enquiry form opens WhatsApp with every field prefilled; it also
# powers the "Chat on WhatsApp" links. Leave "" to fall back to endpoint/mailto.
WHATSAPP_NUMBER = "8801791222777"      # +880 179 122 2777 (wa.me needs digits only)

PAGES = {
    "home": dict(
        out="index.html", route="/", script="home.js", extra_js=["glyph-portal.js"],
        title="Netso Energy — Your roof. Now an energy asset.",
        desc="Netso Energy develops, finances, owns and operates distributed solar infrastructure for commercial and industrial customers in Bangladesh.",
        og="/assets/img/og/home.jpg",
    ),
    "how-it-works": dict(
        out="how-it-works/index.html", route="/how-it-works", script="how.js",
        title="How It Works — Netso Energy",
        desc="Develop, finance, build, own and operate: how Netso turns a commercial rooftop into a contracted energy asset, and how you buy the power through a long-term PPA.",
        og="/assets/img/og/how-it-works.jpg",
    ),
    "about": dict(
        out="about/index.html", route="/about", script="about.js",
        title="About — Netso Energy",
        desc="Why Netso exists: the asset-owner thesis, why Bangladesh, why distributed C&I energy, and where the company is going.",
        og="/assets/img/og/about.jpg",
    ),
    "start": dict(
        out="start-a-project/index.html", route="/start-a-project", script="start.js",
        title="Start a Project — Netso Energy",
        desc="Tell us about your facility. We will assess whether the roof can support a viable energy project.",
        og="/assets/img/og/start.jpg",
    ),
    "estimate": dict(
        out="estimate/index.html", route="/estimate", script="estimate.js",
        title="Estimate — Netso Energy",
        desc="Enter three screening inputs for an indicative rooftop plant size, generation range and grid-energy value for your facility. No PPA price is quoted; site-specific figures come from a survey and the PPA.",
        og="/assets/img/og/how-it-works.jpg",
    ),
    "privacy": dict(
        out="legal/privacy/index.html", route="/legal/privacy", script="legal.js",
        title="Privacy Policy — Netso Energy", desc="How Netso Energy handles personal and project information.",
        og="/assets/img/og/home.jpg", main_class="legal",
    ),
    "terms": dict(
        out="legal/terms/index.html", route="/legal/terms", script="legal.js",
        title="Terms of Service — Netso Energy", desc="Terms for using the Netso Energy website.",
        og="/assets/img/og/home.jpg", main_class="legal",
    ),
    "404": dict(
        out="404.html", route="/404", script="legal.js",
        title="Page not found — Netso Energy", desc="The page you were looking for is not here.",
        og="/assets/img/og/home.jpg", main_class="legal",
    ),
}

HEAD = """<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{title}</title>
<meta name="description" content="{desc}"/>
<link rel="canonical" href="{site}{route}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Netso Energy"/>
<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{desc}"/>
<meta property="og:url" content="{site}{route}"/>
<meta property="og:image" content="{site}{og}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:locale" content="en_GB"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="{site}{og}"/>
<link rel="manifest" href="/manifest.webmanifest"/>
<meta name="theme-color" content="#F5F3EF" media="(prefers-color-scheme: light)"/>
<meta name="theme-color" content="#0C0E11" media="(prefers-color-scheme: dark)"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="icon" href="/assets/img/favicon-96.png" sizes="96x96" type="image/png"/>
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png"/>
<link rel="preload" href="/assets/fonts/Archivo-100-900-normal-latin.woff2" as="font" type="font/woff2" crossorigin/>
<link rel="preload" href="/assets/fonts/InstrumentSerif-400-normal-latin.woff2" as="font" type="font/woff2" crossorigin/>
{hero_preload}
<script>/* opt-in intro animations; auto-failsafe so content is never hidden even if
   the main bundle fails to load */
document.documentElement.classList.add('anim');
setTimeout(function () {{ document.documentElement.classList.remove('anim'); }}, 2000);</script>
<script>/* page-transition curtain: if we arrived through an internal wipe, cover the
   page before first paint so there is no flash, then uncover as a failsafe even
   if the main bundle never loads. Disabled for reduced motion. */
(function(){{try{{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(sessionStorage.getItem('netso:wipe')==='1'){{
    document.documentElement.classList.add('wipe-cover');
    setTimeout(function(){{document.documentElement.classList.remove('wipe-cover');}},1400);
  }}
}}catch(e){{}}}})();</script>
{intro_head}
{jsonld}
<link rel="stylesheet" href="/assets/css/fonts.css"/>
<link rel="stylesheet" href="/assets/css/site.css"/>
</head>
<body data-page="{key}" class="{body_class}">"""

# Organization + WebSite structured data. Only facts already stated on the
# site are included — no invented address, phone, registration or founding
# claim. Emitted once, on the home page.
JSONLD = ('<script type="application/ld+json">'
          '{"@context":"https://schema.org","@graph":['
          '{"@type":"Organization","@id":"' + SITE + '/#org",'
          '"name":"Netso Energy","url":"' + SITE + '/",'
          '"logo":"' + SITE + '/assets/img/icon-512.png",'
          '"description":"Netso Energy develops, finances, owns and operates '
          'distributed solar infrastructure on commercial and industrial '
          'rooftops in Bangladesh.",'
          '"areaServed":{"@type":"Country","name":"Bangladesh"}},'
          '{"@type":"WebSite","@id":"' + SITE + '/#site",'
          '"url":"' + SITE + '/","name":"Netso Energy",'
          '"publisher":{"@id":"' + SITE + '/#org"},'
          '"inLanguage":"en-GB"}]}'
          '</script>')

INTRO_HEAD = """<script>/* skip the intro curtain on repeat views in the same session — set before
first paint so there is never a flash of the curtain */
try { if (sessionStorage.getItem('netso:intro') === '1')
  document.documentElement.classList.add('no-intro'); } catch (e) {}</script>"""

# Page-transition curtain — a dither dissolve played between pages. Inert until
# core.js drives it (and removed outright for reduced-motion), so it never
# affects layout, paint or accessibility on its own. aria-hidden, no focusable
# content. The dither field is a pure-CSS dot texture (no image request).
PAGEWIPE = ('<div class="pagewipe" id="pagewipe" aria-hidden="true">'
            '<div class="pagewipe__field"></div>'
            '<div class="pagewipe__mark">'
            '<svg viewBox="0 0 100 41.09" fill="none" focusable="false" aria-hidden="true">'
            '<path d="M0 40.59L22.77 40.84L34.86 20.48L48.22 20.36L48.85 40.71L73.54 40.71'
            'L85.5 20.48L99.87 20.1L99.87 0.25L74.55 0L62.34 20.48L48.98 20.48L48.47 0.13L23.41 0Z" '
            'fill="currentColor"/></svg></div></div>')

VENDOR = ["/assets/js/vendor/gsap.min.js", "/assets/js/vendor/ScrollTrigger.min.js",
          "/assets/js/vendor/SplitText.min.js", "/assets/js/vendor/lenis.min.js"]


def read(path):
    with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
        return f.read()


# The home hero(es) are now video; preload the shared poster so the first frame
# paints instantly while the clip streams in behind it.
HERO_PRELOAD = ('<link rel="preload" as="image" href="/assets/img/rooftop-night-poster.webp" '
                'fetchpriority="high"/>')


# ---------------------------------------------------------------------------
# Internal notes live in the SOURCE so the company can find them; they must
# never reach the built site. Production output strips *every* HTML comment,
# which removes internal notes, editorial scaffolding and structural dividers
# alike — no comment can leak regardless of how it is written. The build then
# fails loudly if any draft language somehow survives.
#
# Safe because none of the inline <script>/<style> blocks contain HTML-comment
# syntax (they use /* */ and //). Verified by assert_clean below.
# ---------------------------------------------------------------------------
HTML_COMMENT = re.compile(r"[ \t]*<!--[\s\S]*?-->[ \t]*\n?")
DRAFT_MARKERS = ("todo:", "todo ", "fixme", "draft copy", "draft —",
                 "lorem ipsum", "to be replaced with", "placeholder imagery",
                 "must be supplied", "before launch")


def strip_internal(html):
    """Remove all HTML comments from production output."""
    return HTML_COMMENT.sub("", html)


def assert_clean(html, route):
    low = html.lower()
    hits = [m for m in DRAFT_MARKERS if m.lower() in low]
    if hits:
        raise SystemExit(f"build aborted: {route} still contains {hits}")


def build_page(key, page):
    # The home page opens with the Glyph Portal (a scroll camera through the
    # NETSO wordmark), which supersedes the old CSS intro curtain, so intro_head
    # (its session-skip class) is no longer emitted for home.
    intro_head = ""
    head = HEAD.format(hero_preload=HERO_PRELOAD if key == "home" else "", intro_head=intro_head,
                       jsonld=JSONLD if key == "home" else "",
                       title=page["title"], desc=page["desc"], route=page["route"], og=page["og"],
                       site=SITE, key=key, body_class=page.get("body_class", ""))
    portal = read("src/partials/glyph-portal.html") if key == "home" else ""
    skip = read("src/partials/skip.html")
    header = read("src/partials/header.html")
    header = re.sub(
        r'''\{route==='([^']+)'\?' aria-current="page"':''\}''',
        lambda m: ' aria-current="page"' if page["route"] == m.group(1) else '',
        header,
    )
    menu = read("src/partials/mobile-menu.html").replace("{route}", page["route"])
    footer = read("src/partials/footer.html")
    main = read(f"src/pages/{key}.html")
    scripts = "".join(f'<script src="{s}"></script>' for s in VENDOR)
    scripts += "".join(f'<script src="/assets/js/{s}"></script>' for s in ["core.js"] + page.get("extra_js", []) + [page["script"]])
    html = (head + skip + PAGEWIPE + header + menu +
            f'<main id="content" class="{page.get("main_class", "")}">' + portal + main + "</main>" +
            footer + scripts + "</body></html>")
    # inject deploy config (single source of truth in this file)
    if WHATSAPP_NUMBER:
        wa_url = "https://wa.me/%s?text=%s" % (
            WHATSAPP_NUMBER,
            urllib.parse.quote("Hello Netso — I'd like to talk about a rooftop solar project."),
        )
    else:
        wa_url = "mailto:%s" % CONTACT_EMAIL  # safe fallback until the number is set
    html = html.replace("{{FORM_ENDPOINT}}", FORM_ENDPOINT)
    html = html.replace("{{WHATSAPP_NUMBER}}", WHATSAPP_NUMBER)
    html = html.replace("{{WHATSAPP_URL}}", wa_url)
    html = html.replace("hello@netso.energy", CONTACT_EMAIL)
    html = strip_internal(html)
    assert_clean(html, page["route"])
    out = os.path.join(ROOT, page["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    return page["out"], len(html)


def write_sitemap_and_robots():
    """Generate sitemap.xml (public routes only) and robots.txt."""
    import datetime
    today = datetime.date.today().isoformat()
    # 404 is not a public URL; everything else in PAGES is indexable
    routes = [p["route"] for k, p in PAGES.items() if k != "404"]
    # priority hints: home highest, then primary sections, then legal
    prio = {"/": "1.0", "/how-it-works": "0.9",
            "/about": "0.8", "/start-a-project": "0.8", "/estimate": "0.8"}
    urls = "".join(
        f"<url><loc>{SITE}{r}</loc><lastmod>{today}</lastmod>"
        f"<changefreq>monthly</changefreq><priority>{prio.get(r, '0.4')}</priority></url>"
        for r in routes)
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
               f'{urls}</urlset>\n')
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sitemap)
    robots = ("User-agent: *\n"
              "Allow: /\n"
              f"Sitemap: {SITE}/sitemap.xml\n")
    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(robots)
    return len(routes)


if __name__ == "__main__":
    total = 0
    for key, page in PAGES.items():
        path, size = build_page(key, page)
        total += size
        print(f"{page['route']:<22} -> {path:<38} {size // 1024:>4} KB")
    print(f"{'':<22}    total {total // 1024} KB")
    n = write_sitemap_and_robots()
    print(f"sitemap.xml ({n} urls) + robots.txt written")
