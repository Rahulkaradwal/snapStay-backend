const User = require('../models/userModel');
const Handler = require('../utils/Handler');

exports.getUser = Handler.getOne(User);

exports.getAllUsers = Handler.getAll(User);

exports.addUser = Handler.addOne(User);
