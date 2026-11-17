// 메인 — ‘이번 달 표지’로 열기
//   SPOTLIGHT(표지: 키워드 · 호수 · 표지 아트/40초 영상 · 커버스토리)
//   → KEPCO NOW · LIFE & CULTURE 등 섹션별 편집형 그리드
//   → 참여(독자 설문 · 뉴스레터)   ※ 퀴즈는 별도 EVENT 페이지

import { esc, flat, each, readLabel } from '../lib/html.mjs';
import { img } from '../lib/image.mjs';
import { asset, article } from '../lib/paths.mjs';
import { icon } from './icons.mjs';

function cover(issue, story) {
  return `
    <section class="cover" id="cover" aria-labelledby="cover-title" data-scene="base">
      <div class="cover__bg" aria-hidden="true">
        ${img(issue.coverArt, { eager: true, sizes: '100vw', className: 'cover__art' })}
        <video class="cover__video" muted loop playsinline hidden
               data-cover-video data-src="${esc(asset(issue.promoVideo.desktop))}" data-src-mobile="${esc(asset(issue.promoVideo.mobile))}"></video>
      </div>
      <button class="cover__toggle" type="button" hidden data-video-toggle aria-label="배경 영상 일시정지">
        <span data-icon-pause>${icon('pause')}</span><span data-icon-play hidden>${icon('play')}</span>
      </button>
      <div class="container cover__grid">
        <div class="cover__text">
          <h1 class="visually-hidden" id="cover-title">KEPCO 웹진 ${esc(issue.titleKo)} vol.${issue.vol}</h1>
          <p class="cover__issue"><b>${esc(issue.titleEn)}</b> vol.${issue.vol}</p>
          <div class="cover__keyword">
            <p class="cover__keyword-label">이달의 키워드</p>
            <p class="cover__keyword-word">${esc(issue.keyword)}</p>
            <p class="cover__keyword-en" lang="en">${esc(issue.keywordEn)}</p>
          </div>
          <p class="cover__intro">${esc(issue.intro)}</p>
          <a class="cover__story" href="${article(story.slug)}">
            <span class="label">${esc(story.section.name)} · ${esc(story.corner)}</span>
            <span class="cover__story-title">${esc(flat(story.title))}</span>
            <span class="cover__story-meta">${esc(story.author ? story.author.name : story.credits[0][1])} · ${icon('clock')}${readLabel(story)}</span>
            <span class="cover__story-go">${icon('right')}</span>
          </a>
        </div>
      </div>
    </section>`;
}

/**
 * 카드
 *   lg — 사진 16:9 위 + 글 아래 (대표 기사)
 *   sm — 사진 4:5 왼쪽 + 글 오른쪽 (작은 가로형)
 */
function card(a, { size = 'lg', span = 4, rows = 1 }) {
  const isLg = size === 'lg';
  const sizes = isLg
    ? `(min-width: 1024px) ${Math.round((1200 / 12) * span)}px, 100vw`
    : '(min-width: 768px) 160px, 112px';
  const style = rows > 1 ? ` style="grid-row: span ${rows}"` : '';
  return `
          <article class="card card--${size} span-${span}"${style} data-rise>
            <a class="card__link" href="${article(a.slug)}">
              <div class="card__media${a.hero.art ? ` is-${a.hero.art}` : ''}">${img(a.card || a.hero, { sizes })}</div>
              <div class="card__body">
                <p class="label">${esc(a.corner)}</p>
                <h3 class="card__title">${esc(flat(a.title))}</h3>
                <p class="card__summary">${esc(a.oneLine)}</p>
                <p class="card__meta"><span>${esc(a.type.replace(/\s*\(.*\)$/, ''))}</span>${icon('clock')}${readLabel(a)}</p>
              </div>
            </a>
          </article>`;
}

/**
 * 캐러셀 (섹션의 layout: 'carousel')
 *   위: 큰 기사 하나 (slick fade로 자동 전환)
 *   아래: 섹션의 모든 기사 썸네일 — 지금 보이는 기사는 원래 색 + 진행 막대, 누르면 그 기사로 전환
 *   동작은 assets/js/now-carousel.js. 스크립트가 없으면 첫 기사만 크게 보이고 썸네일은 기사 링크로 동작합니다.
 */
function carousel(s, articles) {
  const n = articles.length;
  return `
        <div class="now" data-now aria-roledescription="carousel" aria-label="${esc(s.name)} 기사">
          <div class="now__stage" data-now-stage>
            ${each(articles, (a, i) => `
            <article class="now-feature" aria-roledescription="slide" aria-label="${i + 1} / ${n}">
              <a class="now-feature__link" href="${article(a.slug)}">
                <div class="now-feature__media">${img(a.card || a.hero, { sizes: '(min-width: 1024px) 800px, 100vw', eager: i === 0 })}</div>
                <div class="now-feature__body">
                  <p class="label">${esc(a.corner)}</p>
                  <h3 class="now-feature__title">${esc(flat(a.title))}</h3>
                  <p class="now-feature__summary">${esc(a.oneLine)}</p>
                  <p class="card__meta"><span>${esc(a.type.replace(/\s*\(.*\)$/, ''))}</span>${icon('clock')}${readLabel(a)}</p>
                  <span class="now-feature__go">기사 읽기${icon('right')}</span>
                </div>
              </a>
            </article>`)}
          </div>

          <div class="now__bar">
            <p class="now__count" aria-hidden="true"><b data-now-current>1</b> / ${n}</p>
            <div class="now__controls" hidden data-now-controls>
              <button class="now__btn" type="button" data-now-prev aria-label="이전 기사">${icon('left')}</button>
              <button class="now__btn" type="button" data-now-toggle aria-label="자동 넘김 멈춤">
                <span data-icon-pause>${icon('pause')}</span><span data-icon-play hidden>${icon('play')}</span>
              </button>
              <button class="now__btn" type="button" data-now-next aria-label="다음 기사">${icon('right')}</button>
            </div>
          </div>

          <ol class="now__thumbs" data-now-thumbs>
            ${each(articles, (a, i) => `
            <li class="now-thumb${i === 0 ? ' is-active' : ''}">
              <a class="now-thumb__link" href="${article(a.slug)}" data-now-go="${i}"${i === 0 ? ' aria-current="true"' : ''}>
                <span class="now-thumb__media">${img(a.card || a.hero, { sizes: '(min-width: 768px) 120px, 96px' })}</span>
                <span class="now-thumb__body">
                  <span class="label">${esc(a.corner)}</span>
                  <span class="now-thumb__title">${esc(flat(a.title))}</span>
                </span>
                <span class="now-thumb__progress" aria-hidden="true"></span>
              </a>
            </li>`)}
          </ol>
        </div>`;
}

/**
 * 전환 배치 (섹션의 layout: 'feature') — 분위기를 바꾸는 섹션 (LIFE & CULTURE)
 *   맨 앞 기사(feature: true): 화면 폭 가득 찬 사진 위에 소개 + 바로가기 버튼
 *   나머지: 한 줄에 가로로 — 썸네일 | 설명 (썸네일 높이 = 설명 높이), 사이사이 가는 세로선
 */
function feature(a) {
  return `
        <article class="life-feature" data-rise>
          <div class="life-feature__media">${img(a.hero, { sizes: '100vw' })}</div>
          <div class="life-feature__inner container">
            <div class="life-feature__body">
              <p class="label">${esc(a.corner)}</p>
              <h3 class="life-feature__title">${esc(flat(a.title))}</h3>
              <p class="life-feature__summary">${esc(a.oneLine)}</p>
              <a class="btn life-feature__go" href="${article(a.slug)}">기사 바로가기${icon('right')}<span class="visually-hidden"> ${esc(a.corner)} ${esc(flat(a.title))}</span></a>
            </div>
          </div>
        </article>`;
}

function rowCard(a) {
  return `
          <li class="life-item" data-rise>
            <a class="card__link life-item__link" href="${article(a.slug)}">
              <span class="card__media life-item__media${a.hero.art ? ` is-${a.hero.art}` : ''}">${img(a.card || a.hero, { sizes: '(min-width: 1024px) 180px, 40vw' })}</span>
              <span class="life-item__body">
                <span class="label">${esc(a.corner)}</span>
                <span class="life-item__title">${esc(flat(a.title))}</span>
                <span class="life-item__summary">${esc(a.oneLine)}</span>
                <span class="card__meta">${icon('clock')}${readLabel(a)}</span>
              </span>
            </a>
          </li>`;
}

function section(s, bySlug, coverStory, index) {
  const items = s.items.filter((item) => item.slug !== coverStory);
  if (!items.length) return '';
  const lead = s.layout === 'feature' ? items.find((item) => item.feature) : null;
  const head = `
        <div class="section-head">
          <div>
            <p class="section-head__num">${String(index + 1).padStart(2, '0')}</p>
            <h2 class="section-head__title" id="${s.id}-title">${esc(s.name)}</h2>
            <p class="section-head__desc">${esc(s.desc)}</p>
          </div>
        </div>`;
  if (lead) {
    const rest = items.filter((item) => item !== lead);
    return `
    <section class="section home-section scene-${s.id} is-feature" id="${s.id}" aria-labelledby="${s.id}-title" data-scene="${s.id}">
      <div class="container">${head}
      </div>
      ${feature(bySlug[lead.slug])}
      <div class="container">
        <ul class="life-row">
          ${each(rest, (item) => rowCard(bySlug[item.slug]))}
        </ul>
      </div>
    </section>`;
  }
  const body = s.layout === 'carousel'
    ? carousel(s, items.map((item) => bySlug[item.slug]))
    : `
        <div class="grid home-grid">
          ${each(items, (item) => card(bySlug[item.slug], {
            size: item.size,
            span: item.span,
            rows: item.rows || 1,
          }))}
        </div>`;
  return `
    <section class="section home-section scene-${s.id}" id="${s.id}" aria-labelledby="${s.id}-title" data-scene="${s.id}">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-head__num">${String(index + 1).padStart(2, '0')}</p>
            <h2 class="section-head__title" id="${s.id}-title">${esc(s.name)}</h2>
            <p class="section-head__desc">${esc(s.desc)}</p>
          </div>
        </div>${body}
      </div>
    </section>`;
}

function poll(p, articles) {
  return `
          <form class="panel poll span-12" aria-labelledby="poll-title" data-poll="${esc(p.id)}">
            <p class="label">독자 설문</p>
            <h3 class="panel__title" id="poll-title">${esc(p.title)}</h3>
            <p class="panel__desc">${esc(p.desc)}</p>
            <fieldset class="poll__fieldset">
              <legend class="visually-hidden">${esc(p.title)}</legend>
              <div class="choice-list">
                ${each(articles, (a, i) => `
                <label class="choice">
                  <input class="visually-hidden" type="radio" name="poll-${esc(p.id)}" value="${a.slug}" required>
                  <span class="choice__mark" aria-hidden="true">${i + 1}</span>
                  <span><span class="poll__corner">${esc(a.corner)}</span>${esc(flat(a.title))}</span>
                </label>`)}
              </div>
            </fieldset>
            <button class="btn btn--primary poll__submit" type="submit">투표하기</button>
            <p class="poll__done" role="status" data-poll-status></p>
          </form>`;
}

function newsletter() {
  return `
          <section class="panel newsletter span-12" id="newsletter" aria-labelledby="newsletter-title">
            <div class="newsletter__text">
              <p class="label">Newsletter</p>
              <h3 class="panel__title" id="newsletter-title">새 호가 나오면 메일로 알려드릴게요</h3>
              <p class="panel__desc">매달 1일, 이번 호 기사를 한 통의 메일로 보내드려요.</p>
            </div>
            <form class="newsletter__form" novalidate data-newsletter>
              <div class="field" data-field>
                <label class="field__label" for="newsletter-email">이메일</label>
                <input class="field__input" id="newsletter-email" name="email" type="email"
                       placeholder="name@kepco.co.kr" autocomplete="email" required
                       aria-describedby="newsletter-help">
                <p class="field__helper" id="newsletter-help" aria-live="polite"></p>
              </div>
              <button class="btn btn--primary newsletter__submit" type="submit">구독하기</button>
            </form>
          </section>`;
}

function participate(issue, articles) {
  return `
    <section class="section section--surface" id="participate" aria-labelledby="participate-title" data-scene="surface">
      <div class="container">
        <div class="section-head">
          <div>
            <h2 class="section-head__title" id="participate-title">참여</h2>
            <p class="section-head__desc">이번 호 기사에 한 표를 던지고, 다음 호 소식을 받아 보세요.</p>
          </div>
        </div>
        <div class="grid participate-grid">
          ${poll(issue.poll, articles)}
          ${newsletter()}
        </div>
      </div>
    </section>`;
}

/**
 * 츄르를 찾아라 안내 팝업 (메인) — 안내만, 링크 없음 · 동작은 assets/js/churu-notice.js
 *   PC: 왼쪽 아래 구석에서 올라오는 작은 카드 / 모바일: 화면 가운데 레이어 팝업(뒤를 어둡게)
 *   닫기 · 오늘 하루 보지 않기
 */
function churuNotice(issue) {
  const c = issue.churu;
  if (!c || !c.notice) return '';
  const n = c.notice;
  const sprite = asset(`assets/images/${issue.imageFolder}/${c.sprite}`);
  return `
  <div class="notice-dim" hidden data-notice-dim></div>
  <section class="notice" role="dialog" aria-labelledby="notice-title" aria-describedby="notice-text" hidden
           data-notice="${esc(c.id)}">
    <p class="notice__label" lang="en">${esc(n.label)}</p>
    <h2 class="notice__title" id="notice-title">${esc(n.title)}</h2>
    <p class="notice__text" id="notice-text">${esc(n.text)}</p>
    <span class="notice__cat churu-cat churu-cat--1" role="img" aria-label="파워캣" style="background-image:url('${esc(sprite)}')"></span>
    <div class="notice__actions">
      <button class="notice__close" type="button" data-notice-close>닫기</button>
      <button class="notice__today" type="button" data-notice-today>오늘 하루 보지 않기</button>
    </div>
  </section>`;
}

export function homeMain(issue, bySlug) {
  const articles = issue.sections
    .flatMap((s) => s.items.map((item) => bySlug[item.slug]))
    .filter((a) => !a.draft);
  return [
    cover(issue, bySlug[issue.coverStory]),
    `<div id="articles">${issue.sections.map((s, i) => section(s, bySlug, issue.coverStory, i)).join('')}</div>`,
    participate(issue, articles),
    churuNotice(issue),
  ].join('\n');
}
