const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// authentication routes
router.route('/forgetPassword').post(authController.forgetPassword);
router.route('/resetPassword/:token').post(authController.resetPassword);
router.route('/updatePassword').post(authController.updatePassword);
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router
  .route('/currentUser')
  .get(authController.protect, userController.getCurrentUser);

// general routes
router.route('/').get(userController.getAllUsers).post(userController.addUser);

router.route('/:id').get(userController.getUser);

router.route('/name/:name').get(userController.getUsersByName);

router.get('/me', userController.getMe, userController.getUser);

router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

router.delete(
  '/deleteUser/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.deleteUser
);

router.delete('/deleteMe', authController.protect, userController.deleteMe);
module.exports = router;
