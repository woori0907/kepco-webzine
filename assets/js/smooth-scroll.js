/**
 * 페이지 내 앵커 링크 부드러운 스크롤
 * - 헤더 높이만큼 위치 보정 (CSS scroll-padding-top과 함께 동작)
 * - 이동 후 대상 섹션으로 포커스를 옮겨 스크린리더/키보드 사용자도 위치를 알 수 있게 함
 * - 동작 줄이기 설정 시 즉시 이동
 * - 링크에 data-scroll-duration="1100"(밀리초)을 붙이면 브라우저 기본보다
 *   천천히, 그 시간 동안 가속·감속하며 이동합니다 (기사 히어로의 본문 버튼).
 *   이동 중 휠·터치·키를 쓰면 바로 멈추고 사용자 조작을 따릅니다.
 */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cancelAnimation = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function targetTop(target) {
    var padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var top = target.getBoundingClientRect().top + window.pageYOffset - padding;
    return Math.max(0, Math.min(top, max));
  }

  function animateTo(target, duration) {
    if (cancelAnimation) cancelAnimation();

    var start = window.pageYOffset;
    var end = targetTop(target);
    var startTime = null;
    var frame = 0;
    var stopEvents = ['wheel', 'touchstart', 'keydown'];

    function stop() {
      cancelAnimationFrame(frame);
      stopEvents.forEach(function (name) { window.removeEventListener(name, stop); });
      cancelAnimation = null;
    }

    function step(now) {
      if (startTime === null) startTime = now;
      var t = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start + (end - start) * easeInOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
      else stop();
    }

    stopEvents.forEach(function (name) { window.addEventListener(name, stop, { passive: true }); });
    cancelAnimation = stop;
    frame = requestAnimationFrame(step);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute('href').slice(1);
    if (!id) return; // href="#" 은 무시

    var target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();

    var duration = parseInt(link.getAttribute('data-scroll-duration'), 10);
    if (reducedMotion.matches) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else if (duration > 0) {
      animateTo(target, duration);
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });

    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  });
})();
