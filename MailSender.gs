function sendBulkEmails(senderId) {
  if (!senderId) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sendSheet = ss.getSheetByName('送信先');
  if (!sendSheet) return;

  var values = sendSheet.getDataRange().getValues();
  var logSheet = ss.getSheetByName('ログ');
  if (!logSheet) logSheet = ss.insertSheet('ログ');
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(['日時', '送信者', '宛先', '件名', '本文']);
  }

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var recipient = row[0];
    var subject = row[1];
    var body = row[2];
    if (!recipient) continue;
    MailApp.sendEmail(recipient, subject, body);
    logSheet.appendRow([new Date(), senderId, recipient, subject, body]);
  }

  updateSendCount(senderId);
}

function updateSendCount(senderId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName('ログ');
  if (!logSheet) return;
  var countSheet = ss.getSheetByName('件数');
  if (!countSheet) countSheet = ss.insertSheet('件数');

  var logs = logSheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < logs.length; i++) {
    if (logs[i][1] === senderId) count++;
  }

  var summary = countSheet.getDataRange().getValues();
  var updated = false;
  for (var i = 1; i < summary.length; i++) {
    if (summary[i][0] === senderId) {
      countSheet.getRange(i + 1, 2).setValue(count);
      updated = true;
      break;
    }
  }
  if (!updated) {
    if (summary.length === 0) {
      countSheet.appendRow(['ユーザーID', '件数']);
    }
    countSheet.appendRow([senderId, count]);
  }
}

function sendBulkEmailsUI(token) {
  var user = getUserFromToken(token);
  if (!user) return 'Unauthorized';
  sendBulkEmails(user.id);
  return 'Emails sent';
}
