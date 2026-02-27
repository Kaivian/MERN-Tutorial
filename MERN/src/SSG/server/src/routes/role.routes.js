// server/src/routes/role.routes.js
import { Router } from 'express';
import roleController from '../controllers/role.controller.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// ============================================================================
// ROLE MANAGEMENT ROUTES (Require RBAC)
// ============================================================================

router.get('/', requirePermission('roles:view'), (req, res) => roleController.getRoles(req, res));
router.post('/', requirePermission('roles:create'), (req, res) => roleController.createRole(req, res));
router.get('/:id', requirePermission('roles:view'), (req, res) => roleController.getRole(req, res));
router.put('/:id', requirePermission('roles:edit'), (req, res) => roleController.updateRole(req, res));
router.delete('/:id', requirePermission('roles:delete'), (req, res) => roleController.deleteRole(req, res));

export default router;
