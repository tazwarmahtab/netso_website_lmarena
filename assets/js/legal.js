/* ==========================================================================
   legal.js — legal pages + 404
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  DL.lines('[data-lines]');
  DL.reveal('[data-reveal="up"]', { y: 20 });
  // document sections fade in as you read
  DL.qa('.prose h2, .prose p, .prose ul').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 14 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 94%', toggleActions: 'play none none reverse' },
    });
  });
});

/* page hero appears immediately — never gated behind asset loading */
(function () {
  const go = () => {
    const t = document.querySelector('.pagehero__title'), s = document.querySelector('.pagehero__sub');
    if (!t) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.dispatchEvent(new CustomEvent('dl:introPlayed')); return; }
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.fromTo(t, { y: 22 }, { y: 0, duration: 0.9 });
    if (s) tl.fromTo(s, { y: 14 }, { y: 0, duration: 0.8 }, '-=0.6');
    window.dispatchEvent(new CustomEvent('dl:introPlayed'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
})();
