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
   * * BEST PRACTICE UPDATE:
   * - Access Token: Contains 'sub', 'roles' (slugs), 'type': 'access'.
   * - Refresh Token: Contains only 'sub', 'type': 'refresh'.
   * * @param {Object} user - The user document (must have roles populated).
   * @returns {{accessToken: string, refreshToken: string}}
   */
  generateTokens(user) {
    // 1. Prepare Roles (Map from Objects to Slugs)
    // Ensure roles are populated. If not, fallback to empty array.
    const roleSlugs = user.roles && Array.isArray(user.roles) 
      ? user.roles.map(r => r.slug) 
      : [];

    // 2. Create Access Token Payload (Rich Data for Middleware)
    const accessPayload = {
      sub: user._id.toString(), // Standard Subject Claim
      roles: roleSlugs,         // Custom Claim: ["super_admin", "user"]
      type: 'access'            // Security Claim
    };

    const accessToken = jwt.sign(accessPayload, config.jwt.accessToken.secret, { 
      expiresIn: config.jwt.accessToken.expiresIn 
    });

    // 3. Create Refresh Token Payload (Minimal Data)
    const refreshPayload = {
      sub: user._id.toString(),
      type: 'refresh'
    };

    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshToken.secret, { 
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
    // userObj.roles is kept so frontend can see permissions if needed
    return userObj;
  }

  /* ==================== CORE METHODS ==================== */

  /**
   * Authenticate a user using Username OR Email.
   * @param {Object} input
   * @param {string} input.identifier - The username or email string.
   * @param {string} input.password
   * @param {string} input.ipAddress
   * @param {string} input.userAgent
   * @returns {Promise<Object>}
   */
  async login({ identifier, password, ipAddress, userAgent }) {
    let failReason = '';
    
    // 1. Find User by Credentials
    const user = await userRepository.findByCredentials(identifier);

    try {
      // 2. Validate User Existence
      if (!user) {
        failReason = 'User not found';
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

      // 5. Populate Roles (CRITICAL FOR JWT SLUGS)
      // Fetch 'slug' and 'name' from the Role collection
      await user.populate('roles', 'slug name');

      // 6. Generate Tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // 7. Create/Update Session (Single Device Logic)
      const tokenHash = this.hashToken(refreshToken);
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

      await userRepository.updateSession(user._id, {
        tokenHash,
        ipAddress,
        deviceInfo: { userAgent, type: 'unknown' },
        expiresAt: sessionExpiresAt
      });

      // 8. Audit Log: SUCCESS
      await loginHistoryRepository.create({
        userId: user._id,
        ipAddress,
        deviceInfo: { userAgent },
        status: 'SUCCESS'
      });

      // 9. Return Response
      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        mustChangePassword: user.mustChangePassword
      };

    } catch (error) {
      // 10. Audit Log: FAILURE
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
      
      // Best Practice: Validate Token Type
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
    } catch {
      throw new Error('Invalid refresh token');
    }

    // 2. Check User & Session State
    // decoded.sub is the User ID
    const user = await userRepository.findByIdWithSession(decoded.sub);
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

    // 4. Populate Roles Again (Roles might have changed)
    await user.populate('roles', 'slug name');

    // 5. Token Rotation (Issue NEW pair)
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);
    const newHash = this.hashToken(newRefreshToken);

    // 6. Update DB
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
    
    // Populate roles for profile display
    await user.populate('roles', 'name slug');
    
    return this.sanitizeUser(user);
  }

  /* ==================== ACCOUNT MANAGEMENT ==================== */

  /**
   * Changes the authenticated user's password.
   * @param {string} userId 
   * @param {string} currentPassword 
   * @param {string} newPassword 
   */
  async changePassword(userId, currentPassword, newPassword) {
    // 1. Fetch User WITH PASSWORD explicitly
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error('User not found');

    // 2. Verify Old Password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new Error('Incorrect current password');

    // 3. Prevent reuse
    if (currentPassword === newPassword) {
      throw new Error('New password cannot be the same as the current password');
    }

    // 4. Hash New Password
    // Manual hashing is safer here to ensure consistency if repo uses updateOne
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update Password
    await userRepository.updatePassword(userId, hashedPassword);
    
    logger.info(`[AuthService] Password changed successfully for UserID: ${userId}`);
  }
}

export default new AuthService();