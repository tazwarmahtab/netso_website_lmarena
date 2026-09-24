/* ==========================================================================
   how.js — /how-it-works
   Sticky sub-nav with scrollspy, phase reveals, model diagram reveal.
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const q = DL.q, qa = DL.qa;

  DL.lines('[data-lines]');
  DL.reveal('[data-reveal="up"]', { y: 28 });

  qa('.phase').forEach((phase) => {
    const idx = q('.phase__idx', phase);
    const body = qa('.phase__body', phase);
    const list = q('.phase__list', phase);
    const media = q('.media', phase);

    if (idx) gsap.fromTo(idx, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: phase, start: 'top 85%' } });
    if (body[0]) {
      const heading = q('h2', body[0]);
      if (heading) DL.lines(heading, { start: 'top 85%' });
      const lead = q('.lead', body[0]);
      if (lead) gsap.fromTo(lead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, scrollTrigger: { trigger: phase, start: 'top 80%' } });
    }
    if (list) {
      gsap.fromTo(qa('li', list), { opacity: 0, x: -14 }, {
        opacity: 1, x: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: list, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    }
    if (media) gsap.fromTo(media, { opacity: 0, y: 36, scale: 0.98 }, {
      opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: media, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
  });

  // flow diagrams
  DL.scrubReveal('.flowmap', '.flowmap__cell', { y: 40, scale: 0.98, stagger: 0.1, start: 'top 88%', end: 'top 50%' });

  // FAQ accordion behaviour ships in core.js; add a scrub reveal for the spec list
  DL.scrubReveal('.spec', '.spec__row', { y: 18, scale: 1, stagger: 0.05, start: 'top 90%', end: 'top 60%' });

  /* --------------------------- sub-nav scrollspy ------------------------ */
  const links = qa('.subnav a');
  if (links.length) {
    const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const setActive = () => {
      const probe = window.innerHeight * 0.32;
      let current = targets[0];
      targets.forEach((t) => { if (t.getBoundingClientRect().top <= probe) current = t; });
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${current.id}`));
    };
    setActive();
    window.addEventListener('scroll', setActive, { passive: true });
    window.addEventListener('resize', DL.debounce(setActive, 150));
  }
});

/* page hero appears immediately — never gated behind asset loading */
(function () {
  const go = () => {
    const t = document.querySelector('.pagehero__title'), s = document.querySelector('.pagehero__sub');
    if (!t) return;
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.fromTo(t, { y: 22 }, { y: 0, duration: 0.9 });
    if (s) tl.fromTo(s, { y: 14 }, { y: 0, duration: 0.8 }, '-=0.6');
    window.dispatchEvent(new CustomEvent('dl:introPlayed'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
})();
