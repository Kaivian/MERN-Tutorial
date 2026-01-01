// server/src/models/login-history.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * @class LoginHistory
 * @description Audit log for tracking user authentication attempts.
 * Designed as an append-only collection.
 */
const loginHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  ipAddress: String,

  deviceInfo: {
    os: String,
    browser: String,
    userAgent: String
  },

  /**
   * Outcome of the login attempt.
   * @enum {'SUCCESS' | 'FAILED'}
   */
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },

  /**
   * Reason for failure (e.g., "Invalid Password", "Account Banned").
   * Null if success.
   */
  failReason: String
}, {
  // Only 'createdAt' is needed for logs. 'updatedAt' is disabled.
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model('LoginHistory', loginHistorySchema);