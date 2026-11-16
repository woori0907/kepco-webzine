/**
 * 츄르를 찾아라 — 숨은 이벤트
 *
 * 기사 페이지: 원고가 있는 기사 중 3곳을 무작위로 골라(브라우저마다 한 번 정해 기억) 본문 위에 츄르를 숨깁니다.
 *   츄르를 누르면 → 그 페이지의 츄르가 사라지고, 찾은 개수(churu count)가 1 늘고, 팝업이 뜹니다.
 *   팝업: ‘N번째 츄르를 찾았다 냥!’ + 파워캣 스프라이트 N번째 칸. 다 찾으면 응모 페이지로 가는 버튼.
 * 응모 페이지: 다 찾은 브라우저에서만 응모 폼이 보입니다.
 *
 * localStorage (kepco-webzine:churu:<id>:…)
 *   record  { found: 찾은 기사 slug 목록, sig: 확인값 }   ← 찾은 개수는 이 목록으로만 셈
 *   count   찾은 개수(보기용 — 고쳐도 아무 효과 없음)     plan  숨긴 기사와 자리     client  브라우저 임의값
 *
 * 조작 방지(1단계): record의 확인값은 브라우저 임의값 + 찾은 목록 + 비밀 문자열로 만듭니다.
 *   개발자 도구에서 count나 found만 고치면 확인값이 맞지 않아 기록 전체가 무효가 됩니다.
 *   응모 페이지 주소도 HTML에 그대로 쓰지 않고 뒤섞어 둡니다(data-k).
 *   이 스크립트를 읽고 흉내 내는 것까지는 막지 못합니다 — 서버 확인은 2단계(README).
 * 시연 초기화: 주소 끝에 ?churu-reset 을 붙여 열면 이 브라우저의 츄르 기록이 지워집니다.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-churu]');
  if (!root) return;

  var id = root.getAttribute('data-churu');
  var total = parseInt(root.getAttribute('data-total'), 10) || 3;
  var pages = (root.getAttribute('data-pages') || '').split(',').filter(Boolean);
  var PREFIX = 'kepco-webzine:churu:' + id + ':';
  var SALT = 'pwrcat·' + id + '·n4p8';

  function load(key, fallback) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(PREFIX + key);
      else window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) { /* 저장 불가(사생활 보호 모드 등) — 이번 방문 동안만 동작 */ }
  }

  if (/[?&]churu-reset\b/.test(window.location.search)) {
    ['count', 'found', 'plan', 'record', 'client'].forEach(function (k) { save(k, null); });
  }

  // ---- 확인값 ---------------------------------------------------------------
  // cyrb53 — 짧고 빠른 문자열 해시 (암호용은 아니고, 손으로 고친 값을 걸러내는 용도)
  function hash(str) {
    var h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  var client = load('client', '');
  if (!/^[a-z0-9]{12}$/.test(client)) {
    client = '';
    while (client.length < 12) client += Math.random().toString(36).slice(2);
    client = client.slice(0, 12);
    save('client', client);
  }

  function sign(found) {
    return hash(SALT + '|' + client + '|' + found.join(','));
  }

  // 확인값이 맞고, 목록이 이번 호 기사로만 이뤄졌을 때만 인정 — 아니면 빈 기록
  function verified() {
    var r = load('record', null);
    if (!r || !Array.isArray(r.found) || r.found.length > total) return [];
    var unique = r.found.filter(function (s, i) { return r.found.indexOf(s) === i && pages.indexOf(s) !== -1; });
    if (unique.length !== r.found.length || r.sig !== sign(r.found)) return [];
    return r.found;
  }

  function record(found) {
    save('record', { found: found, sig: sign(found) });
    save('count', found.length);
  }

  // 응모 페이지 주소 — 뒤집은 base64로 뒤섞어 둔 값을 풀어 씀
  function eventUrl() {
    try { return window.atob((root.getAttribute('data-k') || '').split('').reverse().join('')); } catch (e) { return '#'; }
  }

  var found = verified();
  var count = found.length;

  // ---- 응모 페이지 -----------------------------------------------------------
  if (root.hasAttribute('data-churu-page')) {
    var ready = count >= total;
    var locked = root.querySelector('[data-churu-locked]');
    var open = root.querySelector('[data-churu-open]');
    var progress = root.querySelector('[data-churu-progress]');
    if (ready) {
      root.setAttribute('data-churu-ready', '');
      // 응모 때 함께 보낼 증빙 (event-entry.js가 읽음) — 2단계 서버 확인·추첨 때 대조용
      root.setAttribute('data-churu-proof', JSON.stringify({ client: client, found: found, sig: sign(found) }));
    }
    if (locked) locked.hidden = ready;
    if (open) open.hidden = !ready;
    if (progress) progress.textContent = '지금까지 찾은 츄르 ' + Math.min(count, total) + ' / ' + total;
    return;
  }

  // ---- 기사 페이지 -----------------------------------------------------------
  var slug = root.getAttribute('data-slug');

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function spot() {
    // p: 본문 단락 중 몇 번째쯤(0~1)  x·y: 단락 안 위치(%)
    return { p: 0.15 + Math.random() * 0.75, x: 12 + Math.random() * 76, y: 10 + Math.random() * 60 };
  }

  // 숨길 기사 정하기 — 한 번 정하면 기억. 목차가 바뀌어 없는 기사가 생기면 그 자리만 다시 뽑음
  // 이미 찾은 기사는 계획에서 빠지지 않게 먼저 넣어 둠
  var plan = load('plan', null);
  if (!plan || !Array.isArray(plan.pages) || !plan.spots || typeof plan.spots !== 'object') plan = { pages: [], spots: {} };
  var kept = found.slice();
  plan.pages.forEach(function (p) { if (pages.indexOf(p) !== -1 && kept.indexOf(p) === -1) kept.push(p); });
  kept = kept.slice(0, total);
  if (kept.length < Math.min(total, pages.length)) {
    var rest = shuffle(pages.filter(function (p) { return kept.indexOf(p) === -1; }));
    while (kept.length < Math.min(total, pages.length) && rest.length) kept.push(rest.shift());
  }
  plan.pages = kept;
  plan.pages.forEach(function (p) { if (!plan.spots[p]) plan.spots[p] = spot(); });
  save('plan', plan);

  if (plan.pages.indexOf(slug) === -1 || found.indexOf(slug) !== -1 || count >= total) return;

  // 츄르 놓기 — 본문 글 하나를 골라 그 위에 겹쳐 둠
  // 일반 단락이 없는 기사(TRAVEL MATE 등)는 장소 소개·단계 설명 같은 다른 본문 글을 씀
  var paras = document.querySelectorAll('.a-body .b-p');
  if (!paras.length) paras = document.querySelectorAll('.a-body :is(.b-spot__body, .b-step__desc, .b-person__say, .b-voice__text, .b-callout__text, .b-lead)');
  if (!paras.length) paras = [document.querySelector('.a-body')];
  if (!paras[0]) return;
  var s = plan.spots[slug];
  var target = paras[Math.min(paras.length - 1, Math.floor(s.p * paras.length))];
  target.classList.add('has-churu');

  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'churu';
  button.setAttribute('aria-label', '숨어 있는 츄르 찾기');
  button.style.left = s.x + '%';
  button.style.top = s.y + '%';
  var picture = document.createElement('img');
  picture.src = root.getAttribute('data-img');
  picture.alt = '';
  picture.width = 79;
  picture.height = 248;
  button.appendChild(picture);
  target.appendChild(button);

  button.addEventListener('click', function () {
    found = verified(); // 다른 탭에서 찾았을 수도 있으니 다시 읽음
    if (found.indexOf(slug) === -1 && found.length < total) found.push(slug);
    record(found);
    count = found.length;
    button.remove();
    target.classList.remove('has-churu');
    popup(count);
  });

  // ---- 팝업 -----------------------------------------------------------------
  function popup(n) {
    var done = n >= total;
    var dialog = document.createElement('dialog');
    dialog.className = 'churu-pop';
    dialog.setAttribute('aria-labelledby', 'churu-pop-title');

    var cat = document.createElement('span');
    cat.className = 'churu-cat churu-cat--' + Math.min(n, 3);
    cat.style.backgroundImage = 'url("' + root.getAttribute('data-sprite') + '")';
    cat.setAttribute('role', 'img');
    cat.setAttribute('aria-label', '파워캣');

    var title = document.createElement('h2');
    title.className = 'churu-pop__title';
    title.id = 'churu-pop-title';
    title.textContent = n + '번째 츄르를 찾았다 냥!';

    var meter = document.createElement('p');
    meter.className = 'churu-pop__meter';
    for (var i = 1; i <= total; i++) {
      var dot = document.createElement('i');
      if (i <= n) dot.className = 'is-on';
      meter.appendChild(dot);
    }
    var meterText = document.createElement('span');
    meterText.className = 'visually-hidden';
    meterText.textContent = '츄르 ' + total + '개 중 ' + n + '개 찾음';
    meter.appendChild(meterText);

    var note = document.createElement('p');
    note.className = 'churu-pop__note';
    note.textContent = done
      ? '츄르를 모두 찾았어요! 비밀 이벤트에 응모해 보세요.'
      : '남은 츄르 ' + (total - n) + '개는 다른 기사에 숨어 있어요.';

    var actions = document.createElement('div');
    actions.className = 'churu-pop__actions';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn ' + (done ? 'btn--outline' : 'btn--primary');
    close.textContent = done ? '닫기' : '계속 읽기';
    close.addEventListener('click', function () { shut(); });
    if (done) {
      var go = document.createElement('a');
      go.className = 'btn btn--primary';
      go.href = eventUrl();
      go.textContent = '이벤트 응모하러 가기';
      actions.appendChild(go);
    }
    actions.appendChild(close);

    dialog.appendChild(cat);
    dialog.appendChild(title);
    dialog.appendChild(meter);
    dialog.appendChild(note);
    dialog.appendChild(actions);
    document.body.appendChild(dialog);

    function shut() {
      if (dialog.open && dialog.close) dialog.close();
      dialog.remove();
    }
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); shut(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) shut(); }); // 바깥(배경) 누르면 닫기

    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    (done ? actions.firstChild : close).focus();
  }
})();
