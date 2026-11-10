/**
 * KEPCO 웹진 EVENT 응모 → 구글 스프레드시트
 *
 * 설치 (README의 ‘구글 스프레드시트로 응모 받기’ 참고)
 * 1. 응모용 스프레드시트 → 확장 프로그램 → Apps Script → 이 코드를 붙여 넣고 저장
 * 2. 배포 → 새 배포 → 유형: 웹 앱 / 실행 계정: 나 / 액세스: 모든 사용자 → 배포
 * 3. 나온 웹 앱 주소(…/exec)를 src/content/issue.mjs의 entry.endpoint에 넣고
 *    entry.store를 'sheets'로 바꾼 뒤 다시 빌드
 *
 * 시트 구성 (처음 응모가 들어올 때 자동으로 만들어짐)
 *   시트 이름 = 이벤트 id (예: 2026-10)
 *   접수번호 | 접수일시 | 이름 | 연락처 | 소속 | 한마디 | 동의 | 공개
 *   ‘공개’ 칸: 비워 두면 목록에 바로 보이고, N을 적으면 사이트 목록에서 숨겨집니다.
 *   (승인한 글만 보이게 하려면 아래 APPROVAL_REQUIRED를 true로 — 그때는 Y를 적은 글만 보입니다.)
 */

var APPROVAL_REQUIRED = false;
var HEADERS = ['접수번호', '접수일시', '이름', '연락처', '소속', '한마디', '동의', '공개'];
var MAX = { name: 20, phone: 13, org: 30, text: 200 };

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function sheetFor(eventId) {
  var id = String(eventId || '').replace(/[^\w-]/g, '').slice(0, 20);
  if (!id) throw new Error('이벤트 id가 없습니다.');
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(id);
  if (!sheet) {
    sheet = book.insertSheet(id);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange('D:D').setNumberFormat('@'); // 연락처 앞자리 0 유지
  }
  return sheet;
}

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

// 시트에 =, +, -, @ 로 시작하는 값이 수식으로 해석되지 않게
function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function maskName(name) {
  var chars = Array.from(String(name));
  if (chars.length <= 1) return '*';
  if (chars.length === 2) return chars[0] + '*';
  return chars[0] + chars.slice(1, -1).map(function () { return '*'; }).join('') + chars[chars.length - 1];
}

// 응모 접수
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var body = JSON.parse(e.postData.contents);
    if (body.action !== 'entry') return json({ ok: false, code: 'bad-request' });

    var entry = body.entry || {};
    var name = clean(entry.name, MAX.name);
    var phone = clean(entry.phone, MAX.phone);
    var digits = phone.replace(/\D/g, '');
    var text = clean(entry.text, MAX.text);
    if (name.length < 2 || !/^01\d{8,9}$/.test(digits) || text.length < 5 || entry.agree !== true) {
      return json({ ok: false, code: 'invalid', message: '입력 내용을 확인해 주세요.' });
    }

    var sheet = sheetFor(body.eventId);
    var rows = sheet.getDataRange().getValues().slice(1);
    var dup = rows.some(function (row) { return String(row[3]).replace(/\D/g, '') === digits; });
    if (dup) return json({ ok: false, code: 'duplicate' });

    var no = 'EV' + String(body.eventId).replace('-', '').slice(2) + '-' + ('000' + (rows.length + 1)).slice(-4);
    sheet.appendRow([no, new Date(), safeCell(name), phone, safeCell(clean(entry.org, MAX.org)), safeCell(text), 'Y', '']);
    return json({ ok: true, no: no });
  } catch (err) {
    return json({ ok: false, code: 'server', message: '응모를 접수하지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
  } finally {
    lock.releaseLock();
  }
}

// 한마디 목록 — 이름은 가리고, 연락처는 내보내지 않습니다
function doGet(e) {
  try {
    if (e.parameter.action !== 'comments') return json({ ok: false, code: 'bad-request' });
    var rows = sheetFor(e.parameter.eventId).getDataRange().getValues().slice(1);
    var comments = rows
      .filter(function (row) {
        var flag = String(row[7]).trim().toUpperCase();
        return APPROVAL_REQUIRED ? flag === 'Y' : flag !== 'N';
      })
      .map(function (row) {
        return {
          name: maskName(String(row[2]).replace(/^'/, '')),
          org: String(row[4]).replace(/^'/, ''),
          text: String(row[5]).replace(/^'/, ''),
          date: new Date(row[1]).toISOString(),
        };
      })
      .reverse();
    return json({ ok: true, comments: comments });
  } catch (err) {
    return json({ ok: false, code: 'server' });
  }
}
