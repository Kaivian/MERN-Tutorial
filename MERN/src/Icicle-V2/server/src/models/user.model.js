// server/src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

/**
 * Schema definition for user's active session (Single Device Login).
 * _id is disabled to prevent unnecessary ObjectId generation for sub-documents.
 */
const activeSessionSchema = new Schema({
  tokenHash: { type: String, required: true, index: true },
  deviceInfo: {
    os: String,
    browser: String,
    type: { type: String, default: 'unknown' },
    userAgent: String
  },
  ipAddress: String,
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { _id: false });

/**
 * @class User
 * @description Core user model handling authentication, profile, and authorization.
 */
const userSchema = new Schema({
  /* ==================== IDENTITY ==================== */
  
  /**
   * Unique username for the user.
   */
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },

  /**
   * Primary email address. Used for login and notifications.
   */
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address format']
  },

  /**
   * Bcrypt hashed password.
   * Note: Excluded from query results by default (`select: false`).
   * Updated minlength to 8 to match Joi Validation.
   */
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 8 
  },

  /* ==================== RBAC & SECURITY ==================== */

  /**
   * References to Role documents for permission management.
   */
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],

  /**
   * Forces the user to reset their password upon next login.
   * Default is true: Admin-created users must change password immediately.
   */
  mustChangePassword: { type: Boolean, default: true },

  /**
   * Indicates if the user has verified their email address.
   */
  isVerified: { type: Boolean, default: false },

  /**
   * Account lifecycle status.
   * @enum {'active' | 'banned' | 'pending'}
   */
  status: {
    type: String,
    enum: ['active', 'banned', 'pending'],
    default: 'active'
  },

  /* ==================== SESSION ==================== */

  /**
   * Stores the current active session.
   * Using an object instead of an array enforces Single Session logic.
   */
  activeSession: {
    type: activeSessionSchema,
    default: null
  },

  /* ==================== SOCIAL & PROFILE ==================== */

  googleId: { type: String, unique: true, sparse: true },

  profile: {
    fullName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    location: String
  },

  /* ==================== METADATA ==================== */

  lastLoginAt: Date,

  /**
   * Timestamp for Soft Delete. If set, the user is considered deleted.
   */
  deletedAt: { type: Date, default: null }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* ==================== VIRTUALS ==================== */

/**
 * Virtual field to populate Login History without storing it in the User document.
 * Access via `await user.populate('loginHistory')`.
 */
userSchema.virtual('loginHistory', {
  ref: 'LoginHistory',
  localField: '_id',
  foreignField: 'userId',
  options: { sort: { createdAt: -1 }, limit: 10 }
});

/* ==================== METHODS ==================== */

/**
 * Verifies if the provided plain text password matches the hashed password.
 * @param {string} enteredPassword - The plain text password to check.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  // Guard clause: If password field was not selected in query, verify cannot happen
  if (!this.password) {
    throw new Error('Password field is missing. Make sure to use .select("+password")');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);