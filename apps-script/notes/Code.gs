/**
 * Thiệp mời tốt nghiệp · Quỳnh Hương
 * Apps Script Lời nhắn: lưu và trả về các tờ note trên bảng lời nhắn.
 * Cách cài: xem apps-script/README.md
 */

var SHEET_NAME = 'Notes';
var HEADERS = ['Thời gian', 'Tên', 'Lời nhắn', 'Màu', 'Link gửi cho', 'Ẩn'];
var COLORS = ['butter', 'sky', 'sunny', 'cloud', 'cream'];

/** Chạy hàm này 1 lần để tạo tab Notes và tiêu đề cột. */
function setup() {
  getSheet_();
}

/** GET ?action=notes → danh sách lời nhắn công khai. */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'notes';
  if (action === 'notes') return json_({ ok: true, notes: readNotes_() });
  return json_({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  if (data.type !== 'note') return json_({ ok: false, error: 'unknown type' });

  var message = clean_(data.message, 500);
  var name = clean_(data.name, 40);
  if (!message || !name) return json_({ ok: false, error: 'missing fields' });
  var color = COLORS.indexOf(data.color) > -1 ? data.color : 'butter';

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = getSheet_();
    sh.appendRow([new Date(), name, message, color, clean_(data.to, 40), false]);
    sh.getRange(sh.getLastRow(), 6).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/** Đọc lời nhắn, bỏ các dòng đã tick "Ẩn", mới nhất lên đầu, tối đa 300. */
function readNotes_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < 300; i--) {
    var r = rows[i];
    if (r[5] === true || String(r[5]).toLowerCase() === 'true') continue;
    if (!r[2]) continue;
    out.push({
      time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      name: String(r[1]).replace(/^'/, ''),
      message: String(r[2]).replace(/^'/, ''),
      color: String(r[3])
    });
  }
  return out;
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
