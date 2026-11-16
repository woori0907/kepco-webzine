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
//   lead        리드문(본문 중간)      리드
//   opener      도입부                 칼럼 여는 쪽 (RE: SHIFT)
//   chapter     색 면 챕터             주제별 색 면 페이지 (Intuition · Experience)
//   note        메모 카드              A LITTLE NOTE
//   steps       번호 목록 + 작은 사진  습관·방법 1~4
//   flow        구조도                 인포그래픽 (입력 → 판정 상자 흐름)
//   row         2단 묶음               나란히 놓인 정보 박스 2개
//   voices      그림 + 한마디          말풍선 인물 일러스트
//   aside       곁글                   사진 옆 설명 상자
//   foot        각주                   본문 아래 각주
//
// 블록마다 class="b-..." 하나만 붙여 CSS(article.css)에서 모양을 정합니다.

import { esc, each, when, flat } from '../lib/html.mjs';
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

  //   quote  사진 위에 얹는 인용 상자 (인쇄본 ART & CULTURE 35쪽)
  figure: (b) => `
    <figure class="b-figure ${ratioClass(b.ratio)}${b.wide ? ' is-wide' : ''}${b.narrow ? ' is-narrow' : ''}${b.quote ? ' has-quote' : ''}">
      <div class="b-figure__media">${img(b, { sizes: b.wide ? WIDE_SIZES : BODY_SIZES })}</div>
      ${when(b.quote, () => `<blockquote class="b-figure__quote"><p>${esc(b.quote)}</p></blockquote>`)}
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
      ${b.title
        ? `<p class="b-box-label">${esc(b.label || 'Mini Interview')}</p>
      <h2 class="b-people__title" id="${b.id}">${esc(b.title)}</h2>`
        : `<h2 class="b-people__title is-label" id="${b.id}" lang="en">${esc(b.label || 'Mini Interview')}</h2>`}
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

  // 리드문을 본문 중간(예: 도입부 뒤)에 둘 때
  lead: (b) => `<p class="b-lead">${esc(b.text)}</p>`,

  // 도입부 — 인쇄본 RE: SHIFT 쪽. 챕터(chapter)와 같은 2단: 왼쪽 라벨 · 제목 | 세로 선 | 오른쪽 글
  //   label 'RE: SHIFT'  kicker '새로고침!'(목차에 들어감)  title 제목(줄바꿈은 띄어쓰기로)
  //   text [단락…] · quote 인용 한 줄 · subhead 작은 소제목 · after [단락…]
  opener: (b) => `
    <section class="b-opener is-wide" id="${b.id}" aria-labelledby="${b.id}-title">
      <div class="b-opener__grid">
        <div class="b-opener__head">
          ${when(b.label, () => `<p class="b-opener__label" lang="en">${esc(b.label)}</p>`)}
          <h2 class="b-opener__title" id="${b.id}-title">
            <span class="b-opener__kicker">${esc(b.kicker)}</span>
            <span class="b-opener__line">${esc(flat(b.title))}</span>
          </h2>
        </div>
        <div class="b-opener__body">
          ${each(b.text, (t) => `<p class="b-p">${esc(t)}</p>`)}
          ${when(b.quote, () => `<blockquote class="b-opener__quote"><p>${esc(b.quote)}</p></blockquote>`)}
          ${when(b.subhead, () => `<h3 class="b-opener__sub">${esc(b.subhead)}</h3>`)}
          ${each(b.after, (t) => `<p class="b-p">${esc(t)}</p>`)}
        </div>
      </div>
    </section>`,

  // 챕터 — 색 면 위에 한 주제를 묶음 (인쇄본 PERSPECTIVE의 Intuition · Experience 쪽)
  //   tone  'pink' | 'blue' | 'line'(색 면 없이 세로 선으로 나눔)   word  'Intuition' 같은 큰 영문 글자(장식, 없어도 됨)
  //   name  '직관' (화면낭독기용 이름)   cover  { src, alt } 챕터 맨 위 가로 사진
  //   parts [{ title, photo?, blocks: [p · note · steps …] }]
  //         num   동그라미 번호(①)   kicker  제목 윗줄(가는 글씨, 예: ‘세례 요한은 보덴호를’)
  //         title은 왼쪽 소제목(목차에 들어감), photo는 소제목 아래 사진, blocks는 오른쪽
  chapter: (b) => `
    <section class="b-chapter is-wide is-${b.tone || 'pink'}" aria-label="${esc([b.word, b.name].filter(Boolean).join(' · '))}">
      ${when(b.cover, () => `<figure class="b-chapter__cover"><div class="b-figure__media">${img(b.cover, { sizes: WIDE_SIZES })}</div></figure>`)}
      ${when(b.word, () => `<p class="b-chapter__word" lang="en" aria-hidden="true">${esc(b.word)}</p>`)}
      ${each(b.parts, (part) => `
      <div class="b-chapter__part">
        <h2 class="b-chapter__title" id="${part.id}">${when(part.num, () => `<span class="b-chapter__num">${esc(part.num)}</span>`)}${when(part.kicker, () => `<span class="b-chapter__kicker">${esc(part.kicker)}</span> `)}${esc(part.title)}</h2>
        ${when(part.photo, () => `<figure class="b-chapter__photo"><div class="b-figure__media">${img(part.photo, { sizes: '(min-width: 1140px) 240px, 100vw' })}</div></figure>`)}
        <div class="b-chapter__main">
          ${(part.blocks || []).map(renderBlock).join('\n')}
        </div>
      </div>`)}
    </section>`,

  // 메모 카드 — 비스듬한 종이 메모 (인쇄본 A LITTLE NOTE)
  //   label  기본 'A LITTLE NOTE', ''이면 라벨 없이
  note: (b) => `
    <aside class="b-note" aria-label="${esc(b.label ?? 'A LITTLE NOTE') || '메모'}">
      ${when(b.label ?? 'A LITTLE NOTE', () => `<p class="b-note__label" lang="en">${esc(b.label ?? 'A LITTLE NOTE')}</p>`)}
      <p class="b-note__quote">${esc(b.quote)}</p>
      ${when(b.text, () => `<p class="b-note__text">${esc(b.text)}</p>`)}
    </aside>`,

  // 번호 목록 + 작은 사진 — 습관·방법 4가지 같은 단계
  //   items [{ title, text, photo?: { src, alt } }]
  steps: (b) => `
    <ol class="b-steps">
      ${each(b.items, (s, i) => `
      <li class="b-step">
        <span class="b-step__num" aria-hidden="true">${i + 1}</span>
        <div class="b-step__text">
          <p class="b-step__title">${esc(s.title)}</p>
          <p class="b-step__desc">${esc(s.text)}</p>
        </div>
        ${when(s.photo, () => `<div class="b-step__photo">${img(s.photo, { sizes: '(min-width: 768px) 160px, 112px' })}</div>`)}
      </li>`)}
    </ol>`,

  // 구조도 — 위에서 아래로 이어지는 상자 흐름 (인쇄본 NEXT WAVE ‘SEDA 구조도’)
  //   title  화면낭독기·캡션용 이름
  //   boxes  [{ label?, title, items?: [{ photo?, name, text }], join?: [항목…](+로 이음),
  //            scale?: [등급…](번호 매김), checks?: [문장…] }]
  flow: (b) => `
    <figure class="b-flow" aria-label="${esc(b.title)}">
      <ol class="b-flow__list">
        ${each(b.boxes, (box) => `
        <li class="b-flow__box">
          <p class="b-flow__head">${when(box.label, () => `<span lang="en">${esc(box.label)}</span>`)}<b>${esc(box.title)}</b></p>
          ${when(box.items, () => `
          <ul class="b-flow__items">
            ${each(box.items, (it) => `
            <li>${when(it.photo, () => `<span class="b-flow__photo">${img(it.photo, { sizes: '88px' })}</span>`)}<span><b>${esc(it.name)}</b>${esc(it.text)}</span></li>`)}
          </ul>`)}
          ${when(box.join, () => `<p class="b-flow__join">${box.join.map(esc).join('<span aria-hidden="true">+</span>')}</p>`)}
          ${when(box.scale, () => `<ol class="b-flow__scale">${each(box.scale, (s) => `<li>${esc(s)}</li>`)}</ol>`)}
          ${when(box.checks, () => `<ul class="b-flow__checks">${each(box.checks, (s) => `<li>${icon('check')}${esc(s)}</li>`)}</ul>`)}
        </li>`)}
      </ol>
      ${when(b.caption, () => `<figcaption>${esc(b.caption)}</figcaption>`)}
    </figure>`,

  // 2단 묶음 — 정보 박스 두 개를 나란히 (좁은 화면에서는 위아래)
  row: (b) => `
    <div class="b-row">
      ${(b.blocks || []).map(renderBlock).join('\n')}
    </div>`,

  // 그림 + 한마디 — 말풍선 인물 일러스트 (인쇄본 REFRESH 48쪽)
  //   items [{ photo: { src, alt }, text }]
  voices: (b) => `
    <section class="b-voices is-wide" aria-label="${esc(b.title || '참여자 한마디')}">
      <ul class="b-voices__list">
        ${each(b.items, (v) => `
        <li class="b-voice">
          <span class="b-voice__face">${img(v.photo, { sizes: '96px' })}</span>
          <p class="b-voice__text">${esc(v.text)}</p>
        </li>`)}
      </ul>
    </section>`,

  // 곁글 — 사진 옆 짧은 설명 상자
  aside: (b) => `
    <aside class="b-aside"${b.title ? ` aria-label="${esc(b.title)}"` : ''}>
      ${when(b.title, () => `<p class="b-aside__title">${esc(b.title)}</p>`)}
      <p>${esc(b.text)}</p>
    </aside>`,

  // 각주 — 본문 속 ¹ ² 표시에 대응
  foot: (b) => `
    <aside class="b-foot" aria-label="각주">
      <ol>
        ${each(b.items, (t) => `<li>${esc(t)}</li>`)}
      </ol>
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
  //   photo  { src, alt }  오른쪽 가로 사진 (관람 TIP 같은 장소 소개)
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
      ${when(b.photo, () => `<div class="b-callout__photo">${img(b.photo, { sizes: '(min-width: 768px) 360px, 100vw' })}</div>`)}
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
    case 'lead':
      return block.text;
    case 'opener':
      return [block.kicker, block.title, ...(block.text || []), block.quote, block.subhead, ...(block.after || [])].join(' ');
    case 'note':
      return [block.quote, block.text].join(' ');
    case 'steps':
      return block.items.map((s) => `${s.title} ${s.text}`).join(' ');
    case 'chapter':
      return block.parts.map((p) => [p.kicker, p.title, ...(p.blocks || []).map(blockText)].join(' ')).join(' ');
    case 'row':
      return (block.blocks || []).map(blockText).join(' ');
    case 'voices':
      return block.items.map((v) => v.text).join(' ');
    case 'aside':
      return block.text;
    case 'flow':
      return block.boxes.map((x) => [x.title, ...(x.items || []).map((i) => i.text), ...(x.checks || [])].join(' ')).join(' ');
    default:
      return '';
  }
}
