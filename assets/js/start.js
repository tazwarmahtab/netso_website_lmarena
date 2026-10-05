/* ==========================================================================
   start.js — /start-a-project
   Validation + success state (no backend in V1) and phone masking.
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const form = DL.q('#project-form');

  // light phone formatting: keep digits, group as the user types
  const phone = DL.q('#f-phone');
  if (phone) {
    phone.addEventListener('input', () => {
      const d = phone.value.replace(/[^\d+]/g, '');
      const hasPlus = d.startsWith('+880');
      const digits = d.replace(/\+/g, '');
      if (hasPlus && digits.length > 3) {
        const rest = digits.slice(3);
        phone.value = `+880 ${rest.replace(/(\d{4})(\d{0,6})/, (m, a, b) => (b ? `${a} ${b}` : a))}`;
      }
    });
  }

  DL.initForm(form, (data) => {
    // fires after a confirmed successful submission to FORM_ENDPOINT.
    // optional integration point — e.g. fire an analytics/conversion event here.
    window.dispatchEvent(new CustomEvent('netso:lead-confirmed', { detail: { hasCompany: !!data.company } }));
  });

  // Carry screening assumptions from the homepage calculator into the assessment form.
  const prefill = (id, param) => {
    const value = params.get(param);
    const el = document.getElementById(id);
    if (value && el) el.value = value;
  };

  // prefill facility type from ?type=… links elsewhere on the site
  const params = new URLSearchParams(window.location.search);
  prefill('f-spend', 'monthly_spend');
  prefill('f-area', 'roof_area');
  prefill('f-hours', 'operating_hours');
  prefill('f-tariff', 'tariff');

  const type = params.get('type');
  if (type) {
    const sel = DL.q('#f-type');
    if (sel) {
      const match = Array.from(sel.options).find((o) => o.value.toLowerCase().includes(type.toLowerCase()));
      if (match) sel.value = match.value;
    }
  }

  DL.scrubReveal('.nextsteps', '.nextsteps__item', { y: 22, scale: 1, stagger: 0.08, start: 'top 92%', end: 'top 60%' });
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
