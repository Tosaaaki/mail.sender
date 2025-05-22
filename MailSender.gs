
function incrementEmailCount(num) {
  var props = PropertiesService.getScriptProperties();
  var count = Number(props.getProperty('sendCount')) || 0;
  count += num;
  props.setProperty('sendCount', count);
}

function getEmailCount() {
  return Number(PropertiesService.getScriptProperties().getProperty('sendCount')) || 0;
}

function sendBulkEmails(userId) {
  if (!userId) return 0;
  var recipients = ['recipient1@example.com', 'recipient2@example.com'];
  var subject = 'Bulk Email';
  var body = 'Hello from the bulk mailer.';
  recipients.forEach(function(email) {
    MailApp.sendEmail(email, subject, body);
  });
  incrementEmailCount(recipients.length);
  return recipients.length;


}

function sendBulkEmailsUI(token) {
  var user = getUserFromToken(token);
  if (!user) return 'Unauthorized';
  sendBulkEmails(user.id);
  return 'Emails sent';
}
