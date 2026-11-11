/**
 * KEPCO NOW 캐러셀 — 큰 기사 1개 + 아래 썸네일
 * - 큰 기사 전환은 slick(fade)이 맡습니다. (assets/vendor: jQuery 3.7.1 · slick 1.8.1, 둘 다 MIT)
 * - 자동 넘김: 타이머가 시간을 세고, 지금 썸네일 위 진행 막대(CSS 애니메이션)가 같은 시간 동안 차오릅니다.
 *   둘은 같은 멈춤 조건을 쓰므로 함께 멈추고 함께 이어집니다. 시간은 home.css의 --now-delay.
 * - 멈춤: 큰 기사에 마우스를 올렸을 때, 키보드 포커스가 안에 있을 때, 화면 밖에 있을 때, 멈춤 버튼을 눌렀을 때.
 * - 동작 줄이기 설정이면 자동 넘김 없이 시작합니다(재생 버튼으로 켤 수 있음).
 * - 썸네일을 누르면 그 기사로 바뀌고, 이미 크게 보이는 기사의 썸네일을 누르면 기사로 이동합니다.
 * - 스크립트·라이브러리가 없으면 첫 기사만 크게 보이고, 썸네일은 그냥 기사 링크입니다.
 */
(function () {
  'use strict';

  var $ = window.jQuery;
  if (!$ || !$.fn.slick) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('[data-now]').each(function () {
    var root = this;
    var $stage = $(root).find('[data-now-stage]');
    var thumbs = root.querySelectorAll('[data-now-go]');
    var strip = root.querySelector('[data-now-thumbs]');
    var current = root.querySelector('[data-now-current]');
    var controls = root.querySelector('[data-now-controls]');
    var toggle = root.querySelector('[data-now-toggle]');
    var userPaused = reducedMotion;
    if (reducedMotion) toggle.hidden = true; // 동작 줄이기: 자동 넘김 없음, 버튼으로 넘김
    var active = 0;

    $stage.slick({
      fade: true,
      speed: reducedMotion ? 0 : 600,
      cssEase: 'ease',
      arrows: false,
      dots: false,
      autoplay: false,      // 자동 넘김은 진행 막대가 맡음
      infinite: true,
      swipe: true,
      accessibility: false, // 키보드는 아래 버튼·썸네일 링크로
      adaptiveHeight: false,
    });
    root.classList.add('is-ready');
    controls.hidden = false;

    function setActive(index) {
      active = index;
      current.textContent = index + 1;
      Array.prototype.forEach.call(thumbs, function (link, i) {
        var on = i === index;
        link.parentNode.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      // 좁은 화면: 썸네일 줄을 가로로 밀어 지금 기사를 보이게 (페이지는 세로로 움직이지 않음)
      var item = thumbs[index].parentNode;
      if (strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: item.offsetLeft - strip.offsetLeft - 16, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }

    // ---- 자동 넘김 타이머 ----
    // 진행 막대(CSS)와 같은 멈춤 조건을 쓰고, 멈춘 동안 남은 시간을 기억했다가 이어서 셉니다.
    var delay = (parseFloat(getComputedStyle(root).getPropertyValue('--now-delay')) || 6) * 1000;
    var remaining = delay;
    var startedAt = 0;
    var timer = 0;
    var flags = { stopped: userPaused, hold: false, focus: false, away: false };

    function paused() {
      return flags.stopped || flags.hold || flags.focus || flags.away || animating;
    }

    function schedule() {
      clearTimeout(timer);
      timer = 0;
      if (paused()) return;
      startedAt = Date.now();
      timer = setTimeout(function () {
        timer = 0;
        $stage.slick('slickNext');
      }, remaining);
    }

    function setFlag(name, on) {
      if (flags[name] === on) return;
      if (timer) remaining = Math.max(0, remaining - (Date.now() - startedAt)); // 지금까지 흐른 시간 빼기
      flags[name] = on;
      root.classList.toggle('is-' + name, on); // CSS: 진행 막대도 함께 멈춤
      schedule();
    }

    // 전환 중에는 세지 않고, 전환이 끝나면 막대와 시간을 처음부터
    var animating = false;
    $stage.on('beforeChange', function (event, slick, from, to) {
      if (from === to) return;
      animating = true;
      clearTimeout(timer);
      timer = 0;
      root.classList.add('is-changing'); // 전환 중에는 막대를 비워 둠
      setActive(to);
    });
    $stage.on('afterChange', function () {
      animating = false;
      remaining = delay;
      root.classList.remove('is-changing'); // 막대 애니메이션이 처음부터 다시 시작
      schedule();
    });

    Array.prototype.forEach.call(thumbs, function (link, i) {
      link.addEventListener('click', function (event) {
        if (i === active) return; // 이미 크게 보이는 기사 → 기사로 이동
        event.preventDefault();
        $stage.slick('slickGoTo', i);
      });
    });

    root.querySelector('[data-now-prev]').addEventListener('click', function () { $stage.slick('slickPrev'); });
    root.querySelector('[data-now-next]').addEventListener('click', function () { $stage.slick('slickNext'); });

    function syncToggle() {
      toggle.setAttribute('aria-label', flags.stopped ? '자동 넘김 시작' : '자동 넘김 멈춤');
      toggle.querySelector('[data-icon-pause]').hidden = flags.stopped;
      toggle.querySelector('[data-icon-play]').hidden = !flags.stopped;
    }

    toggle.addEventListener('click', function () {
      setFlag('stopped', !flags.stopped);
      syncToggle();
    });

    // 큰 기사 위에 마우스가 있거나, 키보드 포커스가 안에 있으면 잠시 멈춤
    // (마우스 클릭으로 생긴 포커스는 제외 — 재생 버튼을 눌렀는데 멈춰 있지 않도록)
    var stage = $stage[0];
    stage.addEventListener('mouseenter', function () { setFlag('hold', true); });
    stage.addEventListener('mouseleave', function () { setFlag('hold', false); });
    root.addEventListener('focusin', function (event) {
      var keyboard = true;
      try { keyboard = event.target.matches(':focus-visible'); } catch (e) { /* 구형 브라우저 */ }
      setFlag('focus', keyboard);
    });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) setFlag('focus', false);
    });

    // 화면 밖에 있으면 멈춤 (보지 않는 동안 넘어가 버리지 않게)
    if ('IntersectionObserver' in window) {
      setFlag('away', true);
      new IntersectionObserver(function (entries) {
        setFlag('away', !entries[0].isIntersecting);
      }, { threshold: 0.35 }).observe(root);
    }

    root.classList.toggle('is-stopped', flags.stopped);
    syncToggle();
    schedule();
    syncToggle();
  });
})();
