const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  minBookingLength: {
    type: Number,
    required: [true, 'Mininum Booking length is required'],
  },
  maxBookingLength: {
    type: Number,
    required: [true, 'Maximum Booking length is required'],
  },
  maxGuestsPerBooking: {
    type: Number,
    required: [true, 'Max guest per booking is required'],
  },
  breakfastPrice: {
    type: Number,
    required: [true, 'Breakfast Price is Required'],
  },
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
