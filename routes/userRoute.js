const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/forgetPassword').post(authController.forgetPassword);
router.route('/resetPassword/:token').post(authController.resetPassword);

router.route('/updatePassword').post(authController.updatePassword);

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/').get(userController.getAllUsers).post(userController.addUser);

router.route('/:id').get(userController.getUser);

module.exports = router;
