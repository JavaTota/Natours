const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate field value: ${value}, Please use another value`;

  return new AppError(message, 400);
};

const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTErrorDB = () =>
  new AppError('Invalid token please login again', 401);

const handleJWTExpiredErrorDB = () =>
  new AppError('Your token has expired. Please sign in again ', 401);

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error('ERROR', err);
  //RENDERED ERROR IN WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  console.log(req.originalUrl);
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming or other unknown(unexpected) error: don't leak error details
    //1) log error
    console.error('ERROR', err);

    //2) Send general message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  //B) RENDER ERROR IN  WEBSITE
  //a)Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  //b)Programming or other unknown(unexpected) error: don't leak error details
  //1) log error
  console.error('ERROR', err);

  //2) Send general message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //Handling Programming or other unknown(unexpected) error: don't leak error details
    let error = Object.create(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidatorErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTErrorDB();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredErrorDB();
    }

    sendErrorProd(error, req, res);
  }
};
