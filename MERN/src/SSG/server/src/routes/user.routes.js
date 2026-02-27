// server/src/routes/user.routes.js
import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// ============================================================================
// USER MANAGEMENT ROUTES (Require RBAC)
// All routes here should be mounted under a path protected by VerifyToken and RequireActive
// e.g., app.use('/api/users', verifyAccessToken, requireActiveAndSynced, userRoutes)
// ============================================================================

router.get('/', requirePermission('users:view'), (req, res) => userController.getUsers(req, res));
router.post('/', requirePermission('users:create'), (req, res) => userController.createUser(req, res));
router.get('/:id', requirePermission('users:view'), (req, res) => userController.getUser(req, res));
router.put('/:id', requirePermission('users:edit'), (req, res) => userController.updateUser(req, res));

// Note: Lock/Unlock is handled via PUT /:id (updating status field)

export default router;
