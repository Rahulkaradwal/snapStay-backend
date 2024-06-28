const settingsController = require('../controllers/settingsController');

const express = require('express');
const router = express.Router();

router
  .route('/')
  .post(settingsController.addSettings)
  .get(settingsController.getSettings);

router
  .route('/:id')
  .patch(settingsController.updateSettings)
  .delete(settingsController.deleteSettings);

module.exports = router;
