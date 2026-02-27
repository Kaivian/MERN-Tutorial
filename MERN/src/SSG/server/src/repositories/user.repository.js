// server/src/repositories/user.repository.js
import User from '../models/user.model.js';

/**
 * Repository for interacting with the 'User' collection.
 * Abstracts Mongoose operations to provide clean data access methods.
 */
class UserRepository {

  /* ==================== CREATE ==================== */

  /**
   * Create a new user document.
   * @param {Object} userData - The user data object matching the model definition.
   * @returns {Promise<import('mongoose').Document>} The created user document.
   */
  async create(userData) {
    return await User.create(userData);
  }

  /* ==================== READ ==================== */

  /**
   * Find users with pagination and filtering.
   * @param {Object} query - Mongoose query object.
   * @param {Object} options - Pagination options (page, limit).
   */
  async findPaginated(query = {}, { page = 1, limit = 10, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('roles', 'name slug permissions status')
        .select('-password -activeSession'),
      User.countDocuments(query)
    ]);

    return {
      docs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      hasNextPage: page * limit < totalDocs,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Find a user by ID and populate their roles.
   * Standard method for fetching profile info.
   * @param {string} id - The user ID (ObjectId).
   * @returns {Promise<import('mongoose').Document | null>} User document with populated roles.
   */
  async findById(id) {
    return await User.findById(id).populate('roles', 'name slug permissions status');
  }

  /**
   * Find a user by ID and explicitly select the password field.
   * Critical for 'Change Password' flow where we need to verify the old password first.
   * @param {string} id - The user ID.
   * @returns {Promise<import('mongoose').Document | null>}
   */
  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  /**
   * Find a user by ID and explicitly select the activeSession field.
   * Used during Token Refresh to validate the session hash.
   * @param {string} id - The user ID.
   * @returns {Promise<import('mongoose').Document | null>}
   */
  async findByIdWithSession(id) {
    return await User.findById(id).select('+activeSession');
  }

  /**
   * Find a user by email (internal use).
   * @param {string} email 
   */
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Find a user by either Username OR Email.
   * Include the password field for authentication checks.
   * * @param {string} identifier - The login identifier (username or email).
   * @returns {Promise<import('mongoose').Document | null>}
   */
  async findByCredentials(identifier) {
    return await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password');
  }

  /* ==================== UPDATE ==================== */

  /**
   * Generic update method for user profile or settings.
   * @param {string} userId 
   * @param {Object} updateData 
   */
  async update(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });
  }

  /**
   * Update the user's active session (Single Device Login).
   * @param {string} userId - The user ID.
   * @param {Object} sessionData - The new session object.
   * @returns {Promise<import('mongoose').Document | null>}
   */
  async updateSession(userId, sessionData) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          activeSession: sessionData,
          lastLoginAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  /**
   * Update the user's password and reset the 'mustChangePassword' flag.
   * This handles both 'Forgot Password' recovery and 'Force Change Password'.
   * @param {string} userId - The user ID.
   * @param {string} hashedPassword - The new encrypted password.
   * @returns {Promise<void>}
   */
  async updatePassword(userId, hashedPassword) {
    await User.findByIdAndUpdate(userId, {
      $set: {
        password: hashedPassword,
        mustChangePassword: false // Logic: Once password is changed, the requirement is satisfied.
      }
    });
  }

  /* ==================== DELETE ==================== */

  /**
   * Clear the active session (Logout).
   * @param {string} userId - The user ID.
   * @returns {Promise<void>}
   */
  async clearSession(userId) {
    await User.findByIdAndUpdate(userId, { $set: { activeSession: null } });
  }
}

export default new UserRepository();