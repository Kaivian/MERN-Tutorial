// server/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';
import logger from '../utils/logger.utils.js';
import userRepository from '../repositories/user.repository.js';

/**
 * Middleware to protect routes by verifying the JWT Access Token.
 * Extracts token from Cookies or Authorization Header.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verifyAccessToken = (req, res, next) => {
  try {
    let token = null;

    // 1. Priority 1: HTTP-Only Cookie (Web App)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    // 2. Priority 2: Authorization Header (Mobile/API Clients)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.error('Unauthorized: Access token is missing', 401);
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, config.jwt.accessToken.secret);

    // 4. Attach generic user info to request (ID is crucial here)
    req.user = decoded; 

    next();

  } catch (error) {
    let message = 'Forbidden: Invalid access token';
    let statusCode = 403;

    if (error.name === 'TokenExpiredError') {
      message = 'Forbidden: Access token has expired';
      statusCode = 401; // Expired usually implies 401 so client knows to refresh
    }

    logger.warn(`[Auth] Token verification failed (IP: ${req.ip}): ${error.message}`);
    return res.error(message, statusCode, error);
  }
};

/**
 * Middleware to enforce "Force Change Password" policy.
 * Must be placed AFTER verifyAccessToken.
 * Checks DB to see if the user is flagged to change their password.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requirePasswordChanged = async (req, res, next) => {
  try {
    // 1. Ensure user is authenticated first
    if (!req.user || !req.user.id) {
      return res.error('Unauthorized', 401);
    }

    // 2. Fetch latest user status from DB
    // We need real-time status, not just what's in the token
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      return res.error('User not found', 404);
    }

    // 3. Check the flag
    if (user.mustChangePassword === true) {
      // Return 403 with specific error code for Frontend to handle redirect
      return res.error('Password Change Required', 403, {
        errorCode: 'MUST_CHANGE_PASSWORD',
        redirect: '/change-password'
      });
    }

    next();
  } catch (error) {
    logger.error(`[Auth] requirePasswordChanged middleware error: ${error.message}`);
    return res.error('Internal Server Error', 500, error);
  }
};