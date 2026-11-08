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
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-open>
        ${icon('toc')}<span>목차</span>
      </button>
    </div>
  </header>`;
}

function menuItem(a, currentSlug) {
  return `
            <li class="menu__item">
              <a class="menu__link" href="${article(a.slug)}"${a.slug === currentSlug ? ' aria-current="page"' : ''}>
                <span class="menu__corner">${esc(a.corner)}</span>
                <span class="menu__title">${esc(flat(a.title))}</span>
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

function tabbar(isHome) {
  return `
  <nav class="tabbar" aria-label="빠른 이동" data-tabbar>
    <button class="tabbar__item" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-open>${icon('toc')}목차</button>
    <a class="tabbar__item" href="${home()}"${isHome ? ' aria-current="page"' : ''}>${icon('home')}이번 호</a>
    <a class="tabbar__item" href="${home('#participate')}">${icon('chat')}참여</a>
    <button class="tabbar__item" type="button" data-scroll-top>${icon('up')}위로</button>
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
 * @param {string} p.main
 * @param {string} [p.beforeHeader]
 */
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
${p.styles.map((s) => `  <link rel="stylesheet" href="${asset('assets/css/')}${s}">`).join('\n')}

  <script>document.documentElement.classList.add('js');</script>
${p.scripts.map((s) => `  <script src="${asset('assets/js/')}${s}" defer></script>`).join('\n')}
</head>
<body>
  <a class="skip-link" href="#main">본문 바로가기</a>
${p.beforeHeader || ''}${header(issue)}
${menu(issue, p.articles, p.current)}

  <main id="main" tabindex="-1">
${p.main}
  </main>
${footer(issue)}
${tabbar(isHome)}
</body>
</html>
`;
}
