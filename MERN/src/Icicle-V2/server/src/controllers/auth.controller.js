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
   * Note: 'maxAge' is not set here because it differs for Access/Refresh tokens.
   */
  get cookieOptions() {
    return {
      httpOnly: true,                 // Prevents JavaScript access (XSS protection)
      secure: config.app.env === 'production', // HTTPS only in production
      sameSite: 'lax',                // CSRF protection (Use 'lax' for better UX with redirections, 'strict' if API only)
      path: '/'                       // Available across the entire site
    };
  }

  /**
   * Centralized Token Expiration Times (in Milliseconds)
   * MUST SYNC with your .env JWT configuration
   */
  get tokenMaxAges() {
    return {
      // 15 minutes (15 * 60 * 1000)
      accessToken: config.jwt.accessToken.maxAge,
      // 7 days (7 * 24 * 60 * 60 * 1000)
      refreshToken: config.jwt.refreshToken.maxAge
    };
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

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const { user, accessToken, refreshToken } = await authService.login({
        identifier: loginIdentifier,
        password,
        ipAddress,
        userAgent
      });

      // --- Set Cookies (Using centralized maxAges) ---
      res.cookie('refreshToken', refreshToken, {
        ...this.cookieOptions,
        maxAge: this.tokenMaxAges.refreshToken
      });

      res.cookie('accessToken', accessToken, {
        ...this.cookieOptions,
        maxAge: this.tokenMaxAges.accessToken
      });

      logger.success(`[Auth] User logged in: ${user.username} (${user.email})`);

      res.success({ user }, 'Login successful');
    } catch (error) {
      const statusCode = error.message === 'Account is banned' ? 403 : 401;
      logger.warn(`[Auth] Login failed: ${error.message}`);
      res.error(error.message, statusCode, error);
    }
  }

  /**
   * Handle User Logout.
   * Clears cookies and invalidates session in DB.
   */
  async logout(req, res) {
    try {
      if (req.user && req.user.id) {
        await authService.logout(req.user.id);
      }

      // Clear cookies with the same options (path, secure, etc.)
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
   */
  async refreshToken(req, res) {
    try {
      const incomingRefreshToken = req.cookies.refreshToken;

      if (!incomingRefreshToken) {
        return res.error('Refresh token missing', 401);
      }

      const { accessToken, refreshToken } = await authService.refreshToken(incomingRefreshToken);

      // --- Update Cookies with rotated tokens ---
      res.cookie('refreshToken', refreshToken, { 
        ...this.cookieOptions, 
        maxAge: this.tokenMaxAges.refreshToken 
      });
      
      res.cookie('accessToken', accessToken, { 
        ...this.cookieOptions, 
        maxAge: this.tokenMaxAges.accessToken 
      });

      res.success(null, 'Token refreshed');
    } catch (error) {
      // Security: Clear cookies immediately if refresh fails
      res.clearCookie('accessToken', this.cookieOptions);
      res.clearCookie('refreshToken', this.cookieOptions);

      logger.error(`[Auth] Refresh token failed: ${error.message}`);
      res.error(error.message, 403, error);
    }
  }

  /**
   * Get Current User Context.
   */
  async getMe(req, res) {
    try {
      const data = await authService.getMe(req.user.id);
      res.success({ user: data.user, permissions: data.permissions }, 'User context retrieved');
    } catch (error) {
      logger.error(`[Auth] GetMe failed: ${error.message}`);
      res.error(error.message, 404, error);
    }
  }

  /**
   * Handle Change Password.
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // From middleware

      if (!userId) {
        return res.error('User context missing', 401);
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.success(`[Auth] Password changed successfully for UserID: ${userId}`);
      res.success(null, 'Password changed successfully');
    } catch (error) {
      if (error.message.includes('Incorrect current password') || error.message.includes('User not found')) {
        return res.error(error.message, 400, error);
      }
      if (error.message.includes('New password cannot be')) {
        return res.error(error.message, 422, error);
      }

      logger.warn(`[Auth] Change password failed: ${error.message}`);
      res.error(error.message, 500, error);
    }
  }
}

const controller = new AuthController();
export default {
  login: controller.login.bind(controller),
  logout: controller.logout.bind(controller),
  refreshToken: controller.refreshToken.bind(controller),
  getMe: controller.getMe.bind(controller),
  changePassword: controller.changePassword.bind(controller)
};