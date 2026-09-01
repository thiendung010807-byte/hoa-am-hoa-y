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
//
// Data is written to the "Registrations" tab.
// N1/N2 show the live participant count.

const SHEET_NAME = 'Registrations';
const HEADERS = [
  'Timestamp',
  'Submission ID',
  'Full Name',
  'Phone',
  'Email',
  'School',
  'Year',
  'Source',
  'Expectation',
  'Join Future',
  'Note',
  'Extra Answers'
];

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureSheet_(ss) {
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // Initialize/repair the main header row.
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else {
    const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    const needsHeader = HEADERS.some((value, i) => current[i] !== value);
    if (needsHeader) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  // Participant counter. Put it away from registration data so appended rows never overwrite it.
  sheet.getRange('N1').setValue('TỔNG SỐ NGƯỜI THAM GIA');
  sheet.getRange('N2').setFormula('=MAX(COUNTA(B2:B),0)');

  // Small amount of formatting so the summary is easy to spot.
  sheet.getRange('N1:N2').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('N1').setWrap(true);
  sheet.setFrozenRows(1);

  return sheet;
}

function submissionExists_(sheet, submissionId) {
  if (!submissionId || sheet.getLastRow() < 2) return false;
  const finder = sheet
    .getRange(2, 2, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(submissionId))
    .matchEntireCell(true);
  return finder.findNext() !== null;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || !e || !e.parameter || e.parameter.key !== secret) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    if (!e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'empty_body' });
    }

    const data = JSON.parse(e.postData.contents);
    if (!data.submission_id || !data.full_name) {
      return json_({ ok: false, error: 'invalid_payload' });
    }

    // Prevent simultaneous webhook calls from creating duplicate rows.
    lock.waitLock(10000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ensureSheet_(ss);

    // A retry from Vercel/Apps Script must not create a second participant.
    if (submissionExists_(sheet, data.submission_id)) {
      return json_({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.submission_id || '',
      data.full_name || '',
      data.phone || '',
      data.email || '',
      data.school || '',
      data.year || '',
      data.source || '',
      data.expectation || '',
      data.join_future || '',
      data.note || '',
      JSON.stringify(data.extra_answers || {})
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

// Optional helper: run this once manually after pasting the script
// if you want to initialize the header + participant counter before the first registration.
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss);
  SpreadsheetApp.flush();
}
