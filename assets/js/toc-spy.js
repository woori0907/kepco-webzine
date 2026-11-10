/**
 * 기사 목차 — 지금 읽는 소제목 표시
 * - 화면 위에서 30% 지점을 지난 마지막 소제목을 ‘지금 읽는 곳’으로 보고
 *   목차의 해당 링크에 aria-current="true"를 붙입니다 (모양은 article.css).
 * - 첫 소제목에 닿기 전에는 아무것도 표시하지 않습니다.
 * - 목차 링크를 누르면 smooth-scroll.js가 그 소제목으로 부드럽게 이동합니다.
 */
(function () {
  'use strict';

  var toc = document.querySelector('[data-toc]');
  if (!toc) return;

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (link) {
    return document.getElementById(link.getAttribute('href').slice(1));
  });
  if (!targets.length || targets.indexOf(null) !== -1) return;

  var LINE = 0.3;
  var active = -1;

  function update() {
    var line = window.innerHeight * LINE;
    var index = -1;
    for (var i = 0; i < targets.length; i += 1) {
      if (targets[i].getBoundingClientRect().top <= line) index = i;
      else break;
    }
    if (index === active) return;
    if (active !== -1) links[active].removeAttribute('aria-current');
    if (index !== -1) links[index].setAttribute('aria-current', 'true');
    active = index;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
