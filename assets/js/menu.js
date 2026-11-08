/**
 * 전체 메뉴(드로어)
 * - 햄버거 버튼으로 열기, 닫기 버튼 · 배경 클릭 · ESC · 메뉴 링크 클릭으로 닫기
 * - 열려 있는 동안 본문 스크롤 잠금, 포커스를 메뉴 안에 가둠
 * - 닫으면 메뉴를 열었던 버튼으로 포커스 복귀
 */
(function () {
  'use strict';

  var menu = document.querySelector('[data-menu]');
  var openButton = document.querySelector('[data-menu-open]');
  if (!menu || !openButton) return;

  var panel = menu.querySelector('.menu__panel');
  var closeTriggers = menu.querySelectorAll('[data-menu-close]');
  var links = menu.querySelectorAll('.menu__link');
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var closeTimer = null;

  function isOpen() {
    return menu.classList.contains('is-open');
  }

  function open() {
    if (isOpen()) return;
    clearTimeout(closeTimer);

    menu.hidden = false;
    // hidden 해제 직후 한 프레임 뒤에 클래스를 붙여야 트랜지션이 동작
    requestAnimationFrame(function () {
      menu.classList.add('is-open');
    });

    document.body.classList.add('is-locked');
    openButton.setAttribute('aria-expanded', 'true');
    openButton.setAttribute('aria-label', '메뉴 닫기');

    var first = panel.querySelector(FOCUSABLE);
    if (first) first.focus({ preventScroll: true });

    document.addEventListener('keydown', onKeydown);
  }

  function close(options) {
    if (!isOpen()) return;
    var restoreFocus = !options || options.restoreFocus !== false;

    menu.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    openButton.setAttribute('aria-expanded', 'false');
    openButton.setAttribute('aria-label', '메뉴 열기');
    document.removeEventListener('keydown', onKeydown);

    var delay = reducedMotion.matches ? 0 : 280;
    closeTimer = setTimeout(function () {
      menu.hidden = true;
    }, delay);

    if (restoreFocus) openButton.focus({ preventScroll: true });
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

  openButton.addEventListener('click', function () {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  });

  Array.prototype.forEach.call(closeTriggers, function (el) {
    el.addEventListener('click', function () {
      close();
    });
  });

  // 메뉴 링크로 이동할 때는 포커스를 햄버거 버튼으로 되돌리지 않음
  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function () {
      close({ restoreFocus: false });
    });
  });
})();
