const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// authentication routes
router.route('/forgetPassword').post(userController.forgotPassword);
router.route('/resetPassword/:token').post(userController.resetPassword);
router.route('/updatePassword').post(userController.updatePassword);
router.route('/signup').post(userController.signup);
router.route('/login').post(userController.login);
router
  .route('/currentUser')
  .get(userController.protect, userController.getCurrentUser);

// general routes
router.route('/').get(userController.getAllUsers).post(userController.addUser);

router
  .route('/updateUser/:id')
  .get(userController.protect, userController.getUser)
  .patch(userController.protect, userController.updateUser);

router
  .route('/name/:name')
  .get(
    userController.protect,
    authController.restrictTo('admin'),
    userController.getUsersByName
  );

router.get(
  '/me',
  userController.protect,
  userController.getMe,
  userController.getUser
);

router.route('/verifyemail/:token').get(userController.verifyEmail);

router
  .route('/updateMe')
  .patch(userController.protect, userController.updateMe);

router.delete(
  '/deleteUser/:id',
  userController.protect,
  authController.restrictTo('admin'),
  userController.deleteUser
);

router.delete('/deleteMe', userController.protect, userController.deleteMe);
module.exports = router;
