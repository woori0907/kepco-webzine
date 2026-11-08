// 이미지 태그 생성 — 크기(width/height), srcset, 지연 로딩을 자동으로 붙입니다.
// 이미지는 tools/optimize-images.ps1 로 만든 JPG를 씁니다.
//   assets/images/<호>/<ref>.jpg       기본(가로 최대 1600px)
//   assets/images/<호>/<ref>-800.jpg   작은 화면용(있을 때만)

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { asset } from './paths.mjs';
import { esc } from './html.mjs';

let ROOT = process.cwd();
let IMAGE_DIR = 'assets/images';

export function configureImages({ root, dir }) {
  ROOT = root;
  IMAGE_DIR = dir;
}

/** JPEG 헤더에서 가로·세로 읽기 */
function jpegSize(file) {
  const buf = readFileSync(file);
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error(`JPEG 크기를 읽지 못했습니다: ${file}`);
}

const cache = new Map();

function info(ref) {
  if (cache.has(ref)) return cache.get(ref);
  const rel = `${IMAGE_DIR}/${ref}.jpg`;
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs)) throw new Error(`이미지가 없습니다: ${rel}`);
  const size = jpegSize(abs);
  const smallRel = `${IMAGE_DIR}/${ref}-800.jpg`;
  const small = existsSync(path.join(ROOT, smallRel)) ? smallRel : null;
  const result = { src: rel, small, ...size };
  cache.set(ref, result);
  return result;
}

/** 공유 미리보기(OG)용 상대경로 */
export function imagePath(ref) {
  return ref ? info(ref).src : null;
}

/**
 * <img> 태그
 * @param {{src:string, alt:string, position?:string}} image
 * @param {{sizes?:string, eager?:boolean, className?:string}} options
 */
export function img(image, { sizes = '100vw', eager = false, className = '' } = {}) {
  // 이미지가 아직 없으면 회색 박스 (원고 준비 중인 코너)
  if (!image || !image.src) return '<span class="ph" aria-hidden="true"></span>';
  if (image.alt === undefined) throw new Error(`alt가 비어 있습니다: ${image.src}`);
  const meta = info(image.src);
  const srcset = meta.small ? ` srcset="${asset(meta.small)} 800w, ${asset(meta.src)} ${meta.width}w" sizes="${esc(sizes)}"` : '';
  const style = image.position ? ` style="object-position:${esc(image.position)}"` : '';
  const cls = className ? ` class="${className}"` : '';
  const loading = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<img${cls} src="${asset(meta.src)}"${srcset} width="${meta.width}" height="${meta.height}" alt="${esc(image.alt)}"${loading} decoding="async"${style}>`;
}
