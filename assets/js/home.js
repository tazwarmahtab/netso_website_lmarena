/* Netso Energy homepage motion system.
   Motion is progressive enhancement: the site remains readable if GSAP is unavailable,
   and all transforms are disabled for prefers-reduced-motion. */
(function () {
  'use strict';

  function initIntro() {
    const intro = document.getElementById('intro');
    if (!intro) return;
    let gone = false;
    const dismiss = (remember) => {
      if (gone) return;
      gone = true;
      try { if (remember) sessionStorage.setItem('netso:intro', '1'); } catch (e) {}
      intro.classList.add('is-out');
      setTimeout(() => intro.remove(), 420);
    };
    setTimeout(() => { try { sessionStorage.setItem('netso:intro', '1'); } catch (e) {} }, 1500);
    intro.addEventListener('animationend', (e) => {
      if (e.target === intro && !intro.classList.contains('is-out')) intro.remove();
    });
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) =>
      window.addEventListener(ev, () => dismiss(true), { passive: true, once: true }));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dismiss(false);
  }
  initIntro();

  window.DL.ready(function () {
    'use strict';
    const DL = window.DL;
    const qa = DL.qa;
    const realMotion = !DL.reduceMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && typeof window.ScrollTrigger.create === 'function';

    // Existing heading and media enhancements.
    DL.lines('[data-lines]');
    DL.wordReveal('[data-wordreveal]');
    qa('[data-count]').forEach((el) => DL.countUp(el, { suffix: '' }));
    qa('[data-dither]').forEach((el) => DL.dither(el));

    if (!realMotion) return;
    document.body.classList.add('motion-ready');

    // A discreet reading-progress rail makes the long-form argument feel continuous.
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    document.body.appendChild(progress);
    const progressFill = progress.querySelector('span');
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => progressFill.style.transform = `scaleX(${self.progress})`,
    });

    const reveal = (selector, options) => {
      const els = qa(selector);
      if (!els.length) return;
      els.forEach((el, index) => {
        gsap.fromTo(el,
          { opacity: 0, y: options.y || 28, x: options.x || 0, scale: options.scale || 1 },
          { opacity: 1, y: 0, x: 0, scale: 1, duration: options.duration || .9,
            delay: (index % (options.columns || 3)) * (options.stagger || .08), ease: 'power3.out',
            scrollTrigger: { trigger: el, start: options.start || 'top 88%', toggleActions: 'play none none reverse' } });
      });
    };

    // Logo-led hero handoff: copy arrives first, then the rooftop diagram and rail settle in.
    reveal('.netso-hero__copy > *', { y: 34, stagger: .1, columns: 1, start: 'top 92%' });
    gsap.fromTo('.netso-hero__visual', { opacity: 0, y: 34, scale: .965 }, {
      opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: .18,
      scrollTrigger: { trigger: '.netso-hero', start: 'top 86%', toggleActions: 'play none none reverse' }
    });
    gsap.fromTo('.netso-hero__rail', { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: .8, delay: .48, ease: 'power3.out',
      scrollTrigger: { trigger: '.netso-hero', start: 'top 84%', toggleActions: 'play none none reverse' }
    });

    // Every section has a consistent rhythm: heading, content, then data.
    reveal('.netso-problem .sec-head, .problem-copy', { y: 26, columns: 1 });
    reveal('.option-stack article', { y: 22, stagger: .1, columns: 1 });
    reveal('.market-strip div', { y: 18, stagger: .08, columns: 1 });
    reveal('.model-steps li', { y: 26, stagger: .1, columns: 1 });
    reveal('.model-banner', { y: 30, scale: .98, columns: 1 });
    reveal('.econ-grid article', { y: 26, stagger: .1, columns: 1 });
    reveal('.economics-bar', { y: 20, columns: 1 });
    reveal('.proof-grid article', { y: 30, stagger: .12, columns: 1 });
    reveal('.proof-foot', { y: 16, columns: 1 });
    reveal('.trajectory > div', { y: 26, stagger: .1, columns: 1 });
    reveal('.moat', { y: 30, scale: .985, columns: 1 });
    reveal('.cta__inner > *', { y: 26, stagger: .08, columns: 1 });

    // Scroll-linked atmosphere: the hero diagram breathes slightly as it leaves the viewport.
    const heroVisual = document.querySelector('.netso-hero__visual');
    if (heroVisual) {
      gsap.to(heroVisual, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.netso-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      if (window.matchMedia('(any-hover: hover)').matches) {
        heroVisual.addEventListener('pointermove', (event) => {
          const r = heroVisual.getBoundingClientRect();
          const x = (event.clientX - r.left) / r.width - .5;
          const y = (event.clientY - r.top) / r.height - .5;
          gsap.to(heroVisual, { rotateY: x * 2.2, rotateX: y * -1.8, transformPerspective: 900, duration: .55, ease: 'power3.out', overwrite: true });
        });
        heroVisual.addEventListener('pointerleave', () => gsap.to(heroVisual, { rotateY: 0, rotateX: 0, duration: .8, ease: 'power3.out' }));
      }
    }

    // Micro-interactions for cards and CTAs: lift, underline, and tactile press feedback.
    qa('.option-stack article, .econ-grid article, .proof-grid article, .trajectory > div').forEach((card) => {
      card.addEventListener('pointerenter', () => gsap.to(card, { y: -5, duration: .35, ease: 'power3.out', overwrite: true }));
      card.addEventListener('pointerleave', () => gsap.to(card, { y: 0, duration: .5, ease: 'power3.out', overwrite: true }));
    });
    qa('.btn').forEach((button) => {
      button.addEventListener('pointerdown', () => gsap.to(button, { scale: .97, duration: .12, ease: 'power2.out', overwrite: true }));
      button.addEventListener('pointerup', () => gsap.to(button, { scale: 1, duration: .35, ease: 'back.out(2)', overwrite: true }));
      button.addEventListener('pointerleave', () => gsap.to(button, { scale: 1, duration: .35, ease: 'power2.out', overwrite: true }));
    });

    // Keep the active section readable in the dark/light header treatment.
    qa('[data-header="dark"]').forEach((section) => ScrollTrigger.create({
      trigger: section, start: 'top 40px', end: 'bottom 40px',
      onToggle: (self) => document.querySelector('.header')?.classList.toggle('is-dark', self.isActive),
    }));
    ScrollTrigger.refresh();
  });
})();
