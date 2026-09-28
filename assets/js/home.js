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
    // All hero motion below is decorative and is skipped entirely for visitors
    // who asked for reduced motion — CSS (@media prefers-reduced-motion) forces
    // the copy visible, and the stage is shown already-installed further down.
    if (!DL.reduceMotion) {
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
    }

    // rooftop → site assessed → solar deployed → energy flowing.
    // SCROLL DRIVES IT: progress through the hero's dwell zone advances the stage,
    // and scrolling back up reverses it. A timed fallback advances the story for
    // anyone who never scrolls, and yields the moment they do — so a reader who
    // only looks at the first screen still sees the whole transformation.
    // 0 = ordinary rooftop · 1 = site assessed · 2 = deployed + energy flowing
    let stage = -1;
    let manual = false;   // set by the Today / With Netso control, cleared by scrolling
    let auto = null;
    const killAuto = () => { if (auto) { auto.kill(); auto = null; } };

    const stageTo = (next) => {
      if (next === stage) return;            // act only on a real change (no flicker)
      stage = next;
      hero.classList.toggle('is-survey', next >= 1);
      hero.classList.toggle('is-solar', next === 2);
      if (base) base.classList.toggle('is-active', next === 0);
      if (solar) solar.classList.toggle('is-active', next === 2);
      syncControl(next);
    };
    const apply = (p) => stageTo(p > 0.65 ? 2 : p > 0.30 ? 1 : 0);

    /* The state control. Two states of the same roof — gives the visitor the
       transformation without waiting on the scroll, and gives reduced-motion
       users the same comparison with no animation at all. It is wired OUTSIDE
       the motion branch on purpose: it is a static comparison, not motion, so
       it must work for everyone. Manual choice holds until the visitor scrolls,
       at which point the scroll sequence resumes. */
    const ctrl = qa('[data-hero-state]');
    function syncControl(next) {
      const wantsNetso = next === 2;
      const wantsToday = next === 0;
      ctrl.forEach((b) => {
        const isNetso = b.getAttribute('data-hero-state') === 'netso';
        // stage 1 (site assessed) sits between the two, so neither reads as selected
        const on = (isNetso && wantsNetso) || (!isNetso && wantsToday);
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    ctrl.forEach((b) => {
      b.addEventListener('click', () => {
        killAuto();
        manual = true;
        stageTo(b.getAttribute('data-hero-state') === 'netso' ? 2 : 0);
      });
    });

    if (DL.reduceMotion) {
      // the story is shown as already installed, with no sequence and no motion
      qa('.hero__layer').forEach((l) => { l.style.transition = 'none'; });
      stageTo(2);
    } else {
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom 70%',
        onUpdate: (self) => {
          killAuto();
          // scrolling always wins: the scroll sequence and the control never fight
          if (manual) manual = false;
          apply(self.progress);
        },
        onLeaveBack: () => { killAuto(); manual = false; apply(0); },
      });

      // the fallback: only if no scroll has happened, and it stands down instantly
      auto = gsap.to({ p: 0 }, {
        p: 1, duration: 4.5, delay: 1.6, ease: 'power1.inOut',
        onUpdate() { apply(this.targets()[0].p); },
      });
    }

    window.dispatchEvent(new CustomEvent('dl:introPlayed'));
  }

}

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
