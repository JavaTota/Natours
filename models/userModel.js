const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  photo: String,
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
      //THIS. KEYWORD ONLY WORKS ON ONLY ON SAVE AND CREATE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords must be equal',
    },
  },
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

const User = mongoose.model('User', userSchema);

module.exports = User;
