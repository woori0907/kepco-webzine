/**
 * 짧은 등장 효과 (0.32초)
 * - 내용을 투명하게 숨긴 채 시작하지 않습니다. 항상 보이는 상태입니다.
 * - 처음 화면 아래에 있던 [data-rise] 요소만 12px 아래에 두었다가,
 *   화면에 들어오면 제자리로 올라옵니다.
 * - 처음 화면 안에 있는 요소는 아무 효과 없이 그대로 보입니다.
 * - 움직임 줄이기 설정이거나 IntersectionObserver가 없으면 아무것도 하지 않습니다.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var items = document.querySelectorAll('[data-rise]');
  if (!items.length) return;

  var viewportBottom = window.innerHeight;
  var pending = Array.prototype.filter.call(items, function (el) {
    return el.getBoundingClientRect().top > viewportBottom;
  });

  pending.forEach(function (el) {
    el.classList.add('rise-pending');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('rise-in');
      el.classList.remove('rise-pending');
      observer.unobserve(el);
    });
  }, { rootMargin: '0px 0px -5% 0px' });

  pending.forEach(function (el) {
    observer.observe(el);
  });
})();
