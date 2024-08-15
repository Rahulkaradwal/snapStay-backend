const Guest = require('../models/guestModel');
const CatchAsync = require('../utils/CatchAsync');
const handler = require('../utils/Handler');

// get all Guests
exports.getAllGuests = handler.getAll(Guest);

// get a Guest
exports.getGuest = handler.getOne(Guest);

// create Guest
exports.addGuest = handler.addOne(Guest);

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
    next(new AppError('Could not find the user'));
  }
});
