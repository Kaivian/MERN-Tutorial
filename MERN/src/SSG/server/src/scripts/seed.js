// server/src/scripts/seed.js
import mongoose from 'mongoose';
import mongoConfig from '../config/mongo.config.js';
import { resetAndSeedData } from '../db/seed/seed.mongodb.js';
import logger from '../utils/logger.utils.js';

const runSeed = async () => {
  logger.info('--- Starting Manual Seed Process ---');

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(mongoConfig.uri, mongoConfig.options);
    logger.info('Connected to MongoDB.');

    // 2. Execute Reset & Seed Logic
    await resetAndSeedData();

    // 3. Disconnect
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB.');
    logger.info('--- Seed Process Finished ---');
    process.exit(0);

  } catch (error) {
    logger.error('Seed script failed:', error);
    process.exit(1);
  }
};

runSeed();