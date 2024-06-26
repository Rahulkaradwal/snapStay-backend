const mongoose = require('mongoose');
const validator = require('validator');

const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    required: [true, 'Email is required'],
  },
  nationality: {
    type: String,
  },
  nationalID: {
    type: String,
  },
  countryFlag: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Guest = mongoose.model('Guest', guestSchema);
module.exports = Guest;
