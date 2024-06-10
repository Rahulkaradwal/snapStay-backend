const bookingController = require('../controllers/bookingController');

const express = require('express');
const router = express.Router();

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.addBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = router;
