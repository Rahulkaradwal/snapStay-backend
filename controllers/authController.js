const User = require('../models/userModel');
const Handler = require('../utils/Handler');
const catchAsync = require('../utils/CatchAsync');
const signToken = require('../utils/SignToken');

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
