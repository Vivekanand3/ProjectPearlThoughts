const MockProvider1 = require('./providers/MockProvider1');
const MockProvider2 = require('./providers/MockProvider2');

class EmailService {
  constructor() {
    this.provider1 = new MockProvider1();
    this.provider2 = new MockProvider2();
    this.currentProvider = this.provider1;
    this.sentEmails = new Set();
    this.emailQueue = [];
    this.rateLimit = 5;
    this.emailsSent = 0;
    this.emailStatus = {};

    setInterval(() => {
      this.emailsSent = 0;
      this.processQueue();
    }, 60000);
  }

  switchProvider() {
    this.currentProvider = this.currentProvider === this.provider1 ? this.provider2 : this.provider1;
  }

  async retryWithBackoff(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        await fn();
        return;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
  }

  generateEmailId(emailOptions) {
    return `${emailOptions.to}-${emailOptions.subject}-${emailOptions.date}`;
  }

  async sendEmail(emailOptions) {
    const emailId = this.generateEmailId(emailOptions);
    if (this.sentEmails.has(emailId)) {
      console.log('Email already sent');
      return;
    }

    if (this.emailsSent >= this.rateLimit) {
      this.emailQueue.push(emailOptions);
      return;
    }

    try {
      await this.retryWithBackoff(() => this.currentProvider.sendMail(emailOptions));
      this.sentEmails.add(emailId);
      this.emailStatus[emailId] = 'Sent';
      this.emailsSent++;
    } catch (error) {
      this.switchProvider();
      await this.retryWithBackoff(() => this.currentProvider.sendMail(emailOptions));
      this.sentEmails.add(emailId);
      this.emailStatus[emailId] = 'Sent';
      this.emailsSent++;
    }
  }

  async processQueue() {
    while (this.emailQueue.length > 0 && this.emailsSent < this.rateLimit) {
      const emailOptions = this.emailQueue.shift();
      if (emailOptions) {
        await this.sendEmail(emailOptions);
      }
    }
  }

  getEmailStatus(emailId) {
    return this.emailStatus[emailId] || 'Not Sent';
  }
}

module.exports = EmailService;
