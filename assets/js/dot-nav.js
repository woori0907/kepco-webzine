/**
 * 메인 사이드 닷 내비게이션 — 지금 보는 섹션의 점을 표시
 * 화면 위에서 45% 지점의 선을 지난 마지막 섹션이 ‘지금 섹션’ (scene-bg.js와 같은 기준)
 * 맨 위(표지)에서는 첫 섹션(SPOTLIGHT), 맨 아래에 닿으면 마지막 섹션(참여)
 * 점을 누르면 smooth-scroll.js가 그 섹션으로 부드럽게 이동합니다.
 */
(function () {
  'use strict';

  var links = Array.prototype.slice.call(document.querySelectorAll('[data-dot]'));
  if (!links.length) return;
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('data-dot')); });
  var LINE = 0.45;
  var queued = false;

  function update() {
    queued = false;
    var line = window.innerHeight * LINE;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= line) current = i;
    });
    var doc = document.documentElement;
    if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 2) current = sections.length - 1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function request() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();
})();
