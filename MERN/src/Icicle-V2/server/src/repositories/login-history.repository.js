// server/src/repositories/login-history.repository.js
import LoginHistory from '../models/login-history.model.js';

/**
 * Repository for logging and retrieving authentication history (Audit Log).
 */
class LoginHistoryRepository {
  /**
   * Record a new login attempt.
   * @param {Object} data - Log data (userId, ipAddress, deviceInfo, status, failReason).
   * @returns {Promise<import('mongoose').Document>} The created history document.
   */
  async create(data) {
    return await LoginHistory.create(data);
  }

  /**
   * Retrieve login history for a specific user.
   * Results are sorted by newest first.
   * @param {string} userId - The user ID.
   * @param {number} [limit=10] - Number of records to return (default: 10).
   * @returns {Promise<Array<import('mongoose').Document>>} List of history records.
   */
  async findByUserId(userId, limit = 10) {
    return await LoginHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new LoginHistoryRepository();