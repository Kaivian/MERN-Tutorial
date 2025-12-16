// server/src/server.js
import app from './app.js';
import config from './config/env.config.js';
import connectDB from './db/init.mongodb.js';
import logger from './utils/logger.utils.js';

/**
 * Entry point to start the server.
 * Ensures the database is connected and ready before opening the HTTP port.
 *
 * @async
 * @function startServer
 */
const startServer = async () => {
  try {
    /** Log the initialization phase */
    logger.info(`Initializing server configuration...`);
    logger.info(`Environment: ${config.app.env}`);

    /** * Step 1: Connect to Database.
     * This step includes the logic to auto-create the 'development' DB and seed data.
     */
    await connectDB();

    /** Step 2: Start Express Server. */
    const server = app.listen(config.app.port, () => {
      logger.success(`Server started successfully on port ${config.app.port}`);
      logger.info(`Local URL: http://localhost:${config.app.port}`);
    });

    /** * Handle graceful shutdown (Ctrl+C).
     * Ensures pending requests are processed before closing.
     */
    process.on('SIGINT', () => {
      logger.warn('Received SIGINT signal. Shutting down server...');
      
      server.close(() => {
        logger.info('Server closed. Exiting process.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

/** Execute startup logic. */
startServer();