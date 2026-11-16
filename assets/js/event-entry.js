/**
 * EVENT 응모 폼 + 응모 한마디(댓글) 목록
 *
 * 저장 방식은 응모 영역의 data-store 값으로 고릅니다 (src/content/issue.mjs의 entry.store).
 *   local  — 이 브라우저(localStorage)에만 저장. 인터넷·서버 없이 시연할 때 씁니다.
 *   sheets — 구글 스프레드시트(Apps Script 웹 앱)로 보냅니다. data-endpoint에 웹 앱 주소.
 *            시트 쪽 코드는 tools/apps-script/event-entry.gs, 설정 방법은 README.
 * 다른 서버(사내 게시판 등)로 바꿀 때는 STORES에 같은 모양(submit · list)을 하나 더 만들면 됩니다.
 *
 * 시연 데이터 지우기: 주소 끝에 ?reset 을 붙여 열면 이 브라우저의 응모 기록이 지워집니다.
 */
(function () {
  'use strict';

  var section = document.querySelector('[data-entry]');
  if (!section) return;

  var PREFIX = 'kepco-webzine:';
  var PAGE = 5;
  var eventId = section.getAttribute('data-entry');
  var MINE = 'entry:' + eventId;      // 내 응모 접수증
  var ALL = 'entries:' + eventId;     // (local 전용) 이 브라우저에 쌓인 응모 전체

  // ---- 저장소 도우미 -------------------------------------------------------
  function load(key) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function store(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(PREFIX + key);
      else window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  if (/[?&]reset\b/.test(window.location.search)) {
    store(MINE, null);
    store(ALL, null);
    store('quiz:' + eventId, null);
  }

  function digits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatPhone(value) {
    var d = digits(value).slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    var mid = d.length === 10 ? 6 : 7;
    return d.slice(0, 3) + '-' + d.slice(3, mid) + '-' + d.slice(mid);
  }

  function maskName(name) {
    var chars = Array.from(String(name).trim());
    if (chars.length <= 1) return '*';
    if (chars.length === 2) return chars[0] + '*';
    return chars[0] + chars.slice(1, -1).map(function () { return '*'; }).join('') + chars[chars.length - 1];
  }

  function maskPhone(phone) {
    var d = digits(phone);
    return d.slice(0, 3) + '-****-' + d.slice(-4);
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + '.';
  }

  // ---- 저장 방식 -----------------------------------------------------------
  // submit(entry) → Promise<{ no }> · 실패 시 Error(code: 'duplicate' | 'network' | 'storage')
  // list()        → Promise<[{ name, org, text, date }]>  (최신순, 이름은 가리지 않은 채로 와도 됨)
  function fail(code, message) {
    var error = new Error(message);
    error.code = code;
    return Promise.reject(error);
  }

  var STORES = {
    local: {
      submit: function (entry) {
        var all = load(ALL) || [];
        var dup = all.some(function (item) { return digits(item.phone) === digits(entry.phone); });
        if (dup) return fail('duplicate', '이미 응모한 연락처예요.');
        var no = (/churu/.test(eventId) ? 'CH' : 'EV') + eventId.replace(/\D/g, '').slice(2) + '-' + ('000' + (all.length + 1)).slice(-4);
        all.push(Object.assign({ no: no }, entry));
        if (!store(ALL, all)) return fail('storage', '이 브라우저에 저장할 수 없어요. 사생활 보호 모드를 끄고 다시 시도해 주세요.');
        return Promise.resolve({ no: no });
      },
      list: function () {
        var samples = [];
        var holder = section.parentNode.querySelector('[data-comments-samples]');
        try { samples = JSON.parse(holder ? holder.textContent : '[]'); } catch (e) { /* 샘플 없음 */ }
        var mine = (load(ALL) || []).map(function (item) {
          return { name: item.name, org: item.org, text: item.text, date: item.date };
        });
        return Promise.resolve(mine.concat(samples).sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        }));
      },
    },

    sheets: {
      submit: function (entry) {
        return request('POST', { action: 'entry', eventId: eventId, entry: entry }).then(function (res) {
          if (res.ok) return { no: res.no };
          if (res.code === 'duplicate') return fail('duplicate', '이미 응모한 연락처예요.');
          return fail('server', res.message || '응모를 접수하지 못했어요.');
        });
      },
      list: function () {
        return request('GET', { action: 'comments', eventId: eventId }).then(function (res) {
          return res.ok ? res.comments || [] : [];
        });
      },
    },
  };

  // Apps Script 웹 앱 호출 — 본문을 text/plain으로 보내 사전 요청(CORS preflight) 없이 동작
  function request(method, payload) {
    var endpoint = section.getAttribute('data-endpoint');
    if (!endpoint) return fail('network', '응모 접수 주소가 설정되지 않았어요.');
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, 10000);
    var url = endpoint;
    var options = { method: method, signal: controller && controller.signal };
    if (method === 'GET') {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'action=' + payload.action + '&eventId=' + encodeURIComponent(payload.eventId);
    } else {
      options.body = JSON.stringify(payload);
    }
    return fetch(url, options)
      .then(function (r) { return r.json(); })
      .catch(function () { return fail('network', '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'); })
      .then(function (res) { clearTimeout(timer); return res; }, function (e) { clearTimeout(timer); throw e; });
  }

  var backend = STORES[section.getAttribute('data-store')] || STORES.local;

  // ---- 댓글 목록 ------------------------------------------------------------
  // 응모 한마디 목록이 없는 페이지(츄르를 찾아라)에서는 목록 부분을 건너뜀
  var box = document.querySelector('[data-comments]') || document.createElement('div');
  var hasComments = !!box.parentNode;
  var list = box.querySelector('[data-comments-list]');
  var count = box.querySelector('[data-comments-count]');
  var empty = box.querySelector('[data-comments-empty]');
  var more = box.querySelector('[data-comments-more]');
  var all = [];
  var shown = 0;

  function commentItem(c) {
    var li = document.createElement('li');
    li.className = 'comments__item';
    var head = document.createElement('p');
    head.className = 'comments__meta';
    var who = document.createElement('b');
    who.textContent = maskName(c.name);
    head.appendChild(who);
    if (c.org) {
      var org = document.createElement('span');
      org.textContent = c.org;
      head.appendChild(org);
    }
    var when = document.createElement('time');
    when.dateTime = c.date;
    when.textContent = formatDate(c.date);
    head.appendChild(when);
    var body = document.createElement('p');
    body.className = 'comments__text';
    body.textContent = c.text;
    li.appendChild(head);
    li.appendChild(body);
    return li;
  }

  function renderMore() {
    var next = all.slice(shown, shown + PAGE);
    next.forEach(function (c) { list.appendChild(commentItem(c)); });
    shown += next.length;
    more.hidden = shown >= all.length;
  }

  function refresh() {
    if (!hasComments) return Promise.resolve();
    return backend.list().then(function (items) {
      all = items;
      shown = 0;
      list.innerHTML = '';
      count.textContent = all.length ? all.length + '개' : '';
      empty.hidden = all.length > 0;
      renderMore();
    }, function () {
      empty.hidden = false;
      empty.textContent = '한마디 목록을 불러오지 못했어요.';
    });
  }

  if (more) more.addEventListener('click', function () {
    var first = shown;
    renderMore();
    var target = list.children[first];
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
    }
  });

  // ---- 응모 폼 -------------------------------------------------------------
  var form = section.querySelector('[data-entry-form]');
  var alertBox = form.querySelector('[data-entry-alert]');
  var done = section.querySelector('[data-entry-done]');
  var receipt = section.querySelector('[data-entry-receipt]');
  var submit = form.querySelector('[type="submit"]');
  var textCount = form.querySelector('[data-entry-count]');
  var helperDefault = {};
  // input.name은 폼 자체의 name 속성과 겹치므로 입력 칸을 따로 찾아 둡니다
  var input = {};
  ['name', 'phone', 'org', 'text', 'agree', 'website'].forEach(function (key) {
    input[key] = form.querySelector('[name="' + key + '"]');
  });

  function fieldOf(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function setError(name, message) {
    var field = fieldOf(name);
    var helper = field.querySelector('.field__helper');
    if (!(name in helperDefault)) helperDefault[name] = helper.textContent;
    field.classList.toggle('is-error', !!message);
    helper.textContent = message || helperDefault[name];
    var control = field.querySelector('input, textarea');
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }

  function quizCleared() {
    var items = document.querySelectorAll('[data-quiz-item]');
    if (!items.length) return true;
    return Array.prototype.every.call(items, function (item) {
      return !!item.querySelector('.choice.is-correct[aria-pressed="true"]');
    });
  }

  function validate(data) {
    var errors = {};
    var name = data.name.trim();
    if (!name) errors.name = '이름을 입력해 주세요.';
    else if (Array.from(name).length < 2) errors.name = '이름을 두 글자 이상 입력해 주세요.';
    var phone = digits(data.phone);
    if (!phone) errors.phone = '연락처를 입력해 주세요.';
    else if (!/^01\d{8,9}$/.test(phone)) errors.phone = '휴대전화 번호 형식을 확인해 주세요. 예) 010-1234-5678';
    var text = data.text.trim();
    if (!text) errors.text = '한마디를 남겨 주세요.';
    else if (text.length < 5) errors.text = '다섯 글자 이상 남겨 주세요.';
    if (!data.agree) errors.agree = '개인정보 수집·이용에 동의해야 응모할 수 있어요.';
    return errors;
  }

  function showDone(mine) {
    form.hidden = true;
    done.hidden = false;
    receipt.innerHTML = '';
    [['접수 번호', mine.no], ['이름', mine.name], ['연락처', mine.phone], ['접수일', formatDate(mine.date)]].forEach(function (row) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = row[0];
      dd.textContent = row[1];
      div.appendChild(dt);
      div.appendChild(dd);
      receipt.appendChild(div);
    });
  }

  input.phone.addEventListener('input', function () {
    var formatted = formatPhone(input.phone.value);
    if (formatted !== input.phone.value) input.phone.value = formatted;
  });

  input.text.addEventListener('input', function () {
    textCount.textContent = input.text.value.length + ' / 200';
  });

  ['name', 'phone', 'text'].forEach(function (name) {
    form[name].addEventListener('blur', function () {
      if (!fieldOf(name).classList.contains('is-error')) return;
      var errors = validate(readForm());
      setError(name, errors[name]);
    });
  });

  input.agree.addEventListener('change', function () {
    if (input.agree.checked) setError('agree', '');
  });

  function readForm() {
    return {
      name: input.name.value,
      phone: input.phone.value,
      org: input.org.value,
      text: input.text.value,
      agree: input.agree.checked,
    };
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    alertBox.hidden = true;

    if (input.website.value) return; // 자동 입력 방지 칸이 채워짐 → 조용히 무시

    // 츄르를 찾아라: 츄르를 다 찾기 전에는 접수하지 않음 (churu.js가 data-churu-ready를 붙임)
    var churuPage = document.querySelector('[data-churu-page]');
    if (churuPage && !churuPage.hasAttribute('data-churu-ready')) {
      alertBox.textContent = '츄르를 모두 찾아야 응모할 수 있어요.';
      alertBox.hidden = false;
      return;
    }

    if (!quizCleared()) {
      alertBox.textContent = '퀴즈 세 문제를 모두 맞혀야 응모할 수 있어요. 위의 퀴즈를 먼저 풀어 주세요.';
      alertBox.hidden = false;
      return;
    }

    var data = readForm();
    var errors = validate(data);
    var order = ['name', 'phone', 'text', 'agree'];
    order.forEach(function (name) { setError(name, errors[name]); });
    var firstError = order.filter(function (name) { return errors[name]; })[0];
    if (firstError) {
      fieldOf(firstError).querySelector('input, textarea').focus();
      return;
    }

    var entry = {
      name: data.name.trim(),
      phone: formatPhone(data.phone),
      org: data.org.trim(),
      text: data.text.trim(),
      agree: true,
      date: new Date().toISOString(),
    };
    // 츄르를 찾아라: 찾은 기록 증빙(브라우저 임의값 · 찾은 기사 · 확인값)을 함께 남김 — 추첨 때 대조용
    if (churuPage) entry.churu = churuPage.getAttribute('data-churu-proof') || '';

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');

    backend.submit(entry).then(function (res) {
      var mine = { no: res.no, name: entry.name, phone: maskPhone(entry.phone), date: entry.date };
      store(MINE, mine);   // 연락처는 가린 값만 접수증에 남김
      showDone(mine);
      done.focus();
      window.dispatchEvent(new CustomEvent('webzine:entry'));
      refresh();
    }, function (error) {
      if (error.code === 'duplicate') setError('phone', error.message);
      alertBox.textContent = error.message;
      alertBox.hidden = false;
      if (error.code === 'duplicate') input.phone.focus();
    }).then(function () {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    });
  });

  var mine = load(MINE);
  if (mine) showDone(mine);
  refresh();
})();
