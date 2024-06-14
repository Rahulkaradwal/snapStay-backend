const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router
  .route('/get-my-bookings')
  .get(authController.protect, bookingController.getMyBookings);

module.exports = router;
