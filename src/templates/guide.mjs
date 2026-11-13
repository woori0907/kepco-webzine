// 컴포넌트 가이드 — guide/index.html
// 퍼블리셔가 기사 원고(src/content/articles/*.mjs)의 body에 붙여 넣을 블록을
// 실제 화면과 코드로 함께 보여 줍니다. 예시 화면과 코드는 같은 데이터에서 만들어지므로 항상 일치합니다.

import { esc, each } from '../lib/html.mjs';
import { renderBlock } from './blocks.mjs';

/** 블록 객체 → 원고 파일에 그대로 붙여 넣을 수 있는 코드 문자열 */
function toCode(value, indent = '') {
  const next = indent + '  ';
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((v) => next + toCode(v, next)).join(',\n')},\n${indent}]`;
  }
  const entries = Object.entries(value);
  if (!entries.length) return '{}';
  const simple = entries.every(([, v]) => typeof v !== 'object');
  const parts = entries.map(([k, v]) => `${k}: ${toCode(v, next)}`);
  const inline = `{ ${parts.join(', ')} }`;
  if (simple && inline.length + indent.length <= 100) return inline;
  return `{\n${parts.map((p) => next + p).join(',\n')},\n${indent}}`;
}

const EXAMPLES = [
  {
    title: '1칸 · 본문 폭 · 16:9',
    note: '가장 기본형. cols와 ratio를 생략하면 이 모양이 됩니다.',
    block: {
      type: 'images',
      cols: 1,
      items: [
        { src: 'on-site/committee', alt: '입지선정위원회 회의장에서 위원들이 회의 테이블에 둘러앉아 있다', caption: '사진 한 장에 붙는 캡션.' },
      ],
    },
  },
  {
    title: '1칸 · 넓게(1040px)',
    note: '현장감 있는 풍경·행사 사진을 크게 보여줄 때. wide: true',
    block: {
      type: 'images',
      cols: 1,
      wide: true,
      items: [
        { src: 'travel-mate/02_lake_yeongnangho', alt: '눈 덮인 설악산 연봉 아래 펼쳐진 영랑호', caption: '넓은 사진의 캡션.' },
      ],
    },
  },
  {
    title: '1칸 · 원본 비율',
    note: '도표·인포그래픽처럼 잘리면 안 되는 이미지. ratio: \'natural\'',
    block: {
      type: 'images',
      cols: 1,
      ratio: 'natural',
      items: [
        { src: 'next-wave/platform', alt: 'ADMS 오픈 플랫폼과 연결된 업무 서비스 도식', caption: '도표는 원본 비율 그대로.' },
      ],
    },
  },
  {
    title: '2칸 · 4:5',
    note: '2칸 기본형. 자동으로 넓게(1040px) 배치됩니다. 사진마다 캡션을 달 수 있습니다.',
    block: {
      type: 'images',
      cols: 2,
      items: [
        { src: 'refresh/paddle', alt: '보트 위의 직원들이 급류 앞에서 노를 젓고 있다', caption: '왼쪽 사진 캡션.' },
        { src: 'refresh/swim', alt: '구명조끼를 입은 직원들이 강물에 나란히 떠 있다', caption: '오른쪽 사진 캡션.' },
      ],
    },
  },
  {
    title: '2칸 · 1:1 · 공통 캡션',
    note: '정사각형으로 맞추고, 두 장을 묶는 캡션 하나만 달 때. ratio: \'1:1\' + caption',
    block: {
      type: 'images',
      cols: 2,
      ratio: '1:1',
      items: [
        { src: 'issue-now/oath', alt: '직원 대표들이 고객서비스 혁신 다짐 선서문을 읽고 있다' },
        { src: 'issue-now/session', alt: '워크숍 화면 앞에서 참석자들이 발표를 듣고 있다' },
      ],
      caption: '두 장을 묶는 공통 캡션.',
    },
  },
  {
    title: '3칸 · 4:5',
    note: '3칸 기본형. 모바일에서는 첫 장이 16:9로 크게, 나머지 두 장이 나란히 놓입니다.',
    block: {
      type: 'images',
      cols: 3,
      items: [
        { src: 'travel-mate/03_sea_yeonggeumjeong', alt: '해 질 녘 바닷가 바위 위의 영금정 정자', caption: '첫째 캡션.', position: '30% 50%' },
        { src: 'travel-mate/04_village_abai_village', alt: '아바이마을 앞 물길을 건너는 갯배', caption: '둘째 캡션.' },
        { src: 'travel-mate/01_mountain_seoraksan', alt: '나뭇가지 사이로 보이는 설악산 바위 봉우리', caption: '셋째 캡션.' },
      ],
    },
  },
  {
    title: '3칸 · 16:9 · 공통 캡션',
    note: '가로 사진 세 장을 한 줄로. ratio: \'16:9\'',
    block: {
      type: 'images',
      cols: 3,
      ratio: '16:9',
      items: [
        { src: 'travel-mate/04_village_abai_village', alt: '아바이마을 앞 물길을 건너는 갯배' },
        { src: 'travel-mate/00_hero_seoraksan_16x9', alt: '상고대가 핀 설악산 산책로' },
        { src: 'travel-mate/03_sea_yeonggeumjeong', alt: '해 질 녘 영금정과 바다' },
      ],
      caption: '세 장을 묶는 공통 캡션.',
    },
  },
  {
    title: '자리 잡기 · 사진 없이',
    note: '사진이 아직 없을 때. items를 비우거나 src를 빼면 칸 수만큼 회색 박스가 놓입니다.',
    block: {
      type: 'images',
      cols: 3,
      caption: '사진이 들어오면 items에 src와 alt를 채웁니다.',
    },
  },
];

const OPTIONS = [
  ['type', "'images'", '이미지 박스 블록'],
  ['cols', '1 · 2 · 3', '칸 수. 생략하면 사진 개수'],
  ['ratio', "'16:9' · '4:5' · '1:1' · 'natural'", '사진 비율. 생략하면 1칸 16:9, 2·3칸 4:5'],
  ['wide', 'true · false', '본문(720px)보다 넓게(1040px). 생략하면 1칸 false, 2·3칸 true'],
  ['items[].src', "'폴더/파일이름'", 'assets/images/2026-10/ 아래 경로, 확장자(.jpg) 없이. 없으면 회색 박스'],
  ['items[].alt', "'사진 설명'", '화면낭독기용 설명. src가 있으면 꼭 적어야 빌드됩니다'],
  ['items[].caption', "'캡션'", '사진 아래 캡션 (선택)'],
  ['items[].position', "'50% 30%'", '잘릴 때 보여줄 위치 (선택, 가로% 세로%)'],
  ['items[].ratio', '위와 같음', '이 사진만 다른 비율로 (선택)'],
  ['caption', "'공통 캡션'", '사진 묶음 전체 아래에 붙는 캡션 (선택)'],
];

export function guideMain(issue) {
  return `
  <div class="guide">
    <header class="guide__head container">
      <p class="label">Component Guide</p>
      <h1 class="guide__title">이미지 박스 — 1칸 · 2칸 · 3칸</h1>
      <p class="guide__desc">기사 원고 파일(<code>src/content/articles/코너.mjs</code>)의 <code>body</code> 배열에 아래 코드를 붙여 넣고 <code>node src/build.mjs</code>를 실행하면 됩니다. 사진은 <code>assets/images/${esc(issue.imageFolder)}/</code>에 넣고, 원본은 <code>tools/optimize-images.ps1</code>로 줄여 주세요.</p>
    </header>

    <section class="guide__options container" aria-labelledby="guide-options">
      <h2 class="guide__h2" id="guide-options">옵션</h2>
      <div class="guide__table-wrap">
        <table class="guide__table">
          <thead><tr><th scope="col">이름</th><th scope="col">값</th><th scope="col">설명</th></tr></thead>
          <tbody>
            ${each(OPTIONS, ([name, value, desc]) => `<tr><td><code>${esc(name)}</code></td><td><code>${esc(value)}</code></td><td>${esc(desc)}</td></tr>`)}
          </tbody>
        </table>
      </div>
    </section>

    ${each(EXAMPLES, (ex, i) => `
    <section class="guide__example" aria-labelledby="guide-ex-${i + 1}">
      <div class="container guide__example-head">
        <p class="guide__num">${String(i + 1).padStart(2, '0')}</p>
        <h2 class="guide__h2" id="guide-ex-${i + 1}">${esc(ex.title)}</h2>
        <p class="guide__note">${esc(ex.note)}</p>
      </div>
      <div class="a-body guide__preview">
        ${renderBlock(ex.block)}
      </div>
      <div class="container">
        <pre class="guide__code"><code>${esc(toCode(ex.block))},</code></pre>
      </div>
    </section>`)}
  </div>`;
}
