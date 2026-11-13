/**
 * 기사 반응 버튼 — 좋아요 · 유용해요 · 재밌어요
 * - 기사마다 이 브라우저에서 하나만 고를 수 있고, 고른 뒤에는 바꾸거나 취소할 수 없습니다.
 * - 누르면 숫자를 바로 올려 보여 주고(저장은 뒤에서), 저장에 실패하면 원래대로 되돌립니다.
 * - 숫자가 0인 반응은 숫자를 숨깁니다.
 *
 * 저장 방식 (data-store, src/content/issue.mjs의 reactions.store)
 *   local  : 이 브라우저(localStorage)에만 저장 — 인터넷 없는 시연용
 *   sheets : 구글 스프레드시트 (tools/apps-script/reactions.gs를 웹 앱으로 배포한 주소 = data-endpoint)
 * 다른 서버로 바꿀 때는 STORES에 같은 모양(submit · counts)을 하나 더 만들면 됩니다.
 *
 * 시연 데이터 지우기: 기사 주소 끝에 ?reset 을 붙여 열면 이 브라우저의 반응 기록이 모두 지워집니다.
 */
(function () {
  'use strict';

  var section = document.querySelector('[data-reactions]');
  if (!section) return;

  var PREFIX = 'kepco-webzine:';
  var article = section.getAttribute('data-reactions');
  var MINE = 'reaction:' + article; // 이 기사에 내가 고른 반응 id
  var ALL = 'reactions';            // (local 전용) { 기사: { 반응: 수 } }

  var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-reaction]'));
  var status = section.querySelector('[data-reaction-status]');

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
    try {
      Object.keys(window.localStorage).forEach(function (key) {
        if (key.indexOf(PREFIX + 'reaction') === 0) window.localStorage.removeItem(key);
      });
    } catch (e) { /* 지울 수 없으면 그대로 */ }
  }

  /** 브라우저마다 한 번 만들어 두는 임의 값 — 같은 브라우저의 중복 반응을 시트에서 거르는 데 씀 (개인정보 아님) */
  function clientId() {
    var id = load('client');
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      store('client', id);
    }
    return id;
  }

  function fail(code, message) {
    var error = new Error(message);
    error.code = code;
    return Promise.reject(error);
  }

  // ---- 저장 방식 -----------------------------------------------------------
  // submit(reaction) → Promise · 실패 시 Error(code: 'duplicate' | 'network' | 'storage')
  // counts()         → Promise<{ 반응 id: 수 }>
  var STORES = {
    local: {
      submit: function (reaction) {
        var all = load(ALL) || {};
        var mine = all[article] || (all[article] = {});
        mine[reaction] = (mine[reaction] || 0) + 1;
        if (!store(ALL, all)) return fail('storage', '이 브라우저에 저장할 수 없어요.');
        return Promise.resolve();
      },
      counts: function () {
        return Promise.resolve((load(ALL) || {})[article] || {});
      },
    },

    sheets: {
      submit: function (reaction) {
        return request('POST', { action: 'react', article: article, reaction: reaction, client: clientId() }).then(function (res) {
          if (res.ok) return;
          if (res.code === 'duplicate') return fail('duplicate', '이미 반응을 남기셨어요.');
          return fail('server', '반응을 저장하지 못했어요.');
        });
      },
      counts: function () {
        return request('GET', { action: 'counts', article: article }).then(function (res) {
          return res.ok ? res.counts || {} : {};
        });
      },
    },
  };

  function request(method, payload) {
    var endpoint = section.getAttribute('data-endpoint');
    if (!endpoint) return fail('network', '저장 주소가 설정되지 않았어요.');
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, 10000);
    var url = endpoint;
    // text/plain으로 보내야 브라우저의 사전 요청(CORS preflight) 없이 Apps Script에 닿습니다
    var options = { method: method, signal: controller && controller.signal };
    if (method === 'GET') {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'action=' + payload.action + '&article=' + encodeURIComponent(payload.article);
    } else {
      options.body = JSON.stringify(payload);
    }
    return fetch(url, options)
      .then(function (r) { return r.json(); })
      .catch(function () { return fail('network', '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'); })
      .then(function (res) { clearTimeout(timer); return res; }, function (e) { clearTimeout(timer); throw e; });
  }

  var backend = STORES[section.getAttribute('data-store')] || STORES.local;

  // ---- 화면 ----------------------------------------------------------------
  var counts = {};
  var chosen = load(MINE);

  function render() {
    buttons.forEach(function (btn) {
      var id = btn.getAttribute('data-reaction');
      var n = counts[id] || 0;
      var out = btn.querySelector('[data-reaction-count]');
      out.textContent = n > 0 ? n.toLocaleString('ko-KR') : '';
      out.hidden = n === 0;
      btn.setAttribute('aria-pressed', String(id === chosen));
      // 고른 뒤에는 누를 수 없음 — disabled 대신 aria-disabled로 두어 화면낭독기가 상태를 읽을 수 있게
      if (chosen) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
    });
    section.classList.toggle('is-done', !!chosen);
  }

  function labelOf(id) {
    var btn = buttons.filter(function (b) { return b.getAttribute('data-reaction') === id; })[0];
    return btn ? btn.getAttribute('data-label') : '';
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (chosen) {
        status.textContent = '이미 ‘' + labelOf(chosen) + '’ 반응을 남기셨어요.';
        return;
      }
      var id = btn.getAttribute('data-reaction');
      // 먼저 화면에 반영
      chosen = id;
      counts[id] = (counts[id] || 0) + 1;
      store(MINE, id);
      render();
      status.textContent = '‘' + labelOf(id) + '’ 반응을 남겼어요. 고마워요!';

      backend.submit(id).catch(function (error) {
        if (error.code === 'duplicate') {
          // 다른 탭 등에서 이미 남긴 경우 — 고른 상태는 그대로, 숫자만 되돌림
          counts[id] -= 1;
          render();
          status.textContent = error.message;
          return;
        }
        chosen = null;
        counts[id] -= 1;
        store(MINE, null);
        render();
        status.textContent = error.message + ' 잠시 뒤 다시 눌러 주세요.';
      });
    });
  });

  section.hidden = false;
  render();
  backend.counts().then(function (result) {
    counts = result || {};
    render();
  }, function () { /* 숫자를 못 받아와도 버튼은 그대로 씀 */ });
})();
