const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [8, 'A password must have at least 8 character'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        //THIS. KEYWORD ONLY WORKS ON SAVE AND CREATE
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords must be equal',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// MIDDLEWARE TO CHECK IF THE PASSWORD HAS BEEN MODIFIED(IF YES SET THE VALUE)

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

//MIDDELWARE TO HIDE THE INACTIVE USERS

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//MIDDLEWARE TO HASH THE PASSWORD ON SAVE TO DATABASE
userSchema.pre('save', async function (next) {
  //RUN IF PASSWORD IS MODIFIED
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

//COMPARISON OF HASHED PASSWORD TO TO JUST SAVED ENCRYPTED PASSWORD FOR USER LOGIN
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //1) CREATE THE TOKEN
  const resetToken = crypto.randomBytes(32).toString('hex');

  //2) STORE THE ENCRYPTED TOKEN
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  //3) SET EXPIRATION TO 10 MIN LATER
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //4) RETURN THE TOKEN SO THEN WE CAN SEND IT VIA EMAIL
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
