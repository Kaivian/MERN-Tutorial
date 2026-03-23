// server/src/routes/user-curriculum.routes.js
import { Router } from 'express';
import userCurriculumController from '../controllers/user-curriculum.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Protect ALL routes below this line
router.use(verifyAccessToken);

router.get('/', userCurriculumController.getContext);
router.get('/analytics', userCurriculumController.getAnalytics);
router.patch('/context', requirePermission(['profile:edit']), userCurriculumController.updateContext);
router.post('/subjects/:subjectId/grades', requirePermission(['grades:edit']), userCurriculumController.saveGrades);

export default router;
