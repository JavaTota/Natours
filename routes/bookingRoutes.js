const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getCheckoutSession,
  getAllBooking,
  createBooking,
  getOneBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourID', protect, getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBooking).post(createBooking);

router
  .route('/:id')
  .get(getOneBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = router;
