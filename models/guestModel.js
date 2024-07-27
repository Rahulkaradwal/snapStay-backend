const mongoose = require('mongoose');
const validator = require('validator');

const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is required'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    required: [true, 'Email is required'],
  },
  nationality: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

// hash the password when user signup
guestSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// compare password
guestSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check password
guestSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimeStamp < changedTimeStamp;
  }
  return false;
};

// create password Reset Token
guestSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 30 * 1000;
  return resetToken;
};

// to add password change date when user reset the password

guestSchema.pre('save', function (next) {
  // Only run this function if the password was actually modified or if the document is new
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  // Set passwordChangedAt to the current time minus 1 second
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

guestSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const Guest = mongoose.model('Guest', guestSchema);
module.exports = Guest;
