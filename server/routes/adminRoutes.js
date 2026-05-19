const express = require('express');
const {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
  unlockGoalSheet,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deactivateUser);
router.put('/goals/:sheetId/unlock', unlockGoalSheet);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
