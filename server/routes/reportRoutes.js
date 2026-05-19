const express = require('express');
const { exportReport, getAnalytics } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/export', authorize('employee', 'manager', 'admin'), exportReport);
router.get('/analytics', authorize('manager', 'admin'), getAnalytics);

module.exports = router;
