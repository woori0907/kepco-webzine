/**
 * 참여 기능 — 퀴즈 · 설문 · 공감 · 링크 복사
 *
 * 서버 없이도 화면과 인터랙션이 모두 동작하도록 만들었습니다.
 * 응답은 지금은 이 브라우저(localStorage)에만 저장됩니다.
 * 실제 운영에서는 save() 한 곳만 인트라넷 게시판/집계 API 호출로 바꾸면 됩니다.
 */
(function () {
  'use strict';

  var PREFIX = 'kepco-webzine:';

  // ---- 저장소 (사생활 보호 모드 등에서 실패해도 화면은 그대로 동작) ----------
  function load(key) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function save(key, value) {
    // TODO(운영): 집계 서버로 전송 — 예) fetch('/webzine/api/' + key, { method: 'POST', body: JSON.stringify(value) })
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      /* 저장 실패는 무시 */
    }
  }

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  // ---- 퀴즈 ----------------------------------------------------------------
  each(document.querySelectorAll('[data-quiz]'), function (quiz) {
    var quizId = quiz.getAttribute('data-quiz');
    var id = 'quiz:' + quizId;
    var items = quiz.querySelectorAll('[data-quiz-item]');
    var result = quiz.querySelector('[data-quiz-result]');
    var score = quiz.querySelector('[data-score]');
    var enter = quiz.querySelector('[data-quiz-enter]');
    var reset = quiz.querySelector('[data-quiz-reset]');
    var answers = (load(id) || {}).answers || {};

    function mark(item, index, picked) {
      var correct = Number(item.getAttribute('data-answer'));
      var feedback = item.querySelector('[data-feedback]');
      var hint = item.querySelector('[data-hint]');
      var right = picked === correct;

      each(item.querySelectorAll('[data-choice]'), function (btn) {
        var n = Number(btn.getAttribute('data-choice'));
        btn.disabled = true;
        btn.classList.toggle('is-correct', n === correct);
        btn.classList.toggle('is-wrong', n === picked && !right);
        btn.setAttribute('aria-pressed', n === picked ? 'true' : 'false');
      });

      feedback.textContent = right ? '정답이에요!' : '아쉬워요. 정답은 ' + (correct + 1) + '번이에요.';
      feedback.className = 'quiz__feedback ' + (right ? 'is-correct' : 'is-wrong');
      hint.hidden = right;
    }

    function summary() {
      var total = items.length;
      var done = Object.keys(answers).length;
      if (done < total) {
        result.hidden = true;
        return;
      }
      var correct = 0;
      each(items, function (item, i) {
        if (answers[i] === Number(item.getAttribute('data-answer'))) correct += 1;
      });
      // 응모 여부는 응모 폼(event-entry.js)이 남긴 기록으로 판단
      var entered = !!load('entry:' + quizId);
      result.hidden = false;
      if (entered && correct === total) {
        score.textContent = total + '문제 모두 정답! 응모가 접수되었어요.';
        enter.hidden = true;
      } else if (correct === total) {
        score.textContent = total + '문제 모두 정답이에요. 아래 응모 폼을 작성해 주세요!';
        enter.hidden = false;
      } else {
        score.textContent = total + '문제 중 ' + correct + '문제를 맞혔어요. 다시 풀어 볼까요?';
        enter.hidden = true;
      }
    }

    each(items, function (item, i) {
      each(item.querySelectorAll('[data-choice]'), function (btn) {
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', function () {
          var picked = Number(btn.getAttribute('data-choice'));
          answers[i] = picked;
          save(id, { answers: answers });
          mark(item, i, picked);
          summary();
        });
      });
      if (answers[i] !== undefined) mark(item, i, answers[i]);
    });

    // 응모가 접수되면 결과 문구를 다시 계산
    window.addEventListener('webzine:entry', summary);

    reset.addEventListener('click', function () {
      answers = {};
      save(id, { answers: answers });
      each(items, function (item) {
        each(item.querySelectorAll('[data-choice]'), function (btn) {
          btn.disabled = false;
          btn.classList.remove('is-correct', 'is-wrong');
          btn.setAttribute('aria-pressed', 'false');
        });
        var feedback = item.querySelector('[data-feedback]');
        feedback.textContent = '';
        feedback.className = 'quiz__feedback';
        item.querySelector('[data-hint]').hidden = true;
      });
      result.hidden = true;
      var first = quiz.querySelector('[data-choice]');
      if (first) first.focus();
    });

    summary();
  });

  // ---- 설문 ----------------------------------------------------------------
  each(document.querySelectorAll('[data-poll]'), function (form) {
    var id = 'poll:' + form.getAttribute('data-poll');
    var status = form.querySelector('[data-poll-status]');
    var submit = form.querySelector('button[type="submit"]');
    var inputs = form.querySelectorAll('input[type="radio"]');

    function lock(value) {
      each(inputs, function (input) {
        input.checked = input.value === value;
        input.disabled = true;
      });
      submit.disabled = true;
      submit.textContent = '투표 완료';
      status.textContent = '투표해 주셔서 고마워요. 결과는 다음 호에서 공개해요.';
    }

    // 저장된 표가 지금 보기 중에 있을 때만 ‘투표 완료’로 표시 (기사 구성이 바뀐 경우 대비)
    var saved = load(id);
    var stillValid = saved && saved.vote && Array.prototype.some.call(inputs, function (input) {
      return input.value === saved.vote;
    });
    if (stillValid) lock(saved.vote);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var picked = form.querySelector('input[type="radio"]:checked');
      if (!picked) {
        status.textContent = '좋았던 기사를 하나 골라 주세요.';
        inputs[0].focus();
        return;
      }
      save(id, { vote: picked.value });
      lock(picked.value);
    });
  });

  // ---- 공감 ----------------------------------------------------------------
  each(document.querySelectorAll('[data-reactions]'), function (box) {
    var id = 'react:' + box.getAttribute('data-reactions');
    var status = box.querySelector('[data-react-status]');
    var picked = load(id) || {};
    var LABEL = { like: '공감돼요', useful: '유익해요', cheer: '응원해요' };

    each(box.querySelectorAll('[data-reaction]'), function (btn) {
      var key = btn.getAttribute('data-reaction');
      btn.setAttribute('aria-pressed', picked[key] ? 'true' : 'false');

      btn.addEventListener('click', function () {
        picked[key] = !picked[key];
        btn.setAttribute('aria-pressed', picked[key] ? 'true' : 'false');
        save(id, picked);
        status.textContent = picked[key] ? '‘' + LABEL[key] + '’를 남겼어요. 고마워요!' : '‘' + LABEL[key] + '’를 취소했어요.';
      });
    });

    // ---- 링크 복사 (외부 공유 서비스 없이 사내에서도 동작) ----
    var copy = box.querySelector('[data-copy-link]');
    if (copy) {
      copy.addEventListener('click', function () {
        var url = window.location.href.split('#')[0];
        var done = function () { status.textContent = '기사 링크를 복사했어요.'; };
        var fail = function () { status.textContent = '복사하지 못했어요. 주소창의 링크를 이용해 주세요.'; };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(done, fail);
          return;
        }
        // 구형 브라우저·file:// 환경 대비
        var field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        try {
          if (document.execCommand('copy')) done();
          else fail();
        } catch (e) {
          fail();
        }
        document.body.removeChild(field);
      });
    }
  });
})();
