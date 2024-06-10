const Cabin = require('../models/cabinModel');
const handler = require('../utils/Handler');

// get all cabins
exports.getAllCabins = handler.getAll(Cabin);

// get a cabin
exports.getCabin = handler.getOne(Cabin);

// create cabin
exports.addCabin = handler.addOne(Cabin);

// Update Cabin
exports.updateCabin = handler.updateOne(Cabin);

// Delete Cabin
exports.deleteCabin = handler.deleteOne(Cabin);
