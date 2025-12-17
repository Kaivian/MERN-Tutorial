// server/src/models/user.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Sub-schema for tracking the current active session.
 * @typedef {Object} ActiveSession
 * @property {string} tokenHash - SHA-256 hash of the Refresh Token to prevent plaintext storage.
 * @property {Object} deviceInfo - Metadata about the user's device.
 * @property {string} ipAddress - The last recorded IP address of the session.
 * @property {Date} issuedAt - Timestamp when the session was created.
 * @property {Date} expiresAt - Absolute expiration time of the session.
 */
const activeSessionSchema = new Schema({
  tokenHash: { 
    type: String, 
    required: true,
    index: true 
  },
  deviceInfo: {
    os: String,
    browser: String,
    type: { type: String, default: 'unknown' },
    userAgent: String
  },
  ipAddress: String,
  issuedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  }
}, { _id: false });

/**
 * User Schema
 * @description Manages user identity, security flags, RBAC roles, and single-device session management.
 * Optimized for a flow where Admin creates accounts and users must reset passwords upon first login.
 */
const userSchema = new Schema({
  /* ==================== 1. IDENTITY ==================== */

  /** * Unique identifier for the user profile.
   * @type {string} 
   */
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  
  /** * Primary email for communication and password recovery.
   * Note: Set to required: false if using username-only registration, 
   * but recommended true for most MERN applications.
   */
  email: {
    type: String,
    required: [false, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },

  /** * Bcrypt hashed password. 
   * Excluded from query results by default for security.
   */
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    minlength: 6
  },

  /* ==================== 2. SECURITY & AUTH STATUS ==================== */

  /** * Flag indicating if the user is forced to change their password.
   * @default true - Accounts created by Admin require a password reset on first access.
   */
  mustChangePassword: {
    type: Boolean,
    required: true,
    default: true
  },

  /** Indicates if the user has verified their email address. */
  isVerified: {
    type: Boolean,
    default: false
  },

  /** * Current lifecycle state of the account.
   * @type {'active'|'banned'|'pending'}
   */
  status: {
    type: String,
    enum: ['active', 'banned', 'pending'],
    default: 'active'
  },

  /** * Embedded document containing the current session.
   * Implementing this as an object (rather than an array) enforces Single Device Login (SDL).
   */
  activeSession: {
    type: activeSessionSchema,
    default: null
  },

  /* ==================== 3. SOCIAL LOGIN ==================== */

  /** Unique ID provided by Google OAuth. Used for account linking. */
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },

  /* ==================== 4. AUTHORIZATION (RBAC) ==================== */

  /** * References to the Role collection.
   * @type {mongoose.Schema.Types.ObjectId[]}
   */
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role' 
  }],

  /* ==================== 5. PROFILE ==================== */

  /** Public profile metadata. */
  profile: {
    fullName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    location: String
  },
  
  /* ==================== 6. METADATA ==================== */
  
  /** Records the last successful authentication timestamp. */
  lastLoginAt: Date

}, {
  /** * Automatically adds 'createdAt' and 'updatedAt' fields.
   */
  timestamps: true 
});

/**
 * User Model
 * @model User
 */
const User = mongoose.model('User', userSchema);

export default User;