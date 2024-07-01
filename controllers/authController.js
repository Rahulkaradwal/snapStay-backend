const User = require('../models/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const SignToken = require('../utils/SignToken');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/NodeMailer');
const crypto = require('crypto');

// user singup route
exports.signup = catchAsync(async (req, res, next) => {
  const userData = {
    fullName: req.body.fullName,
    email: req.body.email,
    nationality: req.body.nationality,
    nationalID: req.body.nationalID,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  const newUser = await User.create(userData);
  const user = {
    fullName: newUser.fullName,
    email: newUser.email,
    nationality: newUser.nationality,
    nationalID: newUser.nationalID,
  };

  const token = SignToken(newUser._id.toString());

  res.status(200).json({
    status: 'success',
    token,
    data: user,
  });
});

// user login route
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return next(new AppError('Please provide email and passowrd', 401));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user && !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect Password', 401));
  }
  const userData = {
    fullName: user.fullName,
    email: user.email,
    nationality: user.nationality,
    nationalID: user.nationalID,
    id: user._id,
  };

  const token = SignToken(user._id.toString());

  res.status(201).json({
    status: 'success',
    token,
    data: userData,
  });
});

// protect route for secure access

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if the authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is found, return an authorization error
  if (!token) {
    return next(
      new AppError(
        'Sorry, you are not authorized to access this resource.',
        401
      )
    );
  }

  // Verify the token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    if (!decoded) {
      throw new Error('Invalid token');
    }
  } catch (err) {
    return next(
      new AppError('Invalid or expired token, please log in again.', 401)
    );
  }

  // Check if the user still exists
  const freshUser = await User.findById(decoded.id).select('+role');

  if (!freshUser) {
    return next(new AppError('User not found, please log in again.', 401));
  }

  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login again', 401)
    );
  }

  // Attach the user to the request object
  req.user = freshUser;

  next();
});

// restrict access to route

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this this action',
          403
        )
      );
    }
    next();
  };
};

// route for forget password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide your email.', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'Shortly! You will receive a link to reset your password.',
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a request with your new password and passwordConfirm to: ${resetUrl}.\nIf you did not request this, please ignore this email.`;

  try {
    await sendMail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message:
        'If your email exists in our system, you will receive a reset token shortly.',
    });
  } catch (err) {
    console.log('nodemailer error', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.password && !req.body.confirmPassword) {
    return next(new AppError('Sorry! Please enter passwords again!', 401));
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('Sorry! No user found OR the token is expired', 401)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  try {
    await user.save();
    res.status(200).send('Password has been reset successfully');
  } catch (error) {
    return next(new AppError('Failed to reset password', 500));
  }

  const token = SignToken(user._id.toString());
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

// update current logged in user's password

exports.updatePassword = catchAsync(async (req, res, next) => {
  if (
    !req.body.password &&
    !req.body.oldPassword &&
    !req.body.confirmPassword
  ) {
    next(new AppError('Please enter the password correctly', 401));
  }

  const user = await User.findById(req.params.id).select('+password');

  if (!user) {
    return next(new AppError('Something went wrong! User not found', 401));
  }
  if (!(await user.comparePassword(oldPassword, user.password))) {
    return next(
      new AppError('Unauthroized! Please enter your current password', 401)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = undefined;
  await user.save();

  const token = SignToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
