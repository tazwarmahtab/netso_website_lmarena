"""Local-only links, scroll media, focus and FAQ checks."""
import json,pathlib
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:8100'
OUT=pathlib.Path(__file__).parent/'evidence'
out={}
with sync_playwright() as p:
 b=p.chromium.launch()
 c=b.new_context(viewport={'width':768,'height':1024})
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.abort())
 page=c.new_page()
 page.goto(BASE+'/');page.wait_for_timeout(3000)
 out['home_after_settle']=page.evaluate('''() => ({overflow:document.documentElement.scrollWidth-innerWidth,h1top:document.querySelector('h1').getBoundingClientRect().top,transfer:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0),offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'svg',right:e.getBoundingClientRect().right})).slice(0,12)})''')
 page.locator('[data-gp-enter]').click();page.wait_for_timeout(1800)
 out['step_inside']=page.evaluate('''() => ({scrollY,h1top:document.querySelector('h1').getBoundingClientRect().top,hash:location.hash,focus:document.activeElement.tagName})''')
 page.screenshot(path=str(OUT/'home-entered-768.png'))
 local_links=set()
 for route in ['/','/about','/how-it-works','/estimate','/start-a-project','/legal/privacy','/legal/terms']:
  page.goto(BASE+route);page.wait_for_timeout(300)
  local_links.update(page.locator('a[href^="/"]').evaluate_all('(a)=>a.map(x=>x.getAttribute("href"))'))
 out['internal_links']={url:c.request.get(BASE+url.split('#')[0]).status for url in sorted(local_links)}
 page.goto(BASE+'/how-it-works');page.wait_for_timeout(900)
 accordion=page.locator('.accordion__btn').first
 accordion.click();page.wait_for_timeout(800)
 out['faq_open']=accordion.get_attribute('aria-expanded')
 accordion.click();page.wait_for_timeout(800)
 out['faq_closed']=accordion.get_attribute('aria-expanded')
 page.goto(BASE+'/estimate');page.wait_for_timeout(900)
 page.locator('.skip-link').focus();page.keyboard.press('Enter');page.wait_for_timeout(1400)
 out['skip_focus']=page.evaluate('({tag:document.activeElement.tagName,cls:document.activeElement.className,hash:location.hash})')
 c.close()
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.abort())
 page=c.new_page();page.goto(BASE+'/');page.wait_for_timeout(900)
 out['reduced_home']=page.evaluate('''() => ({videoBytes:performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.mp4')).map(r=>({name:r.name.split('/').pop(),bytes:r.transferSize})),animations:ScrollTrigger.getAll().filter(s=>!!s.animation).length})''')
 c.close();b.close()
(OUT/'focused-checks.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))
