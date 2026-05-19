const AuditLog = require('../models/AuditLog');

/**
 * Log changes when goal sheet is locked (approved)
 */
async function logAudit({
  goalSheetId,
  changedBy,
  action,
  field = '',
  oldValue = null,
  newValue = null,
  description = '',
  metadata = {},
}) {
  try {
    await AuditLog.create({
      goalSheet: goalSheetId,
      changedBy,
      action,
      field,
      oldValue,
      newValue,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
}

module.exports = { logAudit };
