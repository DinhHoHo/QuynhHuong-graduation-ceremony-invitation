/**
 * Thiệp mời tốt nghiệp · Quỳnh Hương
 * Apps Script RSVP: lưu xác nhận tham dự vào Google Sheet.
 * Cách cài: xem apps-script/README.md
 */

var SHEET_NAME = 'RSVP';
var HEADERS = ['Thời gian', 'Tên', 'Tham dự', 'Ca', 'Link gửi cho'];

/** Chạy hàm này 1 lần để tạo tab RSVP và tiêu đề cột. */
function setup() {
  getSheet_();
}

function doGet() {
  return json_({ ok: true, service: 'rsvp' });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  if (data.type !== 'rsvp') return json_({ ok: false, error: 'unknown type' });

  var name = clean_(data.name, 60);
  if (!name) return json_({ ok: false, error: 'missing name' });
  var attend = data.attend === 'no' ? 'Không đến được' : 'Sẽ đến';

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([new Date(), name, attend, clean_(data.session, 40), clean_(data.to, 40)]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

/** Cắt độ dài và chặn công thức (=, +, -, @) bị chèn vào Sheet. */
function clean_(v, max) {
  var s = String(v == null ? '' : v).replace(/^\s+|\s+$/g, '').slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
