(() => {
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

  const modal = document.getElementById('requestModal');
  const modalProblem = document.querySelector('#requestForm [name="problem"]');
  const modalFirstInput = document.querySelector('#requestForm [name="name"]');
  let lastFocus = null;
  let selectedService = 'Диагностика и ремонт';

  function openModal(service) {
    selectedService = service || 'Диагностика и ремонт';
    if (modalProblem && (!modalProblem.value || modalProblem.dataset.auto === '1')) {
      modalProblem.value = selectedService;
      modalProblem.dataset.auto = '1';
    }
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    setTimeout(() => modalFirstInput?.focus(), 30);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.();
  }

  document.querySelectorAll('.js-open-modal').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.service)));
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });
  modalProblem?.addEventListener('input', () => { modalProblem.dataset.auto = '0'; });

  document.querySelectorAll('.symptoms button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.symptoms button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed','true');
    const d = diagnostics[btn.dataset.key];
    document.getElementById('diagResultTitle').textContent = d.title;
    document.getElementById('diagResultText').textContent = d.text;
    document.getElementById('diagRequest').dataset.service = d.label;
  }));
  document.getElementById('diagRequest')?.addEventListener('click', () => {
    const key = document.querySelector('.symptoms button.active')?.dataset.key || 'power';
    openModal(diagnostics[key].label);
  });

  document.querySelectorAll('.faq-item > button').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const willOpen = !item.classList.contains('open');
    item.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  }));

  const grid = document.getElementById('locationGrid');
  const count = document.getElementById('locationCount');
  const empty = document.getElementById('locationEmpty');
  const search = document.getElementById('locationSearch');
  const clear = document.getElementById('clearSearch');
  const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function routeUrl(address){ return 'https://yandex.ru/maps/?text=' + encodeURIComponent(address + ', Санкт-Петербург'); }
  function renderLocations(query='') {
    if (!grid) return;
    const q = query.trim().toLowerCase();
    const filtered = locations.filter(x => (x.name+' '+x.address+' '+x.note).toLowerCase().includes(q));
    grid.innerHTML = filtered.map(x => `<article class="location-card ${x.kind}"><div class="pin" aria-hidden="true">⌖</div><div><div class="location-meta"><span>${x.kind==='service'?'Сервисный центр':'Приём-выдача'}</span>${x.kind==='pickup'?'<em>по записи</em>':''}</div><h3>${esc(x.name)}</h3><p>${esc(x.address)}</p><small>${esc(x.note)}</small></div><a class="route" href="${routeUrl(x.address)}" target="_blank" rel="noopener" aria-label="Открыть маршрут: ${esc(x.address)}">Маршрут ↗</a></article>`).join('');
    if (count) count.textContent = `${filtered.length} ${filtered.length===1?'адрес':filtered.length>=2&&filtered.length<=4?'адреса':'адресов'}`;
    if (empty) empty.hidden = filtered.length !== 0;
  }
  renderLocations();
  search?.addEventListener('input', () => renderLocations(search.value));
  clear?.addEventListener('click', () => { search.value=''; renderLocations(); search.focus(); });

  function normalizePhone(value){ return String(value || '').replace(/\D/g,''); }
  function setMessage(el,type,text){
    if (!el) return;
    el.className = `form-message show ${type}`;
    el.textContent = text;
  }
  function whatsappUrl(payload){
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
  function handoffToWhatsApp(payload, msgEl){
    const url = whatsappUrl(payload);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
    setMessage(msgEl,'success','Готово: заявка подготовлена в WhatsApp. В открывшемся чате нажмите «Отправить» — так она сразу попадёт оператору.');
  }

  const quickForm = document.getElementById('quickForm');
  quickForm?.addEventListener('submit', e => {
    e.preventDefault();
    const phone = quickForm.phone.value.trim();
    const msg = document.getElementById('quickMessage');
    if (normalizePhone(phone).length < 10) {
      setMessage(msg,'error','Введите корректный номер телефона.');
      quickForm.phone.focus();
      return;
    }
    handoffToWhatsApp({phone,name:'',problem:'Прошу перезвонить и помочь с ремонтом техники.',location:''}, msg);
  });

  const requestForm = document.getElementById('requestForm');
  requestForm?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(requestForm);
    const phone = String(fd.get('phone')||'').trim();
    const consent = fd.get('consent') === 'on';
    const msg = document.getElementById('fullMessage');
    if (normalizePhone(phone).length < 10) {
      setMessage(msg,'error','Проверьте номер телефона.');
      requestForm.phone.focus();
      return;
    }
    if (!consent) {
      setMessage(msg,'error','Нужно согласие на обработку данных для связи по заявке.');
      requestForm.consent.focus();
      return;
    }
    handoffToWhatsApp({
      name:String(fd.get('name')||'').trim(),
      phone,
      problem:String(fd.get('problem')||selectedService).trim(),
      location:String(fd.get('location')||'').trim()
    }, msg);
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    if (modal && !modal.hidden) closeModal();
  }));
})();