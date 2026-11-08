/**
 * 스크롤에 따라 움직이는 고정 UI
 * - 헤더 · 하단 탭바: 아래로 내리면 숨기고, 위로 올리면 다시 표시 (본문을 가리지 않게)
 * - 목차가 열려 있거나 키보드 포커스가 안에 있으면 숨기지 않음
 * - [data-scroll-top] 버튼: 맨 위로 이동
 */
(function () {
  'use strict';

  var header = document.querySelector('[data-header]');
  var tabbar = document.querySelector('[data-tabbar]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var lastY = window.scrollY;
  var ticking = false;
  var HIDE_AFTER = 160; // 이 위치보다 아래에서만 숨김
  var THRESHOLD = 8;    // 작은 흔들림은 무시

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden && el.contains(document.activeElement)) hidden = false;
    el.classList.toggle('is-hidden', hidden);
  }

  function update() {
    var y = window.scrollY;
    var delta = y - lastY;
    var menuOpen = document.body.classList.contains('is-locked');
    var nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 8;

    if (!menuOpen && Math.abs(delta) > THRESHOLD) {
      var hide = delta > 0 && y > HIDE_AFTER;
      setHidden(header, hide);
      // 페이지 끝에서는 탭바를 다시 보여줌
      setHidden(tabbar, hide && !nearBottom);
      lastY = y;
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  [header, tabbar].forEach(function (el) {
    if (!el) return;
    el.addEventListener('focusin', function () {
      el.classList.remove('is-hidden');
    });
  });

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-scroll-top]');
    if (!btn) return;
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    var main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  });
})();
