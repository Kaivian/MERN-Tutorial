// server/src/routes/admin-curriculum.routes.js
import { Router } from 'express';
import adminCurriculumController from '../controllers/admin-curriculum.controller.js';
import { verifyAccessToken, requireActiveAndSynced } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// All routes in this file require authentication + active account + curriculums:manage permission
const guard = [verifyAccessToken, requireActiveAndSynced, requirePermission('curriculums:manage')];

// =========================================================
// GLOBAL SUBJECT POOL  (for drag source panel)
// =========================================================
router.get('/subjects', ...guard, adminCurriculumController.getAllSubjects);

// =========================================================
// MAJOR CATEGORIES
// =========================================================
router.get('/major-categories', ...guard, adminCurriculumController.getAllMajorCategories);
router.post('/major-categories', ...guard, adminCurriculumController.createMajorCategory);
router.put('/major-categories/:id', ...guard, adminCurriculumController.updateMajorCategory);
router.delete('/major-categories/:id', ...guard, adminCurriculumController.deleteMajorCategory);

// =========================================================
// MAJORS
// =========================================================
router.get('/majors', ...guard, adminCurriculumController.getAllMajors);
router.post('/majors', ...guard, adminCurriculumController.createMajor);
router.put('/majors/:id', ...guard, adminCurriculumController.updateMajor);
router.delete('/majors/:id', ...guard, adminCurriculumController.deleteMajor);
router.get('/majors/:majorId/subjects', ...guard, adminCurriculumController.getMajorSubjects);
router.put('/majors/:majorId/subjects/:subjectId/move', ...guard, adminCurriculumController.moveSubjectSemester);

// =========================================================
// CLASSES
// =========================================================
router.get('/classes', ...guard, adminCurriculumController.getAllClasses);
router.post('/classes', ...guard, adminCurriculumController.createClass);
router.put('/classes/:id', ...guard, adminCurriculumController.updateClass);
router.delete('/classes/:id', ...guard, adminCurriculumController.deleteClass);

// =========================================================
// CLASS CURRICULUM BUILDER
// =========================================================
router.get('/classes/:classId/curriculum', ...guard, adminCurriculumController.getClassCurriculum);
router.post('/classes/:classId/curriculum/subjects', ...guard, adminCurriculumController.addSubjectToClass);
router.delete('/classes/:classId/curriculum/subjects/:mappingId', ...guard, adminCurriculumController.removeSubjectFromClass);
router.put('/classes/:classId/curriculum/reorder', ...guard, adminCurriculumController.reorderCurriculum);
router.post('/classes/:classId/curriculum/copy-from/:sourceClassId', ...guard, adminCurriculumController.copyCurriculumFromClass);

export default router;
