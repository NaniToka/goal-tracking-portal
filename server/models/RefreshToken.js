const mongoose = require('mongoose');

/**
 * Persisted refresh tokens — enables logout / revocation
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

// MongoDB TTL — auto-delete expired documents
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
