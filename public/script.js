(() => {
  'use strict';

  const diagnostics = {
    power: { label: 'Не включается', title: 'Начнём с диагностики питания и платы', text: 'Проверим блок питания, разъём, батарею и основные цепи. До ремонта согласуем причину и объём работ.' },
    heat: { label: 'Греется / шумит', title: 'Проверим систему охлаждения', text: 'Замерим температуры, состояние вентиляторов и термоинтерфейсов. Часто помогает профилактика без сложного ремонта.' },
    slow: { label: 'Тормозит', title: 'Проверим накопитель, память и систему', text: 'Ищем узкое место: SSD/HDD, оперативная память, перегрев, фоновые процессы или ошибки Windows.' },
    blue: { label: 'Синий экран', title: 'Нужна диагностика причины сбоя', text: 'Проверим память, накопитель, драйверы и журнал ошибок, чтобы не маскировать проблему простой переустановкой системы.' },
    wifi: { label: 'Нет интернета / Wi-Fi', title: 'Проверим сеть и настройки', text: 'Диагностируем адаптер, драйверы, роутер и параметры сети. Поможем восстановить стабильное соединение.' },
    clean: { label: 'Нужна чистка', title: 'Проведём профилактику', text: 'Разборка, удаление пыли, обслуживание охлаждения и контроль температур после сборки.' }
  };
  const locations = [
    {name:'Сервисный центр',address:'Сенная пл., 4',note:'Основной сервисный центр',kind:'service'},
    {name:'Центр «Остров»',address:'Средний проспект В.О., 36',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'Лыжный переулок',address:'Лыжный переулок, 1',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'ТЦ «Комендант»',address:'ул. Уточкина, 3к2',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'ТЦ «Парнас»',address:'ул. Меркурьева, 7',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'ТК «Торговый двор»',address:'пр. Науки, 21к1',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'Коллонтай',address:'ул. Коллонтай, 18',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'Дыбенко',address:'ул. Дыбенко, 24к1',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'Бабушкина',address:'ул. Бабушкина, 71',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'Будапештская',address:'ул. Будапештская, 48',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'},
    {name:'ТРК «Нарва»',address:'Ленинский проспект, 128к2',note:'Пункт приёма-выдачи · по предварительной записи',kind:'pickup'}
  ];

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const modal = $('#requestModal');
  const requestForm = $('#requestForm');
  const quickForm = $('#quickForm');
  const modalProblem = $('#requestForm [name="problem"]');
  const modalFirstInput = $('#requestForm [name="name"]');
  const symptomGroup = $('.symptoms');
  const diagTitle = $('#diagResultTitle');
  const diagText = $('#diagResultText');
  const diagRequest = $('#diagRequest');
  const diagResult = $('.diagnostic-result');
  const locationGrid = $('#locationGrid');
  const locationCount = $('#locationCount');
  const locationEmpty = $('#locationEmpty');
  const locationSearch = $('#locationSearch');
  let lastFocus = null;
  let selectedService = 'Диагностика и ремонт';

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function setMessage(el, type, message) {
    if (!el) return;
    el.className = 'form-message show ' + type;
    el.textContent = message;
  }

  function clearMessage(el) {
    if (!el) return;
    el.className = 'form-message';
    el.textContent = '';
  }

  function getFocusable(container) {
    if (!container) return [];
    return $$('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])', container)
      .filter(el => !el.hidden && el.offsetParent !== null);
  }

  function openModal(service) {
    if (!modal) return;
    selectedService = service || 'Диагностика и ремонт';

    if (modalProblem && (!modalProblem.value.trim() || modalProblem.dataset.auto === '1')) {
      modalProblem.value = selectedService;
      modalProblem.dataset.auto = '1';
    }

    clearMessage($('#fullMessage'));
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => modalFirstInput?.focus({preventScroll:true}));
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.({preventScroll:true});
  }

  function toggleFaq(button) {
    const item = button?.closest('.faq-item');
    if (!item) return;
    const willOpen = !item.classList.contains('open');
    item.classList.toggle('open', willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
  }

  function selectDiagnostic(key) {
    const data = diagnostics[key];
    if (!data || !symptomGroup) return false;

    $$('button[data-key]', symptomGroup).forEach(button => {
      const active = button.dataset.key === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (diagTitle) diagTitle.textContent = data.title;
    if (diagText) diagText.textContent = data.text;
    if (diagRequest) {
      diagRequest.dataset.service = data.label;
      diagRequest.setAttribute('aria-label', 'Записаться: ' + data.label);
    }

    if (diagResult) {
      diagResult.classList.remove('is-updating');
      void diagResult.offsetWidth;
      diagResult.classList.add('is-updating');
      window.setTimeout(() => diagResult.classList.remove('is-updating'), 420);
    }
    return true;
  }

  function routeUrl(address) {
    return 'https://yandex.ru/maps/?text=' + encodeURIComponent(address + ', Санкт-Петербург');
  }

  function esc(value) {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function pluralAddresses(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'адрес';
    if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'адреса';
    return 'адресов';
  }

  function renderLocations(query='') {
    if (!locationGrid) return;
    const q = String(query).trim().toLowerCase();
    const filtered = locations.filter(item =>
      (item.name + ' ' + item.address + ' ' + item.note).toLowerCase().includes(q)
    );

    locationGrid.innerHTML = filtered.map(item =>
      '<article class="location-card ' + item.kind + '">' +
        '<div class="pin" aria-hidden="true">⌖</div>' +
        '<div>' +
          '<div class="location-meta"><span>' + (item.kind === 'service' ? 'Сервисный центр' : 'Приём-выдача') + '</span>' +
            (item.kind === 'pickup' ? '<em>по записи</em>' : '') +
          '</div>' +
          '<h3>' + esc(item.name) + '</h3>' +
          '<p>' + esc(item.address) + '</p>' +
          '<small>' + esc(item.note) + '</small>' +
        '</div>' +
        '<a class="route" href="' + routeUrl(item.address) + '" target="_blank" rel="noopener noreferrer" aria-label="Открыть маршрут: ' + esc(item.address) + '">Маршрут ↗</a>' +
      '</article>'
    ).join('');

    if (locationCount) locationCount.textContent = filtered.length + ' ' + pluralAddresses(filtered.length);
    if (locationEmpty) locationEmpty.hidden = filtered.length !== 0;
  }

  function whatsappUrl(payload) {
    const lines = [
      'Здравствуйте! Хочу оставить заявку на ремонт техники.',
      payload.name ? 'Имя: ' + payload.name : '',
      'Телефон: ' + payload.phone,
      payload.problem ? 'Проблема: ' + payload.problem : '',
      payload.location ? 'Адрес / район: ' + payload.location : '',
      'Страница: ' + location.href
    ].filter(Boolean);

    return 'https://wa.me/79810172345?text=' + encodeURIComponent(lines.join('\n'));
  }

  function openWhatsAppFallback(payload, messageEl) {
    const url = whatsappUrl(payload);
    const opened = window.open(url, '_blank');
    if (opened) {
      try { opened.opener = null; } catch {}
    } else {
      window.location.assign(url);
    }
    setMessage(messageEl, 'success', 'Не удалось отправить заявку автоматически. Мы подготовили её в WhatsApp — останется нажать «Отправить».');
  }

  async function submitLead(payload, messageEl) {
    const params = new URLSearchParams(location.search);
    const utm = {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || ''
    };
    const ticket = 'CHN-' + new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14) + '-' + Math.floor(100 + Math.random() * 900);
    const formPayload = {
      _subject: 'Новая заявка Чинилкин — ' + payload.phone,
      _template: 'table',
      _captcha: 'false',
      _url: location.href,
      _honey: payload.website || '',
      'ID заявки': ticket,
      'Имя': payload.name || 'Не указано',
      'Телефон': payload.phone,
      'Проблема': payload.problem || 'Не указана',
      'Адрес / район': payload.location || 'Не указан',
      'Источник': payload.source || 'website',
      'UTM source': utm.source,
      'UTM medium': utm.medium,
      'UTM campaign': utm.campaign,
      'Страница': location.href
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/araarkadij75@gmail.com', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(formPayload)
      });
      const data = await response.json().catch(() => ({}));
      const providerOk = response.ok && (data.success === true || data.success === 'true');

      if (providerOk) {
        setMessage(messageEl, 'success', 'Готово. Заявка ' + ticket + ' отправлена. Мы свяжемся с вами.');
        return {ok:true, ticket, data};
      }

      throw new Error(data.message || 'Ошибка почтовой доставки');
    } catch (error) {
      openWhatsAppFallback(payload, messageEl);
      return {ok:false, fallback:true, error};
    }
  }

  async function onQuickSubmit(event) {
    event.preventDefault();
    if (!quickForm) return;

    const phoneInput = $('[name="phone"]', quickForm);
    const honeypotInput = $('[name="website"]', quickForm);
    const phone = String(phoneInput?.value || '').trim();
    const message = $('#quickMessage');
    const honeypot = String(honeypotInput?.value || '').trim();

    if (honeypot) {
      setMessage(message, 'success', 'Спасибо. Заявка принята.');
      return;
    }
    if (normalizePhone(phone).length < 10) {
      setMessage(message, 'error', 'Введите корректный номер телефона.');
      phoneInput?.focus();
      return;
    }

    const submit = $('[type="submit"]', quickForm);
    const oldText = submit?.textContent || '';
    if (submit) {
      submit.disabled = true;
      submit.setAttribute('aria-busy','true');
      submit.textContent = 'Отправляем…';
    }

    const result = await submitLead({
      phone,
      name: '',
      problem: 'Прошу перезвонить и помочь с ремонтом техники.',
      location: '',
      source: 'hero_quick',
      website: honeypot
    }, message);

    if (result.ok) quickForm.reset();

    if (submit) {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      submit.textContent = oldText;
    }
  }

  async function onRequestSubmit(event) {
    event.preventDefault();
    if (!requestForm) return;

    const fd = new FormData(requestForm);
    const phone = String(fd.get('phone') || '').trim();
    const consent = fd.get('consent') === 'on';
    const honeypot = String(fd.get('website') || '').trim();
    const message = $('#fullMessage');

    if (honeypot) {
      setMessage(message, 'success', 'Спасибо. Заявка принята.');
      return;
    }
    if (normalizePhone(phone).length < 10) {
      setMessage(message, 'error', 'Проверьте номер телефона.');
      $('[name="phone"]', requestForm)?.focus();
      return;
    }
    if (!consent) {
      setMessage(message, 'error', 'Нужно согласие на обработку данных для связи по заявке.');
      $('[name="consent"]', requestForm)?.focus();
      return;
    }

    const submit = $('[type="submit"]', requestForm);
    const oldText = submit?.textContent || '';
    if (submit) {
      submit.disabled = true;
      submit.setAttribute('aria-busy','true');
      submit.textContent = 'Отправляем…';
    }

    const result = await submitLead({
      name: String(fd.get('name') || '').trim(),
      phone,
      problem: String(fd.get('problem') || selectedService).trim(),
      location: String(fd.get('location') || '').trim(),
      source: 'request_modal',
      website: honeypot
    }, message);

    if (result.ok) {
      requestForm.reset();
      if (modalProblem) modalProblem.dataset.auto = '1';
      window.setTimeout(closeModal, 1150);
    }

    if (submit) {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      submit.textContent = oldText;
    }
  }

  function onDocumentClick(event) {
    const close = event.target.closest('[data-close-modal]');
    if (close) {
      event.preventDefault();
      closeModal();
      return;
    }

    const symptom = event.target.closest('.symptoms button[data-key]');
    if (symptom) {
      event.preventDefault();
      selectDiagnostic(symptom.dataset.key);
      return;
    }

    const faq = event.target.closest('.faq-item > button');
    if (faq) {
      event.preventDefault();
      toggleFaq(faq);
      return;
    }

    const clear = event.target.closest('#clearSearch');
    if (clear) {
      event.preventDefault();
      if (locationSearch) {
        locationSearch.value = '';
        renderLocations('');
        locationSearch.focus();
      }
      return;
    }

    const opener = event.target.closest('.js-open-modal');
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.service || 'Диагностика и ремонт');
      return;
    }

    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) {
      const hash = anchor.getAttribute('href');
      const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
        history.replaceState(null,'',hash);
      }
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && modal && !modal.hidden) {
      event.preventDefault();
      closeModal();
      return;
    }

    if (modal && !modal.hidden && event.key === 'Tab') {
      const focusable = getFocusable(modal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (symptomGroup && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
      const buttons = $$('button[data-key]', symptomGroup);
      const index = buttons.indexOf(document.activeElement);
      if (index >= 0) {
        event.preventDefault();
        const delta = (event.key === 'ArrowLeft' || event.key === 'ArrowUp') ? -1 : 1;
        const next = buttons[(index + delta + buttons.length) % buttons.length];
        next.focus();
        selectDiagnostic(next.dataset.key);
      }
    }
  }

  function syncInitialState() {
    $$('.faq-item > button').forEach(button => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.closest('.faq-item')?.classList.toggle('open', expanded);
    });
    renderLocations('');
    selectDiagnostic($('.symptoms button.active')?.dataset.key || 'power');
    if (modal) modal.setAttribute('aria-hidden', modal.hidden ? 'true' : 'false');
  }

  function addAuditPanel(lines, passed, total) {
    const panel = document.createElement('pre');
    panel.id = 'uiAuditPanel';
    panel.setAttribute('role','status');
    panel.style.cssText = 'position:fixed;z-index:999999;left:12px;right:12px;bottom:12px;max-height:45vh;overflow:auto;background:#071a33;color:#eaf8ff;border:2px solid ' + (passed===total ? '#67e8a5' : '#ff6b7a') + ';border-radius:14px;padding:16px;font:12px/1.45 ui-monospace,monospace;white-space:pre-wrap;box-shadow:0 20px 60px #000a';
    panel.textContent = 'UI AUDIT ' + passed + '/' + total + '\n' + lines.join('\n');
    document.body.append(panel);
  }

  async function runUiAudit() {
    if (new URLSearchParams(location.search).get('ui_test') !== '1') return;
    document.title = 'UI AUDIT START — Чинилкин';
    const results = [];
    try {
    const check = (name, value) => results.push({name, ok:Boolean(value)});

    const internal = $$('a[href^="#"]');
    internal.forEach(a => check('anchor ' + a.getAttribute('href'), Boolean(document.querySelector(a.getAttribute('href')))));

    $$('a[href^="tel:"]').forEach(a => check('tel ' + a.textContent.trim(), /^tel:\+79810172345$/.test(a.getAttribute('href'))));
    $$('a[href*="wa.me"]').forEach(a => check('WhatsApp link', /^https:\/\/wa\.me\/79810172345/.test(a.href)));

    check('11 locations rendered', $$('.location-card').length === 11);
    check('11 route links', $$('.location-card a.route').length === 11);
    check('all route links Yandex', $$('.location-card a.route').every(a => a.href.startsWith('https://yandex.ru/maps/')));

    for (const key of Object.keys(diagnostics)) {
      selectDiagnostic(key);
      check('diagnostic ' + key + ' active', $('.symptoms button[data-key="' + key + '"]')?.getAttribute('aria-pressed') === 'true');
      check('diagnostic ' + key + ' title', diagTitle?.textContent === diagnostics[key].title);
      check('diagnostic ' + key + ' CTA', diagRequest?.dataset.service === diagnostics[key].label);
    }
    selectDiagnostic('power');

    for (const button of $$('.faq-item > button')) {
      const item = button.closest('.faq-item');
      const before = item.classList.contains('open');
      button.click();
      check('FAQ toggles ' + button.textContent.trim().slice(0,30), item.classList.contains('open') !== before);
      button.click();
      check('FAQ restores ' + button.textContent.trim().slice(0,30), item.classList.contains('open') === before);
    }

    const openers = $$('.js-open-modal');
    for (const opener of openers) {
      opener.click();
      check('CTA opens modal: ' + opener.textContent.trim().slice(0,32), modal && !modal.hidden);
      check('CTA transfers service', !modalProblem || modalProblem.value.trim().length > 0);
      closeModal();
    }

    openModal('Audit close X');
    $('.modal-close')?.click();
    check('modal X closes', modal?.hidden);

    openModal('Audit backdrop');
    $('.modal-backdrop')?.click();
    check('modal backdrop closes', modal?.hidden);

    openModal('Audit Escape');
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    check('modal Escape closes', modal?.hidden);

    if (locationSearch) {
      locationSearch.value = 'адрес-которого-нет-xyz';
      locationSearch.dispatchEvent(new Event('input',{bubbles:true}));
      check('location search filters', $$('.location-card').length === 0 && locationEmpty && !locationEmpty.hidden);
      $('#clearSearch')?.click();
      check('clear location search', locationSearch.value === '' && $$('.location-card').length === 11);
    }

    if (quickForm) {
      const quickPhone = $('[name="phone"]', quickForm);
      quickPhone.value = '123';
      quickForm.requestSubmit();
      await new Promise(r => setTimeout(r,0));
      check('quick form validation', $('#quickMessage')?.classList.contains('error'));
      quickForm.reset();
      clearMessage($('#quickMessage'));
    }

    if (requestForm) {
      const reqPhone = $('[name="phone"]', requestForm);
      const reqConsent = $('[name="consent"]', requestForm);
      openModal('Audit form');
      reqPhone.value = '123';
      reqConsent.checked = true;
      requestForm.requestSubmit();
      await new Promise(r => setTimeout(r,0));
      check('request form phone validation', $('#fullMessage')?.classList.contains('error'));
      reqPhone.value = '+7 999 999-99-99';
      reqConsent.checked = false;
      requestForm.requestSubmit();
      await new Promise(r => setTimeout(r,0));
      check('request form consent validation', $('#fullMessage')?.classList.contains('error'));
      requestForm.reset();
      closeModal();
      clearMessage($('#fullMessage'));
    }

    const knownButtons = $$('button').every(button =>
      button.matches('.js-open-modal,.symptoms button,#clearSearch,.faq-item > button,[data-close-modal],[type="submit"]')
    );
    check('all buttons have handlers/submit role', knownButtons);
    check('all buttons have explicit type', $$('button').every(b => Boolean(b.getAttribute('type'))));

    const passed = results.filter(r => r.ok).length;
    addAuditPanel(results.map(r => (r.ok ? 'PASS ' : 'FAIL ') + r.name), passed, results.length);
    document.title = 'UI AUDIT ' + passed + '/' + results.length + ' — Чинилкин';
    } catch (error) {
      addAuditPanel(['ERROR ' + (error && error.stack ? error.stack : String(error))], 0, 1);
      document.title = 'UI AUDIT ERROR — Чинилкин';
    }
  }

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
  locationSearch?.addEventListener('input', () => renderLocations(locationSearch.value));
  modalProblem?.addEventListener('input', () => { modalProblem.dataset.auto = '0'; });
  quickForm?.addEventListener('submit', onQuickSubmit);
  requestForm?.addEventListener('submit', onRequestSubmit);

  syncInitialState();
  window.setTimeout(runUiAudit, 250);
})();