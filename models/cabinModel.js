const mongoose = require('mongoose');
const { type } = require('os');
const { float, double } = require('webidl-conversions');

const cabinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must belong to cabin'],
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Capacity is required'],
  },
  regularPrice: {
    type: double,
    required: [true, 'Price is required'],
  },
  discount: {
    type: double,
  },
  description: {
    type: String,
  },
  image: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

const Cabin = mongoose.model('Cabin', cabinSchema);

module.exports = Cabin;
