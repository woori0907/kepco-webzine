// 아이콘 — 하나의 규칙(24px 격자 · 1.75 선 · 둥근 끝)으로 그린 인라인 SVG
// 글자·이미지 아이콘을 섞지 않고 모두 이 세트만 씁니다.

const PATHS = {
  toc: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  home: '<path d="M4 11l8-7 8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"/>',
  chat: '<path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  archive: '<rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  pause: '<path d="M9 5.5v13M15 5.5v13"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.25"/>',
  pencil: '<path d="M5 19l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L9 17.5zM13.5 7l3 3"/>',
  heart: '<path d="M12 19.5s-7.5-4.6-7.5-10.1A4.1 4.1 0 0 1 12 7.1a4.1 4.1 0 0 1 7.5 2.3c0 5.5-7.5 10.1-7.5 10.1z"/>',
  bulb: '<path d="M9.5 17.5h5M10.5 20.5h3M12 3.5a5.75 5.75 0 0 0-3.4 10.4c.6.4.9 1 .9 1.7v.4h5v-.4c0-.7.3-1.3.9-1.7A5.75 5.75 0 0 0 12 3.5z"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0M9.25 9.75v.5M14.75 9.75v.5"/>',
  book: '<path d="M12 6.5C10.2 5.2 7.7 4.5 4.5 4.5v13c3.2 0 5.7.7 7.5 2 1.8-1.3 4.3-2 7.5-2v-13c-3.2 0-5.7.7-7.5 2zM12 6.5v13"/>',
  share: '<circle cx="17.5" cy="6" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="M8.7 10.8l6.6-3.6M8.7 13.2l6.6 3.6"/>',
  textDown: '<path d="M3 19l5-13 5 13M5 14.5h6M15 12h6"/>',
  textUp: '<path d="M3 19l5-13 5 13M5 14.5h6M15 12h6M18 9v6"/>',
};

export function icon(name, label) {
  const body = PATHS[name];
  if (!body) throw new Error(`아이콘이 없습니다: ${name}`);
  const a11y = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true" focusable="false"';
  const fill = name === 'play' ? ' style="fill:currentColor"' : '';
  return `<svg class="icon" viewBox="0 0 24 24"${a11y}${fill}>${body}</svg>`;
}
