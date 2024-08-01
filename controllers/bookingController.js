const Booking = require('../models/bookingModel');
const handler = require('../utils/Handler');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const Cabin = require('../models/cabinModel');
const User = require('../models/userModel');
const Guest = require('../models/guestModel');

// stripe config
const frontEndURL = 'http://localhost:5173/';
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

// create Booking
// exports.addBooking = handler.addOne(Booking);

// Update Booking
exports.updateBooking = handler.updateOne(Booking);

// Delete Booking
exports.deleteBooking = handler.deleteOne(Booking);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const cabin = await Cabin.findById(req.params.cabinId);
  if (!cabin) {
    return next(
      new AppError('Sorry, could not find the Cabin. Please try again.', 404)
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${frontEndURL}rooms`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    customer_email: req.user.email,
    client_reference_id: req.params.cabinId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${cabin.name} Cabin`,
            description: `${cabin.description}`,
            images: [cabin.image],
          },
          unit_amount: cabin.regularPrice * 100, // Make sure regularPrice is in cents
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
  console.log('create booking checkout --------');
  try {
    const cabinId = session.client_reference_id;
    const guest = await Guest.findOne({ email: session.customer_email });
    if (!guest) {
      throw new AppError('Guest not found', 404);
    }
    const guestId = guest._id;
    const price = session.amount_total / 100; // Ensure amount_total is in cents

    console.log('details', cabinId, guestId, price);
    await Booking.create({ cabin: cabinId, guest: guestId, price });
  } catch (err) {
    console.log('Error in creating booking', err);
    return next(new AppError('Sorry! Error in Booking, please try again', 500));
  }
});

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  console.log('webhook ---------------', req.body);
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
    console.log('checkout session completed');
    await exports.createBookingCheckout(event.data.object, next);
  }

  res.status(200).json({ received: true });
});

// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   try {
//     const cabin = await Cabin.findById(req.params.cabinId);
//     if (!cabin) {
//       return next(
//         new AppError('Sorry Could not find the Cabin, please try again', 404)
//       );
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       success_url: `${frontEndURL}`,
//       cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
//       customer_email: req.user.email,
//       client_reference_id: req.params.cabinId,
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: `${cabin.name} Cabin`,
//               description: `${cabin.description}`,
//               images: [cabin.image],
//             },
//             unit_amount: cabin.regularPrice * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//     });

//     console.log('session --------', session);

//     res.status(200).json({
//       status: 'success',
//       session,
//     });
//   } catch (err) {
//     console.log('Error creating Checkout session', err);
//     return next(
//       new AppError(
//         'Sorry! Something went wrong while checkout, please try again later',
//         500
//       )
//     );
//   }
// });

// exports.createBookingCheckout = async (session) => {
//   try {
//     const cabin = session.client_refrence_id;
//     const guest = (await Guest.findOne({ email: session.customer_email })).id;
//     const price = session.unit_amount / 100;

//     console.log('details', cabin, guest, price);

//     await Booking.create({ cabin, guest, price });
//   } catch (err) {
//     console.log('Error in creating booking', err);
//     return next(new AppError('Sorry! Error in Booking, please try again', 500));
//   }
// };

// exports.webhookCheckout = catchAsync(async (req, res, next) => {
//   console.log('webhook', req.body);
//   const signature = req.headers['stripe-signature'];
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error('Webhook error:', err);
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }
//   if (event.type === 'checkout.session.completed') {
//     await exports.createBookingCheckout(event.data.object);
//   }

//   res.status(200).json({ received: true });
// });

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // all the bookings
  const bookings = await Booking.find({ user: req.user.id });

  // find cabin with return ids
  const cabinId = bookings.map((val) => val.cabin);
  const cabins = await Cabin.find({ _id: { $in: cabinId } });

  res.status(200).json({
    status: 'success',
    data: cabins,
  });
});
