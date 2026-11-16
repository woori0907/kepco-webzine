// 츄르를 찾아라 — 숨은 이벤트
//   churuMarker  기사 페이지마다 넣는 숨은 표식. churu.js가 이 값을 읽어 츄르를 숨기고 팝업을 띄움
//   churuMain    츄르 3개를 모두 찾았을 때만 열리는 응모 페이지 (articles/find-churu-<글자>.html)

import { createHash } from 'node:crypto';
import { esc } from '../lib/html.mjs';
import { asset, article, home } from '../lib/paths.mjs';
import { icon } from './icons.mjs';
import { entryForm } from './event.mjs';

/**
 * 응모 페이지 파일 이름 — 'find-churu-' 뒤에 추측하기 어려운 글자를 붙임 (issue.churu.key로 정해짐)
 * key를 바꾸면 주소도 바뀝니다.
 */
export function churuSlug(issue) {
  const c = issue.churu;
  return `${c.slug}-${createHash('sha256').update(`${c.id}:${c.key}`).digest('hex').slice(0, 10)}`;
}

// 응모 페이지 주소는 HTML에 그대로 쓰지 않고 base64를 뒤집어 넣음 (churu.js가 풀어 씀)
function hide(url) {
  return Buffer.from(url).toString('base64').split('').reverse().join('');
}

function attrs(issue) {
  const c = issue.churu;
  const dir = `assets/images/${issue.imageFolder}/`;
  return `data-churu="${esc(c.id)}" data-total="${c.total}" data-pages="${esc((c.pages || []).join(','))}"
       data-img="${esc(asset(dir + c.image))}" data-sprite="${esc(asset(dir + c.sprite))}" data-k="${esc(hide(article(churuSlug(issue))))}"`;
}

/** 기사 페이지용 — 츄르를 숨길 수 있는 기사 목록은 issue.churu.pages (build.mjs가 채움) */
export function churuMarker(a, issue) {
  if (!issue.churu || a.draft) return '';
  return `
  <div hidden ${attrs(issue)}
       data-slug="${esc(a.slug)}"></div>`;
}

export function churuMain(issue) {
  const c = issue.churu;
  const q = { id: c.id };
  const e = { ...issue.entry, ...c.entry };
  return `
  <div class="event event--solo container" ${attrs(issue)} data-churu-page>
    <header class="event__head churu-head">
      <span class="churu-cat churu-cat--3" role="img" aria-label="웃고 있는 파워캣"
            style="background-image:url('${esc(asset(`assets/images/${issue.imageFolder}/${c.sprite}`))}')"></span>
      <div>
        <p class="label">${esc(c.corner)}</p>
        <h1 class="event__title">${esc(c.title)}</h1>
        <p class="event__desc">${esc(c.desc)}</p>
      </div>
    </header>

    <div class="event__body">
      <div class="event__main">
        <!-- 츄르를 다 찾기 전에는 이 안내만 보임 (churu.js) -->
        <section class="panel churu-locked" data-churu-locked aria-labelledby="churu-locked-title">
          <h2 class="panel__title" id="churu-locked-title">아직 찾지 못한 츄르가 있어요</h2>
          <p class="churu-locked__text">이번 호 기사 곳곳에 츄르 ${c.total}개가 숨어 있어요. 모두 찾으면 이 페이지에서 응모할 수 있어요.</p>
          <p class="churu-locked__count" data-churu-progress></p>
          <a class="btn btn--primary" href="${home('#articles')}">${icon('right')}기사 읽으러 가기</a>
        </section>
        <div data-churu-open hidden>
          ${entryForm(q, e)}
        </div>
      </div>
    </div>
  </div>`;
}
