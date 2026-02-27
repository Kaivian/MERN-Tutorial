// server/src/repositories/audit-log.repository.js
import AuditLog from '../models/audit-log.model.js';
import logger from '../utils/logger.utils.js';

class AuditLogRepository {
  /**
   * Logs an administrative action.
   * Does not throw to avoid breaking the main business flow if logging fails.
   */
  async logAction(data) {
    try {
      await AuditLog.create(data);
    } catch (error) {
      logger.error(`[AuditLog] Failed to log action: ${error.message}`, error);
    }
  }

  async findRecent(limit = 100) {
    return AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username email');
  }
}

export default new AuditLogRepository();
