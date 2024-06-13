const CatchAsync = require('./CatchAsync');
const nodemailer = require('nodemailer');

const sendMail = CatchAsync(async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'host',
    port: 'port',
    auth: {
      user: 'user',
      pass: 'pass',
    },
  });
  const mailOptions = {
    from: '',
    to: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
});

module.exports = sendMail;
