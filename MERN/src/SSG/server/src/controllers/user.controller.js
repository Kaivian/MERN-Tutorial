// server/src/controllers/user.controller.js
import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import auditLogRepository from '../repositories/audit-log.repository.js';
import logger from '../utils/logger.utils.js';
import bcrypt from 'bcrypt';

class UserController {
  /**
   * Get paginated list of users
   * GET /api/users
   */
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;

      const query = {};

      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) {
        // Find role by slug first to get its ID
        const roleDoc = await roleRepository.findBySlug(role);
        if (roleDoc) {
          query.roles = roleDoc._id;
        }
      }

      if (status) {
        query.status = status;
      }

      const result = await userRepository.findPaginated(query, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      res.success(result, 'Users retrieved successfully');
    } catch (error) {
      logger.error(`[UserController] getUsers error: ${error.message}`);
      res.error('Failed to retrieve users', 500, error);
    }
  }

  /**
   * Get single user details
   * GET /api/users/:id
   */
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);

      if (!user) {
        return res.error('User not found', 404);
      }

      // Hide sensitive data
      user.password = undefined;
      user.activeSession = undefined;

      res.success({ user }, 'User retrieved successfully');
    } catch (error) {
      logger.error(`[UserController] getUser error: ${error.message}`);
      res.error('Failed to retrieve user', 500, error);
    }
  }

  /**
   * Create a new user (Admin action)
   * POST /api/users
   */
  async createUser(req, res) {
    try {
      const { username, email, password, roles, status = 'active' } = req.body;

      if (!username || !email || !password) {
        return res.error('Missing required fields', 400);
      }

      // Validate Roles
      let roleIds = [];
      if (roles && roles.length > 0) {
        for (const slug of roles) {
          const roleDoc = await roleRepository.findBySlug(slug);
          if (roleDoc) roleIds.push(roleDoc._id);
        }
      } else {
        const defaultRole = await roleRepository.findDefaultRole();
        if (defaultRole) roleIds.push(defaultRole._id);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await userRepository.create({
        username,
        email,
        password: hashedPassword,
        roles: roleIds,
        status,
        mustChangePassword: true // Force password change for admin-created accounts
      });

      // Audit Log
      await auditLogRepository.logAction({
        userId: req.user.id,
        action: 'CREATE',
        resource: 'User',
        resourceId: newUser._id,
        details: { username: newUser.username, roles: roleIds },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      logger.info(`[UserController] User created by Admin: ${newUser.username}`);

      // Sanitize response
      newUser.password = undefined;
      res.success({ user: newUser }, 'User created successfully', 201);
    } catch (error) {
      if (error.code === 11000) {
        return res.error('Username or email already exists', 409);
      }
      logger.error(`[UserController] createUser error: ${error.message}`);
      res.error('Failed to create user', 500, error);
    }
  }

  /**
   * Update a user
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, roles, status, fullName } = req.body;

      // Ensure user exists
      const existingUser = await userRepository.findById(id);
      if (!existingUser) return res.error('User not found', 404);

      // Prevent editing super admin if not super admin yourself (Basic safeguard)
      const existingRoles = existingUser.roles || [];
      const isTargetSuperAdmin = existingRoles.some(r => r.slug === 'super_admin');
      const isRequesterSuperAdmin = req.userPermissions?.includes('super_admin') || req.user?.roles?.includes('super_admin');

      if (isTargetSuperAdmin && !isRequesterSuperAdmin) {
        return res.error('Cannot modify a Super Admin account', 403);
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (status) updateData.status = status;
      if (fullName) updateData['profile.fullName'] = fullName;

      // Handle roles
      if (roles && Array.isArray(roles)) {
        let roleIds = [];
        for (const slug of roles) {
          const roleDoc = await roleRepository.findBySlug(slug);
          if (roleDoc) roleIds.push(roleDoc._id);
        }
        updateData.roles = roleIds;
      }

      const updatedUser = await userRepository.update(id, updateData);

      // Audit Log
      await auditLogRepository.logAction({
        userId: req.user.id,
        action: 'UPDATE',
        resource: 'User',
        resourceId: updatedUser._id,
        details: { changedFields: Object.keys(updateData) },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.success({ user: updatedUser }, 'User updated successfully');
    } catch (error) {
      if (error.code === 11000) return res.error('Username or email already exists', 409);
      logger.error(`[UserController] updateUser error: ${error.message}`);
      res.error('Failed to update user', 500, error);
    }
  }
}

export default new UserController();
