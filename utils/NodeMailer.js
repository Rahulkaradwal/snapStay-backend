const catchAsync = require('./CatchAsync');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URL
);

// Set the initial refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

async function getAccessToken() {
  try {
    // Automatically refresh the access token using the stored refresh token
    const { token } = await oAuth2Client.getAccessToken();

    return token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

const sendMail = catchAsync(async (options) => {
  const accessToken = await getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'rahulkaradwal.dev@gmail.com',
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: 'SnapStay <rahulkaradwal.dev@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
});

module.exports = sendMail;
