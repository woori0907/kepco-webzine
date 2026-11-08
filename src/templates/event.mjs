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
            <button class="btn btn--primary" type="button" data-quiz-enter hidden>${icon('check')}응모하기</button>
            <button class="btn btn--outline" type="button" data-quiz-reset>다시 풀기</button>
          </div>
        </div>
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
      ${quiz(q, bySlug)}

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
