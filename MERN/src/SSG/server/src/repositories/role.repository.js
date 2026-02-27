// server/src/repositories/role.repository.js
import Role from '../models/role.model.js';

/**
 * Repository for interacting with the 'Role' collection.
 */
class RoleRepository {
  /* ==================== CREATE ==================== */
  async create(roleData) {
    return await Role.create(roleData);
  }

  /* ==================== READ ==================== */
  /**
   * Find the default role to assign to new registered users.
   * @returns {Promise<import('mongoose').Document | null>} The default role document.
   */
  async findDefaultRole() {
    return await Role.findOne({ isDefault: false, status: 'active' });
  }

  /**
   * Find a role by its slug (e.g., 'admin', 'editor').
   * @param {string} slug - The unique slug of the role.
   * @returns {Promise<import('mongoose').Document | null>} The role document.
   */
  async findBySlug(slug) {
    return await Role.findOne({ slug });
  }

  async findById(id) {
    return await Role.findById(id);
  }

  async findAll(query = {}) {
    return await Role.find(query).sort({ createdAt: -1 });
  }

  /* ==================== UPDATE ==================== */
  async update(id, updateData) {
    return await Role.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
  }

  /* ==================== SOFT DELETE ==================== */
  async softDelete(id, userId) {
    return await Role.softDelete(id, userId);
  }
}

export default new RoleRepository();