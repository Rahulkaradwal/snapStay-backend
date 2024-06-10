const mongoose = require('mongoose');

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
    type: Number,
    required: [true, 'Price is required'],
  },
  discount: {
    type: Number,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cabin = mongoose.model('Cabin', cabinSchema);

module.exports = Cabin;
