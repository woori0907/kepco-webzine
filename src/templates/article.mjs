// 기사 템플릿 — 성격이 다른 기사도 모두 이 한 틀로 만듭니다.
//   히어로(대표 이미지 + 제목) → 메타 → 3줄 요약 → 목차 → 리드 → 본문 부품 → 필자 소개
//   다음·이전 기사와 지난 호는 오른쪽 아래 리모컨(layout.mjs)으로 이동합니다.

import { esc, lines, each, when, readLabel } from '../lib/html.mjs';
import { img } from '../lib/image.mjs';
import { icon } from './icons.mjs';
import { renderBlock } from './blocks.mjs';
import { churuMarker } from './churu.mjs';

/**
 * 코스 박스 — 인쇄본 표지의 ‘MOUNTAIN → LAKE → SEA → VILLAGE’
 * 태그(tag)가 붙은 장소(spot)를 순서대로 잇고, 누르면 그 장소로 이동합니다.
 */
function course(a) {
  if (!a.course) return '';
  const stops = a.sections.filter((s) => s.tag);
  return `
      <nav class="a-course" aria-label="${esc(a.course.title)}">
        <p class="a-course__head"><b>${icon('pin')}${esc(a.course.label)}</b><span>${esc(a.course.title)}</span></p>
        <ol class="a-course__stops">
          ${each(stops, (s) => `<li><a href="#${s.id}" data-scroll-duration="1100"><span lang="en">${esc(s.tag)}</span><span class="visually-hidden"> ${esc(s.text)}</span></a></li>`)}
        </ol>
      </nav>`;
}

// hero.layout 'top' — 인쇄본 표지처럼 제목을 사진 위쪽(하늘)에 둠
// hero.credit       — 사진 출처 (제목 아래 작은 글씨)
// hero.tone 'light' — 밝은 사진 위에 어두운 글씨 (인쇄본 NEXT WAVE 표지)
function hero(a) {
  const art = a.hero.art ? ` is-${a.hero.art}` : '';
  const layout = (a.hero.layout ? ` is-${a.hero.layout}` : '') + (a.hero.tone ? ` is-${a.hero.tone}` : '');
  return `
    <header class="a-hero${layout}${a.course ? ' has-course' : ''}">
      <div class="a-hero__media${art}">
        ${img(a.hero, { eager: true, sizes: '100vw' })}
      </div>
      <div class="a-hero__text">
        <p class="label a-hero__label">${esc(a.section.name)} · ${esc(a.corner)}</p>
        <h1 class="a-hero__title">${lines(a.title)}</h1>
        ${when(a.dek, () => `<p class="a-hero__dek">${lines(a.dek)}</p>`)}
        ${when(a.hero.credit, () => `<p class="a-hero__credit">${esc(a.hero.credit)}</p>`)}
      </div>
      ${course(a)}
      <a class="a-hero__scroll" href="#article-body" data-scroll-duration="1100" aria-label="본문으로 이동">${icon('down')}</a>
    </header>`;
}

function meta(a) {
  return `
    <div class="a-meta">
      <ul class="a-meta__credits">
        ${each(a.credits, ([role, name]) => `<li><span>${esc(role)}</span> ${esc(name)}</li>`)}
      </ul>
      <p class="a-meta__info">
        <span class="a-meta__time">${icon('clock')}${readLabel(a)}</span>
      </p>
      <div class="a-size" role="group" aria-label="글자 크기" hidden data-text-size-control>
        <button class="a-size__btn" type="button" data-text-size-step="-1" aria-label="글자 작게">${icon('textDown')}</button>
        <span class="a-size__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <button class="a-size__btn" type="button" data-text-size-step="1" aria-label="글자 크게">${icon('textUp')}</button>
        <span class="visually-hidden" role="status" data-text-size-status></span>
      </div>
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

// 목차 — 1200px 이상은 왼쪽 사이드바(지금 읽는 소제목 표시, toc-spy.js), 그보다 좁으면 본문 위 박스
// 눈에 보이는 제목 글자는 두지 않고, 화면낭독기에는 aria-label로 ‘이 기사의 순서’를 알림
function toc(a) {
  if (a.sections.length < 3) return '';
  return `
    <nav class="a-toc" aria-label="이 기사의 순서" data-toc>
      <div class="a-toc__inner">
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

/**
 * 반응 버튼 — 좋아요 · 유용해요 · 재밌어요 (issue.reactions)
 * 기사마다 브라우저당 하나만 고를 수 있고 취소는 없습니다. 동작·저장은 assets/js/reactions.js
 * 스크립트가 없으면 숨겨진 채로 둡니다.
 */
function reactions(a, issue) {
  const r = issue.reactions;
  if (!r || a.draft) return '';
  return `
    <section class="a-react" aria-labelledby="react-title" hidden
             data-reactions="${esc(a.slug)}" data-store="${esc(r.store)}" data-endpoint="${esc(r.endpoint)}">
      <h2 class="a-react__title" id="react-title">${esc(r.title)}</h2>
      <div class="a-react__list" role="group" aria-labelledby="react-title">
        ${each(r.items, ([id, label, iconName]) => `
        <button class="a-react__btn" type="button" aria-pressed="false" data-reaction="${esc(id)}" data-label="${esc(label)}">
          ${icon(iconName)}<span>${esc(label)}</span><span class="a-react__count" data-reaction-count></span>
        </button>`)}
      </div>
      <p class="a-react__status" role="status" data-reaction-status></p>
    </section>`;
}

export function articleMain(a, issue) {
  return `
  <div class="progress" aria-hidden="true"><div class="progress__bar" data-progress></div></div>
  <article class="article${a.theme ? ` is-${a.theme}` : ''}" data-article>
    ${hero(a)}
    <div class="a-body" id="article-body">
      ${meta(a)}
      ${summary(a)}
      ${toc(a)}
      ${when(a.lead, () => `<p class="b-lead">${esc(a.lead)}</p>`)}
      ${a.body.map(renderBlock).join('\n')}
      ${reactions(a, issue)}
      ${author(a)}
    </div>
    ${churuMarker(a, issue)}
  </article>`;
}
