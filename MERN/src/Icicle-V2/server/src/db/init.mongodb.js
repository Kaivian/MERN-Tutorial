// server/src/db/init.mongodb.js
import mongoose from 'mongoose';
import mongoConfig from '../config/mongo.config.js';
import config from '../config/env.config.js';
import { checkAndSeedData } from './seed/seed.mongodb.js';
import logger from '../utils/logger.utils.js';

/**
 * Manages the MongoDB connection lifecycle.
 * Sets up event listeners for monitoring connection health and 
 * handles the initial connection with specific error catching for timeouts.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is successful, otherwise exits the process.
 */
const connectDB = async () => {
  // --- 1. SET UP CONNECTION EVENT LISTENERS ---
  // These monitor the connection status AFTER the initial attempt.

  mongoose.connection.on('connected', () => {
    logger.success('MongoDB event: Connected to database');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB event: Runtime connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB event: Disconnected. Attempting to reconnect...');
  });

  // --- 2. ATTEMPT INITIAL CONNECTION ---
  try {
    /**
     * @constant {Object} options - Enhanced connection settings.
     * serverSelectionTimeoutMS: Fails after 5s if the server is unreachable (prevents long hangs).
     */
    const connectionOptions = {
      ...mongoConfig.options,
      serverSelectionTimeoutMS: 5000, 
    };

    logger.info('Connecting to MongoDB...');
    await mongoose.connect(mongoConfig.uri, connectionOptions);

    logger.success('MongoDB connection established successfully');
    logger.info(`Database Host: ${mongoose.connection.host}`);
    logger.info(`Target Database: ${mongoConfig.name}`);

    // --- 3. AUTO-SEEDING WORKFLOW ---
    if (config.app.env === 'development') {
      await checkAndSeedData();
    }

  } catch (error) {
    // --- 4. SPECIFIC ERROR HANDLING (TIMEOUT & NETWORK) ---
    
    if (error.name === 'MongooseServerSelectionError') {
      logger.error('Connection Timeout: Could not reach the MongoDB server within 5 seconds.');
      logger.info('Troubleshooting: Check if your IP is whitelisted on Atlas or if the DB service is running.');
    } 
    else if (error.name === 'MongoNetworkError') {
      logger.error('Network Error: A socket/network failure occurred during connection.');
    } 
    else {
      logger.error(`Unexpected Database Error: ${error.message}`);
    }

    // Exit process with failure code (1)
    process.exit(1);
  }
};

export default connectDB;