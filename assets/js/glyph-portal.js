/* ==========================================================================
   glyph-portal.js — Netso Energy
   Vanilla port of "Glyph Portal" (a scroll-driven camera through live type).

   Glyph Portal © 2026 Christian Katzmann. MIT.
   Origin: UsefulPortal.astro on https://ktzm.dk → UsefulPortal.tsx → ClarityPortal.tsx.
   This is a framework-free re-implementation of that component for Netso's
   static/vanilla stack. The scroll camera, the largest-inscribed-square ink
   scan (interior), the ink metrics (readInk) and the transform maths (paint)
   are ported faithfully; the React lifecycle/JSX wrapper is replaced with a
   plain DOM initialiser. Keep this notice with copies.
   ========================================================================== */
(function () {
  'use strict';
  window.DL = window.DL || {};

  var DEFAULT_FONT = '"Arial Black", "Arial", sans-serif';
  function clamp(n, a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return Math.min(b, Math.max(a, n)); }
  function smooth(a, b, n) { var t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); }

  /* Largest opaque square, in linear time. Unlike a stem guess, it works in O, S and Ø. */
  function interior(context, char, font) {
    var canvas = context.canvas;
    context.font = font;
    var m = context.measureText(char);
    var pad = 8;
    var left = Math.ceil(m.actualBoundingBoxLeft);
    var ascent = Math.ceil(m.actualBoundingBoxAscent);
    canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
    canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
    context.font = font;
    context.fontKerning = 'none';
    context.fillText(char, pad + left, pad + ascent);
    var width = canvas.width, height = canvas.height;
    var pixels = context.getImageData(0, 0, width, height).data;
    var rows = new Uint16Array(width + 1);
    var size = 0, bx = 0, by = 0;
    for (var y = 0; y < height; y++) {
      var diagonal = 0;
      for (var x = 0; x < width; x++) {
        var above = rows[x + 1];
        rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245 ? Math.min(above, rows[x], diagonal) + 1 : 0;
        diagonal = above;
        if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
      }
    }
    if (size < 3) return null;
    /* Scan at 3× SVG size. Inscribe a disk in the square, with room for raster disagreement. */
    return {
      x: (bx + 1 - size / 2 - pad - left) / 3,
      y: (by + 1 - size / 2 - pad - ascent) / 3,
      radius: (size / 2 - 1) / 3,
    };
  }

  function scrollParent(element) {
    for (var p = element.parentElement; p; p = p.parentElement) {
      if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY) && p !== document.body && p !== document.documentElement) return p;
    }
    return null;
  }

  DL.glyphPortal = function (section) {
    if (!section || section.dataset.gpInit === '1') return function () {};
    section.dataset.gpInit = '1';

    var text = (section.dataset.gpWord || section.getAttribute('aria-label') || 'SUBLIME').trim().normalize('NFC') || 'SUBLIME';
    var focusChar = section.dataset.gpFocusChar || '';
    var interactive = section.dataset.gpInteractive !== 'false';
    var annotations = section.dataset.gpAnnotations === 'true';
    var lengthRaw = parseFloat(getComputedStyle(section).getPropertyValue('--gp-length'));
    var length = isFinite(lengthRaw) ? clamp(lengthRaw, 1, 8) : 2.4;

    var pin = section.querySelector('[data-gp-pin]');
    var field = section.querySelector('[data-gp-field]');
    var art = section.querySelector('[data-gp-art]');
    var clip = section.querySelector('clipPath');
    var clipId = clip ? clip.id : 'gp-clip';
    var glyph = section.querySelector('[data-gp-glyph]');
    var marks = section.querySelector('[data-gp-marks]');
    var choices = section.querySelector('[data-gp-choices]');
    var buttons = Array.prototype.slice.call(choices ? choices.querySelectorAll('button') : []);
    var picker = section.querySelector('[data-gp-select]');
    if (!pin || !field || !art || !clip || !glyph || !marks) return function () {};

    /* Optional video living under the mask (inside the clipped field). Its
       playback is mapped to the portal's scroll progress, so the footage plays
       as the camera flies through the type and finishes as the portal opens.
       Single in-flight seek keeps it locked to the latest scroll position. */
    var video = section.querySelector('[data-gp-video]');
    var vDur = 0, vReady = false, vSeeking = false, vWant = 0;
    function vSeek(tt) {
      vWant = tt;
      if (!video || !vReady || vSeeking) return;
      vSeeking = true;
      var on = function () {
        vSeeking = false; video.removeEventListener('seeked', on);
        if (Math.abs(video.currentTime - vWant) > 0.03) vSeek(vWant);
      };
      video.addEventListener('seeked', on);
      try { video.currentTime = tt; } catch (e) { vSeeking = false; }
    }
    function vPrime() {
      if (!video) return;
      vDur = video.duration || 0;
      if (!vDur || !isFinite(vDur) || vReady) return;
      vReady = true;
      var pl = video.play();                 // decode a frame, then hand control to scroll
      if (pl && pl.then) pl.then(function () { video.pause(); }).catch(function () {});
    }
    if (video) {
      video.removeAttribute('autoplay'); video.loop = false; video.muted = true; video.playsInline = true;
      video.addEventListener('loadedmetadata', vPrime);
      if (video.readyState >= 1) vPrime();
    }

    var root = scrollParent(section);
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d', { willReadFrequently: true });
    var disposed = false, raf = 0, dirty = true, active = true, ready = false;
    var mountedAt = performance.now();
    var browserFrameSeen = false, stalled = false;
    var W = 1, H = 1, travel = 1, startScale = 1, endScale = 1;
    var center = { x: 0, y: 0 }, target = null;
    var lastProgress = -1;
    var candidates = [], letters = [];
    var choosing = false;
    var bounds = { x: 0, y: 0, width: 1, height: 1 };
    var fontDirty = true;

    /* Freeze an available face for this mount. Late font swaps move the ink under the camera. */
    var computedFamily = getComputedStyle(glyph).fontFamily;
    var families = computedFamily.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g) || [];
    var weight = parseInt(getComputedStyle(glyph).fontWeight, 10) || 900;
    var available = families.filter(function (family) {
      try { return document.fonts.check(weight + ' 100px ' + family.trim(), text); } catch (e) { return false; }
    });
    glyph.style.fontFamily = available.concat([DEFAULT_FONT]).join(',');
    stalled = available.length < families.length;

    function readInk() {
      if (!context) return false;
      var font = getComputedStyle(glyph);
      var scanFont = font.fontWeight + ' 300px ' + font.fontFamily;
      context.font = font.fontWeight + ' 100px ' + font.fontFamily;
      context.fontKerning = 'none';
      var metrics = context.measureText(text);
      var advances = [];
      for (var a = 0; a < text.length; a++) advances.push(context.measureText(text.slice(0, a)).width);
      bounds = {
        x: -metrics.actualBoundingBoxLeft, y: -metrics.actualBoundingBoxAscent,
        width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      };
      if (!bounds.width || !bounds.height) return false;
      center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      var requested = focusChar ? text.indexOf(focusChar.normalize('NFC')) : -1;
      var offset = 0;
      candidates = []; letters = [];
      Array.from(text).forEach(function (char) {
        context.font = font.fontWeight + ' 100px ' + font.fontFamily;
        var m = context.measureText(char);
        letters.push({
          index: offset, x: advances[offset] - m.actualBoundingBoxLeft, y: -m.actualBoundingBoxAscent,
          width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
          height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        });
        var found = interior(context, char, scanFont);
        if (found) candidates.push({ x: found.x + advances[offset], y: found.y, radius: found.radius, index: offset });
        offset += char.length;
      });
      target = null;
      for (var c = 0; c < candidates.length; c++) { if (candidates[c].index === requested) { target = candidates[c]; break; } }
      if (!target) {
        target = candidates.slice().sort(function (p, q) {
          return q.radius - p.radius || Math.abs(p.x - center.x) - Math.abs(q.x - center.x);
        })[0] || null;
      }
      return true;
    }

    function select(next) {
      target = next;
      endScale = target ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.35)) : startScale;
      section.dataset.gpFocus = target ? Array.from(text.slice(target.index))[0] : '';
      section.dataset.gpFocusIndex = String(target ? target.index : -1);
      buttons.forEach(function (button) {
        var idx = Number(button.dataset.gpLetter);
        var selected = idx === (target ? target.index : NaN);
        button.disabled = !candidates.some(function (candidate) { return candidate.index === idx; });
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      if (picker && picker.value !== '') {
        picker.value = String(target ? target.index : -1);
        Array.prototype.forEach.call(picker.options, function (option) {
          option.disabled = option.value === '' || !candidates.some(function (candidate) { return candidate.index === Number(option.value); });
        });
      }
      var u = 1 / startScale;
      var y = bounds.y + bounds.height + 25 * u;
      var x = bounds.x;
      var right = x + bounds.width;
      var cross = target ? ('M' + (target.x - 9 * u) + ' ' + target.y + 'h' + (18 * u) + 'M' + target.x + ' ' + (target.y - 9 * u) + 'v' + (18 * u)) : '';
      var annotationPath = marks.querySelector('path');
      annotationPath.setAttribute('d', 'M' + x + ' ' + y + 'H' + right + 'M' + x + ' ' + (y - 5 * u) + 'v' + (10 * u) + 'M' + right + ' ' + (y - 5 * u) + 'v' + (10 * u) + cross);
      annotationPath.setAttribute('stroke-width', String(u));
    }

    function position() {
      var origin = root ? root.getBoundingClientRect().top + root.clientTop : 0;
      return clamp((origin - section.getBoundingClientRect().top) / travel);
    }

    function paint(progress) {
      var isStatic = motion.matches || !browserFrameSeen || stalled || !target;
      var p = isStatic ? 0 : progress;
      if (video && vReady && vDur) vSeek(Math.min(vDur - 0.05, clamp(p / 0.82) * vDur));
      var t = clamp(p / 0.78);
      var eased = t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
      var scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
      var blend = endScale === startScale ? 0 : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
      var cx = center.x + ((target ? target.x : center.x) - center.x) * blend;
      var cy = center.y + ((target ? target.y : center.y) - center.y) * blend;
      var roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
      var transform = 'translate(' + (W / 2) + ' ' + (H * 0.46 + H * 0.04 * eased) + ') scale(' + scale + ') rotate(' + roll + ') translate(' + (-cx) + ' ' + (-cy) + ')';
      var radians = roll * Math.PI / 180;
      var dx = W / 2 / scale, dy = (H * 0.46 + H * 0.04 * eased) / scale;
      clip.setAttribute('transform', 'scale(' + scale + ') rotate(' + roll + ')');
      glyph.setAttribute('transform', 'translate(' + (Math.cos(radians) * dx + Math.sin(radians) * dy - cx) + ' ' + (-Math.sin(radians) * dx + Math.cos(radians) * dy - cy) + ')');
      marks.setAttribute('transform', transform);
      marks.style.opacity = String(1 - smooth(0.015, 0.17, p));
      choosing = interactive && !isStatic && p < 0.04;
      choices.inert = !choosing;
      section.dataset.gpChoosing = String(choosing);
      field.style.clipPath = t >= 1 ? 'none' : 'url(#' + clipId + ')';
      section.style.setProperty('--gp-caption', String(1 - smooth(0.01, 0.16, p)));
      section.style.setProperty('--gp-reveal', String(isStatic ? 1 : smooth(0.78, 0.9, p)));
      section.style.setProperty('--gp-field-scale', String(1 + 0.16 * smooth(0, 0.82, p)));
      section.style.setProperty('--gp-caption-hit', p < 0.08 ? 'auto' : 'none');
      section.dataset.gpEntered = String(p >= 0.9);
      section.dataset.gpProgress = p.toFixed(5);
      if (p !== lastProgress) { lastProgress = p; }
    }

    function layout() {
      if (!section.clientWidth) return;
      W = pin.clientWidth;
      var probe = section.querySelector('[data-gp-viewport]');
      var smallViewport = probe ? probe.offsetHeight : window.innerHeight;
      var viewportHeight = Math.max(1, Math.min(root ? root.clientHeight : smallViewport, smallViewport));
      H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight;
      section.style.setProperty('--gp-height', H + 'px');
      travel = H * length;
      art.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      if (fontDirty) { ready = readInk(); fontDirty = false; }
      if (!ready) return;
      var hasFront = !!section.querySelector('[data-gp-front]');
      var wordHeight = hasFront && H < 480 ? Math.min(H * 0.38, Math.max(24, H - 264)) : H * 0.38;
      startScale = Math.min(W * 0.84 / bounds.width, wordHeight / bounds.height);
      select(target);
      buttons.forEach(function (button) {
        var letter = letters.filter(function (item) { return item.index === Number(button.dataset.gpLetter); })[0];
        if (!letter) return;
        button.style.left = (W / 2 + (letter.x - center.x) * startScale) + 'px';
        button.style.top = (H * 0.46 + (letter.y - center.y) * startScale - Math.max(0, 44 - letter.height * startScale) / 2) + 'px';
        button.style.width = Math.max(1, letter.width * startScale) + 'px';
        button.style.height = Math.max(44, letter.height * startScale) + 'px';
      });
      section.style.setProperty('--gp-word-top', (H * 0.46 - bounds.height * startScale / 2) + 'px');
      section.style.setProperty('--gp-word-bottom', (H * 0.46 + bounds.height * startScale / 2) + 'px');
      section.dataset.gpReady = 'true';
      section.dataset.gpMotion = (!motion.matches && browserFrameSeen && !stalled && target) ? 'on' : 'off';
    }

    function frame(time) {
      raf = 0;
      if (disposed) return;
      if (time !== undefined && !browserFrameSeen) {
        browserFrameSeen = true;
        stalled = stalled || (performance.now() - mountedAt > 2500);
        dirty = true;
      }
      if (dirty) { dirty = false; layout(); }
      if (ready) paint(position());
    }
    function schedule() { if (!raf && active) raf = requestAnimationFrame(frame); }
    function resize() { cancelAnimationFrame(raf); dirty = true; frame(); }
    function scroll() { schedule(); }

    function choose(event) {
      if (!choosing || position() >= 0.04) return;
      var button = event.target.closest ? event.target.closest('[data-gp-letter]') : null;
      var idx = button ? Number(button.dataset.gpLetter) : NaN;
      var next = candidates.filter(function (candidate) { return candidate.index === idx; })[0];
      if (!next || next === target) return;
      select(next); paint(position());
    }
    function navigate(event) {
      var keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (!choosing || keys.indexOf(event.key) === -1) return;
      event.preventDefault();
      var current = candidates.indexOf(target);
      var index = event.key === 'Home' ? 0 : event.key === 'End' ? candidates.length - 1
        : (current + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + candidates.length) % candidates.length;
      var btn = buttons.filter(function (button) { return Number(button.dataset.gpLetter) === candidates[index].index; })[0];
      if (btn) btn.focus({ preventScroll: true });
    }
    function pick() {
      if (!choosing || position() >= 0.04) return;
      var next = candidates.filter(function (candidate) { return candidate.index === Number(picker.value); })[0];
      if (next) { select(next); paint(position()); }
    }

    if (choices) {
      choices.addEventListener('pointerover', choose);
      choices.addEventListener('click', choose);
      choices.addEventListener('focusin', choose);
      choices.addEventListener('keydown', navigate);
    }
    if (picker) picker.addEventListener('change', pick);

    var observer = new ResizeObserver(resize);
    observer.observe(section);
    if (root) observer.observe(root);
    var visibility = new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active) { dirty = true; schedule(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { root: root, rootMargin: '100% 0px' });
    visibility.observe(section);
    (root || window).addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    motion.addEventListener('change', resize);
    if (marks) marks.style.visibility = annotations ? 'visible' : 'hidden';
    frame();
    schedule();
    /* fonts settle after first paint: re-measure so the ink lines up with the final face */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!disposed) resize(); });

    return function () {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      (root || window).removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', resize);
      motion.removeEventListener('change', resize);
      if (choices) {
        choices.removeEventListener('pointerover', choose);
        choices.removeEventListener('click', choose);
        choices.removeEventListener('focusin', choose);
        choices.removeEventListener('keydown', navigate);
      }
      if (picker) picker.removeEventListener('change', pick);
    };
  };

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-glyph-portal]'), function (el) { DL.glyphPortal(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
