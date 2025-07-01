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
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const reviewRouter = require('./reviewsRoutes');

const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');

//MOUNT THE REVIEW ROUTER FOR THIS URL
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

//PROTECT ALL ROUTES USING MIDDLEWARE

router.route('/').get(getAllTours).post(protect, postNewTour);

router.use(protect);

//ROUTES
router.route('/top-5-cheap').get(aliasTopTour, getAllTours);
router.route('/tour-stats').get(getTourStats);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTourById)
  .delete(deleteTourById);

router.use(restrictTo('admin', 'lead-guide', 'guide'));

router.route('/monthly-plan/:year').get(restrictTo('guide'), getMonthlyPlan);

module.exports = router;
