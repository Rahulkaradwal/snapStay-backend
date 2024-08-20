const Booking = require('../models/bookingModel');
const handler = require('../utils/Handler');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const Cabin = require('../models/cabinModel');
const User = require('../models/userModel');
const Guest = require('../models/guestModel');
const sendMail = require('../utils/NodeMailer');

// stripe config
const STRIPE_WEBHOOK_SECRET = 'whsec_htrwehhghTLCgvH5prHvZyc0d1Iu4kfD';
// const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeSecretKey =
  'sk_test_51PKq1n02bTSpcbhuRA2ibFPkwKhQgFkl3Qcd7MZn0TQfSADlJz6XSYcy9TYet7xnWxVha7kYQni83B75R6K5zUVc00D24qjtkB';
const stripe = require('stripe')(stripeSecretKey);

// get all Bookings
exports.getAllBookings = handler.getAll(Booking);

// get a Booking
exports.getBooking = handler.getOne(Booking);

// get latest Bookings
exports.getLatestBooking = catchAsync(async (req, res, next) => {
  const { lastDate, todayDate } = req.query;

  try {
    const startDate = new Date(lastDate);
    const endDate = new Date(todayDate);

    const data = await Booking.aggregate([
      {
        $match: {
          $and: [
            { createdAt: { $gte: startDate } },
            { createdAt: { $lte: endDate } },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).send({
      data: data,
    });
  } catch (err) {
    next(new AppError('Something Went Wrong at Get latest Booking', err));
  }
});

exports.getTodaysBooking = catchAsync(async (req, res, next) => {
  const { today } = req.query;

  try {
    const todayDate = new Date(today); // Assuming todayDate is initialized correctly elsewhere

    const data = await Booking.find({
      $or: [
        {
          $and: [{ status: 'unconfirmed' }, { createdAt: { $gte: todayDate } }],
        },
        {
          $and: [{ status: 'checked-in' }, { endDate: { $lte: todayDate } }],
        },
      ],
    });

    res.status(201).send({ status: 'success', data });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    next(new AppError('Could not load todays Booking', 401));
  }
});

// });

// create Booking without Stripe and user can pay later at desk
exports.createBooking = handler.addBooking(Booking);

// Update Booking
exports.updateBooking = handler.updateOne(Booking);

// Delete Booking
exports.deleteBooking = handler.deleteOne(Booking);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({
    cabin: req.params.cabinId,
    guest: req.user.id,
  });
  if (!booking) {
    return next(
      new AppError('Sorry, could not find the Booking. Please try again.', 404)
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${process.env.FRONTEND_URL}/booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    customer_email: req.user.email,
    client_reference_id: req.params.cabinId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.cabin.name} Cabin`,
            description: `${booking.cabin.description}`,
            images: [booking.cabin.image],
            metadata: {
              bookingId: String(booking._id),
              guestId: String(booking.guest._id),
              startDate: String(booking.startDate),
              endDate: String(booking.endDate),
              numNights: String(booking.numNights),
              numGuests: String(booking.numGuests),
              price: String(booking.cabin.totalPrice),
            },
          },
          unit_amount: booking.totalPrice * 100, // Ensure regularPrice is in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (session, next) => {
  try {
    const cabinId = session.client_reference_id;

    const guest = await Guest.findOne({ email: session.customer_email });

    if (!guest) {
      return next(new AppError('Guest not found', 404));
    }
    const guestId = guest._id;

    const booking = await Booking.findOneAndUpdate(
      {
        guest: guestId,
        cabin: cabinId,
        isPaid: false,
        status: 'unconfirmed',
      },
      {
        isPaid: true,
        status: 'confirmed',
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    const cabin = await Cabin.findById(cabinId);

    const message = `Your Payment has been confirmed! 🎉
    Booking Details:
  - Payment ID: ${session.payment_intent}
  - Booking ID: ${booking._id}
  - Cabin: ${cabin.name}
  - Start Date: ${booking.startDate}
  - End Date: ${booking.endDate}
  - Number of Guests: ${booking.numGuests}
  - Number of Nights: ${booking.numNights}
  - Guest: ${guest.firstName} ${guest.lastName}
  - Total Price: ${booking.totalPrice}
  - Breakfast Included: ${data.hasBreakfast ? 'Yes' : 'No'}

   Thank you for choosing our service. We look forward to hosting you! If you have any questions or special requests, please don't hesitate to contact us.`;

    // send the mail
    try {
      sendMail({
        to: guest.email,
        subject: 'Payment Confirmation',
        message,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log('Error in creating booking', err);
    return next(new AppError('Sorry! Error in Booking, please try again', 500));
  }
});

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await exports.createBookingCheckout(event.data.object, next);
  }

  res.status(200).json({ received: true });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // all the bookings

  const bookings = await Booking.find({ guest: req.user.id });
  // console.log(bookings);

  if (!bookings) {
    return next(new AppError('No bookings found', 404));
  }

  // // find cabin with return ids
  // const cabinId = bookings.map((val) => val.cabin);
  // const cabins = await Cabin.find({ _id: { $in: cabinId } });

  res.status(200).json({
    status: 'success',
    data: bookings,
  });
});

// cancel booking

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.guest._id.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to cancel this booking', 401)
    );
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Booking already cancelled', 400));
  }

  // Update booking status to 'cancelled' and set isPaid to false
  booking.status = 'cancelled';
  booking.isPaid = false;
  await booking.save();

  const cabinData = await Cabin.findById(booking.cabin);
  const guestData = await Guest.findById(booking.guest);

  const message = `Your booking has been cancelled! 🎉
  Booking Details:
  - Booking ID: ${booking._id}
  - Cabin: ${cabinData.name}
  - Start Date: ${booking.startDate.toDateString()}
  - End Date: ${booking.endDate.toDateString()}
  - Number of Guests: ${booking.numGuests}
  - Number of Nights: ${booking.numNights}
  - Guest: ${guestData.firstName} ${guestData.lastName}
  - Total Price: ${booking.totalPrice}
  - Breakfast Included: ${booking.hasBreakfast ? 'Yes' : 'No'}
  
   If you have any questions or special requests, please don't hesitate to contact us.`;

  // send the mail
  try {
    sendMail({
      to: guestData.email,
      subject: 'Booking Cancelled',
      message,
    });
  } catch (err) {
    console.log(err);
  }

  // Update the cabin's bookedDates array by removing the canceled booking
  await Cabin.findByIdAndUpdate(
    booking.cabin,
    {
      $pull: {
        bookedDates: {
          bookingId: booking._id,
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
    message: 'Booking cancelled and refunded successfully',
  });
});

//  catch (err) {
//   console.log('Refund failed:', err);
//   return next(new AppError('Failed to process refund', 500));
// }
// });
