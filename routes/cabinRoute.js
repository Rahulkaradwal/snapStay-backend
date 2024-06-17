const express = require('express');

const cabinController = require('../controllers/cabinController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(cabinController.getAllCabins)
  .post(
    cabinController.uploadCabinPhoto,
    cabinController.uploadPhotoToS3,
    cabinController.addCabin
  );

router
  .route('/:id')
  .get(cabinController.getCabin)
  .delete(cabinController.deleteCabin)
  .patch(
    cabinController.uploadCabinPhoto,
    cabinController.uploadPhotoToS3,
    cabinController.updateCabin
  );

module.exports = router;
