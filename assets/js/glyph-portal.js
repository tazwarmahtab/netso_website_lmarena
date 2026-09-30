/* Netso portal hero v2
   Scroll position is the source of truth. The sequence is reversible.
   Reduced-motion and no-JS render the finished open state. */
(function () {
  'use strict';
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function ease(n) { return n < .5 ? 4*n*n*n : 1 - Math.pow(-2*n + 2, 3) / 2; }

  function init(section) {
    if (!section || section.dataset.portalInit === '1') return;
    section.dataset.portalInit = '1';

    var track = section.querySelector('.portal-v2__track');
    var stage = section.querySelector('.portal-v2__stage');
    var image = section.querySelector('.portal-v2__image');
    var left = section.querySelector('.portal-v2__panel--left');
    var right = section.querySelector('.portal-v2__panel--right');
    var wash = section.querySelector('.portal-v2__wash');
    var veil = section.querySelector('.portal-v2__veil');
    var word = section.querySelector('.portal-v2__wordmark');
    var first = word && word.children[0];
    var last = word && word.children[1];
    var a = section.querySelector('.portal-v2__signal--a');
    var b = section.querySelector('.portal-v2__signal--b');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var raf = 0;

    function progress() {
      var rect = section.getBoundingClientRect();
      var travel = Math.max(1, section.offsetHeight - window.innerHeight);
      return clamp(-rect.top / travel, 0, 1);
    }

    function paint(p) {
      var q = reduce.matches ? 1 : ease(p);
      var open = ease(clamp((p - .04) / .68, 0, 1));
      var title = ease(clamp((p - .08) / .72, 0, 1));
      var imageScale = 1.09 - .09 * open;
      var panelX = 108 * open;
      var spread = 50 * title;
      var scale = 1 + .11 * title;
      var tracking = -.03 - .045 * title;

      image.style.transform = 'translate3d(0,' + (-8 * open) + 'px,0) scale(' + imageScale + ')';
      left.style.transform = 'translate3d(' + (-panelX) + '%,0,0)';
      right.style.transform = 'translate3d(' + panelX + '%,0,0)';
      wash.style.opacity = String(.12 * open);
      veil.style.opacity = String(.82 - .48 * open);
      word.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
      word.style.letterSpacing = tracking + 'em';
      first.style.transform = 'translate3d(' + (-spread) + '%,0,0)';
      last.style.transform = 'translate3d(' + spread + '%,0,0)';
      a.style.transform = 'translate3d(' + (-38 * open) + 'vw,' + (-27 * open) + 'vh,0)';
      b.style.transform = 'translate3d(' + (38 * open) + 'vw,' + (27 * open) + 'vh,0)';
      section.style.setProperty('--portal-open', open);
      section.style.setProperty('--portal-title', title);
    }

    function frame() {
      raf = 0;
      paint(progress());
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function setStatic() {
      if (reduce.matches) {
        section.classList.add('portal-v2--reduced');
        paint(1);
      } else {
        section.classList.remove('portal-v2--reduced');
        schedule();
      }
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduce.addEventListener('change', setStatic);
    setStatic();

    section._portalCleanup = function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', setStatic);
    };
  }

  function boot() {
    document.querySelectorAll('[data-portal-v2]').forEach(init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
