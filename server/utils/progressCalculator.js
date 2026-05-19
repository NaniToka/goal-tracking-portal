/**
 * System-computed progress logic per unit of measurement type.
 * Returns progress percentage (0-100).
 */

const UNITS = {
  NUMERIC: 'numeric',
  PERCENTAGE: 'percentage',
  TIMELINE: 'timeline',
  ZERO_BASED: 'zero_based',
};

/**
 * Min type (Numeric, Percentage): Achievement / Target * 100, capped at 100
 */
function minTypeProgress(achievement, target) {
  if (!target || target === 0) return 0;
  const progress = (achievement / target) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100);
}

/**
 * Max type: Target / Achievement * 100 (lower achievement = higher progress when target is lower)
 * Used when lower values are better (e.g. defects)
 */
function maxTypeProgress(achievement, target) {
  if (!achievement || achievement === 0) return 100;
  const progress = (target / achievement) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100);
}

/**
 * Timeline type: progress based on deadline comparison
 * achievement = completion date (timestamp or ISO string)
 * target = deadline (timestamp or ISO string)
 */
function timelineProgress(achievement, target) {
  if (!target) return 0;
  const deadline = new Date(target).getTime();
  const completed = achievement ? new Date(achievement).getTime() : Date.now();
  const now = Date.now();

  if (completed <= deadline) {
    return 100;
  }
  // Past deadline: linear decay or 0 based on how late
  const totalWindow = deadline - (deadline - 365 * 24 * 60 * 60 * 1000); // fallback window
  if (now > deadline) {
    const overdue = now - deadline;
    const penalty = Math.min((overdue / (30 * 24 * 60 * 60 * 1000)) * 100, 100);
    return Math.max(0, Math.round((100 - penalty) * 100) / 100);
  }
  return Math.round(((deadline - now) / (deadline - (now - 86400000))) * 100) || 0;
}

/**
 * Zero-based: if achievement = 0 → 100%, else → 0%
 */
function zeroBasedProgress(achievement) {
  const val = Number(achievement);
  return val === 0 ? 100 : 0;
}

/**
 * Calculate goal progress for a single goal entry
 */
function calculateGoalProgress(goal, quarterAchievement) {
  const achievement = quarterAchievement?.achievement ?? 0;
  const target = goal.target;
  const unit = goal.unitOfMeasurement;

  switch (unit) {
    case UNITS.NUMERIC:
    case UNITS.PERCENTAGE:
      return minTypeProgress(achievement, target);
    case UNITS.TIMELINE:
      return timelineProgress(
        quarterAchievement?.completedDate || achievement,
        target
      );
    case UNITS.ZERO_BASED:
      return zeroBasedProgress(achievement);
    default:
      return minTypeProgress(achievement, target);
  }
}

/**
 * Weighted overall progress for a goal sheet
 */
function calculateSheetProgress(goals, quarter) {
  if (!goals?.length) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  goals.forEach((goal) => {
    const qa = goal.quarterlyAchievements?.find((q) => q.quarter === quarter);
    const progress = calculateGoalProgress(goal, qa);
    weightedSum += progress * (goal.weightage / 100);
    totalWeight += goal.weightage;
  });

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / (totalWeight / 100)) * 100) / 100;
}

module.exports = {
  UNITS,
  minTypeProgress,
  maxTypeProgress,
  timelineProgress,
  zeroBasedProgress,
  calculateGoalProgress,
  calculateSheetProgress,
};
