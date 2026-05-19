const MIN_WEIGHTAGE = 10;
const MAX_WEIGHTAGE = 100;
const MAX_GOALS = 8;
const REQUIRED_TOTAL_WEIGHTAGE = 100;
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_THRUST_AREA_LENGTH = 100;
const VALID_YEARS = [2024, 2025, 2026, 2027, 2028];
const THRUST_AREA_PATTERN = /^[a-zA-Z0-9\s\-_]+$/;

const UNITS = ['numeric', 'percentage', 'timeline', 'zero_based'];
const ACHIEVEMENT_STATUSES = ['not_started', 'on_track', 'completed'];

/**
 * Validate individual goal field
 */
function validateGoalField(goal, index, fieldName, validationFn, errorMessage) {
  if (!validationFn(goal[fieldName])) {
    return `Goal ${index + 1}: ${errorMessage}`;
  }
  return null;
}

/**
 * Validate goal title
 */
function validateTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length >= MIN_TITLE_LENGTH && trimmed.length <= MAX_TITLE_LENGTH;
}

/**
 * Validate goal description
 */
function validateDescription(description) {
  if (!description) return true; // Optional field
  if (typeof description !== 'string') return false;
  return description.trim().length <= MAX_DESCRIPTION_LENGTH;
}

/**
 * Validate thrust area
 */
function validateThrustArea(thrustArea) {
  if (!thrustArea || typeof thrustArea !== 'string') return false;
  const trimmed = thrustArea.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_THRUST_AREA_LENGTH && THRUST_AREA_PATTERN.test(trimmed);
}

/**
 * Validate unit of measurement
 */
function validateUnit(unit) {
  return UNITS.includes(unit);
}

/**
 * Validate target based on unit type
 */
function validateTarget(target, unit) {
  if (target === undefined || target === null || target === '') return false;
  
  if (unit === 'numeric') {
    return typeof target === 'number' && target > 0;
  }
  
  if (unit === 'percentage') {
    return typeof target === 'number' && target > 0 && target <= 100;
  }
  
  if (unit === 'timeline') {
    // Target should be a valid date string or timestamp
    const date = new Date(target);
    return Number.isNaN(date.getTime()) === false && date.getTime() > Date.now();
  }
  
  if (unit === 'zero_based') {
    return typeof target === 'number' && target >= 0;
  }
  
  return typeof target === 'number' && target > 0;
}

/**
 * Validate weightage
 */
function validateWeightage(weightage) {
  return typeof weightage === 'number' && 
         weightage >= MIN_WEIGHTAGE && 
         weightage <= MAX_WEIGHTAGE &&
         Number.isInteger(weightage);
}

/**
 * Validate quarterly achievements
 */
function validateQuarterlyAchievements(achievements) {
  if (!achievements || !Array.isArray(achievements)) return false;
  if (achievements.length !== 4) return false;
  
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const existingQuarters = new Set(achievements.map(a => a.quarter));
  
  // Check all quarters are present
  const hasAllQuarters = quarters.every(q => existingQuarters.has(q));
  if (!hasAllQuarters) return false;
  
  // Validate each achievement
  return achievements.every(qa => {
    const validQuarter = quarters.includes(qa.quarter);
    const validAchievement = qa.achievement === undefined || typeof qa.achievement === 'number';
    const validStatus = !qa.status || ACHIEVEMENT_STATUSES.includes(qa.status);
    const validProgress = qa.progress === undefined || 
                        (typeof qa.progress === 'number' && qa.progress >= 0 && qa.progress <= 100);
    
    return validQuarter && validAchievement && validStatus && validProgress;
  });
}

/**
 * Validate achievement update
 */
function validateAchievementUpdate(data) {
  const errors = [];
  const { year, goalId, quarter, achievement, status, completedDate } = data;
  
  if (!year || typeof year !== 'number' || year < 2024 || year > 2028) {
    errors.push('Valid year is required (2024-2028).');
  }
  
  if (!goalId || typeof goalId !== 'string') {
    errors.push('Goal ID is required.');
  }
  
  if (!quarter || !['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
    errors.push('Valid quarter is required (Q1, Q2, Q3, Q4).');
  }
  
  if (achievement !== undefined) {
    if (typeof achievement !== 'number') {
      errors.push('Achievement must be a number.');
    }
  }
  
  if (status && !ACHIEVEMENT_STATUSES.includes(status)) {
    errors.push(`Invalid status. Must be one of: ${ACHIEVEMENT_STATUSES.join(', ')}.`);
  }
  
  if (completedDate !== undefined && completedDate !== null) {
    const date = new Date(completedDate);
    if (Number.isNaN(date.getTime())) {
      errors.push('Invalid completed date format.');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check for duplicate goal titles
 */
function checkDuplicateGoals(goals) {
  const titles = goals.map(g => g.title?.trim().toLowerCase()).filter(Boolean);
  const uniqueTitles = new Set(titles);
  return titles.length !== uniqueTitles.size;
}

/**
 * Validate goal sheet rules before submit
 */
function validateGoalSheet(goals) {
  const errors = [];

  if (!goals || goals.length === 0) {
    errors.push('At least one goal is required.');
    return { valid: false, errors };
  }

  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum ${MAX_GOALS} goals allowed per employee.`);
  }

  const totalWeightage = goals.reduce((sum, g) => sum + (g.weightage || 0), 0);
  if (totalWeightage !== REQUIRED_TOTAL_WEIGHTAGE) {
    errors.push(`Total goal weightage must equal ${REQUIRED_TOTAL_WEIGHTAGE}% (current: ${totalWeightage}%).`);
  }

  if (checkDuplicateGoals(goals)) {
    errors.push('Duplicate goal titles are not allowed.');
  }

  goals.forEach((goal, index) => {
    // Validate weightage
    if (!validateWeightage(goal.weightage)) {
      errors.push(`Goal ${index + 1}: Weightage must be an integer between ${MIN_WEIGHTAGE}% and ${MAX_WEIGHTAGE}%.`);
    }
    
    // Validate title
    if (!validateTitle(goal.title)) {
      errors.push(`Goal ${index + 1}: Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`);
    }
    
    // Validate description
    if (!validateDescription(goal.description)) {
      errors.push(`Goal ${index + 1}: Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`);
    }
    
    // Validate thrust area
    if (!validateThrustArea(goal.thrustArea)) {
      errors.push(`Goal ${index + 1}: Thrust area is required and must contain only alphanumeric characters, spaces, hyphens, or underscores (max ${MAX_THRUST_AREA_LENGTH} characters).`);
    }
    
    // Validate unit
    if (!validateUnit(goal.unitOfMeasurement)) {
      errors.push(`Goal ${index + 1}: Unit of measurement must be one of: ${UNITS.join(', ')}.`);
    }
    
    // Validate target based on unit
    if (!validateTarget(goal.target, goal.unitOfMeasurement)) {
      const targetMsg = {
        numeric: 'Target must be a positive number.',
        percentage: 'Target must be a number between 1 and 100.',
        timeline: 'Target must be a valid future date.',
        zero_based: 'Target must be a non-negative number.'
      }[goal.unitOfMeasurement] || 'Target is required and must be valid.';
      errors.push(`Goal ${index + 1}: ${targetMsg}`);
    }
    
    // Validate quarterly achievements if present
    if (goal.quarterlyAchievements && goal.quarterlyAchievements.length > 0) {
      if (!validateQuarterlyAchievements(goal.quarterlyAchievements)) {
        errors.push(`Goal ${index + 1}: Quarterly achievements must include all 4 quarters (Q1, Q2, Q3, Q4) with valid data.`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate goal sheet for draft save (less strict than submit)
 */
function validateGoalSheetDraft(goals) {
  const errors = [];

  if (!goals || goals.length === 0) {
    return { valid: true, errors: [] }; // Allow empty draft
  }

  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum ${MAX_GOALS} goals allowed per employee.`);
  }

  goals.forEach((goal, index) => {
    // Only validate critical fields for draft
    if (goal.title && !validateTitle(goal.title)) {
      errors.push(`Goal ${index + 1}: Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`);
    }
    
    if (goal.weightage && !validateWeightage(goal.weightage)) {
      errors.push(`Goal ${index + 1}: Weightage must be an integer between ${MIN_WEIGHTAGE}% and ${MAX_WEIGHTAGE}%.`);
    }
    
    if (goal.unitOfMeasurement && !validateUnit(goal.unitOfMeasurement)) {
      errors.push(`Goal ${index + 1}: Unit of measurement must be one of: ${UNITS.join(', ')}.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate year parameter
 */
function validateYear(year) {
  const yearNum = Number.parseInt(year, 10);
  return VALID_YEARS.includes(yearNum);
}

module.exports = {
  MIN_WEIGHTAGE,
  MAX_WEIGHTAGE,
  MAX_GOALS,
  REQUIRED_TOTAL_WEIGHTAGE,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_THRUST_AREA_LENGTH,
  VALID_YEARS,
  UNITS,
  ACHIEVEMENT_STATUSES,
  validateGoalSheet,
  validateGoalSheetDraft,
  validateAchievementUpdate,
  validateYear,
  validateTitle,
  validateDescription,
  validateThrustArea,
  validateUnit,
  validateTarget,
  validateWeightage,
  validateQuarterlyAchievements,
};
