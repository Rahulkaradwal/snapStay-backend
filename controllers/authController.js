const User = require('../models/userModel');
const Handler = require('../utils/Handler');

exports.addUser = Handler.addOne(User);
