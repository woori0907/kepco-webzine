/**
 * 기사 공유하기 — 리모컨의 공유 버튼([data-share])
 * - 휴대폰처럼 기기 공유 창이 있으면 그 창을 띄움 (카카오톡 · 메시지 · 메일 등)
 * - 없으면(대부분의 PC) 기사 주소를 복사하고 ‘링크를 복사했어요’ 안내를 잠깐 보여 줌
 * - 공유 주소: 페이지의 og:url(정식 주소)이 있으면 그것, 없으면 지금 주소
 */
(function () {
  'use strict';

  var buttons = document.querySelectorAll('[data-share]');
  if (!buttons.length) return;

  var og = document.querySelector('meta[property="og:url"]');
  var ogTitle = document.querySelector('meta[property="og:title"]');
  var url = (og && og.content) || window.location.href.split('#')[0];
  var title = (ogTitle && ogTitle.content) || document.title;

  var toast = document.createElement('p');
  toast.className = 'share-toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var timer = 0;

  function say(text) {
    toast.textContent = text;
    toast.classList.add('is-shown');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('is-shown'); }, 2400);
  }

  // 클립보드 API가 막힌 환경(로컬 파일 등)을 위한 예전 방식
  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  function copy() {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(url).then(function () { return true; }, function () { return legacyCopy(url); });
    }
    return Promise.resolve(legacyCopy(url));
  }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function (e) {
          if (e && e.name === 'AbortError') return; // 사용자가 닫음
          copy().then(function (ok) { say(ok ? '링크를 복사했어요' : '링크를 복사하지 못했어요'); });
        });
        return;
      }
      copy().then(function (ok) { say(ok ? '링크를 복사했어요' : '링크를 복사하지 못했어요'); });
    });
  });
})();
