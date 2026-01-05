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
   * Centralized to ensure consistency across Login, Refresh, and ChangePassword.
   */
  get cookieOptions() {
    return {
      httpOnly: true,               // Prevents JavaScript access (XSS protection)
      secure: config.app.env === 'production', // HTTPS only in production
      sameSite: 'lax',              // 'lax' allows navigation from external sites, 'strict' is safer for APIs
      path: '/'                     // Available across the entire site
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

      // --- Set Cookies (Using centralized config) ---
      res.cookie('refreshToken', refreshToken, {
        ...this.cookieOptions,
        maxAge: this.tokenMaxAges.refreshToken
      });

      res.cookie('accessToken', accessToken, {
        ...this.cookieOptions,
        maxAge: this.tokenMaxAges.accessToken
      });

      // CHECK STATUS: Force Password Change
      if (user.mustChangePassword) {
        logger.info(`[Auth] User logged in but requires password change: ${user.username}`);
        
        return res.success(
          { 
            user,
            requireAction: 'CHANGE_PASSWORD' 
          }, 
          'Password change required to proceed'
        );
      }

      // Standard Success Flow
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

      // Clear cookies
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
   * [CRITICAL FIX]: Now sets HttpOnly cookies for BOTH tokens (Token Rotation).
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; 

      if (!userId) {
        return res.error('User context missing', 401);
      }

      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Execute Service Logic
      // Assuming authService.changePassword returns: { user, accessToken, refreshToken }
      const result = await authService.changePassword(
        userId, 
        currentPassword, 
        newPassword,
        { ipAddress, userAgent }
      );

      // --- [FIXED] COOKIE HANDLING ---
      // Apply the same cookie logic as Login/Refresh
      
      // 1. Set Refresh Token Cookie
      res.cookie('refreshToken', result.refreshToken, {
        ...this.cookieOptions,
        maxAge: this.tokenMaxAges.refreshToken
      });

      // 2. Set Access Token Cookie (Crucial for Client Middleware to see the new state)
      res.cookie('accessToken', result.accessToken, {
        ...this.cookieOptions,
        maxAge: this.tokenMaxAges.accessToken
      });

      logger.success(`[Auth] Password changed & tokens rotated for UserID: ${userId}`);

      // Return Success
      res.success({
        message: 'Password changed successfully',
        user: result.user
        // Tokens are in cookies, no need to return in body, 
        // but can keep 'user' for UI updates.
      });

    } catch (error) {
      // Handle known operational errors
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
// Bind methods to ensure 'this' refers to the controller instance
export default {
  login: controller.login.bind(controller),
  logout: controller.logout.bind(controller),
  refreshToken: controller.refreshToken.bind(controller),
  getMe: controller.getMe.bind(controller),
  changePassword: controller.changePassword.bind(controller)
};