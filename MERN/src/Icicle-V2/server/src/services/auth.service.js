// server/src/services/auth.service.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import config from '../config/env.config.js';
import userRepository from '../repositories/user.repository.js';
import loginHistoryRepository from '../repositories/login-history.repository.js';
import logger from '../utils/logger.utils.js';

const GRACE_PERIOD_MS = 10000; // 10 Seconds allow for concurrency

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
   * @param {import('mongoose').Document} user - The user document.
   * @returns {Object} Clean DTO object.
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;

    return {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      fullName: userObj.profile?.fullName || '',
      avatarUrl: userObj.profile?.avatarUrl || '',
      roles: Array.isArray(userObj.roles) ? userObj.roles.map(r => r.slug) : [],
      mustChangePassword: userObj.mustChangePassword,
      status: userObj.status,
    };
  }

  /* ==================== CORE METHODS ==================== */

  /**
   * Authenticate a user using Username OR Email.
   */
  async login({ identifier, password, ipAddress, userAgent }) {
    // 1. Find User
    const user = await userRepository.findByCredentials(identifier);

    try {
      // 2. Validate Existence & Password
      if (!user) throw new Error('Invalid credentials');
      const isMatch = await user.matchPassword(password);
      if (!isMatch) throw new Error('Invalid credentials'); // Generic msg for security

      // 3. Check Status
      if (user.status === 'banned') throw new Error('Account is banned');

      // 4. Populate Roles
      await user.populate('roles', 'slug name');

      // 5. Generate Tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // 6. Update Session
      const tokenHash = this.hashToken(refreshToken);
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

      await userRepository.updateSession(user._id, {
        tokenHash,
        ipAddress,
        deviceInfo: { userAgent, type: 'unknown' },
        expiresAt: sessionExpiresAt,
        lastRefreshedAt: new Date() // [NEW] Track initial login time
      });

      // 7. Audit Log
      await loginHistoryRepository.create({
        userId: user._id,
        ipAddress,
        deviceInfo: { userAgent },
        status: 'SUCCESS'
      });

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        mustChangePassword: user.mustChangePassword
      };

    } catch (error) {
      if (user) {
        await loginHistoryRepository.create({
          userId: user._id,
          ipAddress,
          deviceInfo: { userAgent },
          status: 'FAILED',
          failReason: error.message
        });
      }
      throw error;
    }
  }

  /**
   * Logs out the user.
   */
  async logout(userId) {
    if (userId) {
      await userRepository.clearSession(userId);
    }
  }

  /**
   * Refreshes the Access Token with Grace Period logic.
   * This prevents legitimate concurrent requests from logging the user out.
   */
  async refreshToken(incomingRefreshToken) {
    // 1. Verify JWT Signature
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshToken.secret);
      if (decoded.type !== 'refresh') throw new Error();
    } catch {
      throw new Error('Invalid refresh token');
    }

    // 2. Fetch User & Session
    const user = await userRepository.findByIdWithSession(decoded.sub);
    if (!user || !user.activeSession) {
      throw new Error('Session expired or revoked');
    }

    const incomingHash = this.hashToken(incomingRefreshToken);
    const storedHash = user.activeSession.tokenHash;

    // 3. Token Rotation & Reuse Detection
    if (incomingHash !== storedHash) {
      // --- GRACE PERIOD LOGIC ---
      const lastRefreshed = user.activeSession.lastRefreshedAt 
        ? new Date(user.activeSession.lastRefreshedAt).getTime() 
        : 0;
      const timeDiff = Date.now() - lastRefreshed;

      if (timeDiff < GRACE_PERIOD_MS) {
        // Safe Concurrency:
        // The token was rotated just moments ago (< 10s). 
        // Likely the Client sent 2 requests at once. 
        // ACTION: Allow this request to generate a new pair (or return current) to stabilize the client.
        logger.info(`[Auth] Grace period active for User ${user._id}. Allowing concurrent refresh.`);
      } else {
        // Dangerous Reuse:
        // Token mismatch and time > 10s. Likely a token theft attempt.
        // ACTION: Nuke the session.
        await userRepository.clearSession(user._id);
        logger.warn(`[Auth] SECURITY ALERT: Token reuse detected for User ${user._id}`);
        throw new Error('Security Alert: Invalid token reuse detected.');
      }
    }

    // 4. Populate Roles
    await user.populate('roles', 'slug name');

    // 5. Generate NEW Tokens (Rotate)
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);
    const newHash = this.hashToken(newRefreshToken);

    // 6. Update DB
    await userRepository.updateSession(user._id, {
      ...user.activeSession, 
      tokenHash: newHash,    
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastRefreshedAt: new Date() // [IMPORTANT] Update timestamp for next check
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Gets the current user context.
   */
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    
    await user.populate('roles', 'name slug permissions');
    
    // Deduplicate permissions
    const allPermissions = user.roles.reduce((acc, role) => {
      return [...acc, ...(role.permissions || [])];
    }, []);
    const uniquePermissions = [...new Set(allPermissions)];

    return {
      user: this.sanitizeUser(user),
      permissions: uniquePermissions
    };
  }

  /* ==================== ACCOUNT MANAGEMENT ==================== */

  async changePassword(userId, currentPassword, newPassword, { ipAddress, userAgent }) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new Error('Incorrect current password');

    if (currentPassword === newPassword) {
      throw new Error('New password cannot be the same as the current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password & Reset Flag
    await userRepository.update(userId, {
      password: hashedPassword,
      mustChangePassword: false 
    });

    // --- Auto Re-login ---
    user.mustChangePassword = false;
    await user.populate('roles', 'slug name');

    const { accessToken, refreshToken } = this.generateTokens(user);
    const tokenHash = this.hashToken(refreshToken);

    // Update Session (Revoke old tokens)
    await userRepository.updateSession(user._id, {
      tokenHash,
      ipAddress,
      deviceInfo: { userAgent, type: 'unknown' },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastRefreshedAt: new Date() // [NEW]
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
}

export default new AuthService();