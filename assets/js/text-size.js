/**
 * 기사 글자 크기 — 기본 + 2단계까지 크게
 * - html의 data-text-size(없음 · 1 · 2)를 바꾸면 article.css가 본문 글자를 단계마다 2px씩 키웁니다.
 * - 고른 크기는 이 브라우저에 기억해 두고 다른 기사에서도 그대로 씁니다.
 *   (페이지가 그려지기 전에 layout.mjs의 머리말 스크립트가 먼저 적용해 깜빡임이 없음)
 * - 스크립트가 없으면 버튼은 숨겨진 채로 둡니다.
 */
(function () {
  'use strict';

  var box = document.querySelector('[data-text-size-control]');
  if (!box) return;

  var KEY = 'kepco-webzine:text-size';
  var MAX = 2;
  var root = document.documentElement;
  var down = box.querySelector('[data-text-size-step="-1"]');
  var up = box.querySelector('[data-text-size-step="1"]');
  var status = box.querySelector('[data-text-size-status]');
  var LABEL = ['기본', '크게', '아주 크게'];

  var level = Number(root.getAttribute('data-text-size')) || 0;

  function apply(next, announce) {
    level = Math.max(0, Math.min(MAX, next));
    if (level) root.setAttribute('data-text-size', String(level));
    else root.removeAttribute('data-text-size');
    down.disabled = level === 0;
    up.disabled = level === MAX;
    if (announce) status.textContent = '글자 크기: ' + LABEL[level];
    try {
      if (level) window.localStorage.setItem(KEY, String(level));
      else window.localStorage.removeItem(KEY);
    } catch (e) {
      /* 저장 실패는 무시 */
    }
  }

  [down, up].forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(level + Number(btn.getAttribute('data-text-size-step')), true);
      // 끝 단계에서 비활성이 된 버튼에 포커스가 남지 않게 반대쪽으로 옮김
      if (btn.disabled) (btn === up ? down : up).focus();
    });
  });

  box.hidden = false;
  apply(level, false);
})();
