const factory = require('./handlerFactory');
const Reviews = require('../models/reviewModels');

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = factory.getAll(Reviews);
exports.getReviewById = factory.getOne(Reviews);
exports.postNewReview = factory.createOne(Reviews);
exports.updateReviewById = factory.updateOne(Reviews);
exports.deleteReviewById = factory.deleteOne(Reviews);
