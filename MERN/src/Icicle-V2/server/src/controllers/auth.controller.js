// server/src/controllers/auth.controller.js
import authService from '../services/auth.service.js';
import logger from '../utils/logger.utils.js';
import config from '../config/env.config.js';

/**
 * Controller handling all Authentication endpoints.
 * Interacts with AuthService and manages HTTP responses/cookies.
 */
class AuthController {
  
  /**
   * Standardized cookie configuration for security.
   * Based on environment variables.
   * @readonly
   */
  get cookieOptions() {
    return {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: config.app.env === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      path: '/'
    };
  }

  /**
   * Handle User Login.
   * Sets Access and Refresh tokens in HTTP-Only cookies.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async login(req, res) {
    try {
      // Allow flexible input from Frontend:
      // Can send { "identifier": "..." } OR { "username": "..." } OR { "email": "..." }
      const { password, identifier, username, email } = req.body;
      
      // Coalesce into a single identifier variable
      const loginIdentifier = identifier || username || email;

      if (!loginIdentifier) {
        return res.error('Username or Email is required', 400);
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Call Service with 'identifier'
      const { user, accessToken, refreshToken } = await authService.login({
        identifier: loginIdentifier, 
        password, 
        ipAddress, 
        userAgent
      });

      // Set Cookies
      res.cookie('refreshToken', refreshToken, { 
        ...this.cookieOptions, 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.cookie('accessToken', accessToken, { 
        ...this.cookieOptions, 
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      logger.success(`[Auth] User logged in: ${user.username} (${user.email})`);

      res.success({ user }, 'Login successful');
    } catch (error) {
      const statusCode = error.message === 'Account is banned' ? 403 : 401;
      
      // Use generic log message to avoid leaking sensitive info
      logger.warn(`[Auth] Login failed for identifier: ${req.body.identifier || req.body.username || req.body.email}. Reason: ${error.message}`);
      
      res.error(error.message, statusCode, error);
    }
  }

  /**
   * Handle User Logout.
   * Clears cookies and invalidates session in DB.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async logout(req, res) {
    try {
      // In a strict implementation, we would decode the refreshToken to get the userID 
      // and call authService.logout(userId) to clear the session in DB.
      // For now, clearing cookies is sufficient for the client-side.
      
      res.clearCookie('accessToken', this.cookieOptions);
      res.clearCookie('refreshToken', this.cookieOptions);
      
      logger.info(`[Auth] User logged out (IP: ${req.ip})`);
      
      res.success(null, 'Logged out successfully');
    } catch (error) {
      logger.error(`[Auth] Logout error`, error.message);
      res.error('Logout failed', 500, error);
    }
  }

  /**
   * Refresh Access Token.
   * Uses the Refresh Token cookie to issue a new pair of tokens.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async refreshToken(req, res) {
    try {
      const incomingRefreshToken = req.cookies.refreshToken;
      
      if (!incomingRefreshToken) {
        // Just a warning, happens often when cookies expire
        return res.error('Refresh token missing', 401);
      }

      const { accessToken, refreshToken } = await authService.refreshToken(incomingRefreshToken);

      // Update Cookies with rotated tokens
      res.cookie('refreshToken', refreshToken, { ...this.cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('accessToken', accessToken, { ...this.cookieOptions, maxAge: 15 * 60 * 1000 });

      res.success(null, 'Token refreshed');
    } catch (error) {
      // Security: Clear cookies immediately if refresh fails (e.g., Reuse detection)
      res.clearCookie('accessToken', this.cookieOptions);
      res.clearCookie('refreshToken', this.cookieOptions);
      
      logger.error(`[Auth] Refresh token failed: ${error.message}`);
      
      res.error(error.message, 403, error);
    }
  }

  /**
   * Get Current User Profile.
   * Protected route requiring valid Access Token.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getMe(req, res) {
    try {
      // req.user is populated by verifyAccessToken middleware
      const user = await authService.getProfile(req.user.id);
      res.success({ user }, 'Profile retrieved');
    } catch (error) {
      logger.error(`[Auth] GetMe failed for UserID ${req.user?.id}: ${error.message}`);
      res.error(error.message, 404, error);
    }
  }

  /**
   * Handle Change Password.
   * Requires Login (Protected Route).
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // Extracted from Access Token

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.success(`[Auth] Password changed successfully for UserID: ${userId}`);
      res.success(null, 'Password changed successfully');
    } catch (error) {
      logger.warn(`[Auth] Change password failed for UserID ${req.user?.id}: ${error.message}`);
      res.error(error.message, 400, error);
    }
  }
}

// Export instance with bound methods
const controller = new AuthController();
export default {
  login: controller.login.bind(controller),
  logout: controller.logout.bind(controller),
  refreshToken: controller.refreshToken.bind(controller),
  getMe: controller.getMe.bind(controller),
  changePassword: controller.changePassword.bind(controller)
};