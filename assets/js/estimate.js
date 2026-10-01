/* ==========================================================================
   estimate.js — /estimate
   Public screening model for Bangladesh C&I rooftop solar.

   The model intentionally separates:
   1) physical screening: roof + load + daylight profile
   2) current grid-energy value
   3) battery value

   It does NOT pretend to know a project's PPA tariff, demand-charge savings,
   export revenue, financing, battery CAPEX or site-specific yield.
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const q = DL.q;

  DL.lines('[data-lines]');

  /*
   Current reference assumptions, checked 30 Sep 2026:

   SREDA / Power Division:
   - Typical rooftop area: about 7–10 m²/kWp.
   - Typical Bangladesh annual PV output: about 1,200–1,400 kWh/kWp/year.
   - 2025 NEM guideline: AC output can be up to 100% of sanctioned load,
     subject to the guideline and utility approval.
   - Exported energy is settled under the NEM rules; the 2025 guideline
     applies a 10% distribution-system-maintenance deduction to net exports.

   BERC / June 2026:
   - 11 kV industrial energy rates are approximately Tk 11.56/kWh off-peak
     and Tk 16.06/kWh peak. This is a reference band, not every customer's
     blended tariff and not a PPA price.

   The public calculator uses these ranges instead of a fabricated single
   yield or tariff.
  */
  const ROOF_M2_PER_KWP = { lo: 7, hi: 10 };
  const YIELD_YR = { lo: 1200, hi: 1400 };
  const GRID_TARIFF = { lo: 11.56, hi: 16.06 };

  const els = {
    consumption: q('#in-consumption'),
    roof: q('#in-roof'),
    daytime: q('#in-daytime'),
    batt: q('#in-battery'),
    outConsumption: q('#out-consumption'),
    outRoof: q('#out-roof'),
    outDaytime: q('#out-daytime'),
    value: q('#r-value'),
    valueSub: q('#r-value-sub'),
    kwp: q('#r-kwp'),
    kwh: q('#r-kwh'),
    share: q('#r-share'),
    battOut: q('#r-batt')
  };
  if (!els.consumption || !els.roof || !els.daytime) return;

  const grp = (n) => Math.round(n).toLocaleString('en-IN');
  const bdt = (n) => '৳ ' + grp(n);
  const crore = (n) => (n / 10000000);
  const energy = (n) => n >= 1000000 ? `${oneDp(n / 1000000)} GWh` : n >= 1000 ? `${grp(n / 1000)} MWh` : `${grp(n)} kWh`;
  const oneDp = (n) => (Math.round(n * 10) / 10).toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  function compute() {
    const monthlyLoad = Number(els.consumption.value);
    const roof = Number(els.roof.value);
    const daytimeShare = Number(els.daytime.value) / 100;

    // Energy the facility can consume during the solar-producing window.
    const daytimeLoad = monthlyLoad * daytimeShare;

    // Roof-limited DC module capacity range.
    const roofKwpLo = roof / ROOF_M2_PER_KWP.hi;
    const roofKwpHi = roof / ROOF_M2_PER_KWP.lo;

    // Load-limited capacity range based on annual yield.
    const loadKwpLo = daytimeLoad / (YIELD_YR.hi / 12);
    const loadKwpHi = daytimeLoad / (YIELD_YR.lo / 12);

    // Feasible screening band is the intersection of roof and daytime-load limits.
    const kwpLo = Math.max(0, Math.min(roofKwpLo, loadKwpLo));
    const kwpHi = Math.max(kwpLo, Math.min(roofKwpHi, loadKwpHi));

    // Generation range, preserving conservative/high-yield bounds.
    const annualKwhLo = kwpLo * YIELD_YR.lo;
    const annualKwhHi = kwpHi * YIELD_YR.hi;
    const monthlyKwhLo = annualKwhLo / 12;
    const monthlyKwhHi = annualKwhHi / 12;

    // Separate generated energy from energy that can actually displace facility load.
    // Export is not valued in this base case, so neither value nor offset can exceed
    // annual consumption. This also prevents mixed low/high assumptions from making
    // the upper scenario appear to supply more load than the facility uses.
    const annualLoad = monthlyLoad * 12;
    const displacedKwhLo = Math.min(annualKwhLo, annualLoad);
    const displacedKwhHi = Math.min(annualKwhHi, annualLoad);
    const annualValueLo = displacedKwhLo * GRID_TARIFF.lo;
    const annualValueHi = displacedKwhHi * GRID_TARIFF.hi;

    const offsetLo = monthlyLoad > 0 ? (displacedKwhLo / annualLoad) * 100 : 0;
    const offsetHi = monthlyLoad > 0 ? (displacedKwhHi / annualLoad) * 100 : 0;

    return {
      kwpLo, kwpHi, annualKwhLo, annualKwhHi, displacedKwhLo, displacedKwhHi,
      annualValueLo, annualValueHi, offsetLo, offsetHi
    };
  }

  function render() {
    els.outConsumption.textContent = grp(els.consumption.value) + ' kWh';
    els.outRoof.textContent = grp(els.roof.value) + ' m²';
    els.outDaytime.textContent = els.daytime.value + '%';

    const r = compute();

    els.value.textContent = bdt(r.annualValueLo) + ' – ' + bdt(r.annualValueHi);
    els.valueSub.textContent =
      '≈ ৳ ' + oneDp(crore(r.annualValueLo)) + ' – ' +
      oneDp(crore(r.annualValueHi)) +
      ' crore/year of indicative grid-energy value';

    els.kwp.textContent = grp(r.kwpLo) + '–' + grp(r.kwpHi) + ' kWp';
    els.kwh.textContent = energy(r.annualKwhLo) + '–' + energy(r.annualKwhHi);
    els.share.textContent = Math.round(r.offsetLo) + '–' + Math.round(r.offsetHi) + '%';

    const battery = els.batt.getAttribute('aria-checked') === 'true';
    els.battOut.textContent = battery
      ? 'Reliability + shifting'
      : 'Not included';

    els.batt.setAttribute('aria-label',
      battery ? 'Battery storage included as a qualitative option'
              : 'Include battery storage');
  }

  els.consumption.addEventListener('input', render);
  els.roof.addEventListener('input', render);
  els.daytime.addEventListener('input', render);
  els.batt.addEventListener('click', () => {
    const on = els.batt.getAttribute('aria-checked') === 'true';
    els.batt.setAttribute('aria-checked', String(!on));
    render();
  });

  render();
});

/* page hero appears immediately — never gated behind asset loading */
(function () {
  const go = () => {
    const t = document.querySelector('.pagehero__title'), s = document.querySelector('.pagehero__sub');
    if (!t) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.dispatchEvent(new CustomEvent('dl:introPlayed'));
      return;
    }
    if (typeof gsap === 'undefined') { window.dispatchEvent(new CustomEvent('dl:introPlayed')); return; }
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.fromTo(t, { y: 22 }, { y: 0, duration: 0.9 });
    if (s) tl.fromTo(s, { y: 14 }, { y: 0, duration: 0.8 }, '-=0.6');
    window.dispatchEvent(new CustomEvent('dl:introPlayed'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
})();
