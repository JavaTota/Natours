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

router.use(protect);

router
  .route('/')
  .get(setTourUserIds, getAllReviews)
  .post(restrictTo('user'), setTourUserIds, postNewReview);

router
  .route('/:id')
  .get(getReviewById)
  .patch(restrictTo('admin', 'user'), updateReviewById)
  .delete(restrictTo('admin', 'user'), deleteReviewById);

module.exports = router;
