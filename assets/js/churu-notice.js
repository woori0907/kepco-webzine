/**
 * 츄르를 찾아라 안내 팝업 (메인)
 * - 페이지를 열고 잠시 뒤에 나타남 (PC: 왼쪽 아래 카드 · 모바일: 가운데 레이어 + 어두운 배경)
 * - 닫기: 이번 방문(탭) 동안 다시 띄우지 않음 — sessionStorage
 * - 오늘 하루 보지 않기: 오늘 날짜를 기억해 내일 다시 띄움 — localStorage
 * - Esc로 닫기, 모바일에서 어두운 배경을 눌러도 닫힘
 * 시연 초기화: 주소 끝에 ?notice-reset
 */
(function () {
  'use strict';

  var box = document.querySelector('[data-notice]');
  if (!box) return;
  var dim = document.querySelector('[data-notice-dim]');
  var KEY = 'kepco-webzine:notice:' + box.getAttribute('data-notice');
  var mobile = window.matchMedia('(max-width: 767px)');

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function get(store, key) { try { return window[store].getItem(key); } catch (e) { return null; } }
  function set(store, key, value) { try { window[store].setItem(key, value); } catch (e) { /* 저장 불가 — 이번에만 닫힘 */ } }
  function del(store, key) { try { window[store].removeItem(key); } catch (e) { /* 무시 */ } }

  if (/[?&]notice-reset\b/.test(window.location.search)) {
    del('localStorage', KEY);
    del('sessionStorage', KEY);
  }
  if (get('localStorage', KEY) === today() || get('sessionStorage', KEY)) return;

  var lastFocus = null;

  function open() {
    box.hidden = false;
    dim.hidden = !mobile.matches;
    // 다음 프레임에 클래스를 붙여 등장 효과가 보이게
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { box.classList.add('is-open'); dim.classList.add('is-open'); });
    });
    if (mobile.matches) {
      // 모바일은 화면을 가리는 레이어라 초점을 팝업으로 옮김
      lastFocus = document.activeElement;
      box.setAttribute('aria-modal', 'true');
      box.querySelector('[data-notice-close]').focus({ preventScroll: true });
      document.documentElement.classList.add('notice-lock');
    }
  }

  function close() {
    box.classList.remove('is-open');
    dim.classList.remove('is-open');
    document.documentElement.classList.remove('notice-lock');
    box.removeAttribute('aria-modal');
    setTimeout(function () { box.hidden = true; dim.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  box.querySelector('[data-notice-close]').addEventListener('click', function () {
    set('sessionStorage', KEY, '1');
    close();
  });
  box.querySelector('[data-notice-today]').addEventListener('click', function () {
    set('localStorage', KEY, today());
    close();
  });
  dim.addEventListener('click', function () {
    set('sessionStorage', KEY, '1');
    close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) {
      set('sessionStorage', KEY, '1');
      close();
    }
  });

  setTimeout(open, 1200);
})();
