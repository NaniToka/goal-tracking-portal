const express = require('express');
const {
  login,
  refresh,
  logout,
  getMe,
  verifyToken,
  changePassword,
  getSessions,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  handleValidation,
  loginRules,
  refreshRules,
  changePasswordRules,
} = require('../middleware/validateAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Public
router.post('/login', loginRules, handleValidation, asyncHandler(login));
router.post('/refresh', refreshRules, handleValidation, asyncHandler(refresh));

// Protected
router.get('/me', protect, asyncHandler(getMe));
router.post('/verify', protect, asyncHandler(verifyToken));
router.post('/logout', protect, asyncHandler(logout));
router.put('/change-password', protect, changePasswordRules, handleValidation, asyncHandler(changePassword));
router.get('/sessions', protect, asyncHandler(getSessions));

module.exports = router;
