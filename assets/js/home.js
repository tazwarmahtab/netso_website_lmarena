/* ==========================================================================
   home.js — Netso Energy homepage
   The hero is the glyph portal (see glyph-portal.js): one sticky rooftop video
   scrubbed by scroll, with the hero copy sliding up over it. This file now only
   owns the intro curtain and the section reveals for the opening argument.
   ========================================================================== */
/* ===================== 0. intro curtain ==============================
   The curtain is pure CSS and ends by itself at 1.7 s. JS only does the
   two things CSS cannot: remember that it has been seen, and get out of
   the way early if the visitor has already started interacting.
   ==================================================================== */
(function () {
  'use strict';
  const intro = document.getElementById('intro');
  if (!intro) return;

  let gone = false;
  const dismiss = (remember) => {          // fade out and remove the node
    if (gone) return;
    gone = true;
    try { if (remember) sessionStorage.setItem('netso:intro', '1'); } catch (e) {}
    intro.classList.add('is-out');
    setTimeout(() => { intro.remove(); }, 400);
  };

  // remember it for the rest of the session as soon as it has been seen once
  setTimeout(() => { try { sessionStorage.setItem('netso:intro', '1'); } catch (e) {} }, 1500);
  intro.addEventListener('animationend', (e) => {
    if (e.target === intro && !intro.classList.contains('is-out')) intro.remove();
  });

  // any real interaction skips the rest of it
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) =>
    window.addEventListener(ev, () => dismiss(true), { passive: true, once: true }));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dismiss(false);
})();


window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const qa = DL.qa;

  /* ===================== 3. section reveals ============================ */
  DL.lines('[data-lines]');
  DL.reveal('[data-reveal="up"]', { y: 30 });
  DL.qa('[data-count]').forEach((el) => DL.countUp(el, { suffix: '' }));

  DL.scrubReveal('.statgrid', '.statcard', { y: 40, scale: 0.99, stagger: 0.08, start: 'top 88%', end: 'top 45%' });
  DL.scrubReveal('.visiongrid', '.visiongrid__item', { y: 44, scale: 0.98, stagger: 0.1, start: 'top 88%', end: 'top 45%' });

  qa('.pipeline .pipeline__step').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 26 }, {
      opacity: 1, y: 0, duration: 0.8, delay: (i % 3) * 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
  });

  qa('.media img').forEach((el) => {
    gsap.fromTo(el, { scale: 1.06 }, {
      scale: 1, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el.closest('.media'), start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  });

  const compareCols = qa('.compare__col');
  if (compareCols.length) {
    gsap.fromTo(compareCols, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.compare', start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  }
});
