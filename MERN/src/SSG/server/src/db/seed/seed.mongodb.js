// server/src/db/seed/seed.mongodb.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import Role from '../../models/role.model.js';
import Curriculum from '../../models/curriculum/curriculum.model.js';
import { Subject } from '../../models/curriculum/subject.model.js';
import MajorCategory from '../../models/curriculum/major-category.model.js';
import Major from '../../models/curriculum/major.model.js';
import AdminClass from '../../models/curriculum/admin-class.model.js';
import ClassSemesterSubject from '../../models/curriculum/class-semester-subject.model.js';
import logger from '../../utils/logger.utils.js';

/* ==================== CONFIGURATION ==================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE_PATH = path.join(__dirname, 'seed.mongodb.json');
const CURRICULUM_FILE_PATH = path.join(__dirname, '../curriculum/SE/BIT_SE_K19D_K20A.json');

/* ==================== CORE FUNCTIONS ==================== */

const performSeeding = async () => {
  if (!fs.existsSync(SEED_FILE_PATH)) {
    throw new Error(`Seed file not found at: ${SEED_FILE_PATH}`);
  }

  const rawData = fs.readFileSync(SEED_FILE_PATH, 'utf-8');
  const seedData = JSON.parse(rawData);

  // 1. Insert Roles
  let roleMap = new Map();

  if (seedData.roles && seedData.roles.length > 0) {
    const createdRoles = await Role.insertMany(seedData.roles);
    logger.success(`[Seed] Successfully created ${createdRoles.length} role(s).`);

    createdRoles.forEach(role => {
      roleMap.set(role.slug, role._id);
    });
  }

  // 2. Insert Users
  if (seedData.users && seedData.users.length > 0) {
    const usersToCreate = await Promise.all(seedData.users.map(async (userData) => {
      const { roleSlug, password, ...rest } = userData;

      const assignedRoleId = roleMap.get(roleSlug);
      if (!assignedRoleId) {
        logger.warn(`[Seed] Warning: Role slug '${roleSlug}' not found for user '${userData.username}'. Skipping.`);
        return null;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      return {
        ...rest,
        password: hashedPassword,
        roles: [assignedRoleId]
      };
    }));

    const validUsers = usersToCreate.filter(u => u !== null);

    if (validUsers.length > 0) {
      await User.insertMany(validUsers);
      logger.success(`[Seed] Successfully created ${validUsers.length} user(s).`);
      logger.info(`[Seed] Admin Creds: ${seedData.users[0].email}`);
    }
  }

  // 3. Insert Curriculum (both old model AND new hierarchy)
  await seedCurriculumData();
};

export const seedCurriculumData = async () => {
  if (!fs.existsSync(CURRICULUM_FILE_PATH)) {
    logger.warn(`[Seed] Curriculum file not found at: ${CURRICULUM_FILE_PATH}`);
    return;
  }

  const rawCurriculumData = fs.readFileSync(CURRICULUM_FILE_PATH, 'utf-8');
  const curriculumData = JSON.parse(rawCurriculumData);

  try {
    // ─── STEP A: Seed old Curriculum model for backward compatibility ───
    const existingCurriculum = await Curriculum.findOne({ 'curriculum_info.code': curriculumData.curriculum_info.code });
    if (!existingCurriculum) {
      if (curriculumData.subjects && curriculumData.subjects.length > 0) {
        const subjectOps = curriculumData.subjects.map(subj => ({
          updateOne: {
            filter: { code: subj.code },
            update: { $set: subj },
            upsert: true
          }
        }));
        await Subject.bulkWrite(subjectOps);
        logger.success(`[Seed] Successfully processed ${curriculumData.subjects.length} subject(s).`);

        const insertedSubjects = await Subject.find({ code: { $in: curriculumData.subjects.map(s => s.code) } });
        const subjectIds = insertedSubjects.map(s => s._id);

        const newCurriculum = new Curriculum({
          ...curriculumData,
          subjects: subjectIds
        });
        await newCurriculum.save();
        logger.success(`[Seed] Successfully created Curriculum: ${curriculumData.curriculum_info.code}`);
      }
    } else {
      logger.info(`[Seed] Curriculum ${curriculumData.curriculum_info.code} already exists. Skipping.`);
    }

    // ─── STEP B: Seed new Admin Hierarchy (MajorCategory → Major → AdminClass → ClassSemesterSubject) ───
    await seedAdminHierarchy(curriculumData);

  } catch (err) {
    logger.error(`[Seed] Error seeding curriculum:`, err);
  }
};

/**
 * Creates the admin hierarchy from existing curriculum data:
 * - MajorCategory: "Information Technology"
 * - Major: "Software Engineering"  
 * - AdminClass: "BIT_SE_K19D_K20A"
 * - ClassSemesterSubject: maps each subject to its semester in this class
 */
async function seedAdminHierarchy(curriculumData) {
  try {
    // 1. Create MajorCategory: "Information Technology"
    let category = await MajorCategory.findOne({ code: 'IT' });
    if (!category) {
      category = await MajorCategory.create({
        code: 'IT',
        name: 'Information Technology',
        description: 'Khối ngành Công nghệ thông tin',
        color: '#3b82f6'
      });
      logger.success(`[Seed] Created MajorCategory: IT`);
    }

    // 2. Create Major: "Software Engineering"
    let major = await Major.findOne({ code: 'SE' });
    if (!major) {
      major = await Major.create({
        code: 'SE',
        name: 'Software Engineering',
        description: 'Kỹ thuật phần mềm',
        majorCategoryId: category._id
      });
      logger.success(`[Seed] Created Major: SE`);
    }

    // 3. Create AdminClass from curriculum code
    const classCode = curriculumData.curriculum_info.code; // "BIT_SE_K19D_K20A"
    let adminClass = await AdminClass.findOne({ code: classCode });
    if (!adminClass) {
      // Determine totalSemesters from subject data
      const maxSemester = Math.max(
        ...curriculumData.subjects
          .filter(s => s.semester > 0)
          .map(s => s.semester),
        9
      );

      adminClass = await AdminClass.create({
        code: classCode,
        name: curriculumData.curriculum_info.name_en || classCode,
        majorId: major._id,
        intake: 'K19',
        academicYear: '2019-2023',
        totalSemesters: maxSemester
      });
      logger.success(`[Seed] Created AdminClass: ${classCode}`);
    }

    // 4. Create ClassSemesterSubject mappings
    const existingMappings = await ClassSemesterSubject.countDocuments({ classId: adminClass._id });
    if (existingMappings > 0) {
      logger.info(`[Seed] ClassSemesterSubject mappings already exist for ${classCode}. Skipping.`);
      return;
    }

    // Get all subjects from DB (they were upserted in step A)
    const allSubjects = await Subject.find({
      code: { $in: curriculumData.subjects.map(s => s.code) }
    }).lean();

    const subjectCodeMap = new Map();
    allSubjects.forEach(s => subjectCodeMap.set(s.code, s));

    const mappings = [];
    // Group by semester for ordering
    const semesterGroups = {};
    curriculumData.subjects.forEach(subData => {
      const sem = subData.semester || 0;
      if (!semesterGroups[sem]) semesterGroups[sem] = [];
      semesterGroups[sem].push(subData);
    });

    for (const [semStr, subjects] of Object.entries(semesterGroups)) {
      const semester = parseInt(semStr, 10);
      if (semester <= 0) continue; // Skip semester 0 (orientation/prep)

      subjects.forEach((subData, idx) => {
        const dbSubject = subjectCodeMap.get(subData.code);
        if (dbSubject) {
          mappings.push({
            classId: adminClass._id,
            semester,
            subjectId: dbSubject._id,
            order_index: idx
          });
        }
      });
    }

    if (mappings.length > 0) {
      await ClassSemesterSubject.insertMany(mappings, { ordered: false });
      logger.success(`[Seed] Created ${mappings.length} ClassSemesterSubject mappings for ${classCode}`);
    }

  } catch (err) {
    if (err.code === 11000 || err.name === 'MongoBulkWriteError') {
      logger.info(`[Seed] Some admin hierarchy data already exists (duplicate key). Skipping.`);
    } else {
      logger.error(`[Seed] Error seeding admin hierarchy:`, err);
    }
  }
}

/* ==================== EXPORTED WORKFLOWS ==================== */

export const checkAndSeedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info(`[Seed] Database verification complete. Found ${userCount} existing user(s).`);

      // Still seed curriculum/hierarchy if missing
      const curriculumCount = await Curriculum.countDocuments();
      const categoryCount = await MajorCategory.countDocuments();
      if (curriculumCount === 0 || categoryCount === 0) {
        logger.info('[Seed] Curriculum or hierarchy data missing. Seeding curriculum...');
        await seedCurriculumData();
      }

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