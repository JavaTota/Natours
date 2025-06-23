const express = require('express');
const {
  getAllUsers,
  // createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  createUser,
} = require('../controllers/userController');

const { signUp, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
