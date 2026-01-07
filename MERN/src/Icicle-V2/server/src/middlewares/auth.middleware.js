// server/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';
import logger from '../utils/logger.utils.js';
import userRepository from '../repositories/user.repository.js';

/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARES
 * ============================================================================
 */

/**
 * Middleware to protect routes by verifying the JWT Access Token.
 * It operates in a STATELESS mode for performance (does not query DB).
 * Extracts token from HttpOnly Cookies (Web) or Authorization Header (API).
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const verifyAccessToken = (req, res, next) => {
  try {
    let token = null;

    // 1. Priority 1: HTTP-Only Cookie (Browser/Next.js Client)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    // 2. Priority 2: Authorization Header (Mobile/External Clients)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Assuming 'res.error' is a custom response enhancer middleware
      return res.error('Unauthorized: Access token is missing', 401);
    }

    // 3. Verify Token Signature & Expiration
    const decoded = jwt.verify(token, config.jwt.accessToken.secret);

    // 4. Attach minimal user info to request
    // We map 'sub' to 'id' to ensure consistency across the application.
    req.user = {
      id: decoded.sub,        // Standardize usage as req.user.id
      _id: decoded.sub,       // Keep _id for Mongoose compatibility
      username: decoded.username,
      roles: decoded.roles,   // Snapshot of roles at the time of login
      type: decoded.type      // Should be 'access'
    };

    next();

  } catch (error) {
    let message = 'Forbidden: Invalid access token';
    let statusCode = 403;

    if (error.name === 'TokenExpiredError') {
      message = 'Forbidden: Access token has expired';
      statusCode = 401; // Client should trigger refresh token flow
    }

    logger.warn(`[Auth] Token verification failed (IP: ${req.ip}): ${error.message}`);
    return res.error(message, statusCode, error);
  }
};

/**
 * Middleware to enforce strict account security policies.
 * Performs a STATEFUL check against the database.
 * * Capabilities:
 * 1. Checks if the user is ACTIVE (not banned/inactive).
 * 2. Enforces "Must Change Password" policy.
 * 3. Syncs latest roles/permissions from DB to req.user (Handling role revocation).
 * * @note This should be placed AFTER 'verifyAccessToken'.
 * * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const requireActiveAndSynced = async (req, res, next) => {
  try {
    // 1. Validation: Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.error('Unauthorized: User context missing', 401);
    }

    // 2. Fetch fresh user data from Database
    // We select only necessary fields to optimize performance
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      logger.warn(`[Auth] Token valid but user not found in DB: ${req.user.id}`);
      return res.error('User not found or account deleted', 404);
    }

    // 3. SECURITY CHECK: Account Status
    if (user.status === 'banned' || user.status === 'inactive') {
      logger.warn(`[Auth] Blocked request from ${user.status} user: ${user.username}`);
      return res.error('Account is disabled or banned', 403, { 
        errorCode: 'ACCOUNT_DISABLED' 
      });
    }

    // 4. POLICY CHECK: Force Change Password
    // Skip this check if the user is currently targeting the change-password route
    const isChangePasswordRoute = req.originalUrl.includes('/change-password');
    
    if (user.mustChangePassword === true && !isChangePasswordRoute) {
      return res.error('Password Change Required', 403, {
        errorCode: 'MUST_CHANGE_PASSWORD',
        redirect: '/dashboard/change-password' // Adjust to your frontend route
      });
    }

    // 5. DATA SYNC: Update Roles (Critical for RBAC)
    // If Admin revoked a role 1 second ago, the JWT is stale. 
    // We update req.user here so subsequent middlewares allow/deny correctly.
    if (user.roles && Array.isArray(user.roles)) {
      // Assuming user.roles is populated. If not, you might need to populate it in repository
      // or handle it based on your repository implementation.
      // Here we assume userRepository.findById populates roles or returns role objects.
      req.user.roles = user.roles.map(r => r.slug || r); 
    }

    next();

  } catch (error) {
    logger.error(`[Auth] requireActiveAndSynced error: ${error.message}`);
    return res.error('Internal Server Error', 500, error);
  }
};