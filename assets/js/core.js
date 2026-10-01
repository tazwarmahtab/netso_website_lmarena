/* ==========================================================================
   Netso Energy — core.js
   Shared runtime: smooth scroll, header chrome, reveals, accordions,
   animated counters, form handling.
   ========================================================================== */
(function () {
  'use strict';

  // Motion is an enhancement, never a dependency of navigation, forms or the estimate.
  // The tiny no-op adapter keeps functional modules alive when a vendor asset is blocked.
  if (typeof window.gsap === 'undefined') {
    const noop = () => {};
    const chain = () => ({ from: noop, fromTo: noop, to: noop, set: noop, kill: noop });
    window.gsap = { registerPlugin: noop, config: noop, defaults: noop, set: noop, to: noop, fromTo: noop,
      timeline: chain, quickTo: () => noop, killTweensOf: noop,
      ticker: { add: noop, lagSmoothing: noop } };
  }
  if (typeof window.ScrollTrigger === 'undefined') {
    window.ScrollTrigger = { refresh: () => {}, update: () => {}, create: () => ({ progress: 0, kill: () => {} }) };
  }

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
  const scheduleReady = () => {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => fireReady());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleReady, { once: true });
  else scheduleReady();

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
      let previousFocus = null;
      const firstLink = () => DL.q('a,button', menu);
      const setOpen = (state, restore = true) => {
        if (state && !menu.classList.contains('is-open')) previousFocus = document.activeElement;
        menu.classList.toggle('is-open', state);
        menu.hidden = !state;
        menu.inert = !state;
        menu.setAttribute('aria-hidden', String(!state));
        burger.setAttribute('aria-expanded', String(state));
        gsap.to(open, { opacity: state ? 0 : 1, rotate: state ? -30 : 0, duration: 0.35, ease: 'power2.out' });
        gsap.to(close, { opacity: state ? 1 : 0, rotate: state ? 0 : 30, duration: 0.35, ease: 'power2.out' });
        DL.lockScroll(state);
        if (state) requestAnimationFrame(() => firstLink()?.focus());
        else if (restore && previousFocus?.focus) requestAnimationFrame(() => previousFocus.focus());
      };
      setOpen(false, false);
      burger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
      DL.qa('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { e.preventDefault(); setOpen(false); } });
      const mq = window.matchMedia('(min-width: 60rem)');
      mq.addEventListener?.('change', () => { if (mq.matches && menu.classList.contains('is-open')) setOpen(false, false); });
      DL.closeMenu = () => setOpen(false);
    }

    // anchor links
    DL.qa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const t = id && document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        if (a.classList.contains('skip-link') || id === 'content') {
          t.setAttribute('tabindex', '-1');
          t.focus({ preventScroll: true });
        }
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
      if (DL.reduceMotion || typeof SplitText === 'undefined') { el.style.opacity = '1'; el.style.transform = 'none'; el.dataset.split = 'done'; return; }
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
    if (DL.reduceMotion) { list.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    list.forEach((el) => {
      if (el.dataset.reveal === 'done') return;
      el.dataset.reveal = 'done';
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

  /* ---------------------------------------------------------- wordReveal --
     Word-by-word scrubbed reveal (godaylight's signature long-statement move):
     the words start faint and darken to full ink as the block is scrolled
     through. Progressive enhancement — if JS or SplitText never runs, or the
     visitor asked for reduced motion, the text is simply fully legible. */
  DL.wordReveal = function (target, opts) {
    const o = Object.assign({ start: 'top 82%', end: 'top 40%', from: 0.16, scrub: 0.7 }, opts || {});
    const els = typeof target === 'string' ? DL.qa(target) : (Array.isArray(target) ? target : [target]);
    els.forEach((el) => {
      if (!el || el.dataset.wordreveal === 'done') return;
      el.dataset.wordreveal = 'done';
      if (DL.reduceMotion || typeof SplitText === 'undefined') return;   // stays fully visible
      SplitText.create(el, {
        type: 'words', autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(self.words, { opacity: o.from }, {
            opacity: 1, ease: 'none', stagger: 0.6,
            scrollTrigger: { trigger: el, start: o.start, end: o.end, scrub: o.scrub },
          });
        },
      });
    });
  };

  /* -------------------------------------------------------------- dither ---
     Ordered-dither (Bayer 8x8) DISSOLVE: a same-origin image "develops" from a
     sparse field of chunky dots into the full photograph as it scrolls into
     view — the dithering→dissolve effect requested. A canvas is laid over the
     image and drawn on scroll; at completion it hands off to the real, crisp
     <img> for fidelity and print/zoom quality. Progressive enhancement: if the
     canvas cannot be built, or reduced motion is set, the real image just
     shows normally (it is never hidden until the canvas is proven working). */
  const BAYER8 = (function () {
    const m = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
              12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
              3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
              15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
    return m.map((v) => (v + 0.5) / 64);
  })();
  DL.dither = function (target, opts) {
    const o = Object.assign({ start: 'top 90%', end: 'top 45%', scrub: 0.55, px: 3, edge: 0.22 }, opts || {});
    const els = typeof target === 'string' ? DL.qa(target) : (Array.isArray(target) ? target : [target]);
    els.forEach((img) => {
      if (!img || img.dataset.dither === 'init') return;
      img.dataset.dither = 'init';
      if (DL.reduceMotion) return;                       // real image shows as-is
      const go = () => { try { setup(img); } catch (e) { img.style.opacity = '1'; console.warn('[netso] dither', e); } };
      if (img.complete && img.naturalWidth) go();
      else img.addEventListener('load', go, { once: true });
    });

    function setup(img) {
      const wrap = img.parentElement;
      if (!wrap) return;
      if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';

      const canvas = document.createElement('canvas');
      canvas.className = 'dither-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      const ctx = canvas.getContext('2d');
      const small = document.createElement('canvas');
      const sctx = small.getContext('2d', { willReadFrequently: true });
      let sw = 0, sh = 0, src = null, thr = null, out = null, ready = false;

      const build = () => {
        const r = img.getBoundingClientRect();
        const dw = Math.max(1, Math.round(r.width)), dh = Math.max(1, Math.round(r.height));
        if (!dw || !dh) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(dw * dpr); canvas.height = Math.round(dh * dpr);
        canvas.style.width = dw + 'px'; canvas.style.height = dh + 'px';
        canvas.style.left = img.offsetLeft + 'px'; canvas.style.top = img.offsetTop + 'px';
        sw = Math.max(8, Math.min(280, Math.round(dw / o.px)));
        sh = Math.max(8, Math.round(sw * dh / dw));
        small.width = sw; small.height = sh;
        sctx.drawImage(img, 0, 0, sw, sh);
        src = sctx.getImageData(0, 0, sw, sh);          // same-origin: never taints
        out = sctx.createImageData(sw, sh);
        thr = new Float32Array(sw * sh);
        for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) thr[y * sw + x] = BAYER8[(y & 7) * 8 + (x & 7)];
        ready = true;
      };

      const draw = (p) => {
        if (!ready) return;
        const s = src.data, d = out.data, e = o.edge;
        for (let i = 0, n = sw * sh; i < n; i++) {
          let a = (p - thr[i]) / e + 0.5;
          a = a < 0 ? 0 : a > 1 ? 1 : a;
          const j = i * 4;
          d[j] = s[j]; d[j + 1] = s[j + 1]; d[j + 2] = s[j + 2]; d[j + 3] = (s[j + 3] * a) | 0;
        }
        sctx.putImageData(out, 0, 0);
        ctx.imageSmoothingEnabled = p > 0.86;            // chunky dots early, smooth as it resolves
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
      };

      wrap.appendChild(canvas);
      build();
      if (!ready) { canvas.remove(); img.style.opacity = '1'; return; }
      img.style.opacity = '0';

      const apply = (p) => {
        if (p >= 0.995) { canvas.classList.add('is-done'); img.style.opacity = '1'; }
        else { canvas.classList.remove('is-done'); img.style.opacity = '0'; draw(p); }
      };
      apply(0);
      const st = ScrollTrigger.create({
        trigger: img, start: o.start, end: o.end, scrub: o.scrub,
        onUpdate: (self) => apply(self.progress),
        onLeaveBack: () => apply(0),
      });
      window.addEventListener('resize', DL.debounce(() => { build(); apply(st.progress); }, 200));
    }
  };

  /* ---------------------------------------------------------- scrollVideo --
     Scroll-locked video hero (vanilla port of the MIT "Scroll-Locked Video
     Hero" pattern by Guglielmo Giannattasio): the clip is pinned full-screen
     and its playhead is scrubbed by scroll position, so scrolling "plays" the
     video. The source is encoded all-keyframe so every seek is instant. A
     single in-flight seek is enforced (re-seeking to the latest target on
     'seeked') to keep scrubbing smooth. Progressive enhancement: the markup
     ships as an ordinary muted autoplay loop, so with no JS it just plays; for
     reduced motion the scrub is skipped and the clip holds on its poster. */
  DL.scrollVideo = function (section) {
    if (!section) return;
    const video = section.querySelector('video');
    if (!video) return;
    // take the clip over from the no-JS autoplay-loop fallback
    video.removeAttribute('autoplay'); video.loop = false; video.muted = true; video.playsInline = true;

    if (DL.reduceMotion) { try { video.pause(); } catch (e) {} section.dataset.svReady = '1'; return; }

    // lazy download: the clip is below the fold, so with preload="none" we only
    // pull it as the section approaches (~1.5 screens ahead) instead of on load
    if (video.readyState < 1) {
      const kickLoad = () => { try { video.preload = 'auto'; video.load(); } catch (e) {} };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((ents) => {
          if (ents.some((e) => e.isIntersecting)) { io.disconnect(); kickLoad(); }
        }, { rootMargin: '150% 0px' });
        io.observe(section);
      } else { kickLoad(); }
    }

    let dur = 0, ready = false, seeking = false, want = 0, st = null;

    const setTime = (t) => {
      want = t;
      if (!ready || seeking) return;
      seeking = true;
      const onSeek = () => {
        seeking = false; video.removeEventListener('seeked', onSeek);
        if (Math.abs(video.currentTime - want) > 0.03) setTime(want);   // catch up to latest scroll
      };
      video.addEventListener('seeked', onSeek);
      try { video.currentTime = t; } catch (e) { seeking = false; }
    };
    const apply = (p) => {
      section.style.setProperty('--sv-progress', String(p));
      if (ready && dur) setTime(Math.min(dur - 0.05, p * dur));
    };
    const prime = () => {
      dur = video.duration || 0;
      if (!dur || !isFinite(dur) || ready) return;
      ready = true; section.dataset.svReady = '1';
      const play = video.play();               // decode a frame, then hand control to scroll
      if (play && play.then) play.then(() => video.pause()).catch(() => {});
      apply(st ? st.progress : 0);
    };
    video.addEventListener('loadedmetadata', prime);
    if (video.readyState >= 1) prime();

    st = ScrollTrigger.create({
      trigger: section, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => apply(self.progress),
    });
    apply(0);
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
    const whatsapp = (form.getAttribute('data-whatsapp') || '').replace(/[^\d]/g, '');
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
    // build a labelled, ordered summary of the enquiry as plain text
    const summarise = (data) => {
      const order = [
        ['name', 'Name'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Phone'],
        ['facility_location', 'Facility location'], ['facility_type', 'Facility type'],
        ['rooftop_area', 'Rooftop area'], ['consumption', 'Electricity consumption'],
        ['tariff', 'Tariff'], ['sanctioned_load', 'Sanctioned load'],
        ['existing_solar', 'Existing solar'], ['notes', 'Additional information'],
      ];
      return order
        .filter(([k]) => data[k] && String(data[k]).trim())
        .map(([k, label]) => `${label}: ${data[k]}`)
        .join('\n');
    };
    // free, zero-backend path: open WhatsApp with the enquiry prefilled
    const whatsappSubmit = (data) => {
      const text = '*New project enquiry — Netso*\n\n' + summarise(data);
      const url = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(text);
      return window.open(url, '_blank', 'noopener');
    };
    // fallback: compose a prefilled email so the enquiry still reaches a human
    const mailtoFallback = (data) => {
      const to = contact || 'hello@netso.energy';
      const subject = 'Project enquiry — ' + (data.company || data.name || 'Netso website');
      const body = 'Project enquiry submitted via netso.energy\n\n' + summarise(data);
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

      // primary path: hand off to WhatsApp with the enquiry prefilled
      if (whatsapp) {
        const handoff = whatsappSubmit(data);
        showMsg(handoff ? 'WhatsApp is ready with your enquiry prefilled. Review it, then press Send to reach Netso.' : 'Your browser blocked the WhatsApp window. Open WhatsApp directly or email ' + (contact || 'hello@netso.energy') + ' to send the enquiry.', !handoff);
        return;
      }

      // no endpoint configured → hand off to the visitor's mail client
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
  DL.accordion(document);
  DL.qa('[data-count]').forEach((el) => DL.countUp(el, { decimals: Number(el.dataset.decimals || 0), suffix: el.dataset.suffix || '' }));

  // generic reveals
  DL.reveal('[data-reveal="up"]', { y: 28 });
  DL.reveal('[data-reveal="fade"]', { y: 0 });
  DL.qa('[data-lines]').forEach((el) => DL.lines(el, { start: el.dataset.start || 'top 86%' }));

  // godaylight-language enhancements, opt-in per element via data-attributes
  DL.wordReveal('[data-wordreveal]');
  DL.dither('[data-dither]');
  DL.qa('[data-scroll-video]').forEach((el) => DL.scrollVideo(el));
})();

/* ==========================================================================
   Page-transition curtain — a dither dissolve BETWEEN pages.
   On an internal navigation the curtain wipes in (dots resolve to a field),
   then the browser navigates; on arrival the curtain wipes back out to reveal
   the new page. This is a multi-page site, so the effect is delivered with two
   halves: an "out" on click, and an "in" on every page load (incl. bfcache).

   Guardrails (must never trap the user or break navigation):
     * reduced motion → disabled entirely, links behave normally.
     * only same-origin, plain left-clicks on real navigations are intercepted
       (modifier keys, new-tab, downloads, hashes, mailto/tel/wa.me all skip).
     * a hard failsafe navigates even if the animation event never fires.
     * the incoming curtain always clears itself, including on pageshow from
       the back/forward cache, so a returning page is never left covered.
   ========================================================================== */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const curtain = document.getElementById('pagewipe');
  if (!curtain || reduce) { if (curtain) curtain.remove(); return; }
  const clearFlag = () => { try { sessionStorage.removeItem('netso:wipe'); } catch (e) {} };

  // wipe the incoming page open: the page painted already covered (html.wipe-cover
  // set pre-paint), so removing the class transitions the curtain out. bfcache
  // restores re-cover then clear so a returning page is never left covered.
  const wipeIn = () => {
    clearFlag();
    requestAnimationFrame(() => root.classList.remove('wipe-cover'));
  };
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && root.classList.contains('wipe-cover')) wipeIn();
    else clearFlag();
  });
  wipeIn();

  let navigating = false;
  const leave = (href) => {
    if (navigating) return;
    navigating = true;
    try { sessionStorage.setItem('netso:wipe', '1'); } catch (e) {}
    root.classList.remove('wipe-cover');
    curtain.classList.add('is-out');               // cover the outgoing page
    let done = false;
    const go = () => { if (done) return; done = true; window.location.href = href; };
    curtain.addEventListener('transitionend', go, { once: true });
    setTimeout(go, 620);                           // failsafe — never strand a click
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const href = a.getAttribute('href') || '';
    if (!href || href[0] === '#') return;
    if (/^(mailto:|tel:|javascript:|whatsapp:|sms:)/i.test(href)) return;
    let url;
    try { url = new URL(a.href, window.location.href); } catch (_) { return; }
    if (url.origin !== window.location.origin) return;       // external → normal nav
    if (url.pathname === window.location.pathname && url.hash) return;  // in-page anchor
    if (url.href === window.location.href) return;
    e.preventDefault();
    leave(url.href);
  }, true);
})();
