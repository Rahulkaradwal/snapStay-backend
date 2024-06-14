const catchAsync = require('./CatchAsync');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAUTH_REFRESH_TOKEN =
  '1//04vEbeLGGLVoVCgYIARAAGAQSNwF-L9Irwp8WoVlQGRyeRicm1ERSWuQ3qaYflio4QVuQnr_rQtFHFSy7NfZg3IqQIT3oHVk5FsI';

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URL
);

oAuth2Client.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN });

const sendMail = catchAsync(async (options) => {
  console.log('options', options);
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'rahulkaradwal.dev@gmail.com',
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const mailOptions = {
    from: 'Rahul <rahulkaradwal.dev@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  console.log('mail options', mailOptions);
  await transporter.sendMail(mailOptions);
});

module.exports = sendMail;
