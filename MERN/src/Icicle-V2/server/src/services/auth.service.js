// server/src/services/auth.service.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import config from '../config/env.config.js';
import userRepository from '../repositories/user.repository.js';
import loginHistoryRepository from '../repositories/login-history.repository.js';
import logger from '../utils/logger.utils.js';

/**
 * Service class handling all authentication and authorization business logic.
 * Encapsulates complexity of token management, password hashing, and audit logging.
 */
class AuthService {

  /* ==================== PRIVATE HELPERS ==================== */

  /**
   * Hashes a raw token (like a refresh token) using SHA-256.
   * Ensures that even if the DB is compromised, valid tokens are not leaked.
   * @param {string} token - The raw token string.
   * @returns {string} Hex string of the hashed token.
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a pair of JWTs (Access & Refresh).
   * Uses configuration from env.config.js.
   * @param {Object} payload - Data to encode (e.g., { id: '...' }).
   * @returns {{accessToken: string, refreshToken: string}}
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, config.jwt.accessToken.secret, { 
      expiresIn: config.jwt.accessToken.expiresIn 
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshToken.secret, { 
      expiresIn: config.jwt.refreshToken.expiresIn 
    });

    return { accessToken, refreshToken };
  }

  /**
   * Removes sensitive fields (password, internal session data) from the user object.
   * @param {import('mongoose').Document} user - The user document.
   * @returns {Object} Sanitized user object.
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    delete userObj.activeSession;
    delete userObj.loginHistory;
    return userObj;
  }

  /* ==================== CORE METHODS ==================== */

  /**
   * Authenticate a user using Username OR Email.
   * * @param {Object} input
   * @param {string} input.identifier - The username or email string.
   * @param {string} input.password
   * @param {string} input.ipAddress
   * @param {string} input.userAgent
   * @returns {Promise<Object>}
   */
  async login({ identifier, password, ipAddress, userAgent }) {
    let failReason = '';
    
    // 1. Find User by Credentials (Username OR Email)
    const user = await userRepository.findByCredentials(identifier);

    try {
      // 2. Validate User Existence
      if (!user) {
        failReason = 'User not found';
        // Security: Generic message to prevent User Enumeration
        throw new Error('Invalid username/email or password');
      }

      // 3. Validate Password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        failReason = 'Invalid password';
        throw new Error('Invalid username/email or password');
      }

      // 4. Check Account Status
      if (user.status === 'banned') {
        failReason = 'Account banned';
        throw new Error('Account is banned');
      }

      // 5. Generate Tokens
      const payload = { id: user._id };
      const { accessToken, refreshToken } = this.generateTokens(payload);

      // 6. Create/Update Session (Single Device Logic)
      const tokenHash = this.hashToken(refreshToken);
      
      // Expire in 7 days (Sync with JWT expiry if possible)
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await userRepository.updateSession(user._id, {
        tokenHash,
        ipAddress,
        deviceInfo: { userAgent, type: 'unknown' },
        expiresAt: sessionExpiresAt
      });

      // 7. Audit Log: SUCCESS
      await loginHistoryRepository.create({
        userId: user._id,
        ipAddress,
        deviceInfo: { userAgent },
        status: 'SUCCESS'
      });

      // 8. Return Response
      // Explicitly returning 'mustChangePassword' for Frontend redirect logic
      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        mustChangePassword: user.mustChangePassword
      };

    } catch (error) {
      // 9. Audit Log: FAILURE (Only if user exists)
      if (user) {
        await loginHistoryRepository.create({
          userId: user._id,
          ipAddress,
          deviceInfo: { userAgent },
          status: 'FAILED',
          failReason
        });
      }
      throw error;
    }
  }

  /**
   * Logs out the user by clearing the active session in DB.
   * @param {string} userId
   */
  async logout(userId) {
    if (userId) {
      await userRepository.clearSession(userId);
    }
  }

  /**
   * Refreshes the Access Token using Token Rotation.
   * Detects and blocks Token Reuse attacks.
   *
   * @param {string} incomingRefreshToken - Raw refresh token from cookie.
   * @returns {Promise<Object>} { accessToken, refreshToken }
   */
  async refreshToken(incomingRefreshToken) {
    // 1. Verify JWT Structure & Signature
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshToken.secret);
    } catch { 
      throw new Error('Invalid refresh token');
    }

    // 2. Check User & Session State
    const user = await userRepository.findByIdWithSession(decoded.id);
    if (!user || !user.activeSession) {
      throw new Error('Session expired or revoked');
    }

    // 3. SECURITY: Check for Token Reuse
    const incomingHash = this.hashToken(incomingRefreshToken);
    
    if (incomingHash !== user.activeSession.tokenHash) {
      // Critical Security Event: Token reuse detected!
      await userRepository.clearSession(user._id);
      logger.warn(`[AuthService] SECURITY ALERT: Token reuse detected for User ${user._id}. Session revoked.`);
      throw new Error('Security Alert: Invalid token reuse detected. Please login again.');
    }

    // 4. Token Rotation (Issue NEW pair)
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({ id: user._id });
    const newHash = this.hashToken(newRefreshToken);

    // 5. Update DB
    await userRepository.updateSession(user._id, {
      ...user.activeSession, 
      tokenHash: newHash,    
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Gets the current user profile.
   * @param {string} userId
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return this.sanitizeUser(user);
  }

  /* ==================== ACCOUNT MANAGEMENT ==================== */

  /**
   * Changes the authenticated user's password.
   * Requires checking the old password first for security.
   * * @param {string} userId - The ID of the user requesting change.
   * @param {string} currentPassword - The old password provided by user.
   * @param {string} newPassword - The new password to set.
   */
  async changePassword(userId, currentPassword, newPassword) {
    // 1. Fetch User WITH PASSWORD explicitly.
    // Standard findById() excludes password, so matchPassword() would fail without this.
    const user = await userRepository.findByIdWithPassword(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Verify Old Password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    // 3. Prevent reusing the same password (Optional Best Practice)
    if (currentPassword === newPassword) {
      throw new Error('New password cannot be the same as the current password');
    }

    // 4. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update Password and Reset 'mustChangePassword' flag
    // The repository method handles both updating the hash and setting mustChangePassword to false.
    await userRepository.updatePassword(userId, hashedPassword);
    
    // 6. Security Action: Log this event
    logger.info(`[AuthService] Password changed successfully for UserID: ${userId}`);
  }
}

export default new AuthService();