// OPTIONAL: mirror registrations from the Next.js server to Google Sheets.
// 1) Create a Sheet and open Extensions > Apps Script.
// 2) Paste this file. In Project Settings > Script Properties add WEBHOOK_SECRET.
// 3) Deploy > New deployment > Web app > Execute as Me > Anyone.
// The secret stays server-side in Vercel; it is never shipped to the browser.
function doPost(e) {
  try {
    const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || !e.parameter.key || e.parameter.key !== secret) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false })).setMimeType(ContentService.MimeType.JSON);
    }
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registrations');
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp','Submission ID','Full Name','Phone','Email','School','Year','Source','Expectation','Join Future','Note','Extra Answers']);
    sheet.appendRow([data.timestamp || '', data.submission_id || '', data.full_name || '', data.phone || '', data.email || '', data.school || '', data.year || '', data.source || '', data.expectation || '', data.join_future || '', data.note || '', JSON.stringify(data.extra_answers || {})]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false })).setMimeType(ContentService.MimeType.JSON);
  }
}
