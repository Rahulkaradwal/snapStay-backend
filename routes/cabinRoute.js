const Cabin = require('../models/cabinModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
// const { findByIdAndUpdate } = require('../models/bookingModel');
const handler = require('../utils/Handler');

// get all cabins
exports.getAllCabin = handler.getAll(Cabin);

// get a cabin
exports.getCabin = handler.getOne(Cabin);

// create cabin
exports.addCabin = handler.addOne(Cabin);

// Update Cabin
exports.updateCabin = handler.updateOne(Cabin);

// Delete Cabin
exports.deleteCabin = handler.deleteOne(Cabin);
