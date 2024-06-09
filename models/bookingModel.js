const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    default: Date.now(),
    required: [true, 'Date is Required'],
  },
  endDate: {
    type: Date,
    default: Date.now(),
    required: [true, 'Date is Required'],
  },
  numNights: {
    type: Number,
    required: [true, 'Number of Nights is required'],
  },
  numGuests: {
    type: Number,
    required: [true, 'Number of guest is required'],
  },
  cabinPrice: {
    type: Number,
    required: [true, 'Cabin price is required'],
  },
  extraPrice: {
    type: Number,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total Price is required'],
  },
  status: {
    type: String,
    enum: ['confirmed', 'unconfirmed'],
    default: 'unconfirmed',
    required: [true, 'Number of Nights is required'],
  },
  hasBreakfast: {
    type: Boolean,
    required: [true, 'Breakfast is required'],
  },
  isPaid: {
    type: Boolean,
    required: [true, 'IsPaid is required'],
  },
  observations: {
    type: String,
  },
  cabin: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cabin',
    required: [true, 'Cabin is required'],
  },
  guest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Guest',
    required: [true, 'guest is required'],
  },
  createdAt: {
    type: date,
    default: Date.now(),
  },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
