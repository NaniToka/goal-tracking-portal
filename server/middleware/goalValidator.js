const {
  validateGoalSheet,
  validateGoalSheetDraft,
  validateAchievementUpdate,
  validateYear,
} = require('../utils/goalValidation');

/**
 * Middleware to validate goal sheet on update (draft mode - less strict)
 */
function validateGoalSheetUpdate(req, res, next) {
  const { goals } = req.body;
  
  if (!goals) {
    return res.status(400).json({
      success: false,
      message: 'Goals data is required.',
    });
  }

  const validation = validateGoalSheetDraft(goals);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.errors.join(' '),
    });
  }

  next();
}

/**
 * Middleware to validate goal sheet on submit (strict mode)
 */
function validateGoalSheetSubmit(req, res, next) {
  const { goals } = req.body;
  
  if (!goals) {
    return res.status(400).json({
      success: false,
      message: 'Goals data is required.',
    });
  }

  const validation = validateGoalSheet(goals);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.errors.join(' '),
    });
  }

  next();
}

/**
 * Middleware to validate achievement update
 */
function validateAchievement(req, res, next) {
  const { year, goalId, quarter, achievement, status, completedDate } = req.body;
  
  const validation = validateAchievementUpdate({
    year,
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

  next();
}

/**
 * Middleware to validate year parameter
 */
function validateYearParam(req, res, next) {
  const year = req.query.year || req.body.year;
  
  if (!validateYear(year)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid year. Valid years are 2024-2028.',
    });
  }

  next();
}

module.exports = {
  validateGoalSheetUpdate,
  validateGoalSheetSubmit,
  validateAchievement,
  validateYearParam,
};
