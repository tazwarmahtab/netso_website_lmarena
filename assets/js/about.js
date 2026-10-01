/* ==========================================================================
   about.js — /about
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const qa = DL.qa;

  DL.lines('[data-lines]');
  DL.scrubReveal('.beliefs', '.belief', { y: 46, scale: 0.99, stagger: 0.1, start: 'top 88%', end: 'top 45%' });
  DL.scrubReveal('.roadmap', '.roadmap__item', { y: 40, scale: 0.99, stagger: 0.1, start: 'top 88%', end: 'top 45%' });
  DL.scrubReveal('.statgrid', '.statcard', { y: 40, scale: 0.99, stagger: 0.08, start: 'top 88%', end: 'top 45%' });

  qa('.media img').forEach((img) => {
    gsap.fromTo(img, { scale: 1.05 }, {
      scale: 1, duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: img.closest('.media'), start: 'top 90%', toggleActions: 'play none none reverse' },
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
