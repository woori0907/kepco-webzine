/**
 * 형광펜 하이라이트 — 원고에서 ==이렇게== 감싼 중요한 문장 (<mark class="hl">)
 * 문장이 화면 가운데 띠에 들어오면 왼쪽부터 형광펜이 칠해지고,
 * 화면 밖으로 완전히 빠져나간 뒤에 지워집니다 (다시 가운데로 오면 또 칠해짐).
 * 기사마다 1~2개뿐이라 스크롤 때 위치를 직접 읽어 판단합니다(화면 갱신 주기에 한 번).
 * 스크립트가 없으면 처음부터 칠해진 채로 보입니다 (article.css).
 */
(function () {
  'use strict';

  var marks = Array.prototype.slice.call(document.querySelectorAll('mark.hl'));
  if (!marks.length) return;

  document.documentElement.classList.add('has-hl');

  var BAND = 0.1; // 화면 가운데 띠 높이 (화면의 10%)
  var queued = false;

  function update() {
    queued = false;
    var h = window.innerHeight;
    var top = h * (0.5 - BAND / 2);
    var bottom = h * (0.5 + BAND / 2);
    marks.forEach(function (mark) {
      var r = mark.getBoundingClientRect();
      if (r.bottom > top && r.top < bottom) mark.classList.add('is-on');       // 가운데 띠에 걸침 → 칠함
      else if (r.bottom <= 0 || r.top >= h) mark.classList.remove('is-on');    // 화면 밖 → 지움
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
