import mongoose from 'mongoose';
import mongoConfig from '../config/mongo.config.js';
import { seedCurriculumData } from '../db/seed/seed.mongodb.js';
import logger from '../utils/logger.utils.js';

const runSeed = async () => {
    logger.info('--- Starting Curriculum Seed Process ---');
    try {
        await mongoose.connect(mongoConfig.uri, mongoConfig.options);
        logger.info('Connected to MongoDB.');
        await seedCurriculumData();
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
