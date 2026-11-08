/**
 * 고정 헤더
 * - 스크롤하면 그림자 표시 (.is-scrolled)
 * - 아래로 스크롤하면 숨기고, 위로 스크롤하면 다시 표시 (.is-hidden)
 * - 메뉴가 열려 있을 때는 숨기지 않음
 */
(function () {
  'use strict';

  var header = document.querySelector('[data-header]');
  if (!header) return;

  var lastY = window.scrollY;
  var ticking = false;
  var HIDE_AFTER = 160; // 이 위치보다 아래에서만 숨김
  var THRESHOLD = 6;    // 작은 흔들림은 무시

  function update() {
    var y = window.scrollY;
    var delta = y - lastY;
    var menuOpen = document.body.classList.contains('is-locked');

    header.classList.toggle('is-scrolled', y > 0);

    if (!menuOpen && Math.abs(delta) > THRESHOLD) {
      header.classList.toggle('is-hidden', delta > 0 && y > HIDE_AFTER);
      lastY = y;
    }

    // 키보드로 헤더 안에 포커스가 오면 항상 보이게
    if (header.contains(document.activeElement)) {
      header.classList.remove('is-hidden');
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  header.addEventListener('focusin', function () {
    header.classList.remove('is-hidden');
  });

  update();
})();
