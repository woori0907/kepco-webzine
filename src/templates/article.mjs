// 기사 템플릿 — 성격이 다른 기사도 모두 이 한 틀로 만듭니다.
//   히어로(대표 이미지 + 제목) → 메타 → 3줄 요약 → 목차 → 리드 → 본문 부품 → 필자 소개
//   → 기사 끝(공감 · 다음 기사 · 같은 코너 지난 호 · 퀴즈)

import { esc, lines, flat, each, when, readLabel } from '../lib/html.mjs';
import { img } from '../lib/image.mjs';
import { icon } from './icons.mjs';
import { article, EVENT_SLUG } from '../lib/paths.mjs';
import { renderBlock } from './blocks.mjs';

function hero(a) {
  const art = a.hero.art ? ` is-${a.hero.art}` : '';
  return `
    <header class="a-hero">
      <div class="a-hero__media${art}">
        ${img(a.hero, { eager: true, sizes: '(min-width: 1280px) 1200px, 100vw' })}
      </div>
      <div class="a-hero__text">
        <p class="label a-hero__label">${esc(a.section.name)} · ${esc(a.corner)}</p>
        <h1 class="a-hero__title">${lines(a.title)}</h1>
        ${when(a.dek, () => `<p class="a-hero__dek">${esc(a.dek)}</p>`)}
      </div>
    </header>`;
}

function meta(a, issue) {
  return `
    <div class="a-meta">
      <ul class="a-meta__credits">
        ${each(a.credits, ([role, name]) => `<li><span>${esc(role)}</span> ${esc(name)}</li>`)}
      </ul>
      <p class="a-meta__info">
        <span>${esc(issue.dateLabel)} · ${esc(a.section.name)} · ${esc(a.type)}</span>
        <span class="a-meta__time">${icon('clock')}${readLabel(a)}</span>
      </p>
    </div>`;
}

function summary(a) {
  return `
    <section class="a-summary" aria-labelledby="summary-title">
      <h2 class="b-box-label" id="summary-title">3줄 요약</h2>
      <ol>
        ${each(a.summary, (line) => `<li>${esc(line)}</li>`)}
      </ol>
    </section>`;
}

function toc(a) {
  if (a.sections.length < 3) return '';
  return `
    <nav class="a-toc" aria-labelledby="toc-title">
      <h2 class="b-box-label" id="toc-title">이 기사의 순서</h2>
      <ol>
        ${each(a.sections, (s) => `<li><a href="#${s.id}">${esc(s.text)}</a></li>`)}
      </ol>
    </nav>`;
}

function author(a) {
  if (!a.author) return '';
  return `
    <aside class="a-author" aria-label="필자 소개">
      <p class="b-box-label">${esc(a.author.label || '글쓴이')}</p>
      <p class="a-author__name">${esc(a.author.name)} <span>${esc(a.author.role)}</span></p>
      ${when(a.author.note, () => `<p class="a-author__note">${esc(a.author.note)}</p>`)}
    </aside>`;
}

function reactions(a) {
  return `
    <section class="a-react" aria-labelledby="react-title" data-reactions="${a.slug}">
      <h2 class="a-end__title" id="react-title">이 기사, 어땠나요?</h2>
      <p class="a-end__desc">공감은 익명으로 모여 매달 코너별 반응 리포트에 반영돼요.</p>
      <div class="a-react__buttons">
        <button class="reaction" type="button" aria-pressed="false" data-reaction="like">${icon('heart')}공감돼요</button>
        <button class="reaction" type="button" aria-pressed="false" data-reaction="useful">${icon('bulb')}유익해요</button>
        <button class="reaction" type="button" aria-pressed="false" data-reaction="cheer">${icon('cheer')}응원해요</button>
        <button class="reaction a-react__copy" type="button" data-copy-link>${icon('link')}링크 복사</button>
      </div>
      <p class="a-react__status" role="status" data-react-status></p>
    </section>`;
}

function nextCard(next) {
  return `
    <nav class="a-next" aria-label="다음 기사">
      <a class="a-next__link" href="${article(next.slug)}">
        <div class="a-next__media${next.hero.art ? ` is-${next.hero.art}` : ''}">${img(next.card || next.hero, { sizes: '(min-width: 768px) 560px, 100vw' })}</div>
        <div class="a-next__text">
          <p class="a-next__kicker">다음 기사 ${icon('right')}</p>
          <p class="label">${esc(next.corner)}</p>
          <p class="a-next__title">${esc(flat(next.title))}</p>
          <p class="a-next__summary">${esc(next.oneLine)}</p>
          <p class="card__meta">${icon('clock')}${readLabel(next)}</p>
        </div>
      </a>
    </nav>`;
}

function past(a, issue) {
  if (!a.past || !a.past.length) return '';
  return `
    <section class="a-past" aria-labelledby="past-title">
      <h2 class="a-end__title" id="past-title">같은 코너 지난 호</h2>
      <ul>
        ${each(a.past, (item) => `
        <li>
          <a href="${esc(issue.archive.base + item.folder + '/' + (item.file || a.slug + '.html'))}" target="_blank" rel="noopener">
            <span class="a-past__issue">${esc(item.date)} · vol.${item.vol}</span>
            <span class="a-past__title">${esc(item.title)}</span>
            ${icon('external')}<span class="visually-hidden">(새 창)</span>
          </a>
        </li>`)}
      </ul>
    </section>`;
}

function quizBanner(issue) {
  return `
    <a class="a-quiz" href="${article(EVENT_SLUG)}">
      <span class="a-quiz__icon">${icon('quiz')}</span>
      <span class="a-quiz__text">
        <span class="label">${esc(issue.quiz.corner)}</span>
        <span class="a-quiz__title">${esc(issue.quiz.title)}</span>
        <span class="a-quiz__desc">이번 호 기사 속에 정답이 있어요. 풀고 응모해 보세요.</span>
      </span>
      ${icon('right')}
    </a>`;
}

export function articleMain(a, next, issue) {
  return `
  <div class="progress" aria-hidden="true"><div class="progress__bar" data-progress></div></div>
  <article class="article" data-article>
    ${hero(a)}
    <div class="a-body">
      ${meta(a, issue)}
      ${summary(a)}
      ${toc(a)}
      ${when(a.lead, () => `<p class="b-lead">${esc(a.lead)}</p>`)}
      ${a.body.map(renderBlock).join('\n')}
      ${author(a)}
    </div>
  </article>

  <section class="a-end" aria-label="기사를 다 읽었다면">
    <div class="container a-end__inner">
      ${reactions(a)}
      ${nextCard(next)}
      <div class="a-end__more">
        ${past(a, issue)}
        ${quizBanner(issue)}
      </div>
    </div>
  </section>`;
}
