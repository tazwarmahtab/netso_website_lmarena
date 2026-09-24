/* ==========================================================================
   home.js — Netso Energy homepage
   Hero: rooftop → survey → solar sequence (fixed), then section reveals for
   the opening argument. Headline copy lives in the markup, not here.
   ========================================================================== */
function initHero() {
  'use strict';
  const DL = window.DL;
  const q = DL.q, qa = DL.qa;

  /* ===== 1. hero copy is fixed in markup (direction A, locked) =====
     The ?hero= switching and the review badge were removed when the headline
     was frozen. To revisit, edit the markup in src/pages/home.html directly. */
  const hero = q('.hero');

  /* ===================== 2. hero rooftop sequence ====================== */
  if (hero) {
    const base = q('.hero__layer--base', hero);
    const solar = q('.hero__layer--solar', hero);
    const img = q('img', base);
    const title = q('.hero__title');
    const sub = q('.hero__sub');
    const model = q('.hero__model');
    const cta = q('.hero__cta');
    const steps = qa('.hero__model-steps li');
    const proof = q('.hero__proof');
    const top = q('.hero__top');

    // Parallax runs on the photographs inside the stage, not on the stage itself:
    // the stage is sticky now, so translating it would expose an edge. The stage
    // clips its overflow, so the images can drift within it safely. Scale keeps
    // enough headroom (1.12 -> 1.06) that a 3% drift never reveals a border.
    if (solar) gsap.set(solar, { yPercent: 0 });
    const layers = qa('.hero__layer img');
    if (layers.length) {
      gsap.to(layers, {
        yPercent: 3, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    [base, solar].forEach((layer) => {
      const l = q('img', layer);
      if (l) gsap.fromTo(l, { scale: 1.12 }, { scale: 1.06, duration: 2.4, ease: 'power3.out' });
    });

    // headline/copy sequence — fast, so the model lands immediately
    const tl = gsap.timeline({ delay: 0.25, defaults: { ease: 'expo.out' } });
    if (top) tl.fromTo(top, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0);
    // transform-only: the headline is legible from first paint on any connection
    if (title) tl.fromTo(title, { y: 22 }, { y: 0, duration: 0.95 }, 0);
    if (sub) tl.fromTo(sub, { y: 16 }, { y: 0, duration: 0.85 }, '-=0.7');
    if (model) tl.fromTo(model, { y: 12 }, { y: 0, duration: 0.7 }, '-=0.62');
    if (cta) tl.fromTo(cta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5');
    if (steps.length) tl.fromTo(steps, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05 }, '-=0.45');
    if (proof) tl.fromTo(proof, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    // rooftop → survey → solar → energy flow
    const toSolar = () => {
      hero.classList.add('is-solar');
      if (base) base.classList.remove('is-active');
      if (solar) solar.classList.add('is-active');
    };
    if (DL.reduceMotion) {
      toSolar();
      qa('.hero__layer').forEach((l) => { l.style.transition = 'none'; });
    } else {
      setTimeout(() => hero.classList.add('is-survey'), 1300);
      setTimeout(toSolar, 3100);
      // re-run the sequence when the hero scrolls back into view from above
      ScrollTrigger.create({
        trigger: hero, start: 'top 60%', end: 'bottom top',
        onEnterBack: () => { hero.classList.remove('is-solar', 'is-survey'); if (base) base.classList.add('is-active'); if (solar) solar.classList.remove('is-active'); },
      });
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top',
        onLeaveBack: () => { hero.classList.remove('is-solar', 'is-survey'); if (base) base.classList.add('is-active'); if (solar) solar.classList.remove('is-active'); },
      });
    }

    window.dispatchEvent(new CustomEvent('dl:introPlayed'));
  }

}

/* hero runs as soon as it is parsed so the business model never waits on assets */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHero, { once: true });
else initHero();

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
