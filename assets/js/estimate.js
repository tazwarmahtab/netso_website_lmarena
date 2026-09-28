/* ==========================================================================
   estimate.js — /estimate
   The "instrument": an indicative rooftop-solar estimate. Two sliders + a
   battery toggle drive a plant size, daytime generation, a saving RANGE,
   load share and CO2 avoided. No per-kWh rate is ever displayed.

   All constants below are illustrative planning assumptions, not quotes.
   ========================================================================== */
window.DL.ready(function () {
  'use strict';
  const DL = window.DL;
  const q = DL.q;

  DL.lines('[data-lines]');
  DL.reveal('[data-reveal="up"]', { y: 28 });

  /* ---- indicative planning assumptions (internal; never shown) ---------
     Grounded in Bangladesh sources, Sept 2026:
     · Yield 1,400–1,700 kWh/kWp/yr (SREDA national review; PVKnowHow 3.3–4.9/day)
       → 120 kWh/kWp/mo (~1,440/yr), the conservative end.
     · Roof density ~10 m²/kWp for rooftop incl. tilt/spacing (ground ~12 m²/kWp).
     · MT 11kV industrial tariff ৳12.52–16.36/kWh (BERC, 3 Jun 2025 revision);
       14.5 used only to convert a bill into kWh — never displayed.
     · Grid emission factor 0.635 tCO₂/MWh for solar projects (ADB, Bangladesh).
     · Net Metering Guidelines 2025 allow up to 100% of sanctioned load (was 70%),
       so a plant is bounded by usable roof and daytime self-consumption. */
  const M2_PER_KWP = 10;       // usable roof area per installed kWp
  const YIELD_MO   = 120;      // kWh generated per kWp per month (~1,440/yr, BD)
  const GRID_TARIFF = 14.5;    // ৳/kWh, mid of MT industrial band (internal only)
  const DAYTIME_SHARE = 0.55;  // share of consumption solar serves behind the meter
  const CO2_PER_KWH = 0.635;   // kg CO2 per grid kWh displaced (ADB, solar projects)
  // solar lands this fraction below the grid tariff — a range, so no single rate
  const SAVE = { lo: 0.12, hi: 0.25 };
  const SAVE_BATT = { lo: 0.06, hi: 0.16 }; // battery trades saving for reliability

  const els = {
    bill: q('#in-bill'), roof: q('#in-roof'), batt: q('#in-battery'),
    outBill: q('#out-bill'), outRoof: q('#out-roof'),
    save: q('#r-save'), saveYr: q('#r-save-yr'),
    kwp: q('#r-kwp'), kwh: q('#r-kwh'), share: q('#r-share'), co2: q('#r-co2'),
  };
  if (!els.bill || !els.roof) return;

  /* ---- formatters ------------------------------------------------------ */
  const grp = (n) => Math.round(n).toLocaleString('en-IN'); // 1,28,333 grouping
  const bdt = (n) => '৳ ' + grp(n);
  const lakh = (n) => (n / 100000); // value in lakh
  const oneDp = (n) => (Math.round(n * 10) / 10).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const billLabel = (v) => '৳ ' + grp(v);
  const roofLabel = (v) => grp(v) + ' m²';

  function compute() {
    const bill = Number(els.bill.value);
    const roof = Number(els.roof.value);
    const battery = els.batt.getAttribute('aria-checked') === 'true';
    const pct = battery ? SAVE_BATT : SAVE;

    const consumption = bill / GRID_TARIFF;              // kWh/mo the bill implies
    const daytimeKwh  = consumption * DAYTIME_SHARE;     // solar-addressable load
    const genFromRoof = (roof / M2_PER_KWP) * YIELD_MO;  // what the roof can make
    const usableKwh   = Math.max(0, Math.min(genFromRoof, daytimeKwh));
    const plantKwp    = usableKwh / YIELD_MO;

    const saveLoMo = usableKwh * GRID_TARIFF * pct.lo;
    const saveHiMo = usableKwh * GRID_TARIFF * pct.hi;
    const sharePct = consumption > 0 ? Math.min(100, (usableKwh / consumption) * 100) : 0;
    const co2Yr    = (usableKwh * 12 * CO2_PER_KWH) / 1000; // tonnes/yr

    return { usableKwh, plantKwp, saveLoMo, saveHiMo, sharePct, co2Yr };
  }

  function render() {
    els.outBill.textContent = billLabel(els.bill.value);
    els.outRoof.textContent = roofLabel(els.roof.value);

    const r = compute();
    els.save.textContent   = bdt(r.saveLoMo) + ' – ' + bdt(r.saveHiMo);
    els.saveYr.textContent = '≈ ৳ ' + oneDp(lakh(r.saveLoMo * 12)) + ' – ' + oneDp(lakh(r.saveHiMo * 12)) + ' lakh per year';
    els.kwp.innerHTML      = grp(r.plantKwp) + ' kWp';
    els.kwh.innerHTML      = grp(r.usableKwh) + ' kWh<span class="result__unit"> / mo</span>';
    els.share.textContent  = Math.round(r.sharePct) + '%';
    els.co2.innerHTML      = grp(r.co2Yr) + ' t<span class="result__unit"> / yr</span>';
  }

  els.bill.addEventListener('input', render);
  els.roof.addEventListener('input', render);
  els.batt.addEventListener('click', () => {
    const on = els.batt.getAttribute('aria-checked') === 'true';
    els.batt.setAttribute('aria-checked', String(!on));
    render();
  });

  render(); // initial paint
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
