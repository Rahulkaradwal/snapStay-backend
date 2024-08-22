const catchAsync = require('./CatchAsync');
const AppError = require('./AppError');
const QueryFeatures = require('./QueryFeatures');
const Cabin = require('../models/cabinModel');
const Guest = require('../models/guestModel');
const Booking = require('../models/bookingModel');
const sendMail = require('./NodeMailer');
const stripeSecretKey =
  'sk_test_51PKq1n02bTSpcbhuRA2ibFPkwKhQgFkl3Qcd7MZn0TQfSADlJz6XSYcy9TYet7xnWxVha7kYQni83B75R6K5zUVc00D24qjtkB';
const stripe = require('stripe')(stripeSecretKey);

// get all Model
exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filterVal = {};
    if (req.params.id) filterVal = { _id: req.params.id };

    const features = new QueryFeatures(Model.find(filterVal), req.query)
      .limit()
      .page()
      .filter()
      .sort();

    const data = await features.query;

    // Perform a separate count query without pagination
    const totalResult = await Model.countDocuments(filterVal);

    res.status(200).json({
      status: 'success',
      totalResult,
      data,
    });
  });
};
// get a Model

exports.getOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    try {
      const data = await Model.findById(req.params.id);
      if (!data) {
        res.status(400).json({
          status: 'success',
          data: null,
        });
      }
      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(new AppError('Something went wrong at get data', 400));
    }
  });
};

// create Model

exports.addOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    req.body.image = req.file.location;

    try {
      const data = await Model.create(req.body);
      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(new AppError('Could not Add data', 400));
    }
  });
};

exports.addBooking = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { startDate, endDate, cabin } = req.body;

    try {
      // Create the booking
      const data = await Model.create(req.body);

      // Update the cabin with the new booking ID and dates
      const cabinData = await Cabin.findByIdAndUpdate(
        cabin,
        {
          $push: {
            bookedDates: {
              bookingId: data._id,
              startDate,
              endDate,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      // get the guest email

      const guest = await Guest.findById(data.guest);

      // send the mail

      const message = `Your booking has been confirmed! 🎉
      Booking Details:
      - Cabin: ${cabinData.name} 
      - Booking ID: ${data._id}
      - Total Price: $${data.totalPrice}
      - Dates: ${data.startDate.toDateString()} to ${data.endDate.toDateString()} (${
        data.numNights
      } nights)
      - Number of Guests: ${data.numGuests}
      - Breakfast Included: ${data.hasBreakfast ? 'Yes' : 'No'}

      Thank you for choosing our service. We look forward to hosting you! If you have any questions or special requests, please don't hesitate to contact us.`;

      try {
        sendMail({
          to: guest.email,
          subject: 'Booking Confirmation',
          message,
        });
      } catch (err) {
        console.log(err);
      }

      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(new AppError('Could not add Booking', 400));
    }
  });
};

// Update Model

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    if (req.body?.status === 'checked-out') {
      try {
        const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!data) {
          next(new AppError('No data found with that ID', 404));
        }
        // update the bookedDates array with the booking ID
        await Cabin.findByIdAndUpdate(
          data.cabin,
          {
            $pull: {
              bookedDates: {
                bookingId: data._id,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
        res.status(200).json({
          status: 'success',
          data: data,
        });
      } catch (err) {
        next(new AppError('Server Error, Could not update the data ', 400));
      }
    } else
      try {
        const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!data) {
          next(new AppError('No data found with that ID', 404));
        }
        res.status(200).json({
          status: 'success',
          data: data,
        });
      } catch (err) {
        next(new AppError('Server Error, Could not update the data ', 400));
      }
  });
};

// Delete Model

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    let data;

    if (Model === Booking) {
      try {
        // Find the booking to be deleted
        data = await Model.findByIdAndDelete(req.params.id);
        if (!data) {
          return next(new AppError('Sorry, no data found', 404));
        }
        // Update the Cabin bookedDates field by removing the deleted booking
        await Cabin.findByIdAndUpdate(
          data.cabin, // Assuming 'data.cabin' contains the cabin ID
          {
            $pull: {
              bookedDates: {
                bookingId: data._id,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        res.status(204).json({
          status: 'success',
          data: null,
        });
      } catch (err) {
        next(
          new AppError('Internal server error, could not delete the data', 500)
        );
      }
    } else {
      try {
        // For other models, simply delete the document by ID
        data = await Model.findByIdAndDelete(req.params.id);
        if (!data) {
          return next(new AppError('Sorry, no data found', 404));
        }

        res.status(204).json({
          status: 'success',
          data: null,
        });
      } catch (err) {
        next(
          new AppError('Internal server error, could not delete the data', 500)
        );
      }
    }
  });
};
