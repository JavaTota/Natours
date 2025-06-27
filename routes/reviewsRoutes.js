const express = require('express');

const router = express.Router();

const {
  getAllReviews,
  getReviewById,
  postNewReview,
  deleteReviewById,
} = require('../controllers/reviewsController');

const { protect, restrictTo } = require('../controllers/authController');

router.route('/').get(protect, getAllReviews).post(protect, postNewReview);

router
  .route('/:id')
  .get(protect, getReviewById)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteReviewById);

module.exports = router;
