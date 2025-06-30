const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

//TO MAKE THE USE OF TOURID PARAM POSSIBLE
const router = express.Router({ mergeParams: true });

const {
  getAllReviews,
  getReviewById,
  postNewReview,
  deleteReviewById,
  updateReviewById,
  setTourUserIds,
} = require('../controllers/reviewsController');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, postNewReview);

router
  .route('/:id')
  .get(protect, getReviewById)
  .patch(protect, restrictTo('user'), updateReviewById)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteReviewById);

module.exports = router;
