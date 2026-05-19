const express = require('express');
const {
  getTeamMembers,
  getTeamGoals,
  getManagerDashboard,
  approveGoals,
  rejectGoals,
  returnForRework,
  editTeamGoal,
  addCheckInComment,
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('manager', 'admin'));

router.get('/dashboard', getManagerDashboard);
router.get('/team', getTeamMembers);
router.get('/team-goals', getTeamGoals);
router.put('/goals/:sheetId/approve', approveGoals);
router.put('/goals/:sheetId/reject', rejectGoals);
router.put('/goals/:sheetId/rework', returnForRework);
router.put('/goals/:sheetId/edit', editTeamGoal);
router.post('/goals/:sheetId/comment', addCheckInComment);

module.exports = router;
