// server/src/repositories/role.repository.js
import Role from '../models/role.model.js';

/**
 * Repository for interacting with the 'Role' collection.
 */
class RoleRepository {
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
}

export default new RoleRepository();