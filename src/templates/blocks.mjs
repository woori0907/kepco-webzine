// 본문 부품 — 인쇄본 모듈과 1:1로 대응합니다.
//
//   type        웹 컴포넌트            인쇄본 모듈
//   ----------  ---------------------  ----------------------
//   p           본문 단락              본문
//   h2          소제목(목차에 들어감)  소제목
//   h3          작은 소제목            중제목
//   quote       풀쿼트                 인용구(발췌)
//   figure      사진 + 캡션            사진·캡션
//   gallery     사진 2~3장 묶음        사진 조판
//   data        데이터 박스            숫자 강조 박스
//   glossary    용어 박스              용어 해설
//   people      인물 + 한마디(1:1)     미니 인터뷰
//   info        정보 박스              여행 TIP · 안내 표
//   callout     참여 안내              참여 공지
//
// 블록마다 class="b-..." 하나만 붙여 CSS(article.css)에서 모양을 정합니다.

import { esc, each, when } from '../lib/html.mjs';
import { img } from '../lib/image.mjs';
import { icon } from './icons.mjs';

const BODY_SIZES = '(min-width: 768px) 720px, 100vw';
const WIDE_SIZES = '(min-width: 1120px) 1040px, 100vw';

function ratioClass(ratio) {
  return {
    '16:9': 'is-hero',
    '4:5': 'is-card',
    '1:1': 'is-person',
    natural: 'is-natural',
  }[ratio || '16:9'];
}

const renderers = {
  p: (b) => `<p class="b-p">${esc(b.text)}</p>`,

  h2: (b) => `<h2 class="b-h2" id="${b.id}">${esc(b.text)}</h2>`,

  h3: (b) => `<h3 class="b-h3">${esc(b.text)}</h3>`,

  quote: (b) => `
    <figure class="b-quote">
      <blockquote><p>${esc(b.text)}</p></blockquote>
      ${when(b.cite, () => `<figcaption>${esc(b.cite)}</figcaption>`)}
    </figure>`,

  figure: (b) => `
    <figure class="b-figure ${ratioClass(b.ratio)}${b.wide ? ' is-wide' : ''}">
      <div class="b-figure__media">${img(b, { sizes: b.wide ? WIDE_SIZES : BODY_SIZES })}</div>
      ${when(b.caption, () => `<figcaption>${esc(b.caption)}</figcaption>`)}
    </figure>`,

  gallery: (b) => `
    <figure class="b-gallery is-wide cols-${b.items.length}">
      <div class="b-gallery__grid">
        ${each(b.items, (item) => `
        <figure class="b-gallery__item ${ratioClass(item.ratio || b.ratio || '4:5')}">
          <div class="b-figure__media">${img(item, { sizes: '(min-width: 768px) 520px, 100vw' })}</div>
          ${when(item.caption, () => `<figcaption>${esc(item.caption)}</figcaption>`)}
        </figure>`)}
      </div>
      ${when(b.caption, () => `<figcaption>${esc(b.caption)}</figcaption>`)}
    </figure>`,

  data: (b) => `
    <aside class="b-data" aria-label="${esc(b.title)}">
      <p class="b-box-label">${esc(b.title)}</p>
      <dl class="b-data__list">
        ${each(b.items, (item) => `
        <div class="b-data__item">
          <dt>${esc(item.label)}</dt>
          <dd><strong>${esc(item.value)}</strong>${when(item.unit, () => `<span>${esc(item.unit)}</span>`)}</dd>
        </div>`)}
      </dl>
      ${when(b.note, () => `<p class="b-box-note">${esc(b.note)}</p>`)}
    </aside>`,

  glossary: (b) => `
    <aside class="b-glossary" aria-label="${esc(b.title || '용어 풀이')}">
      <p class="b-box-label">${esc(b.title || '용어 풀이')}</p>
      <dl>
        ${each(b.items, (item) => `
        <div class="b-glossary__item">
          <dt>${esc(item.term)}${when(item.full, () => ` <span lang="en">${esc(item.full)}</span>`)}</dt>
          <dd>${esc(item.desc)}</dd>
        </div>`)}
      </dl>
    </aside>`,

  people: (b) => `
    <section class="b-people is-wide" aria-labelledby="${b.id}">
      <p class="b-box-label">${esc(b.label || 'Mini Interview')}</p>
      <h2 class="b-people__title" id="${b.id}">${esc(b.title)}</h2>
      <ul class="b-people__list">
        ${each(b.items, (person) => `
        <li class="b-person">
          <div class="b-person__photo">${img(person.photo, { sizes: '96px' })}</div>
          <div class="b-person__text">
            <p class="b-person__name">${esc(person.name)} <span>${esc(person.role)}</span></p>
            <p class="b-person__say">${esc(person.text)}</p>
          </div>
        </li>`)}
      </ul>
    </section>`,

  info: (b) => `
    <aside class="b-info is-wide" aria-label="${esc(b.title)}">
      <p class="b-box-label">${esc(b.title)}</p>
      <div class="b-info__grid">
        ${each(b.groups, (group) => `
        <section class="b-info__group">
          <h3>${esc(group.name)}</h3>
          <dl>
            ${each(group.rows, ([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`)}
          </dl>
        </section>`)}
      </div>
    </aside>`,

  // ---- 원고 준비 중인 코너용 자리 표시 ----
  draft: (b) => `
    <aside class="b-draft" aria-label="원고 준비 중">
      <p class="b-box-label">원고 준비 중</p>
      <p class="b-draft__text">이 코너의 원고와 사진이 들어갈 자리입니다. 아래는 기사 부품 배치 예시예요.</p>
      ${when(b.plan && b.plan.length, () => `
      <dl class="b-draft__plan">
        ${each(b.plan, ([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`)}
      </dl>`)}
    </aside>`,

  skeleton: (b) => {
    const n = b.lines || 4;
    // 마지막 줄은 짧게, 나머지는 92~100% 사이로 들쭉날쭉하게
    const widths = Array.from({ length: n }, (_, i) => (i === n - 1 ? 58 : 92 + ((i * 7) % 9)));
    return `
    <div class="b-skeleton" aria-hidden="true">
      ${widths.map((w) => `<span style="width:${w}%"></span>`).join('')}
    </div>`;
  },

  callout: (b) => `
    <aside class="b-callout" aria-label="${esc(b.title)}">
      <p class="b-box-label">${esc(b.label || '참여 안내')}</p>
      <p class="b-callout__title">${esc(b.title)}</p>
      ${when(b.text, () => `<p class="b-callout__text">${esc(b.text)}</p>`)}
      ${when(b.steps, () => `<ol class="b-callout__steps">${each(b.steps, (s) => `<li>${esc(s)}</li>`)}</ol>`)}
      ${when(b.action, () => `<a class="btn btn--primary" href="${esc(b.action.href)}">${esc(b.action.label)}${icon('right')}</a>`)}
    </aside>`,
};

export function renderBlock(block) {
  const render = renderers[block.type];
  if (!render) throw new Error(`알 수 없는 블록입니다: ${block.type}`);
  return render(block);
}

/** 읽는 시간 계산에 쓰는 순수 텍스트 */
export function blockText(block) {
  switch (block.type) {
    case 'p':
    case 'h2':
    case 'h3':
    case 'quote':
      return block.text;
    case 'people':
      return block.items.map((p) => p.text).join(' ');
    case 'callout':
      return [block.title, block.text].join(' ');
    default:
      return '';
  }
}
