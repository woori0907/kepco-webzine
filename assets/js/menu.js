/**
 * 목차(전체 메뉴)
 * - 헤더의 ‘목차’ 버튼과 하단 탭바의 ‘목차’ 버튼 어디서나 열림
 * - 닫기 버튼 · 배경 클릭 · ESC · 목차 링크 클릭으로 닫힘
 * - 열려 있는 동안 본문 스크롤 잠금, 포커스를 목차 안에 가둠
 * - 닫으면 목차를 열었던 버튼으로 포커스 복귀
 */
(function () {
  'use strict';

  var menu = document.querySelector('[data-menu]');
  var openers = document.querySelectorAll('[data-menu-open]');
  if (!menu || !openers.length) return;

  var panel = menu.querySelector('.menu__panel');
  var closers = menu.querySelectorAll('[data-menu-close]');
  var links = menu.querySelectorAll('a[href]');
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var lastOpener = null;
  var closeTimer = null;

  function isOpen() {
    return menu.classList.contains('is-open');
  }

  function setExpanded(value) {
    Array.prototype.forEach.call(openers, function (btn) {
      btn.setAttribute('aria-expanded', value ? 'true' : 'false');
    });
  }

  function open(trigger) {
    if (isOpen()) return;
    clearTimeout(closeTimer);
    lastOpener = trigger || openers[0];

    menu.hidden = false;
    // hidden 해제 직후 한 프레임 뒤에 클래스를 붙여야 트랜지션이 동작
    requestAnimationFrame(function () {
      menu.classList.add('is-open');
    });

    document.body.classList.add('is-locked');
    setExpanded(true);

    var current = panel.querySelector('[aria-current="page"]') || panel.querySelector(FOCUSABLE);
    if (current) current.focus({ preventScroll: true });

    document.addEventListener('keydown', onKeydown);
  }

  function close(options) {
    if (!isOpen()) return;
    var restoreFocus = !options || options.restoreFocus !== false;

    menu.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setExpanded(false);
    document.removeEventListener('keydown', onKeydown);

    closeTimer = setTimeout(function () {
      menu.hidden = true;
    }, reducedMotion.matches ? 0 : 320);

    if (restoreFocus && lastOpener) lastOpener.focus({ preventScroll: true });
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    var focusable = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE));
    if (!focusable.length) return;
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

  Array.prototype.forEach.call(openers, function (btn) {
    btn.addEventListener('click', function () {
      if (isOpen()) close();
      else open(btn);
    });
  });

  Array.prototype.forEach.call(closers, function (el) {
    el.addEventListener('click', function () {
      close();
    });
  });

  // 링크로 이동할 때는 버튼으로 포커스를 되돌리지 않음
  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function () {
      close({ restoreFocus: false });
    });
  });
})();
