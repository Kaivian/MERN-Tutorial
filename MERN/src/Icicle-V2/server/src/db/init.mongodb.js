// server/src/db/init.mongodb.js
import mongoose from 'mongoose';
import mongoConfig from '../config/mongo.config.js';
import config from '../config/env.config.js';
import { checkAndSeedData } from './seed/seed.mongodb.js';
import logger from '../utils/logger.utils.js';

/**
 * Establishes the connection to the MongoDB database.
 * Selects the specific database name based on the environment configuration
 * and triggers the auto-seeding process if in the development environment.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connected, or exits the process on failure.
 */
const connectDB = async () => {
  try {
    /**
     * Connect to MongoDB using the URI and Options from config.
     * Mongoose will automatically switch to the database specified in 'options.dbName'.
     */
    await mongoose.connect(mongoConfig.uri, mongoConfig.options);

    logger.success('MongoDB connection established successfully');
    logger.info(`Database Host: ${mongoose.connection.host}`);
    logger.info(`Target Database: ${mongoConfig.name}`);

    /**
     * Workflow: Check environment and run auto-seeder.
     * If the environment is 'development', this logic ensures the 'development' 
     * database is physically created and populated with initial data if empty.
     */
    if (config.app.env === 'development') {
      await checkAndSeedData();
    }

  } catch (error) {
    logger.error('Failed to establish MongoDB connection', error);
    
    // Exit the process with failure code (1) to prevent the server from running without a DB.
    process.exit(1);
  }
};

export default connectDB;