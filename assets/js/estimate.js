/* Netso Energy — localized Bangladesh C&I rooftop screening model.
   Uses physical screening ranges plus a selectable tariff basis. It intentionally
   does not turn outage exposure into a fabricated diesel-savings claim. */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const q = DL.q;
  DL.lines('[data-lines]');

  const ROOF_M2_PER_KWP = { lo: 7, hi: 10 };
  const YIELD_YR = { lo: 1200, hi: 1400 };
  const TARIFFS = {
    industrial: { lo: 11.56, hi: 16.06, label: '11 kV industrial' },
    custom: { lo: 13.5, hi: 13.5, label: 'Your blended rate' },
  };

  const els = {
    consumption: q('#in-consumption'), roof: q('#in-roof'), daytime: q('#in-daytime'),
    tariff: q('#in-tariff'), customTariff: q('#in-custom-tariff'), customWrap: q('#custom-tariff-control'),
    outage: q('#in-outage'), batt: q('#in-battery'),
    outConsumption: q('#out-consumption'), outRoof: q('#out-roof'), outDaytime: q('#out-daytime'),
    outTariff: q('#out-tariff'), outCustomTariff: q('#out-custom-tariff'), outOutage: q('#out-outage'),
    value: q('#r-value'), valueSub: q('#r-value-sub'), kwp: q('#r-kwp'), kwh: q('#r-kwh'),
    share: q('#r-share'), battOut: q('#r-batt'), tariffOut: q('#r-tariff'), resilience: q('#r-resilience')
  };
  if (!els.consumption || !els.roof || !els.daytime || !els.tariff) return;

  const grp = (n) => Math.round(n).toLocaleString('en-IN');
  const oneDp = (n) => (Math.round(n * 10) / 10).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const bdt = (n) => '৳ ' + grp(n);
  const crore = (n) => n / 10000000;
  const energy = (n) => n >= 1000000 ? `${oneDp(n / 1000000)} GWh` : n >= 1000 ? `${grp(n / 1000)} MWh` : `${grp(n)} kWh`;
  const rate = (n) => `৳${Number(n).toFixed(2)}`;

  function activeTariff() {
    if (els.tariff.value === 'custom') {
      const n = Number(els.customTariff.value);
      return { lo: n, hi: n, label: 'Your blended rate' };
    }
    return TARIFFS.industrial;
  }

  function compute() {
    const monthlyLoad = Number(els.consumption.value);
    const roof = Number(els.roof.value);
    const daytimeShare = Number(els.daytime.value) / 100;
    const daytimeLoad = monthlyLoad * daytimeShare;
    const roofKwpLo = roof / ROOF_M2_PER_KWP.hi;
    const roofKwpHi = roof / ROOF_M2_PER_KWP.lo;
    const loadKwpLo = daytimeLoad / (YIELD_YR.hi / 12);
    const loadKwpHi = daytimeLoad / (YIELD_YR.lo / 12);
    const kwpLo = Math.max(0, Math.min(roofKwpLo, loadKwpLo));
    const kwpHi = Math.max(kwpLo, Math.min(roofKwpHi, loadKwpHi));
    const annualKwhLo = kwpLo * YIELD_YR.lo;
    const annualKwhHi = kwpHi * YIELD_YR.hi;
    const annualLoad = monthlyLoad * 12;
    const displacedKwhLo = Math.min(annualKwhLo, annualLoad);
    const displacedKwhHi = Math.min(annualKwhHi, annualLoad);
    const tariff = activeTariff();
    return {
      kwpLo, kwpHi, annualKwhLo, annualKwhHi,
      annualValueLo: displacedKwhLo * tariff.lo, annualValueHi: displacedKwhHi * tariff.hi,
      offsetLo: monthlyLoad ? (displacedKwhLo / annualLoad) * 100 : 0,
      offsetHi: monthlyLoad ? (displacedKwhHi / annualLoad) * 100 : 0,
      tariff, outage: Number(els.outage.value)
    };
  }

  function render() {
    els.outConsumption.textContent = grp(els.consumption.value) + ' kWh';
    els.outRoof.textContent = grp(els.roof.value) + ' m²';
    els.outDaytime.textContent = els.daytime.value + '%';
    const custom = els.tariff.value === 'custom';
    els.customWrap.hidden = !custom;
    const tariff = activeTariff();
    els.outTariff.textContent = custom ? 'Your blended rate' : '11 kV industrial';
    els.outCustomTariff.textContent = rate(els.customTariff.value) + '/kWh';
    els.outOutage.textContent = els.outage.value + ' hrs/month';

    const r = compute();
    els.value.textContent = bdt(r.annualValueLo) + ' – ' + bdt(r.annualValueHi);
    els.valueSub.textContent = `≈ ৳ ${oneDp(crore(r.annualValueLo))} – ${oneDp(crore(r.annualValueHi))} crore/year of indicative grid-energy value at ${rate(tariff.lo)}–${rate(tariff.hi)}/kWh`;
    els.kwp.textContent = grp(r.kwpLo) + '–' + grp(r.kwpHi) + ' kWp';
    els.kwh.textContent = energy(r.annualKwhLo) + '–' + energy(r.annualKwhHi);
    els.share.textContent = Math.round(r.offsetLo) + '–' + Math.round(r.offsetHi) + '%';
    const battery = els.batt.getAttribute('aria-checked') === 'true';
    els.battOut.textContent = battery ? 'Reliability + shifting' : 'Not included';
    els.tariffOut.textContent = custom ? rate(tariff.lo) + '/kWh' : rate(tariff.lo) + '–' + rate(tariff.hi);
    els.resilience.textContent = r.outage === 0 ? 'No hours entered' : r.outage + ' hrs/month';
    els.batt.setAttribute('aria-label', battery ? 'Battery storage included as a qualitative option' : 'Include battery storage');
  }

  [els.consumption, els.roof, els.daytime, els.customTariff, els.outage, els.tariff].forEach((input) => input?.addEventListener('input', render));
  els.tariff.addEventListener('change', render);
  els.batt.addEventListener('click', () => {
    const on = els.batt.getAttribute('aria-checked') === 'true';
    els.batt.setAttribute('aria-checked', String(!on));
    render();
  });
  render();
});

/* Page hero appears immediately — never gated behind asset loading. */
(function () {
  const go = () => {
    const t = document.querySelector('.pagehero__title'), s = document.querySelector('.pagehero__sub');
    if (!t) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined') {
      window.dispatchEvent(new CustomEvent('dl:introPlayed')); return;
    }
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.fromTo(t, { y: 22 }, { y: 0, duration: 0.9 });
    if (s) tl.fromTo(s, { y: 14 }, { y: 0, duration: 0.8 }, '-=0.6');
    window.dispatchEvent(new CustomEvent('dl:introPlayed'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true }); else go();
})();
