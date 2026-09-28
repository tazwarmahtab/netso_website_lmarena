/* ==========================================================================
   Netso Energy — core.js
   Shared runtime: smooth scroll, header chrome, reveals, marquee, accordions,
   tabs, animated counters, form handling.
   ========================================================================== */
(function () {
  'use strict';

  // register only the plugins that actually loaded, so one failed vendor
  // request degrades gracefully instead of throwing and killing the page
  gsap.registerPlugin(...[typeof ScrollTrigger !== 'undefined' && ScrollTrigger,
                          typeof SplitText !== 'undefined' && SplitText].filter(Boolean));
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });

  const DL = (window.DL = {});
  DL.page = document.body.dataset.page || '';
  DL.q = (sel, root) => (root || document).querySelector(sel);
  DL.qa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  DL.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  DL.lerp = (a, b, t) => a + (b - a) * t;
  DL.debounce = (fn, ms) => { let t; return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), ms || 200); }; };
  DL.isDesktop = () => window.matchMedia('(min-width: 60rem)').matches;
  DL.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- ready -- */
  const readyQueue = [];
  DL.ready = (fn) => { readyQueue.push(fn); };
  let readyFired = false;
  function fireReady() {
    if (readyFired) return;
    readyFired = true;
    readyQueue.forEach((fn) => { try { fn(); } catch (e) { console.warn('[netso]', e); } });
    ScrollTrigger.refresh();
  }
  window.addEventListener('load', () => {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 2500))]).then(() => setTimeout(fireReady, 60));
  });

  /* ------------------------------------------------------------- smooth --- */
  let lenis = null;
  if (!DL.reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');
  }
  DL.lenis = lenis;
  DL.scrollTo = (target, opts) => {
    const o = Object.assign({ duration: 1.1, offset: 0 }, opts || {});
    if (lenis) lenis.scrollTo(target, o);
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else if (target && target.getBoundingClientRect) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  };
  DL.lockScroll = (locked) => {
    if (locked) { document.documentElement.style.overflow = 'hidden'; if (lenis) lenis.stop(); }
    else { document.documentElement.style.overflow = ''; if (lenis) lenis.start(); }
  };

  /* ------------------------------------------------------------- header --- */
  function header() {
    const el = DL.q('.header');
    if (!el) return;
    const dark = DL.q('.mobile-menu.is-dark');
    // reveal the header chrome shortly after load; on the home page the intro
    // curtain covers the viewport for ~1.5 s, so this happens behind it
    const onReady = () => el.classList.add('is-in');
    setTimeout(onReady, 260);

    // dark header over dark sections
    const darkSections = DL.qa('[data-header="dark"]');
    if (darkSections.length) {
      darkSections.forEach((s) => ScrollTrigger.create({
        trigger: s, start: 'top 40px', end: 'bottom 40px',
        onToggle: (self) => el.classList.toggle('is-dark', self.isActive),
      }));
    }

    // burger / mobile menu
    const burger = DL.q('.header__burger');
    const menu = DL.q('.mobile-menu');
    if (burger && menu) {
      const open = burger.querySelector('[data-icon="burger"]');
      const close = burger.querySelector('[data-icon="close"]');
      const setOpen = (state) => {
        menu.classList.toggle('is-open', state);
        burger.setAttribute('aria-expanded', String(state));
        gsap.to(open, { opacity: state ? 0 : 1, rotate: state ? -30 : 0, duration: 0.35, ease: 'power2.out' });
        gsap.to(close, { opacity: state ? 1 : 0, rotate: state ? 0 : 30, duration: 0.35, ease: 'power2.out' });
        DL.lockScroll(state);
      };
      setOpen(false);
      burger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
      DL.qa('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
      DL.closeMenu = () => setOpen(false);
    }

    // anchor links
    DL.qa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const t = id && document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        DL.scrollTo(t, { offset: -70 });
      });
    });
  }

  /* ------------------------------------------------------------ reveals --- */
  /** Line-by-line mask reveal for headings. */
  DL.lines = function (target, opts) {
    const o = Object.assign({ start: 'top 86%', duration: 0.9, stagger: 0.09, delay: 0, y: 100 }, opts || {});
    const els = typeof target === 'string' ? DL.qa(target) : (Array.isArray(target) ? target : [target]);
    els.forEach((el) => {
      if (!el || el.dataset.split === 'done') return;
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(self.lines, { yPercent: o.y }, {
            yPercent: 0, duration: o.duration, stagger: o.stagger, delay: o.delay, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: o.start, toggleActions: 'play none none reverse' },
          });
        },
      });
      el.dataset.split = 'done';
    });
  };

  /** Simple fade/slide reveal. */
  DL.reveal = function (target, opts) {
    const o = Object.assign({ y: 24, opacity: 0, duration: 0.9, stagger: 0.08, start: 'top 88%', x: 0, scale: 1 }, opts || {});
    const els = typeof target === 'string' ? DL.qa(target) : (Array.isArray(target) ? target : [target]);
    const list = els.filter(Boolean);
    if (!list.length) return;
    list.forEach((el) => {
      gsap.fromTo(el, { opacity: o.opacity, y: o.y, x: o.x, scale: o.scale },
        {
          opacity: 1, y: 0, x: 0, scale: 1, duration: o.duration, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: o.start, toggleActions: 'play none none reverse' },
        });
    });
  };

  /** Scrubbed reveal for groups of elements (cards, rows). */
  DL.scrubReveal = function (trigger, targets, opts) {
    const o = Object.assign({ y: 56, scale: 0.97, stagger: 0.12, start: 'top 85%', end: 'top 40%', scrub: 0.8, x: 0 }, opts || {});
    const trig = typeof trigger === 'string' ? DL.q(trigger) : trigger;
    const els = typeof targets === 'string' ? DL.qa(targets) : (Array.isArray(targets) ? targets : [targets]);
    if (!trig || !els.length) return;
    gsap.timeline({ scrollTrigger: { trigger: trig, start: o.start, end: o.end, scrub: o.scrub } })
      .fromTo(els.filter(Boolean),
        { opacity: 0, y: o.y, x: o.x, scale: o.scale, transformOrigin: 'center bottom' },
        { opacity: 1, y: 0, x: 0, scale: 1, ease: 'power2.out', stagger: o.stagger });
  };

  /** Animated number counter. */
  DL.countUp = function (el, opts) {
    if (!el) return;
    const o = Object.assign({ duration: 1.6, decimals: 0, suffix: '', prefix: '' }, opts || {});
    const raw = el.dataset.value !== undefined ? el.dataset.value : el.textContent;
    const end = parseFloat(String(raw).replace(/[^0-9.\-]/g, '')) || 0;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: o.duration, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate() {
        const n = obj.v.toFixed(o.decimals);
        el.textContent = `${o.prefix}${Number(n).toLocaleString('en-US', { minimumFractionDigits: o.decimals, maximumFractionDigits: o.decimals })}${o.suffix}`;
      },
    });
  };

  /* ------------------------------------------------------------ marquee --- */
  DL.marquee = function (root) {
    const track = DL.q('.marquee__track', root || document);
    if (!track) return;
    const html = track.innerHTML;
    track.innerHTML = html + html;
    gsap.to(track, { xPercent: -50, duration: 42, ease: 'none', repeat: -1 });
  };

  /* ---------------------------------------------------------- accordion --- */
  DL.accordion = function (root) {
    DL.qa('.accordion__item', root || document).forEach((item) => {
      const btn = DL.q('.accordion__btn', item);
      const panel = DL.q('.accordion__panel', item);
      if (!btn || !panel) return;
      gsap.set(panel, { height: 0 });
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        DL.qa('.accordion__item.is-open', root || document).forEach((other) => {
          if (other === item) return;
          other.classList.remove('is-open');
          DL.q('.accordion__btn', other).setAttribute('aria-expanded', 'false');
          gsap.to(DL.q('.accordion__panel', other), { height: 0, duration: 0.6, ease: 'power3.inOut' });
        });
        item.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        gsap.to(panel, { height: isOpen ? 0 : 'auto', duration: 0.7, ease: 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
      });
    });
  };

  /* --------------------------------------------------------------- tabs --- */
  DL.tabs = function (root) {
    DL.qa('[data-tabs]', root || document).forEach((group) => {
      const btns = DL.qa('button', group);
      btns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
          btns.forEach((b) => b.setAttribute('aria-selected', 'false'));
          btn.setAttribute('aria-selected', 'true');
          const target = btn.dataset.target;
          const scope = document.getElementById(group.dataset.tabs);
          if (!scope) return;
          DL.qa('[data-panel]', scope).forEach((p) => {
            const on = p.dataset.panel === target;
            p.hidden = !on;
            if (on) {
              gsap.fromTo(p, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
              ScrollTrigger.refresh();
            }
          });
        });
        if (i === 0) btn.setAttribute('aria-selected', 'true');
      });
    });
  };

  /* -------------------------------------------------------------- forms --- */
  /**
   * Validates a form, shows field-level errors, then hands the payload to
   * `onSubmit`. V1 has no backend: `onSubmit` is the integration point
   * (see the note in the form's markup).
   */
  DL.initForm = function (form, onSubmit) {
    if (!form) return;
    const btn = DL.q('[type="submit"]', form);
    const btnLabel = btn ? DL.q('[data-label]', btn) || btn : null;
    const original = btnLabel ? btnLabel.textContent : '';
    const status = DL.q('.form-status', form.parentElement || form);

    // give every error message a stable id so it can be announced via
    // aria-describedby when its field is invalid
    let errSeq = 0;
    DL.qa('.field', form).forEach((field) => {
      const err = DL.q('.field__error', field);
      if (err && !err.id) err.id = `field-err-${++errSeq}`;
    });

    const setInvalid = (el, field, invalid) => {
      if (field) field.classList.toggle('is-invalid', invalid);
      el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      const err = field && DL.q('.field__error', field);
      if (err) {
        if (invalid) el.setAttribute('aria-describedby', err.id);
        else el.removeAttribute('aria-describedby');
      }
    };

    const validate = () => {
      let ok = true;
      DL.qa('[required]', form).forEach((el) => {
        const field = el.closest('.field');
        let valid = el.type === 'checkbox' ? el.checked : String(el.value || '').trim().length > 0;
        if (valid && el.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        if (valid && el.type === 'tel') valid = el.value.replace(/\D/g, '').length >= 7;
        setInvalid(el, field, !valid);
        if (!valid) ok = false;
      });
      return ok;
    };

    form.addEventListener('input', (e) => {
      const field = e.target.closest && e.target.closest('.field');
      if (field && field.classList.contains('is-invalid')) {
        const stillEmpty = e.target.type === 'checkbox' ? !e.target.checked : !String(e.target.value).trim();
        if (!stillEmpty) setInvalid(e.target, field, false);
      }
    });

    const endpoint = (form.getAttribute('data-endpoint') || '').trim();
    const contact = (form.getAttribute('data-contact') || '').trim();
    const msg = DL.q('.form-msg', form);
    const setBusy = (b) => {
      if (btn) btn.disabled = b;
      if (btnLabel) btnLabel.textContent = b ? 'Submitting…' : original;
    };
    const showMsg = (text, isError) => {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.toggle('form-msg--error', !!isError);
      msg.hidden = false;
    };
    const clearMsg = () => { if (msg) { msg.hidden = true; msg.textContent = ''; } };
    const showSuccess = (data) => {
      form.hidden = true;
      if (status) status.classList.add('is-visible');
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      document.dispatchEvent(new CustomEvent('netso:leadSubmitted', { detail: data }));
      if (typeof onSubmit === 'function') onSubmit(data);
    };
    // zero-backend fallback: compose a prefilled email so the enquiry still
    // reaches a human on any host, even before a form service is configured
    const mailtoFallback = (data) => {
      const to = contact || 'hello@netso.energy';
      const subject = 'Project enquiry — ' + (data.company || data.name || 'Netso website');
      const order = [
        ['name', 'Name'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Phone'],
        ['facility_location', 'Facility location'], ['facility_type', 'Facility type'],
        ['rooftop_area', 'Rooftop area'], ['consumption', 'Electricity consumption'],
        ['tariff', 'Tariff'], ['sanctioned_load', 'Sanctioned load'],
        ['existing_solar', 'Existing solar'], ['notes', 'Additional information'],
      ];
      const lines = order
        .filter(([k]) => data[k] && String(data[k]).trim())
        .map(([k, label]) => `${label}: ${data[k]}`);
      const body = 'Project enquiry submitted via netso.energy\n\n' + lines.join('\n');
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearMsg();
      if (!validate()) {
        const first = DL.q('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea', form);
        if (first && first.focus) first.focus({ preventScroll: false });
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      delete data._gotcha; delete data._subject;

      // no endpoint configured yet → hand off to the visitor's mail client
      if (!endpoint) {
        mailtoFallback(data);
        showMsg('We\u2019ve opened your email client with the enquiry prefilled \u2014 press send to reach us. If nothing opened, write to ' + (contact || 'hello@netso.energy') + '.', false);
        return;
      }

      setBusy(true);
      fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
        .then((res) => {
          if (res.ok) { setBusy(false); showSuccess(data); return; }
          return res.json().then((j) => {
            const m = j && j.errors && j.errors[0] && j.errors[0].message;
            throw new Error(m || 'Submission failed');
          }).catch(() => { throw new Error('Submission failed'); });
        })
        .catch(() => {
          setBusy(false);
          showMsg('Sorry \u2014 we couldn\u2019t submit your enquiry. Please try again, or email us directly at ' + (contact || 'hello@netso.energy') + '.', true);
        });
    });
  };

  /* ------------------------------------------------------------ helpers --- */
  DL.qa('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  header();
  DL.marquee(document);
  DL.accordion(document);
  DL.tabs(document);
  DL.qa('[data-count]').forEach((el) => DL.countUp(el, { decimals: Number(el.dataset.decimals || 0), suffix: el.dataset.suffix || '' }));

  // generic reveals
  DL.reveal('[data-reveal="up"]', { y: 28 });
  DL.reveal('[data-reveal="fade"]', { y: 0 });
  DL.qa('[data-lines]').forEach((el) => DL.lines(el, { start: el.dataset.start || 'top 86%' }));
})();
