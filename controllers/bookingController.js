const Booking = require('../models/bookingModel');
const handler = require('../utils/Handler');

// get all Bookings
exports.getAllBookings = handler.getAll(Booking);

// get a Booking
exports.getBooking = handler.getOne(Booking);

// create Booking
exports.addBooking = handler.addOne(Booking);

// Update Booking
exports.updateBooking = handler.updateOne(Booking);

// Delete Booking
exports.deleteBooking = handler.deleteOne(Booking);
