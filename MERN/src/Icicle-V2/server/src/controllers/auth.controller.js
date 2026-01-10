// server/src/controllers/auth.controller.js
import authService from '../services/auth.service.js';
import logger from '../utils/logger.utils.js';
import ENV from '../config/env.config.js';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Centralized Cookie Configuration.
 * Ensures consistency across Login, Refresh, and ChangePassword.
 */
const COOKIE_OPTS = {
  httpOnly: true,
  secure: ENV.app.env === 'production', // HTTPS only in production
  sameSite: 'lax',                         // 'lax' allows navigation from external sites
  path: '/',
};

const COOKIE_NAMES = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
};

// ============================================================================
// CONTROLLER IMPLEMENTATION
// ============================================================================

class AuthController {

  /**
   * Helper to set authentication cookies in the response.
   * @param {Response} res - Express Response object
   * @param {Object} tokens - Object containing accessToken and refreshToken
   */
  setAuthCookies(res, { accessToken, refreshToken }) {
    if (refreshToken) {
      res.cookie(COOKIE_NAMES.REFRESH, refreshToken, {
        ...COOKIE_OPTS,
        maxAge: ENV.jwt.refreshToken.maxAge, // e.g., 7 days
      });
    }

    if (accessToken) {
      res.cookie(COOKIE_NAMES.ACCESS, accessToken, {
        ...COOKIE_OPTS,
        maxAge: ENV.jwt.accessToken.maxAge, // e.g., 15 mins
      });
    }
  }

  /**
   * Helper to clear authentication cookies.
   * used for Logout or Error handling.
   */
  clearAuthCookies(res) {
    const clearOpts = { ...COOKIE_OPTS, maxAge: 0 };
    res.clearCookie(COOKIE_NAMES.ACCESS, clearOpts);
    res.clearCookie(COOKIE_NAMES.REFRESH, clearOpts);
  }

  /**
   * Handle User Login.
   */
  async login(req, res) {
    try {
      const { password, identifier, username, email } = req.body;
      const loginIdentifier = identifier || username || email;

      if (!loginIdentifier) {
        return res.error('Username or Email is required', 400);
      }

      const { user, accessToken, refreshToken, mustChangePassword } = await authService.login({
        identifier: loginIdentifier,
        password,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // 1. Set Cookies
      this.setAuthCookies(res, { accessToken, refreshToken });

      // 2. Check Force Password Change Policy
      if (mustChangePassword) {
        logger.info(`[Auth] User logged in but requires password change: ${user.username}`);
        return res.success(
          { user, requireAction: 'CHANGE_PASSWORD' },
          'Password change required to proceed'
        );
      }

      // 3. Success Response
      logger.success(`[Auth] User logged in: ${user.username}`);
      res.success({ user }, 'Login successful');

    } catch (error) {
      const status = error.message === 'Account is banned' ? 403 : 401;
      logger.warn(`[Auth] Login failed: ${error.message}`);
      res.error(error.message, status, error);
    }
  }

  /**
   * Handle User Logout.
   */
  async logout(req, res) {
    try {
      if (req.user?.id) {
        await authService.logout(req.user.id);
      }
      
      this.clearAuthCookies(res);
      logger.info(`[Auth] User logged out (IP: ${req.ip})`);
      
      res.success(null, 'Logged out successfully');
    } catch (error) {
      logger.error(`[Auth] Logout error: ${error.message}`);
      res.error('Logout failed', 500, error);
    }
  }

  /**
   * Refresh Access Token.
   * Critical for keeping the user session alive transparently.
   */
  async refreshToken(req, res) {
    try {
      const incomingRefreshToken = req.cookies[COOKIE_NAMES.REFRESH];

      if (!incomingRefreshToken) {
        return res.error('Refresh token missing', 401);
      }

      const { accessToken, refreshToken } = await authService.refreshToken(incomingRefreshToken);

      // Rotate Tokens (Set new cookies)
      this.setAuthCookies(res, { accessToken, refreshToken });

      // [IMPORTANT]: Return accessToken in body for Client Middleware/Proxy to intercept
      return res.success({ accessToken }, 'Token refreshed');

    } catch (error) {
      // If refresh fails (expired/reuse), clear everything to force re-login
      this.clearAuthCookies(res);
      
      logger.error(`[Auth] Refresh token failed: ${error.message}`);
      return res.error(error.message, 403, error);
    }
  }

  /**
   * Get Current User Context (/me).
   */
  async getMe(req, res) {
    try {
      // req.user.id comes from the verifyToken middleware
      const data = await authService.getMe(req.user.id);
      res.success({ user: data.user, permissions: data.permissions }, 'User context retrieved');
    } catch (error) {
      logger.error(`[Auth] GetMe failed: ${error.message}`);
      res.error(error.message, 404, error);
    }
  }

  /**
   * Handle Change Password.
   * Auto-refreshes session (token rotation) upon success.
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword,
        { 
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1', 
          userAgent: req.headers['user-agent'] || 'Unknown' 
        }
      );

      // Rotate tokens immediately so user stays logged in with new state
      this.setAuthCookies(res, { 
        accessToken: result.accessToken, 
        refreshToken: result.refreshToken 
      });

      logger.success(`[Auth] Password changed for UserID: ${userId}`);
      
      res.success({ 
        message: 'Password changed successfully', 
        user: result.user 
      });

    } catch (error) {
      // Map specific service errors to HTTP codes
      if (error.message.includes('Incorrect current')) return res.error(error.message, 400);
      if (error.message.includes('New password')) return res.error(error.message, 422);

      logger.warn(`[Auth] Change password failed: ${error.message}`);
      res.error(error.message, 500, error);
    }
  }
}

// ============================================================================
// EXPORT & BINDING
// ============================================================================

const controller = new AuthController();

// Explicitly bind methods to the controller instance to preserve 'this' context
// when used as Express route handlers.
export default {
  login: controller.login.bind(controller),
  logout: controller.logout.bind(controller),
  refreshToken: controller.refreshToken.bind(controller),
  getMe: controller.getMe.bind(controller),
  changePassword: controller.changePassword.bind(controller)
};