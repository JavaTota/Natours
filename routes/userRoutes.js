const express = require('express');
const {
  getAllUsers,
  // createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  updateMe,
  deleteMe,
  getMe,
  createOneUser,
} = require('../controllers/userController');

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//PROTECT ALL ROUTES USING MIDDLEWARE
router.use(protect);

router.patch('/updatePassword', updatePassword);

router.get('/me', getMe, getUserById);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

//RESTRICT TO ADMIN
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createOneUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
