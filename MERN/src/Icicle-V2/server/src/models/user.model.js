// server/src/models/user.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Sub-schema for storing session information.
 * @description
 * Configured with `_id: false` to optimize storage.
 * Designed to be embedded in the User document to support Single Device Login.
 */
const activeSessionSchema = new Schema({
  /**
   * Hash of the Refresh Token.
   * @warning Do not store tokens in plaintext.
   * @note 'index: true' automatically creates an index on 'activeSession.tokenHash'.
   */
  tokenHash: { 
    type: String, 
    required: true,
    index: true 
  },
  
  /** User device information (OS, Browser, etc.) */
  deviceInfo: {
    os: String,
    browser: String,
    type: { type: String, default: 'unknown' },
    userAgent: String
  },
  
  /** IP address of the session */
  ipAddress: String,
  
  /** Token issuance time */
  issuedAt: { type: Date, default: Date.now },
  
  /** Token expiration time. Used to validate the session. */
  expiresAt: { type: Date, required: true }
}, { _id: false });

/**
 * Main User Schema.
 * @description
 * Manages identity, security, authorization, and the single active session.
 * Supports Hybrid Auth strategy: Manual Registration (Password) first -> Link Google later.
 */
const userSchema = new Schema({
  /* ==================== 1. IDENTITY ==================== */

  /**
   * Unique username identifier.
   * @type {string}
   * @unique
   * @sparse Allows null if the user hasn't set a username yet.
   */
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  
  /**
   * Primary login email.
   * @type {string}
   * @required Mandatory for identity verification.
   */
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },

  /**
   * Hashed password.
   * @required Mandatory as the flow requires manual registration first.
   * @private This field is excluded by default when querying (`select: false`).
   */
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    minlength: 6
  },

  /* ==================== 2. SOCIAL LOGIN ==================== */

  /**
   * Google ID (Subject ID from Google).
   * @unique
   * @sparse Only exists if the user has successfully linked their account.
   * @description Used for quick login after email verification.
   */
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },

  /* ==================== 3. STATUS & SECURITY ==================== */

  /** Email verification status */
  isVerified: {
    type: Boolean,
    default: false
  },

  /**
   * Account status.
   * @enum ['active', 'banned', 'pending']
   */
  status: {
    type: String,
    enum: ['active', 'banned', 'pending'],
    default: 'active'
  },

  /**
   * Single active session (Single Device).
   * @type {activeSessionSchema}
   * @default null (When user is not logged in or has logged out).
   * @description Stored as an Object to automatically overwrite the old session upon new login.
   */
  activeSession: {
    type: activeSessionSchema,
    default: null
  },

  /* ==================== 4. AUTHORIZATION (RBAC) ==================== */

  /**
   * List of User Roles.
   * References the 'roles' collection.
   */
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role' 
  }],

  /* ==================== 5. PROFILE ==================== */

  /** Publicly displayed user profile information */
  profile: {
    fullName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    location: String
  },
  
  /* ==================== 6. METADATA ==================== */
  
  /** Timestamp of the last successful login */
  lastLoginAt: Date

}, {
  /** * Automatically manages `createdAt` and `updatedAt`.
   * @see https://mongoosejs.com/docs/timestamps.html
   */
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

export default User;