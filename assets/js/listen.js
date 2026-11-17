/**
 * 기사 듣기 — 기사에 audio(음성 파일)가 있으면 글자 크기 버튼 옆에 재생 버튼이 나옵니다.
 * - 누르면 재생, 다시 누르면 일시정지 (이어서 재생) · 끝나면 처음으로
 * - 버튼에 남은 시간, 아래 가는 막대에 진행 정도 표시
 * - 파일은 누를 때 처음 불러옴 (preload="none") · 불러오지 못하면 안내
 * - 스크립트가 없으면 버튼은 숨겨진 채로 둡니다.
 */
(function () {
  'use strict';

  var box = document.querySelector('[data-listen]');
  if (!box) return;

  var audio = box.querySelector('[data-listen-audio]');
  var btn = box.querySelector('[data-listen-btn]');
  var label = box.querySelector('[data-listen-label]');
  var time = box.querySelector('[data-listen-time]');
  var bar = box.querySelector('[data-listen-progress]');
  var iconPlay = btn.querySelector('[data-icon-play]');
  var iconPause = btn.querySelector('[data-icon-pause]');

  function clock(sec) {
    if (!isFinite(sec) || sec < 0) return '';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function render() {
    var playing = !audio.paused && !audio.ended;
    iconPlay.hidden = playing;
    iconPause.hidden = !playing;
    btn.setAttribute('aria-pressed', String(playing));
    label.textContent = playing ? '일시정지' : audio.currentTime > 0 && !audio.ended ? '이어 듣기' : '기사 듣기';
    var d = audio.duration;
    time.textContent = isFinite(d) ? clock(d - audio.currentTime) : '';
    bar.style.transform = 'scaleX(' + (isFinite(d) && d ? audio.currentTime / d : 0) + ')';
    box.classList.toggle('is-playing', playing);
    box.classList.toggle('is-started', audio.currentTime > 0 && !audio.ended);
  }

  btn.addEventListener('click', function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {
        label.textContent = '재생할 수 없어요';
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('ended', function () {
    audio.currentTime = 0;
    render();
  });
  audio.addEventListener('error', function () {
    label.textContent = '음성을 불러오지 못했어요';
  });
  ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange'].forEach(function (type) {
    audio.addEventListener(type, render);
  });

  box.hidden = false;
  render();
})();
