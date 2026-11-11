// 기사 템플릿 — 성격이 다른 기사도 모두 이 한 틀로 만듭니다.
//   히어로(대표 이미지 + 제목) → 메타 → 3줄 요약 → 목차 → 리드 → 본문 부품 → 필자 소개
//   다음·이전 기사와 지난 호는 오른쪽 아래 리모컨(layout.mjs)으로 이동합니다.

import { esc, lines, each, when, readLabel } from '../lib/html.mjs';
import { img } from '../lib/image.mjs';
import { icon } from './icons.mjs';
import { renderBlock } from './blocks.mjs';

function hero(a) {
  const art = a.hero.art ? ` is-${a.hero.art}` : '';
  return `
    <header class="a-hero">
      <div class="a-hero__media${art}">
        ${img(a.hero, { eager: true, sizes: '100vw' })}
      </div>
      <div class="a-hero__text">
        <p class="label a-hero__label">${esc(a.section.name)} · ${esc(a.corner)}</p>
        <h1 class="a-hero__title">${lines(a.title)}</h1>
        ${when(a.dek, () => `<p class="a-hero__dek">${esc(a.dek)}</p>`)}
      </div>
      <a class="a-hero__scroll" href="#article-body" data-scroll-duration="1100" aria-label="본문으로 이동">${icon('down')}</a>
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
    <nav class="a-toc" aria-labelledby="toc-title" data-toc>
      <div class="a-toc__inner">
        <h2 class="b-box-label" id="toc-title">이 기사의 순서</h2>
        <ol>
          ${each(a.sections, (s) => `<li><a href="#${s.id}">${esc(s.text)}</a></li>`)}
        </ol>
      </div>
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

export function articleMain(a, issue) {
  return `
  <div class="progress" aria-hidden="true"><div class="progress__bar" data-progress></div></div>
  <article class="article" data-article>
    ${hero(a)}
    <div class="a-body" id="article-body">
      ${meta(a, issue)}
      ${summary(a)}
      ${toc(a)}
      ${when(a.lead, () => `<p class="b-lead">${esc(a.lead)}</p>`)}
      ${a.body.map(renderBlock).join('\n')}
      ${author(a)}
    </div>
  </article>`;
}
