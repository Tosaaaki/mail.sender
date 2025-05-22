function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index');
}

function unauthorized() {
  return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var action = e.parameter.action;
  switch (action) {
    case 'login':
      var token = login(e.parameter.username, e.parameter.password);
      if (!token) return unauthorized();
      return ContentService.createTextOutput(JSON.stringify({ token: token }))
        .setMimeType(ContentService.MimeType.JSON);
    case 'sendEmails':
      if (!verifyLogin(e.parameter.token)) return unauthorized();
      var user = getUserFromToken(e.parameter.token);
      var sent = sendBulkEmails(user.id);
      return ContentService.createTextOutput(JSON.stringify({ sent: sent }))
        .setMimeType(ContentService.MimeType.JSON);
    case 'getCount':
      if (!verifyLogin(e.parameter.token)) return unauthorized();
      var count = getEmailCount();
      return ContentService.createTextOutput(JSON.stringify({ count: count }))
        .setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService.createTextOutput('Invalid action')
        .setMimeType(ContentService.MimeType.TEXT);

  }
}
