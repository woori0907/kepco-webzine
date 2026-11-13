/**
 * KEPCO 웹진 기사 반응(좋아요 · 유용해요 · 재밌어요) → 구글 스프레드시트
 *
 * 설치 (README의 ‘기사 반응을 시트로 받기’ 참고)
 * 1. 반응용 새 스프레드시트 → 확장 프로그램 → Apps Script → 이 코드를 붙여 넣고 저장
 *    (응모용 시트와 따로 두세요. 응모 시트에는 개인정보가 있어 볼 수 있는 사람을 좁혀야 하고,
 *     한 프로젝트에 doPost가 두 개 있으면 충돌합니다.)
 * 2. 배포 → 새 배포 → 유형: 웹 앱 / 실행 계정: 나 / 액세스: 모든 사용자 → 배포
 * 3. 나온 웹 앱 주소(…/exec)를 src/content/issue.mjs의 reactions.endpoint에 넣고
 *    reactions.store를 'sheets'로 바꾼 뒤 다시 빌드
 *
 * 시트 구성 (처음 반응이 들어올 때 자동으로 만들어짐)
 *   ‘반응’ 시트 : 일시 | 기사 | 반응 | 브라우저   — 누를 때마다 한 줄
 *   ‘집계’ 시트 : 기사별 × 반응별 개수 표 (QUERY 수식이라 자동으로 갱신)
 *   ‘브라우저’ 칸은 같은 브라우저의 중복 반응을 거르는 임의 값이며 개인을 알아볼 수 없습니다.
 *   잘못 들어온 줄은 ‘반응’ 시트에서 행을 지우면 집계와 사이트 숫자에서 함께 빠집니다(최대 1분 뒤).
 */

var LOG = '반응';
var SUMMARY = '집계';
var HEADERS = ['일시', '기사', '반응', '브라우저'];
var REACTIONS = ['like', 'useful', 'fun']; // issue.mjs의 reactions.items id와 같게
var CACHE_SECONDS = 60;

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function logSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(LOG);
  if (!sheet) {
    sheet = book.insertSheet(LOG);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  if (!book.getSheetByName(SUMMARY)) {
    var summary = book.insertSheet(SUMMARY);
    summary.getRange('A1').setFormula(
      "=QUERY('" + LOG + "'!A:D," + ' "select B, count(A) where B is not null group by B pivot C label B \'기사\'", 1)'
    );
  }
  return sheet;
}

function validArticle(value) {
  var slug = String(value || '');
  return /^[a-z0-9-]{1,40}$/.test(slug) ? slug : '';
}

function countsFor(article) {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('counts:' + article);
  if (hit) return JSON.parse(hit);
  var counts = {};
  logSheet().getDataRange().getValues().slice(1).forEach(function (row) {
    if (row[1] === article && REACTIONS.indexOf(row[2]) !== -1) counts[row[2]] = (counts[row[2]] || 0) + 1;
  });
  cache.put('counts:' + article, JSON.stringify(counts), CACHE_SECONDS);
  return counts;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var body = JSON.parse(e.postData.contents);
    var article = validArticle(body.article);
    var reaction = String(body.reaction || '');
    var client = String(body.client || '').replace(/[^a-z0-9]/gi, '').slice(0, 32);
    if (body.action !== 'react' || !article || REACTIONS.indexOf(reaction) === -1 || client.length < 8) {
      return json({ ok: false, code: 'bad-request' });
    }

    var sheet = logSheet();
    var dup = sheet.getDataRange().getValues().slice(1).some(function (row) {
      return row[1] === article && row[3] === client;
    });
    if (dup) return json({ ok: false, code: 'duplicate' });

    sheet.appendRow([new Date(), article, reaction, client]);
    CacheService.getScriptCache().remove('counts:' + article);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, code: 'server' });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var article = validArticle(e.parameter.article);
    if (e.parameter.action !== 'counts' || !article) return json({ ok: false, code: 'bad-request' });
    return json({ ok: true, counts: countsFor(article) });
  } catch (err) {
    return json({ ok: false, code: 'server' });
  }
}
