/**
 * 페이지 내 앵커 링크 부드러운 스크롤
 * - 헤더 높이만큼 위치 보정 (CSS scroll-padding-top과 함께 동작)
 * - 이동 후 대상 섹션으로 포커스를 옮겨 스크린리더/키보드 사용자도 위치를 알 수 있게 함
 * - 동작 줄이기 설정 시 즉시 이동
 */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute('href').slice(1);
    if (!id) return; // href="#" 은 무시

    var target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });

    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });

    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  });
})();
