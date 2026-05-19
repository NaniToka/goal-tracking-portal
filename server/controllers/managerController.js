const GoalSheet = require('../models/GoalSheet');
const User = require('../models/User');
const {
  calculateSheetProgress,
  calculateGoalProgress,
} = require('../utils/progressCalculator');
const { logAudit } = require('../middleware/auditLogger');

function enrichTeamSheet(sheet, quarter) {
  const goals = sheet.goals.map((goal) => {
    const g = goal.toObject();
    const qa = g.quarterlyAchievements?.find((q) => q.quarter === quarter);
    g.computedProgress = calculateGoalProgress(g, qa);
    return g;
  });
  return {
    ...sheet.toObject(),
    goals,
    overallProgress: calculateSheetProgress(sheet.goals, quarter),
    plannedProgress: 100,
    actualProgress: calculateSheetProgress(sheet.goals, quarter),
  };
}

/**
 * GET /api/manager/team
 */
exports.getTeamMembers = async (req, res, next) => {
  try {
    const team = await User.find({ manager: req.user._id, role: 'employee', isActive: true })
      .select('name email department employeeId')
      .sort('name');
    res.json({ success: true, team });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/manager/team-goals
 */
exports.getTeamGoals = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const quarter = req.query.quarter || 'Q1';
    const status = req.query.status;

    const teamIds = await User.find({ manager: req.user._id, role: 'employee' }).distinct('_id');

    const filter = { employee: { $in: teamIds }, year };
    if (status) filter.status = status;

    const sheets = await GoalSheet.find(filter)
      .populate('employee', 'name email department employeeId')
      .sort('-updatedAt');

    const enriched = sheets.map((s) => enrichTeamSheet(s, quarter));
    res.json({ success: true, teamGoals: enriched, quarter });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/manager/dashboard
 */
exports.getManagerDashboard = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const quarter = req.query.quarter || 'Q1';
    const teamIds = await User.find({ manager: req.user._id, role: 'employee' }).distinct('_id');

    const sheets = await GoalSheet.find({ employee: { $in: teamIds }, year });

    const stats = {
      teamSize: teamIds.length,
      pendingApproval: sheets.filter((s) => s.status === 'submitted').length,
      approved: sheets.filter((s) => s.status === 'approved').length,
      rework: sheets.filter((s) => s.status === 'rework').length,
      avgProgress:
        sheets.length > 0
          ? Math.round(
              (sheets.reduce((sum, s) => sum + calculateSheetProgress(s.goals, quarter), 0) /
                sheets.length) *
                100
            ) / 100
          : 0,
    };

    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/manager/goals/:sheetId/approve
 */
exports.approveGoals = async (req, res, next) => {
  try {
    const sheet = await GoalSheet.findById(req.params.sheetId).populate('employee');

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    const employee = await User.findById(sheet.employee._id);
    if (employee.manager?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this team member.' });
    }

    sheet.status = 'approved';
    sheet.isLocked = true;
    sheet.approvedAt = new Date();
    sheet.approvedBy = req.user._id;
    sheet.rejectionReason = '';
    await sheet.save();

    await logAudit({
      goalSheetId: sheet._id,
      changedBy: req.user._id,
      action: 'approve',
      description: 'Goals approved and locked',
    });

    res.json({ success: true, goalSheet: sheet, message: 'Goals approved successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/manager/goals/:sheetId/reject
 */
exports.rejectGoals = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const sheet = await GoalSheet.findById(req.params.sheetId).populate('employee');

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    sheet.status = 'rejected';
    sheet.isLocked = false;
    sheet.rejectionReason = reason || 'Rejected by manager';
    await sheet.save();

    res.json({ success: true, goalSheet: sheet });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/manager/goals/:sheetId/rework
 */
exports.returnForRework = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const sheet = await GoalSheet.findById(req.params.sheetId);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    sheet.status = 'rework';
    sheet.isLocked = false;
    sheet.managerNotes = notes || 'Please revise your goals.';
    await sheet.save();

    res.json({ success: true, goalSheet: sheet });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/manager/goals/:sheetId/edit
 */
exports.editTeamGoal = async (req, res, next) => {
  try {
    const { goals } = req.body;
    const sheet = await GoalSheet.findById(req.params.sheetId);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    if (sheet.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit targets/weightages for submitted goals.',
      });
    }

    const oldGoals = JSON.parse(JSON.stringify(sheet.goals));
    sheet.goals = goals;
    await sheet.save();

    await logAudit({
      goalSheetId: sheet._id,
      changedBy: req.user._id,
      action: 'manager_edit',
      oldValue: oldGoals,
      newValue: goals,
      description: 'Manager inline edit of targets and weightages',
    });

    res.json({ success: true, goalSheet: sheet });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/manager/goals/:sheetId/comment
 */
exports.addCheckInComment = async (req, res, next) => {
  try {
    const { goalId, quarter, comment } = req.body;
    const sheet = await GoalSheet.findById(req.params.sheetId);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    const goal = sheet.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    goal.managerComments.push({
      quarter,
      comment,
      author: req.user._id,
    });

    if (sheet.isLocked) {
      await logAudit({
        goalSheetId: sheet._id,
        changedBy: req.user._id,
        action: 'check_in_comment',
        field: `goal.${goalId}`,
        newValue: comment,
        description: `Manager check-in comment for ${quarter}`,
      });
    }

    await sheet.save();
    res.json({ success: true, goalSheet: sheet });
  } catch (error) {
    next(error);
  }
};
