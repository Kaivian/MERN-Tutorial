// server/src/controllers/role.controller.js
import roleRepository from '../repositories/role.repository.js';
import auditLogRepository from '../repositories/audit-log.repository.js';
import logger from '../utils/logger.utils.js';

class RoleController {
  /**
   * Get all active (and non-deleted) roles
   * GET /api/roles
   */
  async getRoles(req, res) {
    try {
      const { includeInactive } = req.query;

      const query = { isDeleted: false };
      if (includeInactive !== 'true') {
        query.status = 'active';
      }

      const roles = await roleRepository.findAll(query);
      res.success({ roles }, 'Roles retrieved successfully');
    } catch (error) {
      logger.error(`[RoleController] getRoles error: ${error.message}`);
      res.error('Failed to retrieve roles', 500, error);
    }
  }

  /**
   * Get role details
   * GET /api/roles/:id
   */
  async getRole(req, res) {
    try {
      const role = await roleRepository.findById(req.params.id);
      if (!role || role.isDeleted) return res.error('Role not found', 404);

      res.success({ role }, 'Role retrieved successfully');
    } catch (error) {
      logger.error(`[RoleController] getRole error: ${error.message}`);
      res.error('Failed to retrieve role', 500, error);
    }
  }

  /**
   * Create a new role
   * POST /api/roles
   */
  async createRole(req, res) {
    try {
      const { name, permissions, description } = req.body;

      if (!name) return res.error('Role name is required', 400);

      const newRole = await roleRepository.create({
        name,
        permissions: permissions || [],
        description
      });

      // Audit Log
      await auditLogRepository.logAction({
        userId: req.user.id,
        action: 'CREATE',
        resource: 'Role',
        resourceId: newRole._id,
        details: { name: newRole.name, permissions: newRole.permissions },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.success({ role: newRole }, 'Role created successfully', 201);
    } catch (error) {
      if (error.code === 11000) return res.error('Role name already exists', 409);
      logger.error(`[RoleController] createRole error: ${error.message}`);
      res.error('Failed to create role', 500, error);
    }
  }

  /**
   * Update a role (permissions, name, status)
   * PUT /api/roles/:id
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, permissions, description, status } = req.body;

      const role = await roleRepository.findById(id);
      if (!role || role.isDeleted) return res.error('Role not found', 404);

      if (role.isSystem) {
        // Limited updates for system roles
        // We might want to allow adding permissions to system roles, but let's restrict name/status changes
        if (name && name !== role.name) return res.error('Cannot change name of a system role', 403);
        if (status && status !== role.status) return res.error('Cannot change status of a system role', 403);
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (permissions) updateData.permissions = permissions;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;

      const updatedRole = await roleRepository.update(id, updateData);

      // Audit Log
      await auditLogRepository.logAction({
        userId: req.user.id,
        action: 'UPDATE',
        resource: 'Role',
        resourceId: updatedRole._id,
        details: { changedFields: Object.keys(updateData) },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.success({ role: updatedRole }, 'Role updated successfully');
    } catch (error) {
      if (error.code === 11000) return res.error('Role name already exists', 409);
      logger.error(`[RoleController] updateRole error: ${error.message}`);
      res.error('Failed to update role', 500, error);
    }
  }

  /**
   * Soft Delete a role
   * DELETE /api/roles/:id
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      const role = await roleRepository.findById(id);
      if (!role || role.isDeleted) return res.error('Role not found', 404);
      if (role.isSystem) return res.error('Cannot delete a system role', 403);

      await roleRepository.softDelete(id, req.user.id);

      // Audit Log
      await auditLogRepository.logAction({
        userId: req.user.id,
        action: 'DELETE',
        resource: 'Role',
        resourceId: role._id,
        details: { name: role.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.success(null, 'Role deleted successfully');
    } catch (error) {
      logger.error(`[RoleController] deleteRole error: ${error.message}`);
      // Usually "Role is assigned to active users"
      res.error(error.message || 'Failed to delete role', 400, error);
    }
  }
}

export default new RoleController();
