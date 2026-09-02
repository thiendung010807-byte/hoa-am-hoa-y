const SHEET_NAME = 'Đăng ký';
const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const HEADERS = [
  'Thời gian đăng ký',
  'Họ và tên',
  'SĐT',
  'Email',
  'Trường',
  'MSV NEU',
  'Trường khác',
  'Link Facebook',
  'Lớp chuyên ngành',
  'Kĩ năng / Biệt tài / Sở thích',
  'Đăng ký văn nghệ',
  'Chi tiết tiết mục',
  'Lời nhắn / Thắc mắc'
];

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(value, maxLen) {
  const text = value === null || value === undefined ? '' : String(value).trim();
  return text.slice(0, maxLen || 3000);
}

// Prevent spreadsheet formula injection while keeping the visible value unchanged.
function safeCell_(value, maxLen) {
  const text = clean_(value, maxLen);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function normalizePhone_(phone) {
  let value = clean_(phone, 40).replace(/[^\d+]/g, '');
  if (value.indexOf('+84') === 0) value = '0' + value.slice(3);
  if (value.indexOf('84') === 0 && value.length >= 11) value = '0' + value.slice(2);
  return value;
}

function normalizeEmail_(email) {
  return clean_(email, 160).toLowerCase();
}

function secureEquals_(a, b) {
  a = String(a || '');
  b = String(b || '');
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function ensureSheet_(ss) {
  ss.setSpreadsheetTimeZone(TIME_ZONE);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const current = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0]
    : [];
  const needsHeader = HEADERS.some((header, index) => current[index] !== header);
  if (needsHeader) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  sheet.getRange('A1:M1')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);

  // Empty N is intentional; summary starts at O.
  sheet.getRange('O1').setValue('TỔNG SỐ NGƯỜI THAM GIA');
  sheet.getRange('O2').setFormula('=COUNTA(B2:B)');
  sheet.getRange('O1:O2').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('O1').setWrap(true);

  sheet.getRange('A2:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sheet.getRange('B:M').setWrap(true);
  sheet.getRange('C:C').setNumberFormat('@');
  sheet.getRange('F:F').setNumberFormat('@');

  const widths = [155, 180, 130, 220, 150, 130, 220, 260, 190, 320, 170, 360, 360];
  widths.forEach((width, i) => sheet.setColumnWidth(i + 1, width));
  sheet.setColumnWidth(15, 200);

  return sheet;
}

function isDuplicate_(sheet, phone, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const rows = sheet.getRange(2, 3, lastRow - 1, 2).getDisplayValues();
  const phoneKey = normalizePhone_(phone);
  const emailKey = normalizeEmail_(email);

  return rows.some(function(row) {
    const oldPhone = normalizePhone_(row[0]);
    const oldEmail = normalizeEmail_(row[1]);
    return (phoneKey && oldPhone === phoneKey) || (emailKey && oldEmail === emailKey);
  });
}

function rateLimited_(ipHash) {
  if (!ipHash) return false;
  const cache = CacheService.getScriptCache();
  const key = 'rl_' + clean_(ipHash, 128);
  const count = Number(cache.get(key) || '0');
  if (count >= 5) return true;
  cache.put(key, String(count + 1), 600); // max 5 attempts / 10 minutes / hashed IP
  return false;
}

function validatePayload_(data) {
  if (!data) return 'empty_payload';
  if (!clean_(data.fullName, 100)) return 'missing_name';
  if (!/^0\d{9,10}$/.test(normalizePhone_(data.phone))) return 'invalid_phone';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail_(data.email))) return 'invalid_email';
  if (['NEU', 'HUST', 'HUCE', 'Trường khác'].indexOf(clean_(data.school, 50)) < 0) return 'invalid_school';
  if (data.school === 'NEU' && !clean_(data.studentId, 100)) return 'missing_student_id';
  if (data.school === 'Trường khác' && !clean_(data.otherSchool, 200)) return 'missing_other_school';
  if (['Có', 'Không'].indexOf(clean_(data.performance, 20)) < 0) return 'invalid_performance';
  if (data.performance === 'Có' && !clean_(data.performanceDetails, 3000)) return 'missing_performance_details';
  return '';
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ ok: false, error: 'empty_body' });
    if (e.postData.contents.length > 20000) return json_({ ok: false, error: 'body_too_large' });

    const data = JSON.parse(e.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!expectedSecret || !secureEquals_(data.secret, expectedSecret)) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    const validationError = validatePayload_(data);
    if (validationError) return json_({ ok: false, error: validationError });

    if (rateLimited_(data.ipHash)) {
      return json_({ ok: false, rateLimited: true, error: 'rate_limited' });
    }

    lock.waitLock(15000);
    const sheet = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet());

    const phone = normalizePhone_(data.phone);
    const email = normalizeEmail_(data.email);
    if (isDuplicate_(sheet, phone, email)) {
      return json_({ ok: false, duplicate: true, error: 'duplicate' });
    }

    const vietnamTime = Utilities.formatDate(new Date(), TIME_ZONE, 'dd/MM/yyyy HH:mm:ss');
    const row = [[
      vietnamTime,
      safeCell_(data.fullName, 100),
      safeCell_(phone, 40),
      safeCell_(email, 160),
      safeCell_(data.school, 50),
      data.school === 'NEU' ? safeCell_(data.studentId, 100) : '',
      data.school === 'Trường khác' ? safeCell_(data.otherSchool, 200) : '',
      safeCell_(data.facebook, 500),
      safeCell_(data.classMajor, 200),
      safeCell_(data.skills, 3000),
      safeCell_(data.performance, 20),
      data.performance === 'Có' ? safeCell_(data.performanceDetails, 3000) : '',
      safeCell_(data.note, 3000)
    ]];

    const targetRow = sheet.getLastRow() + 1;
    sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues(row);
    sheet.getRange(targetRow, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    sheet.getRange(targetRow, 3).setNumberFormat('@');
    sheet.getRange(targetRow, 6).setNumberFormat('@');

    SpreadsheetApp.flush();
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return json_({ ok: true, service: 'Hoa Am Hoa Y registration webhook' });
}

function setupSheet() {
  ensureSheet_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.flush();
}
