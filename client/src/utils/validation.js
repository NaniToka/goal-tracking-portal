export const MIN_WEIGHTAGE = 10;
export const MAX_GOALS = 8;
export const REQUIRED_TOTAL = 100;

export const UNITS = [
  { value: 'numeric', label: 'Numeric' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'zero_based', label: 'Zero-based' },
];

export const ACHIEVEMENT_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'on_track', label: 'On Track' },
  { value: 'completed', label: 'Completed' },
];

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export function validateGoals(goals) {
  const errors = [];
  if (!goals?.length) {
    errors.push('At least one goal is required.');
    return errors;
  }
  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum ${MAX_GOALS} goals allowed.`);
  }
  const total = goals.reduce((s, g) => s + (Number(g.weightage) || 0), 0);
  if (total !== REQUIRED_TOTAL) {
    errors.push(`Total weightage must equal ${REQUIRED_TOTAL}% (current: ${total}%).`);
  }
  goals.forEach((g, i) => {
    if (!g.title?.trim()) errors.push(`Goal ${i + 1}: Title is required.`);
    if (!g.thrustArea) errors.push(`Goal ${i + 1}: Thrust area is required.`);
    if (g.target === '' || g.target === undefined || g.target === null) {
      errors.push(`Goal ${i + 1}: Target is required.`);
    }
    if ((Number(g.weightage) || 0) < MIN_WEIGHTAGE) {
      errors.push(`Goal ${i + 1}: Minimum weightage is ${MIN_WEIGHTAGE}%.`);
    }
  });
  return errors;
}

export function statusColor(status) {
  const map = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    rework: 'bg-orange-100 text-orange-800',
    not_started: 'bg-slate-100 text-slate-600',
    on_track: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export function formatLabel(str) {
  return str?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
}
