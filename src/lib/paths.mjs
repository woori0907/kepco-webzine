// 경로 헬퍼 — 페이지 위치(최상위 / articles 폴더)에 맞는 상대경로를 만듭니다.
// 메인은 최상위 index.html, 기사는 articles/<slug>.html 에 생성됩니다.

export const ARTICLE_DIR = 'articles';
export const EVENT_SLUG = 'event';

let root = '';

/** 지금 만드는 페이지가 최상위에서 얼마나 깊은지 설정 ('' 또는 '../') */
export function setRoot(prefix) {
  root = prefix;
}

/** assets 등 최상위 기준 경로 → 현재 페이지 기준 상대경로 */
export function asset(path) {
  return root + path;
}

/** 메인 페이지 (해시 선택) */
export function home(hash = '') {
  return `${root}index.html${hash}`;
}

/** 기사 페이지 */
export function article(slug) {
  return `${root}${ARTICLE_DIR}/${slug}.html`;
}

/** 최상위 기준 기사 파일 경로 (파일 쓰기 · OG 주소용) */
export function articleFile(slug) {
  return `${ARTICLE_DIR}/${slug}.html`;
}
