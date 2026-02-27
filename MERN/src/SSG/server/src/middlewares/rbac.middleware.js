// server/src/middlewares/rbac.middleware.js
import logger from '../utils/logger.utils.js';
import userRepository from '../repositories/user.repository.js';

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 * Checks if the authenticated user has the necessary permissions.
 * 
 * @param {string | string[]} requiredPermissions - The permission(s) required to access the route.
 * @param {string} mode - 'AND' requires all permissions, 'OR' requires at least one.
 * @returns {Function} Express middleware function.
 */
export const requirePermission = (requiredPermissions, mode = 'AND') => {
  return async (req, res, next) => {
    try {
      // 1. Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.error('Unauthorized: User context missing', 401);
      }

      // 2. Fetch fresh user data with populated roles
      const user = await userRepository.findById(req.user.id);

      if (!user) {
        return res.error('User not found', 404);
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.error('Account is disabled or banned', 403);
      }

      // 3. Extract unique permissions from active roles
      const activeRoles = user.roles?.filter(r => r.status === 'active') || [];
      const userPermissions = activeRoles.reduce((acc, role) => {
        return [...acc, ...(role.permissions || [])];
      }, []);
      const uniquePermissions = [...new Set(userPermissions)];

      // 4. Attach to req for potential downstream use (e.g., specific field filtering)
      req.userPermissions = uniquePermissions;

      // Super Admin Override (Optional but common pattern)
      if (activeRoles.some(r => r.slug === 'super_admin')) {
        return next();
      }

      // 5. Evaluate Required Permissions
      const permsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      let hasAccess = false;
      if (mode === 'AND') {
        hasAccess = permsToCheck.every(perm => uniquePermissions.includes(perm));
      } else { // 'OR'
        hasAccess = permsToCheck.some(perm => uniquePermissions.includes(perm));
      }

      // 6. Access Decision
      if (!hasAccess) {
        logger.warn(`[RBAC] Access Denied for User ID ${user._id} to ${req.originalUrl}. Required: ${permsToCheck.join(', ')}`);
        return res.error('Forbidden: Insufficient privileges', 403, { errorCode: 'INSUFFICIENT_PERMISSIONS' });
      }

      next();

    } catch (error) {
      logger.error(`[RBAC] Middleware error: ${error.message}`);
      return res.error('Internal Server Error during permission verification', 500, error);
    }
  };
};
