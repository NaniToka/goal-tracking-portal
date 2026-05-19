const express = require('express');
const {
  getMyGoalSheet,
  updateMyGoalSheet,
  submitGoalSheet,
  updateAchievement,
  getEmployeeDashboard,
} = require('../controllers/goalController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateGoalSheetUpdate,
  validateGoalSheetSubmit,
  validateAchievement,
  validateYearParam,
} = require('../middleware/goalValidator');

const router = express.Router();

router.use(protect, authorize('employee'));

router.get('/dashboard', validateYearParam, getEmployeeDashboard);
router.get('/my-sheet', validateYearParam, getMyGoalSheet);
router.put('/my-sheet', validateGoalSheetUpdate, updateMyGoalSheet);
router.post('/submit', validateGoalSheetSubmit, submitGoalSheet);
router.patch('/achievement', validateAchievement, updateAchievement);

module.exports = router;
