(() => {
  'use strict';
  const id = Number(window.CHINILKIN_CONFIG?.metrikaId);
  const enabled = Number.isSafeInteger(id) && id > 0;
  const goals = new Set(['phone_click','whatsapp_click','request_open','lead_attempt','lead_success','lead_error','whatsapp_fallback']);
  if (enabled) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(script);
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  }
  window.trackChinilkin = (goal, params = {}) => {
    if (!goals.has(goal)) return;
    // Never include names, phone numbers, message text or other form values.
    const safe = {};
    if (['header','hero','footer','mobile','services','diagnostic','final','other','hero_quick','request_modal'].includes(params.placement)) safe.placement = params.placement;
    if (enabled) window.ym(id, 'reachGoal', goal, safe);
  };
  const placement = el => {
    if (el.closest('.mobile-dock')) return 'mobile';
    if (el.closest('.topbar')) return 'header';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.footer')) return 'footer';
    if (el.closest('#services')) return 'services';
    if (el.closest('#diagnostic')) return 'diagnostic';
    if (el.closest('.final-cta')) return 'final';
    return 'other';
  };
  document.addEventListener('click', event => {
    const el = event.target.closest('a,button');
    if (!el) return;
    const href = el.getAttribute('href') || '';
    const goal = href.startsWith('tel:') ? 'phone_click' : /^https:\/\/wa\.me\//.test(href) ? 'whatsapp_click' : el.matches('.js-open-modal') ? 'request_open' : null;
    if (goal) window.trackChinilkin(goal, { placement: placement(el) });
  });
})();
