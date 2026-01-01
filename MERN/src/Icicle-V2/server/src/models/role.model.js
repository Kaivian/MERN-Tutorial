// server/src/models/role.model.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

/**
 * @class Role
 * @description Defines user roles and permissions for RBAC.
 */
const roleSchema = new Schema({
  /**
   * Human-readable name of the role (e.g., "System Admin").
   */
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 50
  },

  /**
   * URL-friendly identifier used in code (e.g., "system_admin").
   * Auto-generated from name if not provided.
   */
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  /**
   * List of specific permission strings (e.g., "user:create", "post:delete").
   */
  permissions: [{
    type: String,
    trim: true
  }],

  description: { type: String, maxlength: 200 },

  /**
   * If true, this role is automatically assigned to new users upon registration.
   */
  isDefault: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

/* ==================== MIDDLEWARE ==================== */

/**
 * Pre-save hook to generate a slug from the name.
 * Ensures strict, lowercase, underscore-separated slugs.
 */
roleSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    if (!this.slug) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        replacement: '_'
      });
    }
  }
  next();
});

export default mongoose.model('Role', roleSchema);