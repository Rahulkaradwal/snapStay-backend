const User = require('../models/userModel');
const Handler = require('../utils/Handler');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

const filterField = (value, ...allowedFileds) => {
  let obj = {};
  Object.keys(value).forEach((el) => {
    if (allowedFileds.includes(el)) {
      obj[el] = value[el];
    }
  });
  return obj;
};

exports.getUser = Handler.getOne(User);

exports.getAllUsers = Handler.getAll(User);

exports.addUser = Handler.addOne(User);

exports.deleteUser = Handler.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('Sorry! you can not update the password', 401));
  }

  const limitFields = filterField(req.body, 'fullName');

  const userUpdate = await User.findByIdAndUpdate(req.user.id, limitFields, {
    new: true,
    runValidators: true,
  });

  if (!userUpdate) {
    return next(
      new AppError('Something went wrong! Could not update the data', 401)
    );
  }
  res.status(200).json({
    status: 'success',
    data: userUpdate,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
