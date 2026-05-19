const mongoose = require('mongoose');

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'rework'];
const ACHIEVEMENT_STATUSES = ['not_started', 'on_track', 'completed'];
const UNITS = ['numeric', 'percentage', 'timeline', 'zero_based'];

const quarterlyAchievementSchema = new mongoose.Schema(
  {
    quarter: { type: String, enum: QUARTERS, required: true },
    achievement: { type: mongoose.Schema.Types.Mixed, default: 0 },
    status: {
      type: String,
      enum: ACHIEVEMENT_STATUSES,
      default: 'not_started',
    },
    completedDate: { type: Date, default: null },
    progress: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    thrustArea: { type: String, required: true, trim: true },
    unitOfMeasurement: {
      type: String,
      enum: UNITS,
      required: true,
    },
    target: { type: mongoose.Schema.Types.Mixed, required: true },
    weightage: { type: Number, required: true, min: 10, max: 100 },
    quarterlyAchievements: [quarterlyAchievementSchema],
    managerComments: [
      {
        quarter: { type: String, enum: QUARTERS },
        comment: { type: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: true }
);

const goalSheetSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: { type: Number, required: true },
    goals: [goalSchema],
    status: {
      type: String,
      enum: STATUSES,
      default: 'draft',
    },
    isLocked: { type: Boolean, default: false },
    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
    managerNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

goalSheetSchema.index({ employee: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('GoalSheet', goalSheetSchema);
module.exports.QUARTERS = QUARTERS;
module.exports.STATUSES = STATUSES;
module.exports.ACHIEVEMENT_STATUSES = ACHIEVEMENT_STATUSES;
module.exports.UNITS = UNITS;
