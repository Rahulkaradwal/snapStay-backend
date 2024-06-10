const Guest = require('../models/guestModel');
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
