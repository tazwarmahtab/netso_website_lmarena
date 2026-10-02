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
  let selectedRegion = { id: 'dhaka', name: 'Dhaka', ghi_kwh_m2_day: 4.5031 };
  let selectedYield = YIELD_YR;

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
    const loadKwpLo = daytimeLoad / (selectedYield.hi / 12);
    const loadKwpHi = daytimeLoad / (selectedYield.lo / 12);
    const kwpLo = Math.max(0, Math.min(roofKwpLo, loadKwpLo));
    const kwpHi = Math.max(kwpLo, Math.min(roofKwpHi, loadKwpHi));
    const annualKwhLo = kwpLo * selectedYield.lo;
    const annualKwhHi = kwpHi * selectedYield.hi;
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

  function setRegion(region) {
    selectedRegion = region;
    const ghi = Number(region.ghi_kwh_m2_day);
    // Screening conversion: climatological GHI × 365 × 0.75–0.85 system factor.
    selectedYield = { lo: Math.round(ghi * 365 * 0.75), hi: Math.round(ghi * 365 * 0.85) };
    document.querySelectorAll('[data-region]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.region === region.id)));
    const name = q('#solar-region-name'), value = q('#solar-region-value'), copy = q('#solar-region-copy');
    if (name) name.textContent = region.name;
    if (value) value.textContent = ghi.toFixed(2) + ' kWh/m²/day';
    if (copy) copy.textContent = `Screening yield band: ${selectedYield.lo.toLocaleString('en-IN')}–${selectedYield.hi.toLocaleString('en-IN')} kWh/kWp/year using a 0.75–0.85 system factor.`;
    render();
  }

  fetch('/assets/data/bangladesh-solar-resource.json').then((response) => response.ok ? response.json() : Promise.reject(response.status)).then((payload) => {
    const byId = Object.fromEntries(payload.regions.map((region) => [region.id, region]));
    document.querySelectorAll('[data-region]').forEach((button) => button.addEventListener('click', () => byId[button.dataset.region] && setRegion(byId[button.dataset.region])));
    if (byId.dhaka) setRegion(byId.dhaka);
  }).catch(() => {
    document.querySelectorAll('[data-region]').forEach((button) => button.addEventListener('click', () => {}));
  });

  const leadForm = q('[data-lead-form]');
  const leadStatus = q('[data-lead-status]');
  leadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!leadForm.checkValidity()) { leadForm.reportValidity(); return; }
    const r = compute();
    const form = new FormData(leadForm);
    const payload = {
      source: 'netso-solar-calculator', submittedAt: new Date().toISOString(),
      name: form.get('name'), company: form.get('company'), phone: form.get('phone'), email: form.get('email'), consent: true,
      region: selectedRegion.name, regionSolarResource: selectedRegion.ghi_kwh_m2_day,
      monthlyConsumptionKwh: Number(els.consumption.value), roofAreaM2: Number(els.roof.value), daylightLoadShare: Number(els.daytime.value),
      tariffBasis: activeTariff().label, blendedTariff: activeTariff().lo, outageHoursPerMonth: Number(els.outage.value), battery: els.batt.getAttribute('aria-checked') === 'true',
      result: { pvKwp: [r.kwpLo, r.kwpHi], annualGenerationKwh: [r.annualKwhLo, r.annualKwhHi], annualValueBdt: [r.annualValueLo, r.annualValueHi] },
      crm: { lifecycleStage: 'lead', leadSource: 'Website calculator', tags: ['solar-calculator', 'bangladesh'] }
    };
    const webhook = window.NETSO_LEAD_WEBHOOK || '';
    const whatsappNumber = (leadForm.dataset.whatsappNumber || '').replace(/\D/g, '');
    const whatsappMessage = [
      'Hello Netso — I would like a rooftop solar assessment.',
      `Name: ${payload.name}`, `Company: ${payload.company}`, `Phone: ${payload.phone}`,
      payload.email ? `Email: ${payload.email}` : '', `Region: ${payload.region}`,
      `Monthly consumption: ${payload.monthlyConsumptionKwh.toLocaleString('en-IN')} kWh`,
      `Usable roof: ${payload.roofAreaM2.toLocaleString('en-IN')} m²`,
      `Calculator result: ${Math.round(payload.result.pvKwp[0])}–${Math.round(payload.result.pvKwp[1])} kWp; ${Math.round(payload.result.annualValueBdt[0]).toLocaleString('en-IN')}–${Math.round(payload.result.annualValueBdt[1]).toLocaleString('en-IN')} BDT/year`,
      'I agree that Netso Energy may contact me about this enquiry.'
    ].filter(Boolean).join('\n');
    try {
      if (webhook) {
        const response = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error('Webhook rejected');
      } else {
        localStorage.setItem('netso:last-lead', JSON.stringify(payload));
      }
      if (whatsappNumber) window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener');
      leadStatus.textContent = whatsappNumber ? 'Opening WhatsApp with your result prefilled.' : (webhook ? 'Received — our team will follow up with your site-specific next step.' : 'Saved as a lead-ready result. CRM routing is ready to connect before launch.');
      leadForm.reset();
    } catch (error) {
      leadStatus.textContent = 'We could not send this yet. Please use WhatsApp or try again in a moment.';
    }
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
