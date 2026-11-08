/**
 * 메인 썸네일 방향 감지 호버
 * - 마우스가 썸네일의 어느 변(위·아래·왼쪽·오른쪽)으로 들어왔는지 계산해
 *   그 변에서부터 원래 색 사진이 펼쳐집니다.
 * - 마우스가 나갈 때는 나간 변 쪽으로 원래 색이 접히며 다시 모노톤이 됩니다.
 * - 키보드로 카드에 포커스하면 방향 없이 바로 원래 색, 포커스가 빠지면 바로 모노톤.
 * - 마우스가 있는 기기에서만 동작합니다. 스크립트가 없으면 CSS의 흐려지는 효과로 대신합니다.
 * - 모양은 home.css의 .card__reveal 규칙에 있습니다.
 */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover)').matches) return;

  var medias = document.querySelectorAll('.home-section .card__media');
  if (!medias.length) return;

  document.documentElement.classList.add('has-dirhover');

  var SIDES = ['top', 'right', 'bottom', 'left'];

  /**
   * 마우스 위치가 썸네일 가운데에서 어느 변 쪽인지
   * 가로세로 비율을 맞춘 뒤 각도로 4등분합니다.
   */
  function sideOf(el, event) {
    var rect = el.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    var x = (event.clientX - rect.left - w / 2) * (w > h ? h / w : 1);
    var y = (event.clientY - rect.top - h / 2) * (h > w ? w / h : 1);
    var index = Math.round(Math.atan2(y, x) / (Math.PI / 2) + 5) % 4; // 0 위 · 1 오른쪽 · 2 아래 · 3 왼쪽
    return SIDES[index];
  }

  /** 원래 색 사진 레이어: 썸네일 사진을 복제해 위에 겹칩니다 (처음 필요할 때 한 번만) */
  function revealOf(media) {
    var layer = media.querySelector('.card__reveal');
    if (layer) return layer;
    var img = media.querySelector('img');
    if (!img) return null; // 사진이 없는 회색 박스는 건너뜀
    layer = document.createElement('div');
    layer.className = 'card__reveal';
    layer.setAttribute('aria-hidden', 'true');
    var copy = img.cloneNode(false);
    copy.alt = '';
    copy.removeAttribute('loading');
    layer.appendChild(copy);
    media.appendChild(layer);
    return layer;
  }

  /** 접힌 상태에서 시작하도록, 전환 없이 위치만 옮긴 뒤 다음 프레임에 펼침 */
  function show(layer, side) {
    layer.classList.add('no-transition');
    layer.classList.remove('is-shown');
    layer.setAttribute('data-from', side);
    void layer.offsetWidth; // 접힌 위치를 먼저 그리게 함
    layer.classList.remove('no-transition');
    layer.classList.add('is-shown');
  }

  /** 나간 변 쪽으로 접힘 */
  function hide(layer, side) {
    layer.classList.remove('no-transition');
    layer.setAttribute('data-from', side);
    layer.classList.remove('is-shown');
  }

  Array.prototype.forEach.call(medias, function (media) {
    media.addEventListener('mouseenter', function (event) {
      var layer = revealOf(media);
      if (layer) show(layer, sideOf(media, event));
    });

    media.addEventListener('mouseleave', function (event) {
      var layer = media.querySelector('.card__reveal');
      if (layer) hide(layer, sideOf(media, event));
    });

    // 키보드 포커스: 방향 없이 바로
    var link = media.closest('.card__link');
    if (!link) return;
    link.addEventListener('focus', function () {
      if (!link.matches(':focus-visible')) return;
      var layer = revealOf(media);
      if (!layer) return;
      layer.classList.add('no-transition', 'is-shown');
    });
    link.addEventListener('blur', function () {
      var layer = media.querySelector('.card__reveal');
      if (!layer) return;
      layer.classList.add('no-transition');
      layer.classList.remove('is-shown');
    });
  });
})();
