const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewsRoutes');

const app = express();

// GLOBAL MIDDLEWARES

//SET SECURITY HTTP HEADERS
app.use(helmet());

console.log(process.env.NODE_ENV);

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMITER FOR REQUESTS FROM SAME IP(preventing brute force attacks)s
const limiter = rateLimit({
  max: 100,
  windowM: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

//BODY PARSER, middleware to be able to read the body of req
app.use(
  express.json({
    limit: '10kb',
  }),
);

//DATA SANITIZATION AGAINST noSQL DATA INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS
app.use(xss());

//PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.all('*', (req, res, next) => {
  // const err = new Error(`Cant find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // next(err);

  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
