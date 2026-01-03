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
   * @param {string} token - The raw token string.
   * @returns {string} Hex string of the hashed token.
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a pair of JWTs (Access & Refresh).
   * @param {Object} user - The user document (must have roles populated).
   * @returns {{accessToken: string, refreshToken: string}}
   */
  generateTokens(user) {
    // Ensure roles are populated. If not, fallback to empty array.
    const roleSlugs = user.roles && Array.isArray(user.roles) 
      ? user.roles.map(r => r.slug) 
      : [];

    const accessPayload = {
      sub: user._id.toString(), // Standard Subject Claim
      username: user.username, // Custom Claim
      roles: roleSlugs,         // Custom Claim: ["super_admin", "user"]
      mustChangePassword: user.mustChangePassword, // Custom Claim
      type: 'access'            // Security Claim
    };

    const accessToken = jwt.sign(accessPayload, config.jwt.accessToken.secret, { 
      expiresIn: config.jwt.accessToken.expiresIn 
    });

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
   * Sanitizes the user object for API responses.
   * - Removes sensitive data (password, sessions, __v).
   * - Flattens nested objects (profile.fullName -> fullName).
   * - Normalizes IDs (_id -> id).
   * * @param {import('mongoose').Document} user - The user document.
   * @returns {Object} Clean DTO object.
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;

    // 1. Flatten Profile Data (Developer Experience improvement)
    const fullName = userObj.profile?.fullName || '';
    const avatarUrl = userObj.profile?.avatarUrl || '';

    // 2. Map Roles to Slugs (Lightweight payload)
    // If you need the full Role name, use: r => ({ name: r.name, slug: r.slug })
    const roles = Array.isArray(userObj.roles) 
      ? userObj.roles.map(r => r.slug) 
      : [];

    // 3. Construct Clean Object
    return {
      id: userObj._id.toString(), // Standardize ID
      username: userObj.username,
      email: userObj.email,
      fullName: fullName,
      avatarUrl: avatarUrl,
      roles: roles,
      mustChangePassword: userObj.mustChangePassword,
      status: userObj.status,
      // Explicitly excluding: password, __v, _id, activeSession, loginHistory, etc.
    };
  }

  /* ==================== CORE METHODS ==================== */

  /**
   * Authenticate a user using Username OR Email.
   * @param {Object} input
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

      // 5. Populate Roles (Critical for Token & Response)
      await user.populate('roles', 'slug name');

      // 6. Generate Tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // 7. Create/Update Session
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
      // Note: Login response usually doesn't need full permissions, but can include them if needed.
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
   * Logs out the user.
   * @param {string} userId
   */
  async logout(userId) {
    if (userId) {
      await userRepository.clearSession(userId);
    }
  }

  /**
   * Refreshes the Access Token.
   * @param {string} incomingRefreshToken
   * @returns {Promise<Object>}
   */
  async refreshToken(incomingRefreshToken) {
    // 1. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshToken.secret);
      if (decoded.type !== 'refresh') throw new Error('Invalid token type');
    } catch {
      throw new Error('Invalid refresh token');
    }

    // 2. Check User & Session
    const user = await userRepository.findByIdWithSession(decoded.sub);
    if (!user || !user.activeSession) {
      throw new Error('Session expired or revoked');
    }

    // 3. Token Reuse Detection
    const incomingHash = this.hashToken(incomingRefreshToken);
    if (incomingHash !== user.activeSession.tokenHash) {
      await userRepository.clearSession(user._id);
      logger.warn(`[AuthService] SECURITY ALERT: Token reuse detected for User ${user._id}`);
      throw new Error('Security Alert: Invalid token reuse detected.');
    }

    // 4. Populate Roles
    await user.populate('roles', 'slug name');

    // 5. Rotate Tokens
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
   * Gets the current user context (Profile + Permissions).
   * Used for the /auth/me endpoint.
   * @param {string} userId
   */
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    
    // 1. Populate Roles to get permissions
    // Assuming Role schema has 'permissions' field
    await user.populate('roles', 'name slug permissions');
    
    // 2. Calculate Permissions (Hybrid approach)
    // Aggregate permissions from all roles into a single array
    const allPermissions = user.roles.reduce((acc, role) => {
      return [...acc, ...(role.permissions || [])];
    }, []);
    
    // Deduplicate permissions
    const uniquePermissions = [...new Set(allPermissions)];

    // 3. Return Clean User + Permissions
    return {
      user: this.sanitizeUser(user),
      permissions: uniquePermissions
    };
  }

  /* ==================== ACCOUNT MANAGEMENT ==================== */

  /**
   * Changes the authenticated user's password.
   * @param {string} userId 
   * @param {string} currentPassword 
   * @param {string} newPassword 
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new Error('Incorrect current password');

    if (currentPassword === newPassword) {
      throw new Error('New password cannot be the same as the current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, hashedPassword);
    
    logger.info(`[AuthService] Password changed successfully for UserID: ${userId}`);
  }
}

export default new AuthService();