// Google Sheets mirror for Hòa Âm Hỏa Ý registrations.
//
// SETUP
// 1) Create/open a Google Sheet -> Extensions -> Apps Script.
// 2) Paste this entire file.
// 3) Apps Script -> Project Settings -> Script Properties:
//      WEBHOOK_SECRET = a long random secret (32+ chars recommended)
// 4) Deploy -> New deployment -> Web app:
//      Execute as: Me
//      Who has access: Anyone
// 5) Copy the /exec URL to Vercel env GOOGLE_SHEETS_WEBHOOK_URL.
// 6) Put the same secret in Vercel env GOOGLE_SHEETS_WEBHOOK_SECRET.

const SHEET_NAME = 'Registrations';
const HEADERS = [
  'Timestamp',
  'Submission ID',
  'Họ và tên',
  'SĐT',
  'Email',
  'Trường',
  'MSV (nếu NEU)',
  'Link Facebook',
  'Lớp chuyên ngành',
  'Kĩ năng / biệt tài / sở thích',
  'Đóng góp tiết mục văn nghệ',
  'Thông tin tiết mục',
  'Thắc mắc / nhắn gửi',
  'Extra Answers'
];

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function ensureSheet_(ss) {
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const current = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0] : [];
  const needsHeader = HEADERS.some((value, i) => current[i] !== value);
  if (needsHeader) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Summary is placed away from the registration columns.
  sheet.getRange('P1').setValue('TỔNG SỐ NGƯỜI THAM GIA');
  sheet.getRange('P2').setFormula('=MAX(COUNTA(B2:B),0)');
  sheet.getRange('P1:P2').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('P1').setWrap(true);
  sheet.setFrozenRows(1);
  return sheet;
}

function submissionExists_(sheet, submissionId) {
  if (!submissionId || sheet.getLastRow() < 2) return false;
  return sheet.getRange(2, 2, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(submissionId)).matchEntireCell(true).findNext() !== null;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || !e || !e.parameter || e.parameter.key !== secret) return json_({ ok: false, error: 'unauthorized' });
    if (!e.postData || !e.postData.contents) return json_({ ok: false, error: 'empty_body' });

    const data = JSON.parse(e.postData.contents);
    if (!data.submission_id || !data.full_name) return json_({ ok: false, error: 'invalid_payload' });
    const extra = data.extra_answers || {};

    lock.waitLock(10000);
    const sheet = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet());
    if (submissionExists_(sheet, data.submission_id)) return json_({ ok: true, duplicate: true });

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.submission_id || '',
      data.full_name || '',
      data.phone || '',
      data.email || '',
      data.school || '',
      extra.studentId || '',
      data.source || '', // DB compatibility field stores Facebook URL
      data.year || '', // DB compatibility field stores class/major
      data.expectation || '', // DB compatibility field stores skills/talents
      data.join_future || '', // DB compatibility field stores performance yes/no
      extra.performanceDetails || '',
      data.note || '',
      JSON.stringify(extra)
    ]);

    SpreadsheetApp.flush();
    return json_({ ok: true, total: Math.max(sheet.getLastRow() - 1, 0) });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function setupSheet() {
  ensureSheet_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.flush();
}
