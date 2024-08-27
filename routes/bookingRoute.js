const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const guestController = require('../controllers/guestController');
const userController = require('../controllers/userController');

const express = require('express');
const router = express.Router();

router
  .route('/getAllBooking')
  .get(userController.protect, bookingController.getAllBookings);

router
  .route('/deleteBooking/:id')
  .delete(userController.protect, bookingController.deleteBooking);

router
  .route('/getBooking/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(guestController.protect, bookingController.deleteBooking);

router.get(
  '/checkout-session/:cabinId',
  guestController.protect,
  bookingController.getCheckoutSession
);

router.get(
  '/cancelBooking/:bookingId',
  guestController.protect,
  bookingController.cancelBooking
);

router
  .route('/create-booking')
  .post(guestController.protect, bookingController.createBooking);

router
  .route('/get-my-bookings')
  .get(guestController.protect, bookingController.getMyBookings);

router.route('/getTodaysBooking').get(bookingController.getTodaysBooking);

router.route('/getLatestBooking').get(bookingController.getLatestBooking);

module.exports = router;
