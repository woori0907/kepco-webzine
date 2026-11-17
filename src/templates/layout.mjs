// 공통 틀 — 모든 페이지가 같은 헤더 · 목차 · 푸터 · 하단 탭바를 씁니다.

import { esc, flat, each } from '../lib/html.mjs';
import { imagePath } from '../lib/image.mjs';
import { asset, home, article, EVENT_SLUG } from '../lib/paths.mjs';
import { icon } from './icons.mjs';

function header(issue) {
  return `
  <header class="site-header" data-header>
    <div class="site-header__inner">
      <p class="site-header__issue"><b>${esc(issue.dateLabel)}</b> <span>vol.${issue.vol}</span></p>
      <a class="site-header__logo" href="${home()}" aria-label="KEPCO 웹진 ${esc(issue.titleKo)} 홈">
        <img src="${asset('assets/images/logo-kepco.svg')}" alt="" width="119" height="28">
      </a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-open aria-label="목차">
        ${icon('toc')}
      </button>
    </div>
  </header>`;
}

function menuItem(a, currentSlug) {
  return `
            <li class="menu__item">
              <a class="menu__link" href="${article(a.slug)}"${a.slug === currentSlug ? ' aria-current="page"' : ''}>
                <span class="menu__corner">${esc(a.corner)}</span>
                <span class="visually-hidden">: ${esc(flat(a.title))}</span>
              </a>
            </li>`;
}

function menu(issue, articles, currentSlug) {
  const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
  return `
  <div class="menu" id="site-menu" role="dialog" aria-modal="true" aria-labelledby="menu-title" hidden data-menu>
    <div class="menu__overlay" data-menu-close></div>
    <div class="menu__panel">
      <div class="menu__head">
        <img src="${asset('assets/images/logo-kepco.svg')}" alt="KEPCO" width="94" height="22">
        <button class="menu__close" type="button" aria-label="목차 닫기" data-menu-close>${icon('close')}</button>
      </div>
      <div class="menu__issue">
        <p class="menu__issue-meta" id="menu-title">${esc(issue.titleKo)} 목차 · vol.${issue.vol}</p>
        <p class="menu__keyword">${esc(issue.keyword)}<span>${esc(issue.keywordEn)}</span></p>
      </div>
      <nav aria-label="이번 호 목차">
        ${each(issue.sections, (section) => `
        <section class="menu__section" aria-labelledby="menu-${section.id}">
          <h2 class="menu__section-name" id="menu-${section.id}">${esc(section.name)}</h2>
          <ol class="menu__list">
            ${each(section.items, ({ slug }) => menuItem(bySlug[slug], currentSlug))}
            ${section.event ? menuItem({ slug: EVENT_SLUG, corner: issue.quiz.corner, title: issue.quiz.title }, currentSlug) : ''}
          </ol>
        </section>`)}
      </nav>
      <div class="menu__extra">
        <a class="btn btn--outline" href="${home('#participate')}">${icon('chat')}독자 설문</a>
        <a class="btn btn--outline" href="${home('#newsletter')}">${icon('mail')}뉴스레터 신청</a>
        <a class="btn btn--outline" href="${esc(issue.archive.main)}" target="_blank" rel="noopener">${icon('external')}지난 호 보기<span class="visually-hidden">(새 창)</span></a>
      </div>
    </div>
  </div>`;
}

function footer(issue) {
  return `
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <img src="${asset('assets/images/logo-kepco.svg')}" alt="KEPCO" width="102" height="24">
        <p class="site-footer__issue">웹진 ${esc(issue.titleKo)} · vol.${issue.vol}</p>
      </div>
      <ul class="site-footer__links">
        <li><a href="${home('#articles')}">이번 호 기사</a></li>
        <li><a href="${home('#participate')}">참여</a></li>
        <li><a href="${esc(issue.archive.main)}" target="_blank" rel="noopener">지난 호<span class="visually-hidden">(새 창)</span></a></li>
      </ul>
      <p class="site-footer__copy">© ${issue.year} KEPCO. All Rights Reserved.</p>
    </div>
  </footer>`;
}

// 하단 탭바 (태블릿·모바일) — 목차 · 이번 호 · (기사: 공유하기 / 그 밖: 참여) · e북 · 위로
function tabbar(issue, isHome, isArticle) {
  return `
  <nav class="tabbar" aria-label="빠른 이동" data-tabbar>
    <button class="tabbar__item" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-open>${icon('toc')}목차</button>
    <a class="tabbar__item" href="${home()}"${isHome ? ' aria-current="page"' : ''}>${icon('home')}이번 호</a>
    ${isArticle
      ? `<button class="tabbar__item" type="button" data-share>${icon('share')}공유</button>`
      : `<a class="tabbar__item" href="${home('#participate')}">${icon('chat')}참여</a>`}
    <a class="tabbar__item" href="${esc(asset(issue.ebook))}" target="_blank" rel="noopener" aria-label="e북 보기 (새 창)">${icon('book')}e북</a>
    <button class="tabbar__item" type="button" data-scroll-top>${icon('up')}위로</button>
  </nav>`;
}

/**
 * 리모컨 (데스크톱 오른쪽 아래 고정) — 다음 기사 · 이전 기사 · 공유하기(기사만) · e북 · 지난 호 보기 · 맨 위로
 * 순서는 목차 순서 + 맨 끝 EVENT, 끝에서는 처음으로 돌아갑니다.
 * 메인·가이드처럼 기사가 아닌 페이지에서는 ‘다음’ = 첫 기사, ‘이전’ = 마지막(EVENT).
 * 아이콘만 보이고, 마우스·키보드 포커스 시 왼쪽에 이름표가 나옵니다(화면낭독기는 aria-label).
 */
function remote(issue, articles, currentSlug) {
  const pages = [
    ...articles.map((a) => ({ slug: a.slug, name: a.corner, title: flat(a.title) })),
    { slug: EVENT_SLUG, name: issue.quiz.corner, title: issue.quiz.title },
  ];
  const i = pages.findIndex((x) => x.slug === currentSlug);
  const isArticle = articles.some((a) => a.slug === currentSlug); // 공유하기는 기사 페이지에만
  const next = pages[(i + 1) % pages.length]; // i가 -1이면 첫 기사
  const prev = pages[(i - 1 + pages.length) % pages.length]; // i가 -1이면 마지막
  const item = (attrs, iconName, label, tip) => `
      <li><${attrs.tag} class="remote__btn" ${attrs.rest} aria-label="${esc(label)}" data-tip="${esc(tip)}">${icon(iconName)}</${attrs.tag}></li>`;
  return `
  <nav class="remote" aria-label="리모컨" data-remote>
    <ul>${item({ tag: 'a', rest: `href="${article(next.slug)}"` }, 'right', `다음 기사: ${next.name} ${next.title}`, `다음 · ${next.name}`)}${item({ tag: 'a', rest: `href="${article(prev.slug)}"` }, 'left', `이전 기사: ${prev.name} ${prev.title}`, `이전 · ${prev.name}`)}${isArticle ? item({ tag: 'button', rest: 'type="button" data-share' }, 'share', '이 기사 공유하기', '공유하기') : ''}${item({ tag: 'a', rest: `href="${esc(asset(issue.ebook))}" target="_blank" rel="noopener"` }, 'book', 'e북 보기 (새 창)', 'e북 보기')}${item({ tag: 'a', rest: `href="${esc(issue.archive.main)}" target="_blank" rel="noopener"` }, 'archive', '지난 호 보기 (새 창)', '지난 호 보기')}${item({ tag: 'button', rest: 'type="button" data-scroll-top' }, 'up', '맨 위로', '맨 위로')}
    </ul>
  </nav>`;
}

/**
 * 메인 전용 사이드 내비게이션 (데스크톱 오른쪽 고정)
 *   점(dot) — 섹션(SPOTLIGHT · KEPCO NOW · LIFE & CULTURE · 참여)으로 이동, 지금 보는 섹션이 길게 표시 (dot-nav.js)
 *   그 아래 따로 떨어진 원형 버튼 — e북 보기 · 지난 호 보기 · 맨 위로
 */
function dotnav(issue) {
  const stops = [
    ...issue.sections.map((s) => ({ id: s.id, name: s.name })),
    { id: 'participate', name: '참여' },
  ];
  const round = (tag, rest, iconName, label) =>
    `<${tag} class="remote__btn remote__round" ${rest} aria-label="${esc(label)}" data-tip="${esc(label)}">${icon(iconName)}</${tag}>`;
  return `
  <nav class="remote remote--home" aria-label="섹션 바로가기" data-remote>
    <ol class="dots" data-dots>
      ${each(stops, (s, i) => `<li><a class="dots__link${i === 0 ? ' is-active' : ''}" href="#${s.id}" data-dot="${s.id}" data-tip="${esc(s.name)}"${i === 0 ? ' aria-current="true"' : ''}><span class="visually-hidden">${esc(s.name)}</span></a></li>`)}
    </ol>
    <div class="remote__rounds">
      ${round('a', `href="${esc(asset(issue.ebook))}" target="_blank" rel="noopener"`, 'book', 'e북 보기 (새 창)')}
      ${round('a', `href="${esc(issue.archive.main)}" target="_blank" rel="noopener"`, 'archive', '지난 호 보기 (새 창)')}
      ${round('button', 'type="button" data-scroll-top', 'up', '맨 위로')}
    </div>
  </nav>`;
}

/**
 * @param {object} p
 * @param {object} p.issue
 * @param {object[]} p.articles
 * @param {string} p.file        출력 파일명 (OG url)
 * @param {string} p.title       <title>
 * @param {string} p.description
 * @param {string} p.ogImage     이미지 ref
 * @param {string} [p.current]   현재 기사 slug
 * @param {string[]} p.styles    추가 CSS
 * @param {string[]} p.scripts   JS 파일명
 *   'vendor/…'로 시작하면 assets/vendor의 외부 라이브러리(jQuery · slick)를 가리킵니다.
 * @param {string} p.main
 * @param {string} [p.beforeHeader]
 */
function fileUrl(name, kind) {
  return name.startsWith('vendor/') ? asset(`assets/${name}`) : asset(`assets/${kind}/`) + name;
}

export function page(p) {
  const { issue } = p;
  const url = issue.siteUrl + (p.file === 'index.html' ? '' : p.file);
  const ogImage = issue.siteUrl + imagePath(p.ogImage);
  const isHome = p.file === 'index.html';

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!-- 시안 공개 전: 모든 페이지를 검색엔진에서 제외. 정식 공개 때 이 줄을 지웁니다. -->
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}">

  <!-- 공유 미리보기: 뉴스레터·메신저용 절대경로 -->
  <meta property="og:type" content="${isHome ? 'website' : 'article'}">
  <meta property="og:site_name" content="KEPCO 웹진">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:url" content="${esc(url)}">
  <meta name="theme-color" content="#ffffff">

  <link rel="stylesheet" href="${asset('assets/css/')}fonts.css">
  <link rel="stylesheet" href="${asset('assets/css/')}tokens.css">
  <link rel="stylesheet" href="${asset('assets/css/')}base.css">
  <link rel="stylesheet" href="${asset('assets/css/')}components.css">
  <link rel="stylesheet" href="${asset('assets/css/')}layout.css">
${p.styles.map((s) => `  <link rel="stylesheet" href="${fileUrl(s, 'css')}">`).join('\n')}

  <script>document.documentElement.classList.add('js');try{var ts=localStorage.getItem('kepco-webzine:text-size');if(ts==='1'||ts==='2')document.documentElement.setAttribute('data-text-size',ts);}catch(e){}</script>
${[...p.scripts, 'glow-cursor.js', 'cursor.js'].map((s) => `  <script src="${fileUrl(s, 'js')}" defer></script>`).join('\n')}
</head>
<body>
  <a class="skip-link" href="#main">본문 바로가기</a>
${p.beforeHeader || ''}${header(issue)}
${menu(issue, p.articles, p.current)}

  <main id="main" tabindex="-1">
${p.main}
  </main>
${footer(issue)}
${tabbar(issue, isHome, p.articles.some((a) => a.slug === p.current))}
${isHome ? dotnav(issue) : remote(issue, p.articles, p.current)}
</body>
</html>
`;
}
