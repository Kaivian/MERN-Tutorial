// server/src/models/role.model.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

/**
 * @class Role
 * @description Defines user roles and permissions for RBAC.
 * Implements system-level locks and referential integrity checks.
 */
const roleSchema = new Schema({
  /**
   * Human-readable name (e.g., "Quản Trị Viên").
   */
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 50
  },

  /**
   * URL-friendly identifier (e.g., "quan_tri_vien").
   * CRITICAL: Used by Middleware logic.
   * If isSystem is true, this field becomes read-only (immutable).
   */
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    immutable: (doc) => doc.isSystem // Lock slug for system roles to prevent code breakage
  },

  /**
   * List of permissions (e.g., "user:create").
   * Auto-deduplicated via pre-save hook.
   */
  permissions: [{
    type: String,
    trim: true
  }],

  description: { type: String, maxlength: 200 },

  /**
   * Protected System Flag.
   * If true, this role CANNOT be deleted and its slug CANNOT be changed.
   * Created via Seeders only.
   */
  isSystem: { 
    type: Boolean, 
    default: false,
    immutable: true // Once true, always true
  },

  /**
   * Automatically assigned to new registered users.
   * Indexed for faster registration queries.
   */
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
  }
}, {
  timestamps: true
});

/* ==================== INDEXES ==================== */

// Compound index for frequent queries: "Get me the default active role"
roleSchema.index({ isDefault: 1, status: 1 });

/* ==================== MIDDLEWARE (HOOKS) ==================== */

/**
 * PRE-SAVE: 
 * 1. Auto-generate Slug (with Vietnamese support).
 * 2. Deduplicate Permissions array.
 */
roleSchema.pre('save', function(next) {
  // 1. Slug Generation
  if (this.isModified('name') || !this.slug) {
    // Only generate if slug is missing or name changed (and not immutable locked)
    if (!this.slug) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        locale: 'vi', // Essential for correct Vietnamese handling
        replacement: '_'
      });
    }
  }

  // 2. Permission Deduplication
  // Converts ["a", "b", "a"] -> ["a", "b"]
  if (this.isModified('permissions') && this.permissions) {
    this.permissions = [...new Set(this.permissions)];
  }

  next();
});

/**
 * PRE-DELETE: Safety Firewall
 * Prevents deleting System Roles OR Roles currently assigned to Users.
 */
roleSchema.pre('findOneAndDelete', async function(next) {
  try {
    const query = this.getQuery();
    const roleToDelete = await this.model.findOne(query);

    if (!roleToDelete) {
      return next(); // Let Mongoose handle not found
    }

    // CHECK 1: System Integrity Protection
    if (roleToDelete.isSystem) {
      throw new Error('Action Denied: Cannot delete a system-protected role.');
    }

    // CHECK 2: Referential Integrity Protection
    // Use db.model() to access User model without Circular Dependency imports
    const User = this.model.db.model('User');
    
    // Check if any user has this role in their 'roles' array
    const userCount = await User.countDocuments({ roles: roleToDelete._id });

    if (userCount > 0) {
      throw new Error(`Action Denied: Cannot delete role "${roleToDelete.name}" because ${userCount} users are currently assigned to it.`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Role', roleSchema);