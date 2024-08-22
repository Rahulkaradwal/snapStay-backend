const Guest = require('../models/guestModel');
const CatchAsync = require('../utils/CatchAsync');
const handler = require('../utils/Handler');
const authController = require('../controllers/authController');

// signup Guest
exports.signup = authController.signup(Guest);

// login Guest
exports.login = authController.login(Guest);

// forgot password Guest
exports.forgetPassword = authController.forgetPassword(Guest);

// reset password Guest
exports.resetPassword = authController.resetPassword(Guest);

// update password Guest
exports.updatePassword = authController.updatePassword(Guest);

// protect guest
exports.protect = authController.protect(Guest);

// verify guest
exports.verifyEmail = authController.verifyEmail(Guest);

// get all Guests
exports.getAllGuests = handler.getAll(Guest);

// get a Guest
exports.getGuest = handler.getOne(Guest);

// Update Guest
exports.updateGuest = handler.updateOne(Guest);

// Delete Guest
exports.deleteGuest = handler.deleteOne(Guest);

exports.getGuestByName = CatchAsync(async (req, res, next) => {
  const lastName = req.params.lastName;
  try {
    const guests = await Guest.find({
      lastName: { $regex: lastName, $options: 'i' },
    });

    res.status(200).json({
      status: 'success',
      data: guests,
    });
  } catch (err) {
    return next(new AppError('Could not find the user'));
  }
});
