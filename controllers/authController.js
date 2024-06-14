const User = require('../models/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const SignToken = require('../utils/SignToken');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/NodeMailer');

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
  console.log('reset url', resetUrl);

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
    console.log(err);
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
