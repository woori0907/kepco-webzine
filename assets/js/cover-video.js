/**
 * 메인 표지 배경 영상 (데스크톱 · 모바일 두 가지)
 * - data-src(데스크톱) / data-src-mobile(767px 이하) 중 하나를 표지 배경에서 소리 없이 반복 재생합니다.
 * - 파일이 없거나 재생할 수 없으면 아무 일도 하지 않고 표지 아트가 그대로 보입니다.
 * - 일시정지 버튼을 제공하고(움직이는 콘텐츠 정지 기능), 움직임 줄이기 설정이면 자동 재생하지 않습니다.
 */
(function () {
  'use strict';

  var video = document.querySelector('[data-cover-video]');
  var toggle = document.querySelector('[data-video-toggle]');
  if (!video || !toggle || !video.dataset.src) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var iconPause = toggle.querySelector('[data-icon-pause]');
  var iconPlay = toggle.querySelector('[data-icon-play]');

  function render() {
    var paused = video.paused;
    iconPause.hidden = paused;
    iconPlay.hidden = !paused;
    toggle.setAttribute('aria-label', paused ? '배경 영상 재생' : '배경 영상 일시정지');
  }

  video.addEventListener('loadeddata', function () {
    video.hidden = false;
    toggle.hidden = false;
    if (!reducedMotion) {
      var playing = video.play();
      if (playing && playing.catch) playing.catch(render);
    }
    render();
  }, { once: true });

  // 파일이 없을 때: 영상은 숨긴 채로 두고 표지 아트를 보여줌
  video.addEventListener('error', function () {
    video.hidden = true;
    toggle.hidden = true;
  }, true);

  video.addEventListener('play', render);
  video.addEventListener('pause', render);

  toggle.addEventListener('click', function () {
    if (video.paused) video.play();
    else video.pause();
  });

  // 좁은 화면(767px 이하)은 세로형 모바일 영상, 그 외는 데스크톱 영상 — 하나만 불러옴
  var mobile = window.matchMedia('(max-width: 767px)').matches && video.dataset.srcMobile;
  video.preload = 'auto';
  video.src = mobile ? video.dataset.srcMobile : video.dataset.src;
  video.load();
})();
