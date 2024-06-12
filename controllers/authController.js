const User = require('../models/userModel');
const Handler = require('../utils/Handler');
const catchAsync = require('../utils/CatchAsync');
const signToken = require('../utils/SignToken');
const AppError = require('../utils/AppError');
const SignToken = require('../utils/SignToken');

// exports.addUser = Handler.addOne(User);

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

  const token = signToken(newUser._id.toString());

  res.status(200).json({
    status: 'success',
    token,
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, passowrd } = req.body;
  if (!email && !passowrd) {
    return next(new AppError('Please provide email and passowrd', 401));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user && !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect Password', 401));
  }

  const token = SignToken(user._id.toString());

  res.status(201).json({
    status: 'success',
    token,
    data: user,
  });
});
