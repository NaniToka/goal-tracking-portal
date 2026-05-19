const GoalSheet = require('../models/GoalSheet');
const User = require('../models/User');
const { 
  validateGoalSheet, 
  validateGoalSheetDraft,
  validateAchievementUpdate,
  validateYear,
} = require('../utils/goalValidation');
const {
  calculateGoalProgress,
  calculateSheetProgress,
} = require('../utils/progressCalculator');
const { logAudit } = require('../middleware/auditLogger');

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function initQuarterlyAchievements() {
  return QUARTERS.map((quarter) => ({
    quarter,
    achievement: 0,
    status: 'not_started',
    progress: 0,
  }));
}

function enrichGoalsWithProgress(goals, quarter) {
  return goals.map((goal) => {
    const g = goal.toObject ? goal.toObject() : { ...goal };
    const qa = g.quarterlyAchievements?.find((q) => q.quarter === quarter);
    g.computedProgress = calculateGoalProgress(g, qa);
    return g;
  });
}

/**
 * GET /api/goals/my-sheet
 */
exports.getMyGoalSheet = async (req, res, next) => {
  try {
    const year = Number.parseInt(req.query.year, 10) || new Date().getFullYear();
    
    if (!validateYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Valid years are 2024-2028.',
      });
    }
    
    let sheet = await GoalSheet.findOne({ employee: req.user._id, year }).populate(
      'employee',
      'name email department'
    );

    if (!sheet) {
      sheet = await GoalSheet.create({
        employee: req.user._id,
        year,
        goals: [],
        status: 'draft',
      });
      sheet = await sheet.populate('employee', 'name email department');
    }

    const quarter = req.query.quarter || 'Q1';
    const goalsWithProgress = enrichGoalsWithProgress(sheet.goals, quarter);
    const overallProgress = calculateSheetProgress(sheet.goals, quarter);

    res.json({
      success: true,
      goalSheet: sheet,
      goalsWithProgress,
      overallProgress,
      quarter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/goals/my-sheet
 */
exports.updateMyGoalSheet = async (req, res, next) => {
  try {
    const year = Number.parseInt(req.body.year, 10) || new Date().getFullYear();
    const { goals } = req.body;

    if (!validateYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Valid years are 2024-2028.',
      });
    }

    // Validate goals (draft mode - less strict)
    const validation = validateGoalSheetDraft(goals);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(' '),
      });
    }

    let sheet = await GoalSheet.findOne({ employee: req.user._id, year });

    if (!sheet) {
      sheet = new GoalSheet({ employee: req.user._id, year, goals: [], status: 'draft' });
    }

    if (sheet.isLocked && sheet.status === 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Goal sheet is locked. Contact admin to unlock.',
      });
    }

    if (!['draft', 'rework', 'rejected'].includes(sheet.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit goals in current status.',
      });
    }

    const goalsWithQuarters = (goals || []).map((g) => ({
      ...g,
      quarterlyAchievements:
        g.quarterlyAchievements?.length === 4
          ? g.quarterlyAchievements
          : initQuarterlyAchievements(),
    }));

    sheet.goals = goalsWithQuarters;
    await sheet.save();

    res.json({ success: true, goalSheet: sheet });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/goals/submit
 */
exports.submitGoalSheet = async (req, res, next) => {
  try {
    const year = Number.parseInt(req.body.year, 10) || new Date().getFullYear();
    
    if (!validateYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Valid years are 2024-2028.',
      });
    }
    
    const sheet = await GoalSheet.findOne({ employee: req.user._id, year });

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    const validation = validateGoalSheet(sheet.goals);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.errors.join(' ') });
    }

    sheet.status = 'submitted';
    sheet.submittedAt = new Date();
    await sheet.save();

    res.json({ success: true, goalSheet: sheet, message: 'Goals submitted for approval.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/goals/achievement
 */
exports.updateAchievement = async (req, res, next) => {
  try {
    const { year, goalId, quarter, achievement, status, completedDate } = req.body;
    
    // Validate achievement update data
    const validation = validateAchievementUpdate({
      year: year || new Date().getFullYear(),
      goalId,
      quarter,
      achievement,
      status,
      completedDate,
    });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(' '),
      });
    }
    
    const sheet = await GoalSheet.findOne({ 
      employee: req.user._id, 
      year: year || new Date().getFullYear() 
    });

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Goal sheet not found.' });
    }

    if (sheet.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Achievements can only be updated after goals are approved.',
      });
    }

    const goal = sheet.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    let qa = goal.quarterlyAchievements.find((q) => q.quarter === quarter);
    const oldAchievement = qa ? { ...qa.toObject() } : null;

    if (!qa) {
      goal.quarterlyAchievements.push({
        quarter,
        achievement: achievement ?? 0,
        status: status || 'not_started',
        completedDate: completedDate || null,
      });
      qa = goal.quarterlyAchievements[goal.quarterlyAchievements.length - 1];
    } else {
      if (achievement !== undefined) qa.achievement = achievement;
      if (status) qa.status = status;
      if (completedDate !== undefined) qa.completedDate = completedDate;
      qa.updatedAt = new Date();
    }

    qa.progress = calculateGoalProgress(goal, qa);

    if (sheet.isLocked) {
      await logAudit({
        goalSheetId: sheet._id,
        changedBy: req.user._id,
        action: 'achievement_update',
        field: `goal.${goalId}.${quarter}`,
        oldValue: oldAchievement,
        newValue: { achievement: qa.achievement, status: qa.status, progress: qa.progress },
        description: `Updated Q achievement for goal: ${goal.title}`,
      });
    }

    await sheet.save();

    res.json({
      success: true,
      goalSheet: sheet,
      progress: qa.progress,
      overallProgress: calculateSheetProgress(sheet.goals, quarter),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/goals/dashboard
 */
exports.getEmployeeDashboard = async (req, res, next) => {
  try {
    const year = Number.parseInt(req.query.year, 10) || new Date().getFullYear();
    
    if (!validateYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Valid years are 2024-2028.',
      });
    }
    
    const quarter = req.query.quarter || 'Q1';
    const sheet = await GoalSheet.findOne({ employee: req.user._id, year });

    const stats = {
      totalGoals: sheet?.goals?.length || 0,
      status: sheet?.status || 'draft',
      isLocked: sheet?.isLocked || false,
      overallProgress: sheet ? calculateSheetProgress(sheet.goals, quarter) : 0,
      weightageUsed: sheet?.goals?.reduce((s, g) => s + g.weightage, 0) || 0,
    };

    res.json({ success: true, stats, goalSheet: sheet });
  } catch (error) {
    next(error);
  }
};
