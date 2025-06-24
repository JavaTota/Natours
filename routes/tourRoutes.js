const express = require('express');
const {
  getAllTours,
  postNewTour,
  getTourById,
  updateTourById,
  deleteTourById,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');

//PARAM MIDDLEWARE
// router.param('id', checkId);

//ROUTES

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, getAllTours).post(postNewTour);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTourById)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTourById);

module.exports = router;
