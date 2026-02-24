// server/src/routes/todo/task.routes.js
import express from 'express';
import taskController from '../../controllers/todo/task.controller.js';
import { verifyAccessToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyAccessToken);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
