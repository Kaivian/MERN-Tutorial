// server/src/routes/curriculum.routes.js
import { Router } from 'express';
import curriculumController from '../controllers/curriculum.controller.js';

const router = Router();

// Routes for curriculum data
router.get('/programs', curriculumController.getPrograms);
router.get('/:code/semesters', curriculumController.getSemesters);
router.get('/:code/subjects', curriculumController.getSubjects);

export default router;
