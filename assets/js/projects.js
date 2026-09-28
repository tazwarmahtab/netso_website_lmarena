/* ==========================================================================
   projects.js — /projects
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const qa = DL.qa;

  DL.reveal('[data-reveal="up"]', { y: 26 });

  const rows = qa('.pipeline-table tbody tr');
  if (rows.length) {
    gsap.fromTo(rows, { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.pipeline-table', start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  }

  const feature = DL.q('.project-feature');
  if (feature) {
    gsap.fromTo(DL.qa('.spec__row', feature), { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: feature, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
  }

  qa('.evidenceguide__item').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: 0.7, delay: (i % 4) * 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: el.parentElement, start: 'top 88%', toggleActions: 'play none none reverse' },
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
