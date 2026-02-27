// server/src/db/seed/run-seed.js
import mongoose from 'mongoose';
import ENV from '../../config/env.config.js';
import { resetAndSeedData } from './seed.mongodb.js';
import logger from '../../utils/logger.utils.js';

const run = async () => {
  try {
    logger.info('[Seed] Connecting to MongoDB...');
    await mongoose.connect(ENV.mongoDB.uri);
    logger.info('[Seed] Connected successfully. Starting seed process...');

    await resetAndSeedData();

    logger.success('[Seed] Completed All Tasks.');
  } catch (err) {
    logger.error('[Seed] Fatal error:', err);
  } finally {
    await mongoose.disconnect();
    logger.info('[Seed] Disconnected from MongoDB.');
    process.exit(0);
  }
};

run();
