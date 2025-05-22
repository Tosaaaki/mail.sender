function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index');
}

function doPost(e) {
  var token = e.parameter.token;
  if (!verifyLogin(token)) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }
  var user = getUserFromToken(token);
  if (!user) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }
  sendBulkEmails(user.id);
  return ContentService.createTextOutput('Emails sent').setMimeType(ContentService.MimeType.TEXT);
}
