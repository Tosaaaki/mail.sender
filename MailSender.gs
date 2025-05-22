function sendBulkEmails(userId) {
  if (!userId) return;
  var recipients = ['recipient1@example.com', 'recipient2@example.com'];
  var subject = 'Bulk Email';
  var body = 'Hello from the bulk mailer.';
  recipients.forEach(function(email) {
    MailApp.sendEmail(email, subject, body);
  });
}

function sendBulkEmailsUI() {
  var user = getUserFromToken('valid-token');
  if (!user) return 'Unauthorized';
  sendBulkEmails(user.id);
  return 'Emails sent';
}
