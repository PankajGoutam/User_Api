const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers
} = require('../Controllers/UserController');

const {authenticateUser} = require('../Middleware/authenticateUser');

const {loginValidator,
  registerValidator
} = require('../Utils/validator');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Publicly accessible route to get user profile by ID
router.get('/profile',authenticateUser,getUserProfile);
router.get('/',authenticateUser,getAllUsers);

// // Protected routes for update and delete operations
router.post('/update', authenticateUser, updateUserProfile);
router.delete('/delete', authenticateUser, deleteUser);

module.exports = router;
