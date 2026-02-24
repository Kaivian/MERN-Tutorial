// server/src/routes/user-curriculum.routes.js
import { Router } from 'express';
import userCurriculumController from '../controllers/user-curriculum.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect ALL routes below this line
router.use(verifyAccessToken);

router.get('/', userCurriculumController.getContext);
router.get('/analytics', userCurriculumController.getAnalytics);
router.patch('/context', userCurriculumController.updateContext);
router.post('/subjects/:subjectId/grades', userCurriculumController.saveGrades);

export default router;
