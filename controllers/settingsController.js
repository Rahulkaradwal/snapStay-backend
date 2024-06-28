const Settings = require('../models/settingsModel');
const Handler = require('../utils/Handler');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

exports.getSettings = Handler.getAll(Settings);

exports.updateSettings = Handler.updateOne(Settings);

exports.addSettings = Handler.addOne(Settings);

exports.deleteSettings = Handler.deleteOne(Settings);
