// 본문 부품 — 인쇄본 모듈과 1:1로 대응합니다.
//
//   type        웹 컴포넌트            인쇄본 모듈
//   ----------  ---------------------  ----------------------
//   p           본문 단락              본문
//   h2          소제목(목차에 들어감)  소제목
//   h3          작은 소제목            중제목
//   quote       풀쿼트                 인용구(발췌)
//   images      이미지 박스 1·2·3칸    사진 조판 (1단·2단·3단)
//   figure      사진 1장 (도표·원본비율) 도표·인포그래픽
//   data        데이터 박스            숫자 강조 박스
//   glossary    용어 박스              용어 해설
//   people      인물 + 한마디(1:1)     미니 인터뷰
//   info        정보 박스              여행 TIP · 안내 표
//   callout     참여 안내              참여 공지
//   spot        장소 소개(번호·태그)   여행지 1곳 (사진 + 태그 + 추천 한마디 + 가는 법)
//   map         일러스트 지도          MAP 페이지
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

  // 이미지 박스 — 1칸 · 2칸 · 3칸 템플릿 (사용법: guide/index.html)
  //   cols     1 | 2 | 3                 (기본: 사진 개수)
  //   ratio    '16:9' | '4:5' | '1:1' | 'natural'   (기본: 1칸 16:9, 2·3칸 4:5)
  //   wide     true면 본문보다 넓게 1040px  (기본: 1칸 false, 2·3칸 true)
  //   items    [{ src, alt, caption?, position?, ratio? }]  — src가 없으면 회색 박스
  //   caption  사진 묶음 전체에 붙는 공통 캡션
  images: (b) => {
    const items = b.items || [];
    const cols = b.cols || Math.min(items.length, 3) || 1;
    if (![1, 2, 3].includes(cols)) throw new Error(`images: cols는 1·2·3 중 하나여야 합니다 (${cols})`);
    const ratio = b.ratio || (cols === 1 ? '16:9' : '4:5');
    const wide = b.wide ?? cols > 1;
    const width = wide ? 1040 : 720;
    const sizes = cols === 1
      ? (wide ? WIDE_SIZES : BODY_SIZES)
      : `(min-width: 768px) ${Math.round(width / cols)}px, 50vw`;
    // 칸 수보다 사진이 적으면 남은 칸은 회색 박스로 자리만 잡음
    const filled = items.concat(Array.from({ length: Math.max(0, cols - items.length) }, () => ({})));
    return `
    <figure class="b-images cols-${cols}${wide ? ' is-wide' : ''}">
      <div class="b-images__grid">
        ${each(filled, (item) => `
        <figure class="b-images__item ${ratioClass(item.ratio || ratio)}">
          <div class="b-figure__media">${img(item, { sizes })}</div>
          ${when(item.caption, () => `<figcaption>${esc(item.caption)}</figcaption>`)}
        </figure>`)}
      </div>
      ${when(b.caption, () => `<figcaption class="b-images__caption">${esc(b.caption)}</figcaption>`)}
    </figure>`;
  },

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

  //   rows   [['참여 대상', '한전 임직원'], …]   note  * 작은 안내
  //   image  { src, alt }  오른쪽 원형 사진       tone  'paper'면 미색 면 (인쇄본 안내 박스)
  //   icon   라벨 앞 아이콘 이름                  wide  true면 본문보다 넓게 (지도 아래 이어 붙일 때)
  callout: (b) => `
    <aside class="b-callout${b.tone ? ` is-${b.tone}` : ''}${b.image ? ' has-image' : ''}${b.wide ? ' is-wide' : ''}" aria-label="${esc(b.title)}">
      <div class="b-callout__main">
        <p class="b-box-label">${b.icon ? icon(b.icon) : ''}${esc(b.label || '참여 안내')}</p>
        <p class="b-callout__title">${esc(b.title)}</p>
        ${when(b.text, () => `<p class="b-callout__text">${esc(b.text)}</p>`)}
        ${when(b.steps, () => `<ol class="b-callout__steps">${each(b.steps, (s) => `<li>${esc(s)}</li>`)}</ol>`)}
        ${when(b.rows, () => `
        <dl class="b-callout__rows">
          ${each(b.rows, ([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`)}
        </dl>`)}
        ${when(b.note, () => `<p class="b-callout__note">${esc(b.note)}</p>`)}
        ${when(b.action, () => `<a class="btn btn--primary" href="${esc(b.action.href)}">${esc(b.action.label)}${icon(b.action.icon || 'right')}</a>`)}
      </div>
      ${when(b.image, () => `<div class="b-callout__image">${img(b.image, { sizes: '(min-width: 768px) 200px, 160px' })}</div>`)}
    </aside>`,

  // 장소 소개 — 인쇄본 TRAVEL MATE의 여행지 한 곳
  //   tag      'MOUNTAIN' 같은 영문 태그 (사진 모서리에 붙은 종이 태그)
  //   name · title   장소 이름 · 한 줄 제목   (목차에는 name이 들어감)
  //   photo    { src, alt, position? }     layout  'wide'면 사진을 위에 가로로 길게
  //   text     본문 단락 하나
  //   pick     { label?, by?, text }        직원 추천 한마디
  //   guide    { label?, rows: [[항목, 내용], …] }   ‘이렇게 가보세요’
  //   번호(num)·id는 build.mjs가 순서대로 붙이고, 짝수 번째는 사진·글 좌우를 바꿈
  spot: (b) => {
    const wide = b.layout === 'wide';
    const sizes = wide ? WIDE_SIZES : '(min-width: 768px) 520px, 100vw';
    const variant = wide ? ' is-panorama' : b.num % 2 === 0 ? ' is-flip' : '';
    return `
    <section class="b-spot is-wide${variant}" id="${b.id}" aria-labelledby="${b.id}-title">
      <figure class="b-spot__media">
        <div class="b-spot__photo">${img(b.photo, { sizes })}</div>
        ${when(b.tag, () => `<span class="b-spot__tag" lang="en">${esc(b.tag)}</span>`)}
      </figure>
      <div class="b-spot__text">
        <div class="b-spot__intro">
          <h2 class="b-spot__title" id="${b.id}-title">
            <span class="b-spot__num"><span class="visually-hidden">추천 장소 </span>${b.num}<span class="visually-hidden">.</span></span>
            <span class="b-spot__name">${esc(b.name)}</span>
            <span class="b-spot__sub">${esc(b.title)}</span>
          </h2>
          <p class="b-spot__body">${esc(b.text)}</p>
        </div>
        <div class="b-spot__notes">
          ${when(b.pick, () => `
          <figure class="b-spot__pick">
            <p class="b-spot__label">${icon('pencil')}${esc(b.pick.label || 'MATE’S PICK')}</p>
            <blockquote><p>${esc(b.pick.text)}</p></blockquote>
            ${when(b.pick.by, () => `<figcaption class="b-spot__by">${esc(b.pick.by)}</figcaption>`)}
          </figure>`)}
          ${when(b.guide, () => `
          <div class="b-spot__guide">
            <p class="b-spot__label">${icon('pin')}${esc(b.guide.label || '이렇게 가보세요')}</p>
            <dl>
              ${each(b.guide.rows, ([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`)}
            </dl>
          </div>`)}
        </div>
      </div>
    </section>`;
  },

  // 일러스트 지도 — 미색 면 위에 손그림 지도 (인쇄본 MAP)
  //   label  'MATE’S MAP'   src  'travel-mate/지도.png'   alt  지도에 표시된 장소를 글로
  map: (b) => `
    <figure class="b-map is-wide">
      <figcaption class="b-box-label">${icon('pin')}${esc(b.label || 'MAP')}</figcaption>
      <div class="b-map__image">${img(b, { sizes: WIDE_SIZES })}</div>
    </figure>`,
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
    case 'spot':
      return [block.name, block.title, block.text, block.pick?.text].join(' ');
    default:
      return '';
  }
}
