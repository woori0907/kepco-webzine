// HTML 문자열 헬퍼 — 외부 라이브러리 없이 템플릿을 만들기 위한 최소 도구

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** 텍스트를 HTML에 안전하게 넣기 */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

/** 제목 안의 줄바꿈(\n) → 태블릿 이상에서만 줄을 나누는 <br> */
export function lines(value) {
  return String(value ?? '')
    .split('\n')
    .map((part) => esc(part.trim()))
    .join(' <br class="br-md">');
}

/** 한 줄 텍스트 (줄바꿈을 공백으로) */
export function flat(value) {
  return String(value ?? '').replace(/\s*\n\s*/g, ' ').trim();
}

/** 조건부 출력 */
export function when(condition, render) {
  return condition ? (typeof render === 'function' ? render() : render) : '';
}

/** 배열을 렌더링해 이어 붙이기 */
export function each(list, render) {
  return (list || []).map(render).join('');
}

/** 본문 글자 수로 읽는 시간(분) 계산 — 한국어 1분 약 500자 기준 */
export function readingMinutes(text) {
  const chars = String(text).replace(/\s+/g, '').length;
  return Math.max(1, Math.round(chars / 500));
}

/** 카드·메타에 쓰는 읽는 시간 표시 (원고 준비 중이면 그 문구) */
export function readLabel(a) {
  return a.draft ? '원고 준비 중' : `읽는 시간 ${a.minutes}분`;
}
