// server/src/db/seed/seed.mongodb.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import Role from '../../models/role.model.js';
import logger from '../../utils/logger.utils.js';

/* ==================== CONFIGURATION ==================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE_PATH = path.join(__dirname, 'seed.mongodb.json');

/* ==================== CORE FUNCTIONS ==================== */

/**
 * Core function to read JSON and insert data into MongoDB.
 * This function does NOT check for existence, it simply inserts.
 */
const performSeeding = async () => {
  if (!fs.existsSync(SEED_FILE_PATH)) {
    throw new Error(`Seed file not found at: ${SEED_FILE_PATH}`);
  }

  const rawData = fs.readFileSync(SEED_FILE_PATH, 'utf-8');
  const seedData = JSON.parse(rawData);

  // 1. Insert Roles
  let adminRoleId = null;
  if (seedData.roles && seedData.roles.length > 0) {
    await Role.insertMany(seedData.roles);
    logger.success(`[Seed] Successfully created ${seedData.roles.length} role(s).`);
    
    // Find the ID for super_admin
    const adminRole = await Role.findOne({ slug: 'super_admin' });
    if (adminRole) adminRoleId = adminRole._id;
  }

  if (!adminRoleId) {
    logger.error('[Seed] Critical Error: "super_admin" role not found after insertion.');
    return;
  }

  // 2. Insert Users
  if (seedData.users && seedData.users.length > 0) {
    const usersToCreate = await Promise.all(seedData.users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return {
        ...user,
        password: hashedPassword,
        roles: [adminRoleId]
      };
    }));

    await User.insertMany(usersToCreate);
    logger.success(`[Seed] Successfully created Admin account.`);
    logger.info(`[Seed] Credentials: ${seedData.users[0].email} / ${seedData.users[0].password}`);
  }
};

/* ==================== EXPORTED WORKFLOWS ==================== */

/**
 * Workflow A: Auto-seed on server startup.
 * Only runs if the database is completely empty.
 */
export const checkAndSeedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info(`[Seed] Database verification complete. Found ${userCount} existing user(s).`);
      return; 
    }
    
    logger.info('[Seed] Database is empty. Starting auto-seed process...');
    await performSeeding();
    logger.success('[Seed] Auto-seeding process completed successfully.');
  } catch (error) {
    logger.error('[Seed] Error encountered during auto-seeding:', error);
  }
};

/**
 * Workflow B: Manual Reset & Seed (via npm run seed).
 * WARNING: This deletes all existing data in Roles and Users collections.
 */
export const resetAndSeedData = async () => {
  try {
    logger.warn('[Seed] Force Reset triggered. Clearing database...');
    
    // 1. Clear existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    logger.info('[Seed] Database cleared (Users and Roles).');

    // 2. Run Seeding
    await performSeeding();
    
    logger.success('[Seed] Database reset and seeding completed successfully.');
  } catch (error) {
    logger.error('[Seed] Error encountered during manual reset:', error);
    process.exit(1);
  }
};