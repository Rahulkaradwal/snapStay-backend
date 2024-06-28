const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  minBookingLength: {
    type: Number,
    required: [true, 'Min Booking Length is required'],
  },
  maxBookingLength: {
    type: Number,
    required: [true, 'Max Booking Length is required'],
  },
  maxGuestPerBooking: {
    type: Number,
    required: [true, 'Max Guest Per Booking Detail is required'],
  },
  breakfastPrice: {
    type: Number,
    required: [true, 'Breakfast Price is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
