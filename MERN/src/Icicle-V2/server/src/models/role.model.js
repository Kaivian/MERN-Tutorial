// server/src/models/role.model.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

/**
 * Role Schema for Role-Based Access Control (RBAC).
 * Defines the capabilities (permissions) associated with a specific user group.
 * * @description
 * This model serves as the "source of truth" for permissions.
 * It uses a 'slug' field for immutable logic references in your code.
 */
const roleSchema = new Schema({
  /* ==================== 1. IDENTIFICATION ==================== */

  /**
   * Display name of the role.
   * Visible in the Admin Dashboard or UI.
   * Example: "System Administrator", "Content Writer"
   */
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    unique: true, // Prevent duplicate role names
    maxlength: 50
  },

  /**
   * Unique identifier used in backend logic (Hard-coding).
   * Auto-generated from 'name' if not provided explicitly.
   * Example: 'system_admin', 'content_writer'
   * @note 'unique: true' automatically creates an index.
   */
  slug: {
    type: String,
    unique: true, // <--- Cái này đã tự tạo index rồi
    lowercase: true,
    trim: true,
    // Regex: Only allow lowercase letters, numbers, and underscores
    match: [/^[a-z0-9_]+$/, 'Slug can only contain lowercase letters, numbers, and underscores']
  },

  /* ==================== 2. AUTHORIZATION ==================== */

  /**
   * List of granular permissions granted to this role.
   * Recommended Format: "resource:action"
   * Example: ["user:create", "user:delete", "post:view"]
   */
  permissions: [{
    type: String,
    trim: true
  }],

  /* ==================== 3. CONFIGURATION ==================== */

  /**
   * Brief description of the role's purpose.
   * Helpful for other admins to understand what this role does.
   */
  description: {
    type: String,
    maxlength: 200,
    trim: true
  },

  /**
   * Indicates if this role is assigned to new users by default upon registration.
   * @note Ensure only ONE role in the database has this set to true.
   */
  isDefault: {
    type: Boolean,
    default: false
  },

  /**
   * Status of the role.
   * - 'active': Users with this role function normally.
   * - 'inactive': Permissions for this role are effectively suspended.
   */
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }

}, {
  /** Automatically manage createdAt and updatedAt timestamps */
  timestamps: true
});

/* ==================== MIDDLEWARE (HOOKS) ==================== */

/**
 * Pre-save hook to automatically generate a slug from the name.
 * * @description
 * This logic runs before the document is saved to MongoDB.
 * 1. Checks if the name has changed or if the slug is missing.
 * 2. Uses 'slugify' to convert the name into a safe, lowercase slug.
 * Example: "Trưởng Phòng IT" -> "truong_phong_it"
 */
roleSchema.pre('save', function(next) {
  // Only generate/update slug if name is modified or slug is missing
  if (this.isModified('name') || !this.slug) {
    
    // If slug is not manually provided, generate it from name
    if (!this.slug) {
      this.slug = slugify(this.name, {
        lower: true,      // Convert to lowercase
        strict: true,     // Strip special characters (e.g., !@#)
        replacement: '_', // Use underscore separator (better for variable names)
        locale: 'vi'      // Support Vietnamese character mapping
      });
    }
  }
  next();
});

const Role = mongoose.model('Role', roleSchema);

export default Role;