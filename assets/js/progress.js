/**
 * 읽기 진행 표시 — 기사 본문을 얼마나 읽었는지 화면 맨 위 막대로 보여줍니다.
 * 기사 시작~본문 끝 구간을 0~100%로 계산합니다.
 */
(function () {
  'use strict';

  var bar = document.querySelector('[data-progress]');
  var article = document.querySelector('[data-article]');
  if (!bar || !article) return;

  var ticking = false;

  function update() {
    var rect = article.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var read = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
    bar.style.setProperty('--progress', read.toFixed(4));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
