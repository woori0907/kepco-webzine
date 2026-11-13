/**
 * 사진 크게 보기 (레이어 팝업)
 * - 기사 본문 사진(.b-figure__media · 장소 소개 .b-spot__photo · 지도 .b-map__image 안의 img)을
 *   클릭하거나, 포커스 후 Enter·Space로 엽니다.
 * - 이전·다음 버튼과 ← → 키로 같은 기사 안의 사진을 넘겨 봅니다.
 * - 닫기 버튼 · 배경 클릭 · ESC로 닫고, 연 사진으로 포커스를 되돌립니다.
 * - 열려 있는 동안 본문 스크롤을 잠그고 포커스를 팝업 안에 가둡니다.
 * - 회색 박스(사진 없는 자리)는 열리지 않습니다.
 */
(function () {
  'use strict';

  var images = Array.prototype.slice.call(document.querySelectorAll(
    '.a-body .b-figure__media img, .a-body .b-spot__photo img, .a-body .b-map__image img'
  ));
  if (!images.length) return;

  var ICON = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    prev: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    zoom: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M11 8.5v5M8.5 11h5"/>',
  };

  function svg(name) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>';
  }

  // ---- 팝업 만들기 (한 번만) ------------------------------------------------
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '사진 크게 보기');
  box.innerHTML =
    '<div class="lightbox__backdrop" data-lb-close></div>' +
    '<figure class="lightbox__figure">' +
    '  <img class="lightbox__img" alt="">' +
    '  <figcaption class="lightbox__caption"></figcaption>' +
    '</figure>' +
    '<p class="lightbox__count" aria-live="polite"></p>' +
    '<button class="lightbox__btn lightbox__close" type="button" aria-label="닫기" data-lb-close>' + svg('close') + '</button>' +
    '<button class="lightbox__btn lightbox__prev" type="button" aria-label="이전 사진">' + svg('prev') + '</button>' +
    '<button class="lightbox__btn lightbox__next" type="button" aria-label="다음 사진">' + svg('next') + '</button>';
  document.body.appendChild(box);

  var bigImg = box.querySelector('.lightbox__img');
  var caption = box.querySelector('.lightbox__caption');
  var count = box.querySelector('.lightbox__count');
  var closeBtn = box.querySelector('.lightbox__close');
  var prevBtn = box.querySelector('.lightbox__prev');
  var nextBtn = box.querySelector('.lightbox__next');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var current = -1;
  var opener = null;
  var hideTimer = null;

  /** 사진에 맞는 캡션: 사진 칸의 캡션 → 단독 사진의 캡션 → 묶음 공통 캡션 */
  function captionOf(img) {
    // 장소 소개 사진은 장소 이름 · 한 줄 제목, 지도는 지도 이름
    var spot = img.closest('.b-spot');
    if (spot) return spot.querySelector('.b-spot__name').textContent + ' · ' + spot.querySelector('.b-spot__sub').textContent;
    var map = img.closest('.b-map');
    if (map) return map.querySelector('figcaption').textContent;
    var item = img.closest('.b-images__item, .b-figure');
    var own = item && item.querySelector(':scope > figcaption');
    if (own) return own.textContent;
    var group = img.closest('.b-images');
    var shared = group && group.querySelector('.b-images__caption');
    return shared ? shared.textContent : '';
  }

  function show(index) {
    current = (index + images.length) % images.length;
    var img = images[current];
    bigImg.src = img.getAttribute('src'); // srcset 중 가장 큰 원본
    bigImg.alt = img.alt;
    var text = captionOf(img);
    caption.textContent = text;
    caption.hidden = !text;
    count.textContent = images.length > 1 ? (current + 1) + ' / ' + images.length : '';
  }

  function open(index, trigger) {
    clearTimeout(hideTimer);
    opener = trigger;
    show(index);
    prevBtn.hidden = nextBtn.hidden = images.length < 2;
    box.hidden = false;
    requestAnimationFrame(function () {
      box.classList.add('is-open');
    });
    document.body.classList.add('is-locked');
    closeBtn.focus({ preventScroll: true });
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    box.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    document.removeEventListener('keydown', onKeydown);
    hideTimer = setTimeout(function () {
      box.hidden = true;
      bigImg.removeAttribute('src');
    }, reducedMotion.matches ? 0 : 240);
    if (opener) opener.focus({ preventScroll: true });
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowLeft' && images.length > 1) {
      event.preventDefault();
      show(current - 1);
    } else if (event.key === 'ArrowRight' && images.length > 1) {
      event.preventDefault();
      show(current + 1);
    } else if (event.key === 'Tab') {
      var focusable = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) {
        return !b.hidden;
      });
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  Array.prototype.forEach.call(box.querySelectorAll('[data-lb-close]'), function (el) {
    el.addEventListener('click', close);
  });
  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });

  // ---- 본문 사진을 누를 수 있게 ---------------------------------------------
  images.forEach(function (img, index) {
    var media = img.closest('.b-figure__media, .b-spot__photo, .b-map__image');
    media.classList.add('is-zoomable');
    media.setAttribute('role', 'button');
    media.setAttribute('tabindex', '0');
    media.setAttribute('aria-label', '사진 크게 보기' + (img.alt ? ': ' + img.alt : ''));
    media.insertAdjacentHTML('beforeend', '<span class="zoom-hint">' + svg('zoom') + '</span>');

    media.addEventListener('click', function () {
      open(index, media);
    });
    media.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(index, media);
      }
    });
  });
})();
