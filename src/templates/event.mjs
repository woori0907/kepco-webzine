// EVENT — 콘텐츠 연계 퀴즈 페이지 (articles/event.html)
// 기사 템플릿이 아니라 이벤트 전용 틀입니다. 당첨자 발표 등은 이 페이지에 이어 붙이면 됩니다.

import { esc, each } from '../lib/html.mjs';
import { article } from '../lib/paths.mjs';
import { icon } from './icons.mjs';

function quiz(q, bySlug) {
  return `
      <section class="panel quiz" aria-labelledby="quiz-title" data-quiz="${esc(q.id)}">
        <h2 class="visually-hidden" id="quiz-title">${esc(q.title)} 문제</h2>
        <ol class="quiz__list">
          ${each(q.questions, (item, qi) => `
          <li class="quiz__item" data-quiz-item data-answer="${item.answer}">
            <p class="quiz__ask" id="quiz-q${qi + 1}"><span class="quiz__num">Q${qi + 1}</span>${esc(item.ask)}</p>
            <div class="choice-list" role="group" aria-labelledby="quiz-q${qi + 1}">
              ${each(item.options, (opt, oi) => `<button class="choice" type="button" data-choice="${oi}"><span class="choice__mark" aria-hidden="true">${oi + 1}</span>${esc(opt)}</button>`)}
            </div>
            <p class="quiz__feedback" role="status" data-feedback></p>
            <p class="quiz__hint" hidden data-hint>힌트는 <a href="${article(item.from)}">${esc(bySlug[item.from].corner)} 기사</a>에 있어요.</p>
          </li>`)}
        </ol>
        <div class="quiz__result" hidden data-quiz-result>
          <p class="quiz__score" role="status" data-score></p>
          <div class="quiz__actions">
            <a class="btn btn--primary" href="#event-entry" data-quiz-enter hidden>${icon('check')}응모하러 가기</a>
            <button class="btn btn--outline" type="button" data-quiz-reset>다시 풀기</button>
          </div>
        </div>
      </section>`;
}

// 응모 폼 — 퀴즈를 모두 맞힌 뒤 제출할 수 있습니다. 동작은 assets/js/event-entry.js
function entryForm(q, e) {
  const p = e.privacy;
  return `
      <section class="panel entry" id="event-entry" aria-labelledby="entry-title" tabindex="-1"
               data-entry="${esc(q.id)}" data-store="${esc(e.store)}" data-endpoint="${esc(e.endpoint)}">
        <h2 class="panel__title" id="entry-title">응모하기</h2>
        <dl class="entry__info">
          <div><dt>응모 기간</dt><dd>${esc(e.period)}</dd></div>
          <div><dt>당첨 발표</dt><dd>${esc(e.announce)}</dd></div>
          <div><dt>경품</dt><dd>${esc(e.prize)}</dd></div>
        </dl>

        <form class="entry__form" novalidate data-entry-form>
          <p class="entry__notice" role="alert" data-entry-alert hidden></p>

          <div class="entry__row">
            <div class="field" data-field="name">
              <label class="field__label" for="entry-name">이름 <span class="entry__req">필수</span></label>
              <input class="field__input" id="entry-name" name="name" type="text" autocomplete="name"
                     maxlength="20" required aria-describedby="entry-name-help">
              <p class="field__helper" id="entry-name-help" aria-live="polite"></p>
            </div>
            <div class="field" data-field="phone">
              <label class="field__label" for="entry-phone">연락처 <span class="entry__req">필수</span></label>
              <input class="field__input" id="entry-phone" name="phone" type="tel" inputmode="numeric"
                     autocomplete="tel" placeholder="010-0000-0000" maxlength="13" required aria-describedby="entry-phone-help">
              <p class="field__helper" id="entry-phone-help" aria-live="polite"></p>
            </div>
          </div>

          <div class="field" data-field="org">
            <label class="field__label" for="entry-org">소속 <span class="entry__opt">선택</span></label>
            <input class="field__input" id="entry-org" name="org" type="text" maxlength="30"
                   placeholder="예) 서울본부 고객지원부" aria-describedby="entry-org-help">
            <p class="field__helper" id="entry-org-help" aria-live="polite"></p>
          </div>

          <div class="field" data-field="text">
            <label class="field__label" for="entry-text">이번 호 한마디 <span class="entry__req">필수</span></label>
            <textarea class="field__input entry__textarea" id="entry-text" name="text" rows="4" maxlength="200" required
                      placeholder="기사를 읽은 소감이나 다음 호에 바라는 점을 남겨 주세요." aria-describedby="entry-text-help entry-text-count"></textarea>
            <div class="entry__under">
              <p class="field__helper" id="entry-text-help" aria-live="polite">남긴 한마디는 아래 목록에 이름 일부를 가리고 공개돼요.</p>
              <p class="entry__count" id="entry-text-count" data-entry-count>0 / 200</p>
            </div>
          </div>

          <!-- 자동 입력 방지: 사람에게는 보이지 않는 칸 (채워져 있으면 접수하지 않음) -->
          <div class="entry__trap" aria-hidden="true">
            <label for="entry-website">웹사이트</label>
            <input id="entry-website" name="website" type="text" tabindex="-1" autocomplete="off">
          </div>

          <fieldset class="entry__privacy" data-field="agree">
            <legend class="field__label">개인정보 수집·이용 동의 <span class="entry__req">필수</span></legend>
            <table class="entry__table">
              <tr><th scope="row">수집 목적</th><td>${esc(p.purpose)}</td></tr>
              <tr><th scope="row">수집 항목</th><td>${esc(p.items)}</td></tr>
              <tr><th scope="row">보유 기간</th><td>${esc(p.retention)}</td></tr>
            </table>
            <p class="entry__privacy-note">동의하지 않을 수 있으며, 동의하지 않으면 이벤트에 응모할 수 없습니다.</p>
            <label class="entry__check">
              <input type="checkbox" name="agree" required aria-describedby="entry-agree-help">
              <span>개인정보 수집·이용에 동의합니다.</span>
            </label>
            <p class="field__helper" id="entry-agree-help" aria-live="polite"></p>
          </fieldset>

          <button class="btn btn--primary entry__submit" type="submit">${icon('check')}응모하기</button>
        </form>

        <div class="entry__done" hidden data-entry-done tabindex="-1">
          <p class="entry__done-title">${icon('check')}응모가 접수되었어요</p>
          <dl class="entry__info" data-entry-receipt></dl>
          <p class="entry__done-note">한 사람이 한 번 응모할 수 있어요. 당첨자는 ${esc(e.announce)}에서 발표해요.</p>
        </div>
      </section>`;
}

// 응모 한마디(댓글) 목록 — 샘플은 시연에서 목록이 비어 보이지 않게 하는 예시입니다.
function comments(e) {
  const samples = JSON.stringify(e.samples).replace(/</g, '\\u003c');
  return `
      <section class="comments" aria-labelledby="comments-title" data-comments>
        <h2 class="comments__title" id="comments-title">응모 한마디 <span data-comments-count></span></h2>
        <ol class="comments__list" data-comments-list></ol>
        <p class="comments__empty" data-comments-empty hidden>아직 남겨진 한마디가 없어요. 첫 번째로 남겨 주세요.</p>
        <button class="btn btn--outline comments__more" type="button" data-comments-more hidden>더 보기</button>
        <script type="application/json" data-comments-samples>${samples}</script>
      </section>`;
}

export function eventMain(issue, bySlug) {
  const q = issue.quiz;
  const hintArticles = [...new Set(q.questions.map((item) => item.from))].map((slug) => bySlug[slug]);
  return `
  <div class="event container">
    <header class="event__head">
      <p class="label">${esc(q.corner)}</p>
      <h1 class="event__title">${esc(q.title)}</h1>
      <p class="event__desc">${esc(q.desc)}</p>
    </header>

    <div class="event__body">
      <div class="event__main">
        ${quiz(q, bySlug)}
        ${entryForm(q, issue.entry)}
        ${comments(issue.entry)}
      </div>

      <aside class="event__aside" aria-labelledby="event-hint-title">
        <h2 class="event__aside-title" id="event-hint-title">정답이 들어 있는 기사</h2>
        <ul class="event__links">
          ${each(hintArticles, (a) => `
          <li>
            <a href="${article(a.slug)}">
              <span class="label">${esc(a.corner)}</span>
              <span class="event__link-title">${esc(a.title.replace(/\s*\n\s*/g, ' '))}</span>
              ${icon('right')}
            </a>
          </li>`)}
        </ul>
      </aside>
    </div>
  </div>`;
}
