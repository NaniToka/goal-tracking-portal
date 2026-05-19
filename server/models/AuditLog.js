const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    goalSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GoalSheet',
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: { type: String, required: true },
    field: { type: String, default: '' },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    description: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ goalSheet: 1, createdAt: -1 });
auditLogSchema.index({ changedBy: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
