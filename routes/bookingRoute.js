const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    bookingController.getAllBookings
  )
  .post(bookingController.addBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = router;
