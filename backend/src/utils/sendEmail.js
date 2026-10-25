const nodemailer = require('nodemailer');

let transporter;

// Create test or SMTP transporter
const initTransporter = async () => {
  if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback or Ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service Initialized] Test Ethereal Account: ${testAccount.user}`);
    } catch (e) {
      console.warn('[Email Service Fallback] Logging emails to console only.');
      transporter = {
        sendMail: async (opts) => {
          console.log(`[SIMULATED EMAIL TO ${opts.to}]: Subject: ${opts.subject}`);
          return { messageId: 'simulated-' + Date.now() };
        },
      };
    }
  }
};

initTransporter();

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) await initTransporter();
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"EV Charge Hub" <no-reply@evchargehub.com>',
      to,
      subject,
      text,
      html,
    });
    console.log(`Email dispatched: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) console.log(`Preview Email: ${testUrl}`);
    }
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
  }
};

module.exports = sendEmail;
