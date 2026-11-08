/**
 * 메인 섹션 배경 장면 전환
 * - 화면 위에서 45% 지점의 선을 기준으로, 그 선을 지난 마지막 [data-scene] 섹션의 색으로
 *   body[data-scene-bg]를 바꿉니다. 페이지 배경색이 0.4초 동안 바뀝니다(CSS: home.css).
 * - 앵커로 한 번에 이동하거나 푸터 근처에 있어도 가장 가까운 위쪽 섹션 색을 유지합니다.
 * - 내용은 항상 보이는 상태이고 색만 바뀝니다. 움직임 줄이기 설정이면 즉시 바뀝니다.
 * - 스크립트가 없으면 각 섹션이 자기 배경색을 그대로 씁니다.
 */
(function () {
  'use strict';

  var scenes = Array.prototype.slice.call(document.querySelectorAll('main [data-scene]'));
  if (!scenes.length) return;

  document.documentElement.classList.add('has-scene');

  var LINE = 0.45; // 화면 높이 대비 기준선 위치

  // 섹션 몇 개의 위치만 읽으므로 스크롤마다 바로 계산해도 가볍습니다.
  // (브라우저가 scroll 이벤트를 이미 화면 갱신 주기에 맞춰 보냅니다)
  function update() {
    var line = window.innerHeight * LINE;
    var current = scenes[0];
    for (var i = 0; i < scenes.length; i += 1) {
      if (scenes[i].getBoundingClientRect().top <= line) current = scenes[i];
      else break;
    }
    var name = current.getAttribute('data-scene');
    if (document.body.getAttribute('data-scene-bg') !== name) {
      document.body.setAttribute('data-scene-bg', name);
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
