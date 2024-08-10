const User = require('../models/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const SignToken = require('../utils/SignToken');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/NodeMailer');
const crypto = require('crypto');
const Guest = require('../models/guestModel');

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

// guest signup route

exports.guestSingup = catchAsync(async (req, res, next) => {
  // check existing guest
  const guestEmail = await Guest.findOne({ email: req.body.email });
  if (guestEmail) {
    return next(new AppError('Email already exists', 400));
  }

  const guestData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    nationality: req.body.nationality,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  const newGuest = await Guest.create(guestData);

  // send verification email
  const verificationToken = newGuest.createVerificationToken();
  await newGuest.save({ validateBeforeSave: false });

  const message = `Your verification token is ${verificationToken} \n\n Please click on the link below, this link will expire in 24 hours \n\n ${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  try {
    await sendMail({
      to: newGuest.email,
      subject: 'Verification Email',
      message,
    });
  } catch (err) {
    newGuest.verificationToken = undefined;
    newGuest.verificationTokenExpires = undefined;
    await newGuest.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }

  // const token = SignToken(newGuest._id.toString());

  res.status(201).json({
    status: 'success',
    message:
      'Signup successful! Please verify your email to complete the registration.',
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

  if (!(await user.comparePassword(password, user.password))) {
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

// guest login route

exports.guestLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 401));
  }

  const guest = await Guest.findOne({ email }).select('+password');
  if (!guest) {
    return next(new AppError('Guest not found', 404));
  }

  if (!(await guest.compareGuestPassword(password, guest.password))) {
    return next(new AppError('Incorrect Password', 401));
  }

  const guestData = {
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    nationality: guest.nationality,
    phoneNumber: guest.phoneNumber,
    id: guest._id,
  };

  const token = SignToken(guest._id.toString());

  res.status(200).json({
    status: 'success',
    token,
    data: guestData,
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

// protect route for guest
exports.guestProtect = catchAsync(async (req, res, next) => {
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

  // Check if the guest still exists
  const freshGuest = await Guest.findById(decoded.id).select('+role');

  if (!freshGuest) {
    return next(new AppError('User not found, please log in again.', 401));
  }

  if (freshGuest.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login again', 401)
    );
  }

  // Attach the user to the request object
  req.user = freshGuest;

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

// route for forget password for users
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return next(new AppError('Please provide your email.', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      status: 'failed',
      message: 'No user found with that email',
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
      message: 'You will receive a reset link in your email shortly.',
    });
  } catch (err) {
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

// route for forget password for guests
exports.forgetGuestPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return next(new AppError('Please provide your email.', 400));
  }

  const user = await Guest.findOne({ email });

  if (!user) {
    return res.status(200).json({
      status: 'failed',
      message: 'No user found with that email',
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
      message: 'You will receive a reset link in your email shortly.',
    });
  } catch (err) {
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

// verification route

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const guest = await Guest.findOne({
    verificationToken: req.params.token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  console.log('guest', guest);

  if (!guest) {
    return next(
      new AppError('Verification token is invalid or has expired', 401)
    );
  }

  guest.isVerified = true;
  guest.verificationToken = undefined;
  guest.verificationTokenExpires = undefined;
  await guest.save();
  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now login',
  });
});
