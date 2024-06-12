const express = require('express');

const userController = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.addUser);

router.route('/').get(userController.getAllUsers).post(userController.addUser);

router.route('/:id').get(userController.getUser);

module.exports = router;
