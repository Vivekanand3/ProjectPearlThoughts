const EmailService = require('../src/EmailService');

test('should send email successfully', async () => {
  const emailService = new EmailService();
  const emailOptions = { to: 'test@example.com', subject: 'Test', text: 'Hello', date: new Date().toISOString() };
  await emailService.sendEmail(emailOptions);
  const emailId = emailService.generateEmailId(emailOptions);
  expect(emailService.getEmailStatus(emailId)).toBe('Sent');
});
