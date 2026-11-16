/**
 * 글로우 커서 — 마우스가 지나간 길에 또렷하게 빛나는 원이 일정 간격으로 찍히고 곧 사라짐 (사이트 전체)
 * - 원 사이 간격은 마우스 속도에 비례: 천천히 움직이면 촘촘하게, 빠르게 움직이면 성글게
 * - 원 하나 = 보케처럼 속이 고르게 찬 흰 원 + 가장자리만 살짝 흐림 + 바깥에 옅은 보라 빛
 * - 화면 전체에 투명한 캔버스 한 장(클릭·글자 선택은 그대로 통과)
 * - 색: tokens.css의 --glow-core(원 몸통) / --glow-color(바깥 빛 — 밝은 바탕에서 원을 보이게 함)
 * - 마우스가 있는 기기에서만, 움직임 줄이기 설정이면 켜지 않음
 * - 원이 다 사라지면 그리기를 멈춰 가만히 있을 때는 부담이 없음
 */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches || !window.requestAnimationFrame) return;

  // ---- 설정 -------------------------------------------------------------
  var SIZE = 7;          // 원 반지름(px)
  var HALO = 2.2;        // 빛 번짐 — 반지름의 몇 배까지
  var LIFE = 520;        // 원이 남는 시간(ms)
  var GAP_MIN = 16;      // 가장 촘촘할 때 간격(px) — 천천히 움직일 때
  var GAP_MAX = 64;      // 가장 성글 때 간격(px) — 빠르게 움직일 때
  var GAP_PER_SPEED = 26; // 속도(px/ms) 1당 늘어나는 간격(px)
  var MAX = 60;          // 한 번에 그리는 원 최대 개수

  var css = getComputedStyle(document.documentElement);
  var color = css.getPropertyValue('--glow-color').trim() || '#b98cff';
  var core = css.getPropertyValue('--glow-core').trim() || '#ffffff';

  var canvas = document.createElement('canvas');
  canvas.className = 'glow-cursor';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // 원 하나의 모양을 미리 한 번 그려 두고 찍어 씀 (2배 해상도)
  var R = SIZE * HALO;
  var sprite = document.createElement('canvas');
  sprite.width = sprite.height = Math.ceil(R * 4);
  // 보케(bokeh) 모양: 속이 고르게 찬 원 + 가장자리만 살짝 흐림 + 바깥에 옅은 빛
  (function () {
    var s = sprite.getContext('2d');
    s.scale(2, 2);
    // 바깥 빛 (밝은 바탕에서도 원이 보이게 하는 테두리 역할)
    var halo = s.createRadialGradient(R, R, SIZE * 0.9, R, R, R);
    halo.addColorStop(0, color);
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    s.globalAlpha = 0.45;
    s.fillStyle = halo;
    s.fillRect(0, 0, R * 2, R * 2);
    // 원 몸통 — 안쪽은 고르게, 가장자리 25%만 부드럽게 흐려짐
    s.globalAlpha = 1;
    var body = s.createRadialGradient(R, R, 0, R, R, SIZE * 1.15);
    body.addColorStop(0, core);
    body.addColorStop(0.72, core);
    body.addColorStop(1, 'rgba(255, 255, 255, 0)');
    s.fillStyle = body;
    s.beginPath();
    s.arc(R, R, SIZE * 1.15, 0, Math.PI * 2);
    s.fill();
  })();

  var dots = [];
  var last = null;   // 마지막 마우스 위치·시각
  var carry = 0;     // 마지막 원을 찍은 뒤 이동한 거리
  var speed = 0;     // 부드럽게 다듬은 속도(px/ms)
  var running = false;

  window.addEventListener('pointermove', function (e) {
    if (reduce.matches || (e.pointerType && e.pointerType !== 'mouse')) return;
    var now = performance.now();
    var x = e.clientX;
    var y = e.clientY;
    if (!last) {
      dots.push({ x: x, y: y, born: now });
      last = { x: x, y: y, t: now };
      carry = 0;
    } else {
      var dx = x - last.x;
      var dy = y - last.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var dt = Math.max(1, now - last.t);
      speed = speed * 0.7 + (dist / dt) * 0.3;
      var gap = Math.max(GAP_MIN, Math.min(GAP_MAX, GAP_MIN + speed * GAP_PER_SPEED));
      // 지나온 선분 위에 간격마다 원을 찍음
      var walked = gap - carry;
      while (walked <= dist) {
        var k = walked / dist;
        dots.push({ x: last.x + dx * k, y: last.y + dy * k, born: now });
        walked += gap;
      }
      carry = dist - (walked - gap);
      last = { x: x, y: y, t: now };
    }
    if (dots.length > MAX) dots.splice(0, dots.length - MAX);
    if (!running) {
      running = true;
      window.requestAnimationFrame(frame);
    }
  }, { passive: true });

  // 창 밖으로 나가면 이어 찍지 않음
  document.documentElement.addEventListener('mouseleave', function () { last = null; });
  window.addEventListener('blur', function () { last = null; });

  function frame(now) {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    var alive = [];
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var t = (now - d.born) / LIFE;
      if (t >= 1) continue;
      alive.push(d);
      var k = 1 - t;
      var size = R * 2 * (0.75 + 0.25 * k); // 사라지며 조금 작아짐
      ctx.globalAlpha = Math.min(1, k * 1.4); // 처음엔 또렷하게, 끝에서 빠르게 사라짐
      ctx.drawImage(sprite, d.x - size / 2, d.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    dots = alive;
    if (dots.length) window.requestAnimationFrame(frame);
    else running = false;
  }

  // 도중에 움직임 줄이기를 켜면 남은 원을 지우고 더 찍지 않음 (pointermove에서 막힘)
  if (reduce.addEventListener) {
    reduce.addEventListener('change', function () {
      if (reduce.matches) dots = [];
    });
  }
})();
