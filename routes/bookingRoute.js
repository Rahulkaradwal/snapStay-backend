const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router.route('/getAllBooking').get(bookingController.getAllBookings);
router
  .route('/getBooking/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(authController.guestProtect, bookingController.deleteBooking);

router.get(
  '/checkout-session/:cabinId',
  authController.guestProtect,
  bookingController.getCheckoutSession
);

router
  .route('/create-booking')
  .post(authController.guestProtect, bookingController.createBooking);

router
  .route('/get-my-bookings')
  .get(authController.guestProtect, bookingController.getMyBookings);

router.route('/getTodaysBooking').get(bookingController.getTodaysBooking);

router.route('/getLatestBooking').get(bookingController.getLatestBooking);

module.exports = router;
