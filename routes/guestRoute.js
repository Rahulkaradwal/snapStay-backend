const guestController = require('../controllers/guestController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const express = require('express');
const router = express.Router();

router.route('/forgetPassword').post(guestController.forgetPassword);
router.route('/resetPassword/:token').post(guestController.resetPassword);

router.route('/guestSignup').post(guestController.signup);
router.route('/guestLogin').post(guestController.login);

router
  .route('/currentGuest')
  .get(guestController.protect, guestController.getGuest);

router
  .route('/')
  .get(
    userController.protect,
    authController.restrictTo('admin'),
    guestController.getAllGuests
  )
  .post(guestController.signup);

router.route('/verifyemail/:token').get(guestController.verifyEmail);

router
  .route('/lastName/:lastName')
  .get(guestController.protect, guestController.getGuestByName);

router
  .route('/:id')
  .get(guestController.getGuest)
  .delete(
    userController.protect,
    authController.restrictTo('admin'),
    guestController.deleteGuest
  )
  .patch(
    userController.protect,
    authController.restrictTo('admin'),
    guestController.updateGuest
  );

module.exports = router;
