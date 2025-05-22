function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index');
}

function doPost(e) {
  var data = {};
  if (e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return ContentService.createTextOutput('Invalid JSON').setMimeType(ContentService.MimeType.TEXT);
    }
  }

  if (data.action === 'login') {
    var token = verifyLogin(data.id, data.password);
    if (!token) {
      return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
    }
    return ContentService.createTextOutput(JSON.stringify({ token: token }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var user = getUserFromToken(data.token);
  if (!user) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }
  sendBulkEmails(user.id);
  return ContentService.createTextOutput('Emails sent').setMimeType(ContentService.MimeType.TEXT);
}
