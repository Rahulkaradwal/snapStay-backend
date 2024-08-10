const guestController = require('../controllers/guestController');

const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router.route('/forgetPassword').post(authController.forgetGuestPassword);
router.route('/resetPassword/:token').post(authController.resetGuestPassword);

router.route('/guestSignup').post(authController.guestSingup);
router.route('/guestLogin').post(authController.guestLogin);

router
  .route('/currentGuest')
  .get(authController.guestProtect, guestController.getGuest);

router
  .route('/')
  .get(guestController.getAllGuests)
  .post(guestController.addGuest);

router.route('/verifyemail/:token').get(authController.verifyEmail);

router
  .route('/:id')
  .get(guestController.getGuest)
  .delete(guestController.deleteGuest)
  .patch(guestController.updateGuest);

module.exports = router;
