/**
 * 스크롤 등장 애니메이션
 * - [data-reveal] 요소가 화면에 들어오면 .is-visible 추가
 * - 같은 그리드 안의 카드는 순서대로 조금씩 늦게 등장
 * - IntersectionObserver를 지원하지 않거나 동작 줄이기 설정이면 바로 표시
 */
(function () {
  'use strict';

  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  var STAGGER = 80; // ms

  // 같은 부모 안에서의 순서로 지연 시간 지정
  Array.prototype.forEach.call(items, function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
      return child.hasAttribute('data-reveal');
    });
    var index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty('--reveal-delay', index * STAGGER + 'ms');

    // 등장 후에는 지연을 없애 hover 반응이 늦지 않게
    el.addEventListener('transitionend', function handler(event) {
      if (event.propertyName !== 'opacity') return;
      el.style.removeProperty('--reveal-delay');
      el.removeEventListener('transitionend', handler);
    });
  });

  function showAll() {
    Array.prototype.forEach.call(items, function (el) {
      el.classList.add('is-visible');
    });
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  });

  Array.prototype.forEach.call(items, function (el) {
    observer.observe(el);
  });
})();
