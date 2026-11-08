/**
 * 뉴스레터 구독 폼
 * - 이메일 형식 검사 → Figma Input State(Error) 스타일 적용
 * - 입력 중에는 에러를 지우고, 포커스를 잃을 때 다시 검사
 * - 제출 중 버튼 비활성화(State=Disabled), 완료 메시지 표시
 *
 * 실제 발송 서버가 아직 없으므로 submitSubscription()은 가짜 요청입니다.
 * 백엔드가 준비되면 이 함수만 fetch 호출로 바꾸면 됩니다.
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-newsletter]');
  if (!form) return;

  var field = form.querySelector('[data-field]');
  var input = form.querySelector('input[type="email"]');
  var helper = form.querySelector('.field__helper');
  var submit = form.querySelector('button[type="submit"]');
  var submitLabel = submit.textContent;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var MESSAGES = {
    empty: '이메일 주소를 입력해 주세요.',
    invalid: '이메일 형식이 올바르지 않아요. 예: name@example.com',
    success: '구독 신청이 완료되었어요. 새 호가 나오면 메일로 알려드릴게요.',
    failure: '잠시 후 다시 시도해 주세요.'
  };

  function setState(state, message) {
    field.classList.toggle('is-error', state === 'error');
    field.classList.toggle('is-success', state === 'success');
    input.setAttribute('aria-invalid', state === 'error' ? 'true' : 'false');
    helper.textContent = message || '';
  }

  function validate() {
    var value = input.value.trim();
    if (!value) return MESSAGES.empty;
    if (!EMAIL_RE.test(value)) return MESSAGES.invalid;
    return '';
  }

  function submitSubscription(email) {
    // TODO: 실제 API로 교체 — 예) return fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email: email }) })
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ ok: true, email: email });
      }, 600);
    });
  }

  input.addEventListener('input', function () {
    if (field.classList.contains('is-error') || field.classList.contains('is-success')) {
      setState('default');
    }
  });

  input.addEventListener('blur', function () {
    // 비어 있을 때 포커스만 빠진 경우에는 에러를 띄우지 않음
    if (!input.value.trim()) return;
    var error = validate();
    if (error) setState('error', error);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var error = validate();
    if (error) {
      setState('error', error);
      input.focus();
      return;
    }

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    submit.textContent = '신청 중…';

    submitSubscription(input.value.trim())
      .then(function (res) {
        if (!res.ok) throw new Error('subscribe failed');
        form.reset();
        setState('success', MESSAGES.success);
      })
      .catch(function () {
        setState('error', MESSAGES.failure);
      })
      .then(function () {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        submit.textContent = submitLabel;
      });
  });
})();
