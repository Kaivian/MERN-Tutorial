// server/src/utils/cron.utils.js
import cron from 'node-cron';
import expenseService from '../services/expense.service.js';
import logger from './logger.utils.js';

/**
 * Initialize all scheduled cron jobs
 */
export const setupCronJobs = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled job: processDueRecurringExpenses');
    try {
      const result = await expenseService.processDueRecurringExpenses();
      logger.info(`Scheduled job completed. Processed ${result.processed} due expenses.`);
    } catch (error) {
      logger.error('Error during scheduled recurring expenses processing:', error);
    }
  });

  logger.info('Cron jobs initialized successfully');
};
