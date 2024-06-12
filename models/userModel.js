const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    required: [true, 'Email is required'],
  },
  role: {
    type: String,
    default: 'guest',
    enum: ['admin', 'guest'],
    select: false,
  },
  nationality: {
    type: String,
  },
  nationalID: {
    type: String,
  },
  //   countryFlag: {
  //     type: String,
  //   },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    select: false,
  },
});

// hash the password when user signup
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// compare password
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check password change after

userSchema.methods.changePasswordAfter = async function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimeStamp < changedTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
