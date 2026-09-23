const SPREADSHEET_ID = '1FhQ2S3sDEgD2UReiEytrc7FQeURbsF3Hrgg-ij82hck';
const SHEET_NAME = 'Сайт Чинилкин';

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ok:true, service:'chinilkin-leads', sheet:SHEET_NAME});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    let data = {};
    try {
      data = JSON.parse((e.postData && e.postData.contents) || '{}');
    } catch (err) {
      return json_({ok:false, error:'invalid_json'});
    }

    if (String(data.website || '').trim()) {
      return json_({ok:true, ignored:true});
    }

    const phone = String(data.phone || '').trim();
    const digits = phone.replace(/\D/g,'');
    if (digits.length < 10) {
      return json_({ok:false, error:'invalid_phone'});
    }

    const cache = CacheService.getScriptCache();
    const dedupeKey = 'lead:' + Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        digits + '|' + String(data.problem || '').slice(0,120)
      )
    ).slice(0,40);

    if (cache.get(dedupeKey)) {
      return json_({ok:true, duplicate:true});
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return json_({ok:false, error:'sheet_not_found'});
    }

    const now = new Date();
    const tz = ss.getSpreadsheetTimeZone() || 'Europe/Moscow';
    const stamp = Utilities.formatDate(now, tz, 'yyyyMMdd-HHmmss');
    const ticket = 'CHN-' + stamp + '-' + Math.floor(100 + Math.random() * 900);

    const utm = data.utm || {};
    sheet.appendRow([
      ticket,
      now,
      String(data.name || ''),
      phone,
      String(data.location || ''),
      String(data.problem || ''),
      String(data.source || 'website'),
      String(utm.source || ''),
      String(utm.medium || ''),
      String(utm.campaign || ''),
      String(data.page || ''),
      'Новая',
      '',
      ''
    ]);

    cache.put(dedupeKey, '1', 90);

    try {
      const ownerEmail = DriveApp.getFileById(SPREADSHEET_ID).getOwner().getEmail();
      if (ownerEmail) {
        const safe = s => String(s || '').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
        MailApp.sendEmail({
          to: ownerEmail,
          subject: 'Новая заявка Чинилкин — ' + phone,
          htmlBody:
            '<b>Новая заявка с сайта «Чинилкин»</b><br><br>' +
            '<b>ID:</b> ' + safe(ticket) + '<br>' +
            '<b>Имя:</b> ' + safe(data.name) + '<br>' +
            '<b>Телефон:</b> ' + safe(phone) + '<br>' +
            '<b>Адрес / район:</b> ' + safe(data.location) + '<br>' +
            '<b>Проблема:</b> ' + safe(data.problem) + '<br>' +
            '<b>Источник:</b> ' + safe(data.source) + '<br><br>' +
            '<a href="https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit">Открыть CRM-таблицу</a>'
        });
      }
    } catch (mailErr) {
      console.log('Notification email failed: ' + mailErr);
    }

    return json_({ok:true, ticket:ticket});
  } finally {
    lock.releaseLock();
  }
}