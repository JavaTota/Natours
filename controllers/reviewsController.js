const Reviews = require('../models/reviewModels');
const APIFeatures = require('../utils/apifeatures');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY
  const features = new APIFeatures(Reviews.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await features.query;

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

exports.postNewReview = catchAsync(async (req, res, next) => {
  const newReview = await Reviews.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.deleteReviewById = catchAsync(async (req, res, next) => {
  const review = await Reviews.findByIdAndRemove(req.params.id);

  if (!review) {
    return next(new AppError('No Review found with that id', 404));
  }
  res.status(204).json({
    status: 'success',
  });
});
