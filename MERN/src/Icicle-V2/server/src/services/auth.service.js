// server/src/services/auth.service.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import config from '../config/env.config.js';
import userRepository from '../repositories/user.repository.js';
import loginHistoryRepository from '../repositories/login-history.repository.js';
import logger from '../utils/logger.utils.js';

const GRACE_PERIOD_MS = 10000; // 10 Seconds allowance for concurrency

/**
 * Service class handling all authentication and authorization business logic.
 * Encapsulates complexity of token management, password hashing, and audit logging.
 */
class AuthService {

  /* ==================== PRIVATE HELPERS ==================== */

  /**
   * Generates a SHA-256 hash of the provided token.
   * Used for securely storing refresh tokens in the database.
   *
   * @param {string} token - The raw token string to hash.
   * @returns {string} The hexadecimal string representation of the hash.
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Populates ONLY active roles for a user document.
   * Uses Mongoose 'match' to filter out inactive roles at the DB level.
   *
   * @param {import('mongoose').Document} user - The user document to populate.
   * @returns {Promise<void>}
   * @private
   */
  async _populateActiveRoles(user) {
    await user.populate({
      path: 'roles',
      match: { status: 'active' },
      select: 'slug name permissions status'
    });
  }

  /**
   * Generates a pair of JWTs (Access & Refresh) based on the user's active roles.
   * * @param {Object} user - The user document (must have roles populated).
   * @returns {{accessToken: string, refreshToken: string}} An object containing both tokens.
   */
  generateTokens(user) {
    // Filter again just to be safe, ensuring no inactive role slips in.
    const activeRoles = user.roles && Array.isArray(user.roles) 
      ? user.roles.filter(r => r.status === 'active')
      : [];

    const roleSlugs = activeRoles.map(r => r.slug);

    const accessPayload = {
      sub: user._id.toString(), // Standard Subject Claim
      username: user.username,  // Custom Claim
      roles: roleSlugs,         // Custom Claim: ["super_admin", "user"]
      mustChangePassword: user.mustChangePassword,
      type: 'access'            // Security Claim
    };

    // Use Access Token specific configuration
    const accessToken = jwt.sign(accessPayload, config.jwt.accessToken.secret, { 
      expiresIn: config.jwt.accessToken.expiresIn 
    });

    const refreshPayload = {
      sub: user._id.toString(),
      type: 'refresh'
    };

    // Use Refresh Token specific configuration (Longer lifespan)
    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshToken.secret, { 
      expiresIn: config.jwt.refreshToken.expiresIn 
    });

    return { accessToken, refreshToken };
  }

  /**
   * Sanitizes the user object for API responses, removing sensitive data.
   *
   * @param {import('mongoose').Document} user - The user document.
   * @returns {Object} A clean DTO object suitable for client consumption.
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;

    // Filter roles in response DTO as well
    const activeRoles = Array.isArray(userObj.roles) 
      ? userObj.roles.filter(r => r.status === 'active') 
      : [];

    return {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      fullName: userObj.profile?.fullName || '',
      avatarUrl: userObj.profile?.avatarUrl || '',
      roles: activeRoles.map(r => r.slug),
      mustChangePassword: userObj.mustChangePassword,
      status: userObj.status,
    };
  }

  /* ==================== CORE METHODS ==================== */

  /**
   * Authenticates a user using their identifier (Username or Email) and password.
   * Creates a new session and logs the login history.
   *
   * @param {Object} credentials - The login credentials.
   * @param {string} credentials.identifier - Username or Email.
   * @param {string} credentials.password - Plain text password.
   * @param {string} credentials.ipAddress - The IP address of the client.
   * @param {string} credentials.userAgent - The User-Agent string of the client.
   * @returns {Promise<Object>} An object containing the user DTO and tokens.
   * @throws {Error} If credentials are invalid or the account is disabled.
   */
  async login({ identifier, password, ipAddress, userAgent }) {
    // 1. Find User
    const user = await userRepository.findByCredentials(identifier);

    try {
      // 2. Validate Existence & Password
      if (!user) throw new Error('Invalid credentials');
      const isMatch = await user.matchPassword(password);
      if (!isMatch) throw new Error('Invalid credentials'); 

      // 3. Check Status 
      if (user.status === 'banned' || user.status === 'inactive') {
        throw new Error('Account is disabled or banned');
      }

      // 4. Populate Active Roles Only
      await this._populateActiveRoles(user);

      // 5. Generate Tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // 6. Update Session
      const tokenHash = this.hashToken(refreshToken);
      // Use config for maxAge calculation to ensure consistency
      const sessionExpiresAt = new Date(Date.now() + config.jwt.refreshToken.maxAge);

      await userRepository.updateSession(user._id, {
        tokenHash,
        ipAddress,
        deviceInfo: { userAgent, type: 'unknown' },
        expiresAt: sessionExpiresAt,
        lastRefreshedAt: new Date()
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
   * Logs out the user by clearing their active session.
   *
   * @param {string} userId - The ID of the user to logout.
   * @returns {Promise<void>}
   */
  async logout(userId) {
    if (userId) {
      await userRepository.clearSession(userId);
    }
  }

  /**
   * Refreshes the Access Token using a valid Refresh Token.
   * Implements Token Rotation and Reuse Detection (Grace Period).
   *
   * @param {string} incomingRefreshToken - The refresh token provided by the client.
   * @returns {Promise<{accessToken: string, refreshToken: string}>} New token pair.
   * @throws {Error} If the token is invalid, expired, or reused suspiciously.
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

    // [Safety Check] Even for refresh, verify user status
    if (user.status !== 'active') throw new Error('Account is disabled');

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
        logger.info(`[Auth] Grace period active for User ${user._id}. allowing concurrent refresh.`);
      } else {
        await userRepository.clearSession(user._id);
        logger.warn(`[Auth] SECURITY ALERT: Token reuse detected for User ${user._id}`);
        throw new Error('Security Alert: Invalid token reuse detected.');
      }
    }

    // 4. Populate Active Roles Only
    await this._populateActiveRoles(user);

    // 5. Generate NEW Tokens (Rotate)
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);
    const newHash = this.hashToken(newRefreshToken);

    // 6. Update DB with new expiration based on Config
    await userRepository.updateSession(user._id, {
      ...user.activeSession, 
      tokenHash: newHash,    
      expiresAt: new Date(Date.now() + config.jwt.refreshToken.maxAge), // Extend session
      lastRefreshedAt: new Date()
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Retrieves current user context including flattened permissions.
   *
   * @param {string} userId - The ID of the authenticated user.
   * @returns {Promise<Object>} Object containing user DTO, roles, and permissions.
   * @throws {Error} If the user is not found.
   */
  async getMe(userId) {
    // Note: User Status check is handled by 'requireActiveAndSynced' middleware.
    
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    
    // 1. Populate Active Roles Only
    await this._populateActiveRoles(user);
    
    // 2. Deduplicate permissions from ACTIVE roles only
    const activeRoles = user.roles || [];

    const allPermissions = activeRoles.reduce((acc, role) => {
      return [...acc, ...(role.permissions || [])];
    }, []);
    const uniquePermissions = [...new Set(allPermissions)];

    return {
      user: this.sanitizeUser(user),
      roles: activeRoles.map(r => r.slug), 
      permissions: uniquePermissions
    };
  }

  /* ==================== ACCOUNT MANAGEMENT ==================== */

  /**
   * Changes the user's password and resets the session to prevent logout.
   *
   * @param {string} userId - The user's ID.
   * @param {string} currentPassword - The user's current password for verification.
   * @param {string} newPassword - The new password to set.
   * @param {Object} context - Context containing IP and User Agent.
   * @returns {Promise<Object>} User DTO and new tokens.
   * @throws {Error} If current password is wrong or new password is the same.
   */
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
    
    // Populate roles to generate valid tokens
    await this._populateActiveRoles(user);

    const { accessToken, refreshToken } = this.generateTokens(user);
    const tokenHash = this.hashToken(refreshToken);

    // Update session with new hash and correct expiration time
    await userRepository.updateSession(user._id, {
      tokenHash,
      ipAddress,
      deviceInfo: { userAgent, type: 'unknown' },
      expiresAt: new Date(Date.now() + config.jwt.refreshToken.maxAge), // Reset expiration
      lastRefreshedAt: new Date() 
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
}

export default new AuthService();