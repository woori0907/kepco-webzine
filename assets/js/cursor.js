/**
 * 동그라미 커서 (사이트 전체) — 작은 점은 마우스를 바로 따라가고, 바깥 원은 살짝 늦게 부드럽게 따라옴
 * - 링크·버튼 위: 원이 커지며 옅게 채워짐 / 누르는 동안: 원이 작아짐
 * - 글자 입력 칸 위: 원래 글자 커서(I자)를 보여 주고 동그라미는 숨김
 * - 창 밖으로 나가면 숨김
 * - 마우스가 있는 기기에서만, 움직임 줄이기 설정이면 원래 커서 그대로
 * 모양은 layout.css의 .cursor
 */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches || !window.requestAnimationFrame) return;

  var EASE = 0.18; // 바깥 원이 따라오는 빠르기 (0~1, 클수록 빠름)
  var LINKS = 'a[href], button, label, summary, select, [role="button"], [data-now-go], .choice';
  var TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

  var ring = document.createElement('div');
  var dot = document.createElement('div');
  ring.className = 'cursor cursor--ring';
  dot.className = 'cursor cursor--dot';
  ring.setAttribute('aria-hidden', 'true');
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-cursor');

  var x = -100, y = -100;   // 마우스 위치
  var rx = -100, ry = -100; // 바깥 원 위치
  var shown = false;
  var raf = 0;

  function place(el, px, py) {
    el.style.transform = 'translate3d(' + px + 'px, ' + py + 'px, 0)';
  }

  function loop() {
    rx += (x - rx) * EASE;
    ry += (y - ry) * EASE;
    place(ring, rx, ry);
    // 거의 따라잡으면 멈춤 (가만히 있을 때는 그리지 않음)
    if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) raf = window.requestAnimationFrame(loop);
    else raf = 0;
  }

  function show(on) {
    if (shown === on) return;
    shown = on;
    document.documentElement.classList.toggle('cursor-on', on);
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    if (!shown) { rx = x; ry = y; place(ring, rx, ry); }
    place(dot, x, y);
    show(true);
    var target = e.target instanceof Element ? e.target : null;
    var onText = !!(target && target.closest(TEXT));
    document.documentElement.classList.toggle('cursor-text', onText);
    ring.classList.toggle('is-link', !onText && !!(target && target.closest(LINKS)));
    if (!raf) raf = window.requestAnimationFrame(loop);
  }, { passive: true });

  window.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
  window.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
  document.documentElement.addEventListener('mouseleave', function () { show(false); });
  window.addEventListener('blur', function () { show(false); });

  // 도중에 움직임 줄이기를 켜면 원래 커서로
  if (reduce.addEventListener) {
    reduce.addEventListener('change', function () {
      if (!reduce.matches) return;
      document.documentElement.classList.remove('has-cursor', 'cursor-on', 'cursor-text');
      ring.remove();
      dot.remove();
    });
  }
})();
