// server/src/routes/index.js
import { Router } from 'express';
import ENV from '../config/env.config.js';
import authRoutes from './auth.routes.js';

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

export default router;