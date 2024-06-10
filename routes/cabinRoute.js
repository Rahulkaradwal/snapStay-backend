const express = require('express');

const cabinController = require('../controllers/cabinController');

const router = express.Router();

router
  .route('/')
  .get(cabinController.getAllCabins)
  .post(cabinController.addCabin);

router
  .route('/:id')
  .get(cabinController.getCabin)
  .delete(cabinController.deleteCabin)
  .patch(cabinController.updateCabin);

module.exports = router;
