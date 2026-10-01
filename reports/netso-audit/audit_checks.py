"""Read-only local browser audit. External requests and real lead delivery blocked."""
import json, pathlib, urllib.request
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).parent / 'evidence'
BASE = 'http://127.0.0.1:8100'
ROUTES = ['/', '/how-it-works', '/about', '/estimate', '/start-a-project', '/legal/privacy', '/legal/terms', '/not-a-route']
results = {'routes': [], 'checks': {}}

def isolate(ctx):
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width, height in [(1440,900), (390,844), (320,700), (768,1024)]:
        ctx = browser.new_context(viewport={'width':width,'height':height})
        isolate(ctx)
        for route in ROUTES:
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            response = page.goto(BASE+route, wait_until='load')
            page.wait_for_timeout(900)
            state = page.evaluate('''() => ({
              overflow:document.documentElement.scrollWidth-innerWidth,
              h1:document.querySelectorAll('h1').length,
              main:document.querySelectorAll('main').length,
              title:document.title,
              robots:document.querySelector('meta[name="robots"]')?.content || null,
              brokenImages:[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src),
              missingHashes:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1))),
              video:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,paused:v.paused,preload:v.preload})),
              transfer:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0),
              h1Top:document.querySelector('h1')?.getBoundingClientRect().top
            })''')
            results['routes'].append({'route':route,'width':width,'status':response.status,'errors':errors,**state})
            if width in (1440,390) and route in ('/','/estimate','/start-a-project'):
                slug=route.strip('/').replace('/','-') or 'home'
                page.screenshot(path=str(OUT/f'{slug}-{width}.png'))
                if route=='/estimate':
                    page.locator('#instrument').scroll_into_view_if_needed()
                    page.wait_for_timeout(900)
                    page.screenshot(path=str(OUT/f'calculator-{width}.png'))
            page.close()
        ctx.close()

    ctx=browser.new_context(viewport={'width':390,'height':844})
    isolate(ctx)
    page=ctx.new_page()
    page.goto(BASE+'/estimate'); page.wait_for_timeout(700)
    results['checks']['calculator_default']=page.locator('.instrument__results').inner_text()
    page.locator('#in-consumption').fill('10000')
    page.locator('#in-roof').fill('20000')
    page.locator('#in-daytime').fill('100')
    results['checks']['calculator_load_limited']=page.locator('.instrument__results').inner_text()
    page.locator('#in-consumption').fill('1000000')
    page.locator('#in-roof').fill('200')
    page.locator('#in-daytime').fill('30')
    results['checks']['calculator_small_roof']=page.locator('.instrument__results').inner_text()
    page.locator('#in-battery').click()
    results['checks']['battery_toggle']=page.locator('#r-batt').inner_text()

    page.goto(BASE+'/start-a-project'); page.wait_for_timeout(700)
    page.locator('[type="submit"]').click()
    results['checks']['empty_form']={'invalid':page.locator('[aria-invalid="true"]').count(),'focus':page.evaluate('document.activeElement.id')}
    page.evaluate('window.open=(url)=>{window.__auditHandoff=url;return null}')
    for selector,value in {'#f-name':'Audit Test','#f-company':'Example Facility','#f-email':'audit@example.com','#f-phone':'01700000000','#f-location':'Test only'}.items():
        page.locator(selector).fill(value)
    page.locator('#f-type').select_option(label='Other')
    page.locator('[name="consent"]').check()
    page.locator('[type="submit"]').click()
    results['checks']['valid_form']={'message':page.locator('.form-msg').inner_text(),'formVisible':page.locator('#project-form').is_visible(),'handoffHost':page.evaluate('new URL(window.__auditHandoff).hostname'),'hasLeadSummary':page.evaluate('window.__auditHandoff.includes("Example%20Facility")')}

    page.goto(BASE+'/about'); page.wait_for_timeout(700)
    tab_order=[]
    for _ in range(13):
        page.keyboard.press('Tab')
        tab_order.append(page.evaluate('''() => ({tag:document.activeElement.tagName,text:document.activeElement.textContent.trim().slice(0,50),inMenu:!!document.activeElement.closest('.mobile-menu'),expanded:document.querySelector('.header__burger').getAttribute('aria-expanded')})'''))
    results['checks']['closed_menu_tab_order']=tab_order
    page.locator('.header__burger').click(); page.wait_for_timeout(500)
    results['checks']['open_menu_focus']=page.evaluate('document.activeElement.className')
    page.keyboard.press('Escape')
    results['checks']['escape_menu']=page.locator('.header__burger').get_attribute('aria-expanded')
    page.locator('.header__burger').click()
    page.set_viewport_size({'width':1440,'height':900})
    results['checks']['resize_open_menu']=page.evaluate('''() => ({overflow:document.documentElement.style.overflow,expanded:document.querySelector('.header__burger').getAttribute('aria-expanded'),burgerVisible:!!document.querySelector('.header__burger').offsetParent})''')
    ctx.close()
    for mode in ['no-js','no-gsap','no-scrolltrigger','reduced-motion']:
        opts={'java_script_enabled':mode!='no-js','viewport':{'width':390,'height':844}}
        if mode=='reduced-motion': opts['reduced_motion']='reduce'
        ctx=browser.new_context(**opts)
        isolate(ctx)
        if mode=='no-gsap': ctx.route('**/gsap.min.js',lambda r:r.abort())
        if mode=='no-scrolltrigger': ctx.route('**/ScrollTrigger.min.js',lambda r:r.abort())
        page=ctx.new_page(); errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE+'/estimate'); page.wait_for_timeout(1000)
        page.locator('#in-consumption').fill('10000')
        results['checks'][mode]={'errors':errors,'outputConsumption':page.locator('#out-consumption').inner_text()}
        if mode=='reduced-motion':
            results['checks'][mode]['scrollAnimations']=page.evaluate('''() => ScrollTrigger.getAll().filter(s=>!!s.animation).length''')
        page.goto(BASE+'/start-a-project'); page.wait_for_timeout(900)
        if mode=='no-js':
            response_holder=[]
            page.on('response',lambda r:response_holder.append(r.status) if r.request.method=='POST' else None)
            page.locator('[type="submit"]').click(); page.wait_for_timeout(500)
            results['checks'][mode]['formSubmitStatus']=response_holder
        else:
            results['checks'][mode]['formSubmitListeners']=page.evaluate('typeof window.DL?.initForm')
        ctx.close()
    browser.close()

for route in ['/.git/HEAD','/README.md','/src/pages/privacy.html','/assets/video/rooftop-night.mp4']:
    req=urllib.request.Request(BASE+route,headers={'Range':'bytes=0-99'} if route.endswith('mp4') else {})
    with urllib.request.urlopen(req) as r:
        results['checks']['http:'+route]={'status':r.status,'contentLength':r.headers.get('Content-Length'),'contentRange':r.headers.get('Content-Range')}
(OUT/'browser-checks.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
