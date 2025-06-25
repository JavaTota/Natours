const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOPtions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOPtions.secure = true;

  res.cookie('jwt', token, cookieOPtions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    role: req.body.role,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) CHECK IF EMAIL & PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 404));
  }

  //2) CHECK IF USER EXIST AND PASSWORD IS OKAY
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) IF EVERYTHING OKAY SEND TOKEN
  createSendToken(user, 200, res);
});

//CHECK IF USER HAS AUTHORIZATIONS
exports.protect = catchAsync(async (req, res, next) => {
  //1) GET THE TOKEN AND CHECK IF EXISTS
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, please login to get access', 401),
    );
  }
  //2) VERIFICATION TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) CHECK IF USER STILL EXIST
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists',
        401,
      ),
    );
  }

  //4) CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed  password. Please log in again', 401),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE

  req.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) GET USER BASED ON POSTED EMAIL
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  //2) GENERATE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  //turn off validators
  await user.save({ validateBeforeSave: false });

  //3) SEND IT TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Password? Submit a PATCH request with your new password and password confirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for ten minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'there was an error sending the email. Try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)GET USER BASED ON TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    //checking if token has expired
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) IF TOKEN HAS NOT EXPIRED, AND THE IS USER, SET NEW PASSWORD
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  //3)UPDATE changedPasswordAt PROPERTY FOR THE USER
  //4)LOG THE USER IN, SEND TOKEN
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) GET USER FROM COLLECTION
  const user = await User.findById(req.user.id).select('+password');

  if (!user) return next(new AppError('User does not exists', 500));

  //2)CHECK IF CURRENT PASSWORD IS CORRECT

  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('current password is incorrect', 401));

  //3) UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  //4)LOG IN USER SEND TOKEN
  createSendToken(user, 200, res);
});
