const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router.route('/getAllBooking').get(bookingController.getAllBookings);
router
  .route('/getBooking/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

router.get(
  '/checkout-session/:cabinId',
  authController.guestProtect,
  bookingController.getCheckoutSession
);

router
  .route('/get-my-bookings')
  .get(authController.protect, bookingController.getMyBookings);

router.route('/getTodaysBooking').get(bookingController.getTodaysBooking);

router.route('/getLatestBooking').get(bookingController.getLatestBooking);

module.exports = router;
