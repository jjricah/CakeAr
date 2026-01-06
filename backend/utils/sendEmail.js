const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  // For development, a service like Mailtrap.io is perfect as it captures emails
  // in a fake inbox without sending them to real users.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2. Define the email options
  const message = {
    from: `${process.env.FROM_NAME || 'CREAKE'} <${process.env.FROM_EMAIL || 'noreply@creake.app'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Actually send the email
  await transporter.sendMail(message);
};

module.exports = sendEmail;