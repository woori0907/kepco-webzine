// 웹진 생성기 — `node src/build.mjs`
//
// src/content/ 의 원고(호 정보 + 기사)를 템플릿에 넣어 순수 HTML을 씁니다.
//   메인     → index.html
//   기사     → articles/<코너>.html   (inception · issue-now · next-wave …)
//   이벤트   → articles/event.html    (콘텐츠 연계 퀴즈)
// 결과물은 지금처럼 폴더째 올리면 되는 정적 파일이고, 인터넷 연결 없이 열립니다.
// 매달 바꾸는 것은 src/content/ 와 assets/images/<호>/ 뿐입니다.

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { issue } from './content/issue.mjs';
import { configureImages } from './lib/image.mjs';
import { readingMinutes, flat } from './lib/html.mjs';
import { setRoot, articleFile, ARTICLE_DIR, EVENT_SLUG } from './lib/paths.mjs';
import { blockText } from './templates/blocks.mjs';
import { page } from './templates/layout.mjs';
import { homeMain } from './templates/home.mjs';
import { articleMain } from './templates/article.mjs';
import { eventMain } from './templates/event.mjs';
import { guideMain } from './templates/guide.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
configureImages({ root: ROOT, dir: `assets/images/${issue.imageFolder}` });

// ---- 원고 불러오기 (섹션 순서대로) -------------------------------------------
const articles = [];
for (const section of issue.sections) {
  for (const item of section.items) {
    const file = path.join(ROOT, 'src/content/articles', `${item.slug}.mjs`);
    const mod = await import(pathToFileURL(file).href);
    articles.push(prepare(mod.default, item.slug, section));
  }
}
const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
if (!bySlug[issue.coverStory]) throw new Error(`커버스토리 '${issue.coverStory}'가 목차에 없습니다`);
for (const q of issue.quiz.questions) {
  if (!bySlug[q.from]) throw new Error(`퀴즈 힌트 기사 '${q.from}'가 목차에 없습니다`);
}

/**
 * 원고가 아직 없는 코너(draft: true) — 자리만 잡는 기본값
 * 사진은 회색 박스, 본문은 회색 줄로 기사 부품 배치를 보여 줍니다.
 */
function withDraftDefaults(a) {
  if (!a.draft) return a;
  const h2 = { type: 'h2', text: '소제목이 들어갈 자리' };
  return {
    oneLine: '원고가 들어오면 한 줄 요약이 들어갑니다.',
    summary: [
      '3줄 요약 첫째 줄이 들어갈 자리입니다.',
      '3줄 요약 둘째 줄이 들어갈 자리입니다.',
      '3줄 요약 셋째 줄이 들어갈 자리입니다.',
    ],
    credits: [['글', '미정']],
    hero: { alt: '' },
    body: [
      { type: 'draft', plan: a.plan },
      { ...h2 },
      { type: 'skeleton', lines: 5 },
      { type: 'skeleton', lines: 4 },
      { type: 'images', cols: 1, items: [{ caption: '사진 설명이 들어갈 자리' }] },
      { type: 'skeleton', lines: 5 },
      { type: 'quote', text: '본문에서 고른 인용구가 들어갈 자리' },
      { ...h2 },
      { type: 'skeleton', lines: 6 },
      { type: 'images', cols: 2, caption: '사진 2장 묶음에 붙는 공통 캡션 자리' },
      { type: 'skeleton', lines: 3 },
    ],
    ...a,
  };
}

/** 원고 검사 + 섹션 · 소제목 id · 읽는 시간 */
function prepare(raw, slug, section) {
  const a = withDraftDefaults(raw);
  if (a.slug !== slug) throw new Error(`${slug}.mjs의 slug가 다릅니다: ${a.slug}`);
  for (const key of ['corner', 'type', 'title', 'oneLine', 'summary', 'hero', 'body']) {
    if (!a[key]) throw new Error(`${slug}: '${key}'가 비어 있습니다`);
  }
  if (a.summary.length !== 3) throw new Error(`${slug}: 3줄 요약은 3줄이어야 합니다`);

  let n = 0;
  const sections = [];
  const body = a.body.map((block) => {
    if (block.type === 'h2' || block.type === 'people') {
      n += 1;
      const id = `sec-${n}`;
      sections.push({ id, text: block.type === 'people' ? block.title : block.text });
      return { ...block, id };
    }
    return block;
  });

  const text = [a.lead || '', ...body.map(blockText)].join(' ');
  return {
    ...a,
    body,
    sections,
    section: { id: section.id, name: section.name },
    minutes: a.draft ? null : readingMinutes(text),
  };
}

// ---- 페이지 쓰기 -------------------------------------------------------------
// 기사 폴더를 비우고 다시 만듭니다 (지운 기사가 남지 않게)
rmSync(path.join(ROOT, ARTICLE_DIR), { recursive: true, force: true });
mkdirSync(path.join(ROOT, ARTICLE_DIR), { recursive: true });

const written = [];
function write(file, html) {
  writeFileSync(path.join(ROOT, file), html);
  written.push(file);
}

const common = { issue, articles };

setRoot('');
write('index.html', page({
  ...common,
  file: 'index.html',
  title: `KEPCO 웹진 ${issue.titleKo} · ${issue.keyword}`,
  description: issue.intro,
  ogImage: issue.coverArt.src,
  styles: ['vendor/slick/slick.css', 'home.css'],
  scripts: ['menu.js', 'scroll-ui.js', 'smooth-scroll.js', 'rise.js', 'scene-bg.js', 'dir-hover.js', 'vendor/jquery/jquery.min.js', 'vendor/slick/slick.min.js', 'now-carousel.js', 'cover-video.js', 'participation.js', 'newsletter.js'],
  main: homeMain(issue, bySlug),
}));

articles.forEach((a) => {
  setRoot('../');
  write(articleFile(a.slug), page({
    ...common,
    file: articleFile(a.slug),
    current: a.slug,
    title: `${flat(a.title)} | KEPCO 웹진 ${issue.titleKo}`,
    description: a.oneLine,
    ogImage: a.hero.src || issue.coverArt.src,
    styles: ['article.css'],
    scripts: ['menu.js', 'scroll-ui.js', 'smooth-scroll.js', 'rise.js', 'progress.js', 'toc-spy.js', 'lightbox.js'],
    main: articleMain(a, issue),
  }));
});

setRoot('../');
write(articleFile(EVENT_SLUG), page({
  ...common,
  file: articleFile(EVENT_SLUG),
  current: EVENT_SLUG,
  title: `${issue.quiz.title} | KEPCO 웹진 ${issue.titleKo}`,
  description: issue.quiz.desc,
  ogImage: issue.coverArt.src,
  styles: ['event.css'],
  scripts: ['menu.js', 'scroll-ui.js', 'smooth-scroll.js', 'event-entry.js', 'participation.js'], // event-entry가 먼저: ?reset 초기화 뒤에 퀴즈가 읽도록
  main: eventMain(issue, bySlug),
}));

// 퍼블리셔용 컴포넌트 가이드 (목차에는 넣지 않음)
mkdirSync(path.join(ROOT, 'guide'), { recursive: true });
setRoot('../');
write('guide/index.html', page({
  ...common,
  file: 'guide/index.html',
  title: `컴포넌트 가이드 · 이미지 박스 | KEPCO 웹진`,
  description: '기사 본문 이미지 박스(1·2·3칸) 사용법',
  ogImage: issue.coverArt.src,
  styles: ['article.css', 'guide.css'],
  scripts: ['menu.js', 'scroll-ui.js', 'smooth-scroll.js', 'lightbox.js'],
  main: guideMain(issue),
}));

console.log(`완료: ${written.length}개 페이지`);
for (const s of issue.sections) {
  console.log(`  ${s.name}`);
  for (const { slug } of s.items) {
    const a = bySlug[slug];
    console.log(`    ${articleFile(slug)}  ${a.corner} · ${a.draft ? '원고 준비 중' : `읽는 시간 ${a.minutes}분`}`);
  }
}
console.log(`    ${articleFile(EVENT_SLUG)}  ${issue.quiz.corner}`);
console.log('  guide/index.html  컴포넌트 가이드');
