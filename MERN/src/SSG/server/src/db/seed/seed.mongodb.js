// server/src/db/seed/seed.mongodb.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import Role from '../../models/role.model.js';
import logger from '../../utils/logger.utils.js';

/* ==================== CONFIGURATION ==================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE_PATH = path.join(__dirname, 'seed.mongodb.json');

/* ==================== CORE FUNCTIONS ==================== */

const performSeeding = async () => {
  if (!fs.existsSync(SEED_FILE_PATH)) {
    throw new Error(`Seed file not found at: ${SEED_FILE_PATH}`);
  }

  const rawData = fs.readFileSync(SEED_FILE_PATH, 'utf-8');
  const seedData = JSON.parse(rawData);

  // 1. Insert Roles
  // Using insertMany bypasses hooks, but for seeding static system data, it's acceptable
  // provided the JSON data includes 'slug' and correct 'isSystem' flags.
  let roleMap = new Map();

  if (seedData.roles && seedData.roles.length > 0) {
    const createdRoles = await Role.insertMany(seedData.roles);
    logger.success(`[Seed] Successfully created ${createdRoles.length} role(s).`);

    // Create a Map for quick lookup: 'super_admin' -> ObjectId('...')
    createdRoles.forEach(role => {
      roleMap.set(role.slug, role._id);
    });
  }

  // 2. Insert Users
  if (seedData.users && seedData.users.length > 0) {
    const usersToCreate = await Promise.all(seedData.users.map(async (userData) => {
      const { roleSlug, password, ...rest } = userData;

      // Determine Role ID
      const assignedRoleId = roleMap.get(roleSlug);
      
      if (!assignedRoleId) {
        logger.warn(`[Seed] Warning: Role slug '${roleSlug}' not found for user '${userData.username}'. Skipping.`);
        return null;
      }

      // Hash Password manually (insertMany bypasses pre-save hooks)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      return {
        ...rest,
        password: hashedPassword,
        roles: [assignedRoleId] 
      };
    }));

    // Filter out nulls (failed role lookups)
    const validUsers = usersToCreate.filter(u => u !== null);

    if (validUsers.length > 0) {
      await User.insertMany(validUsers);
      logger.success(`[Seed] Successfully created ${validUsers.length} user(s).`);
      logger.info(`[Seed] Admin Creds: ${seedData.users[0].email}`);
    }
  }
};

/* ==================== EXPORTED WORKFLOWS ==================== */

export const checkAndSeedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info(`[Seed] Database verification complete. Found ${userCount} existing user(s).`);
      return; 
    }
    
    logger.info('[Seed] Database appears empty. Starting auto-seed process...');
    await performSeeding();
    logger.success('[Seed] Auto-seeding process completed successfully.');
  } catch (error) {
    logger.error('[Seed] Error encountered during auto-seeding:', error);
  }
};

export const resetAndSeedData = async () => {
  try {
    logger.warn('[Seed] Force Reset triggered. Dropping entire database...');
    
    // Drop Database to ensure clean slate for system roles
    await mongoose.connection.dropDatabase();
    logger.info('[Seed] Database dropped successfully.');

    await performSeeding();
    
    logger.success('[Seed] Database reset and seeding completed successfully.');
  } catch (error) {
    logger.error('[Seed] Error encountered during manual reset:', error);
    process.exit(1);
  }
};