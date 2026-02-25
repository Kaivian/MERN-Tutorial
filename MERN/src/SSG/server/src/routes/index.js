// server/src/routes/index.js
import { Router } from 'express';
import ENV from '../config/env.config.js';
import authRoutes from './auth.routes.js';
import curriculumRoutes from './curriculum.routes.js';
import userCurriculumRoutes from './user-curriculum.routes.js';
import taskRoutes from './todo/task.routes.js';

const router = Router();

/**
 * Health Check for API
 * @route GET /api/status
 */
router.get('/status', (req, res) => {
  res.success({
    environment: ENV.app.env,
    database: ENV.app.env === 'development' ? 'development_db' : 'production_db',
    uptime: process.uptime()
  }, 'Backend API is running smoothly');
});

/* ==========================================================================
   Module Routes
   ========================================================================== */

/**
 * Authentication Routes
 * @route /api/auth/*
 * @desc  Handles login, register, logout, refresh token, etc.
 */
router.use('/auth', authRoutes);

/**
 * Curriculum Routes
 * @route /api/curriculums/*
 * @desc  Handles curriculum and subject fetching
 */
router.use('/curriculums', curriculumRoutes);

/**
 * User Curriculum Routes
 * @route /api/user/curriculum
 * @desc  Handles user context, saved grades, and GPA
 */
router.use('/user/curriculum', userCurriculumRoutes);

/**
 * Task & Deadline Routes
 * @route /api/tasks
 * @desc  Handles user tasks, subjects constraints and subtask management
 */
router.use('/tasks', taskRoutes);

/**
 * Expense Management Routes
 * @route /api/expense
 * @desc  Handles transaction, recurring expenses, budgets, and dashboard
 */
import expenseRoutes from './expense.routes.js';
router.use('/expense', expenseRoutes);

export default router;