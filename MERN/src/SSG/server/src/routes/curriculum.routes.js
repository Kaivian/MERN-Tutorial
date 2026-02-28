// server/src/routes/curriculum.routes.js
import { Router } from 'express';
import curriculumController from '../controllers/curriculum.controller.js';
import adminCurriculumController from '../controllers/admin-curriculum.controller.js';
import { verifyAccessToken, requireActiveAndSynced } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Public curriculum data routes
router.get('/programs', curriculumController.getPrograms);

// ===  Public read-only routes for the new Admin Hierarchy (student-facing selects) ===
// MUST be BEFORE /:code wildcard routes, otherwise Express matches "hierarchy" as :code
const authGuard = [verifyAccessToken, requireActiveAndSynced];
router.get('/hierarchy/categories', ...authGuard, adminCurriculumController.getAllMajorCategories);
router.get('/hierarchy/majors', ...authGuard, adminCurriculumController.getAllMajors);
router.get('/hierarchy/classes', ...authGuard, adminCurriculumController.getAllClasses);

// Admin routes for managing subjects (non-parameterized path, before :code)
router.put('/subjects/:subjectId', verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage'), curriculumController.updateSubject);

// Wildcard :code routes AFTER all fixed-path routes
router.get('/:code/semesters', curriculumController.getSemesters);
router.get('/:code/subjects', curriculumController.getSubjects);

// Admin CRUD routes for curriculums (also using :code wildcard)
router.post('/', verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage'), curriculumController.createCurriculum);
router.put('/:code', verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage'), curriculumController.updateCurriculum);
router.delete('/:code', verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage'), curriculumController.deleteCurriculum);

// Admin routes for managing subjects within a curriculum
router.post('/:code/subjects', verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage'), curriculumController.createSubject);
router.delete('/:code/subjects/:subjectId', verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage'), curriculumController.deleteSubject);

export default router;
