const factory = require('./handlerFactory');
const Reviews = require('../models/reviewModels');

const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tours: req.params.tourId };

  const reviews = await Reviews.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tours) req.body.tours = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.postNewReview = factory.createOne(Reviews);
exports.updateReviewById = factory.updateOne(Reviews);
exports.deleteReviewById = factory.deleteOne(Reviews);
