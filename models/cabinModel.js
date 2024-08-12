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
  bookingSettings: {
    type: mongoose.Schema.ObjectId,
    ref: 'Setting',
    required: [true, 'Booking Settings are requried'],
  },
  bookedDates: [
    {
      bookingId: {
        type: String,
        select: false,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
  ],
});

cabinSchema.pre(/^find/, function (next) {
  this.populate({ path: 'bookingSettings' });
  next();
});

// cabinSchema.pre(/^find/, function (next) {
//   this.populate({ path: 'bookings', select: 'startDate endDate ' });
//   next();
// });

const Cabin = mongoose.model('Cabin', cabinSchema);

module.exports = Cabin;
