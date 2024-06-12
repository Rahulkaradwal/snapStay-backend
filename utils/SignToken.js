const jwt = require('jsonwebtoken');

const SignToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_EXPIRES_IN,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

module.exports = SignToken;
