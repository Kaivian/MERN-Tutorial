// server/src/routes/auth.routes.js
import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { 
  registerSchema,
  loginSchema, 
  changePasswordSchema 
} from '../validations/auth.validation.js';
import authController from '../controllers/auth.controller.js';
import { verifyAccessToken, requireActiveAndSynced } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* ==========================================================================
   Public Routes (No Authentication Required)
   ========================================================================== */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, assign default role & auto-login
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & set cookies (accessToken, refreshToken)
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear authentication cookies
 * @access  Public (Can be protected, but safe as public if clearing cookies)
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using the httpOnly refresh token cookie
 * @access  Public (Validated via Cookie)
 */
router.post('/refresh', authController.refreshToken);

/* ==========================================================================
   Protected Routes (Authentication Required)
   ========================================================================== */

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user's context (ID, Roles, Permissions).
 * Optimized for Client-side Auth Context (Lightweight).
 * @access  Private (Requires valid Access Token)
 */
router.get('/me',
  verifyAccessToken,
  requireActiveAndSynced,
  authController.getMe
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change current user's password. Requires old password verification.
 * @access  Private (Requires valid Access Token)
 */
router.post('/change-password', 
  verifyAccessToken,             // 1. Check Login (Get User ID)
  validate(changePasswordSchema),// 2. Validate Rules (Regex, Old != New, Confirm match)
  authController.changePassword  // 3. Execute Logic
);

export default router;