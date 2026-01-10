// server/src/models/role.model.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

/**
 * @class RoleSchema
 * @description Defines user roles and permissions for the RBAC system.
 * * BEST PRACTICE IMPLEMENTATION:
 * - Uses Soft Delete pattern (never physically deletes data).
 * - Implements Static Methods for critical business logic.
 * - Enforces immutability on system-critical fields.
 */
const roleSchema = new Schema({
  /**
   * Human-readable name (e.g., "Quản Trị Viên").
   */
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },

  /**
   * URL-friendly identifier.
   * Stability: Should rarely change to preserve frontend routing integrity.
   */
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    // immutable: true // OPTIONAL: Uncomment if slugs should NEVER change after creation
  },

  permissions: [{
    type: String,
    trim: true
  }],

  description: { 
    type: String, 
    maxlength: 200 
  },

  /**
   * System Roles (e.g., Admin, SuperUser) cannot be modified or soft-deleted.
   */
  isSystem: { 
    type: Boolean, 
    default: false,
    immutable: true 
  },

  isDefault: { 
    type: Boolean, 
    default: false,
    index: true 
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },

  /* ==================== SOFT DELETE FIELDS ==================== */
  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true // Important for filtering out deleted roles
  },

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* ==================== INDEXES ==================== */

// Compound index for fetching active, non-deleted roles (most frequent query)
roleSchema.index({ isDeleted: 1, status: 1 });
roleSchema.index({ isDeleted: 1, isDefault: 1 });

/* ==================== MIDDLEWARE ==================== */

/**
 * PRE-SAVE: Slug Generation & Deduplication
 */
roleSchema.pre('save', function(next) {
  // 1. Generate Slug only if it's a new document OR slug is explicitly modified.
  // We avoid auto-updating slug when Name changes to prevent URL breakage.
  if (this.isNew || this.isModified('slug')) {
    if (!this.slug && this.name) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        locale: 'vi',
        replacement: '_'
      });
    }
  }

  // 2. Permission Deduplication
  if (this.isModified('permissions') && this.permissions) {
    this.permissions = [...new Set(this.permissions)];
  }

  next();
});

/* ==================== STATIC METHODS (BUSINESS LOGIC) ==================== */

/**
 * @function softDelete
 * @description Safely performs a soft delete check.
 * Replaces the risky 'pre-remove' hooks with an explicit method.
 * * @param {string} roleId - The ID of the role to delete.
 * @param {string} userId - The ID of the user performing the action (for audit).
 * @throws {Error} If role is System role or currently assigned to users.
 */
roleSchema.statics.softDelete = async function(roleId, userId) {
  const role = await this.findOne({ _id: roleId, isDeleted: false });

  if (!role) {
    throw new Error('Role not found or already deleted.');
  }

  // CHECK 1: System Integrity
  if (role.isSystem) {
    throw new Error('Action Denied: Cannot delete a system-protected role.');
  }

  // CHECK 2: Referential Integrity
  // Dynamic import to avoid circular dependency issues at the top level
  const User = mongoose.model('User');
  
  // Check if active users are still assigned this role
  // Assuming User model has 'roles' array or single 'role' field
  // Also assume we only care about non-deleted users
  const userCount = await User.countDocuments({ 
    roles: role._id,
    isDeleted: { $ne: true } // Assuming User also has soft delete
  });

  if (userCount > 0) {
    throw new Error(`Action Denied: Role is assigned to ${userCount} active users.`);
  }

  // PERFORM SOFT DELETE
  role.isDeleted = true;
  role.deletedAt = new Date();
  role.deletedBy = userId;
  role.slug = `${role.slug}-deleted-${Date.now()}`; // Free up the slug for reuse
  role.status = 'inactive';
  
  return role.save();
};

/**
 * @function findActive
 * @description Helper to get only non-deleted, active roles.
 */
roleSchema.query.byActive = function() {
  return this.where({ isDeleted: false, status: 'active' });
};

export default mongoose.model('Role', roleSchema);