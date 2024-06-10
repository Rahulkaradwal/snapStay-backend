const guestController = require('../controllers/guestController');

const express = require('express');
const router = express.Router();

router
  .route('/')
  .get(guestController.getAllGuests)
  .post(guestController.addGuest);

router
  .route('/:id')
  .get(guestController.getGuest)
  .delete(guestController.deleteGuest)
  .patch(guestController.updateGuest);

module.exports = router;
