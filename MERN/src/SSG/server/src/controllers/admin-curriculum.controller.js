// server/src/controllers/admin-curriculum.controller.js
import MajorCategory from '../models/curriculum/major-category.model.js';
import Major from '../models/curriculum/major.model.js';
import AdminClass from '../models/curriculum/admin-class.model.js';
import ClassSemesterSubject from '../models/curriculum/class-semester-subject.model.js';
import { Subject } from '../models/curriculum/subject.model.js';

class AdminCurriculumController {

  // =====================================================================
  // MAJOR CATEGORY CRUD
  // =====================================================================

  /** GET /api/admin/major-categories */
  async getAllMajorCategories(req, res, next) {
    try {
      const categories = await MajorCategory.find({ isActive: true }).sort({ name: 1 }).lean();

      // Attach majorCount to each category
      const categoryIds = categories.map(c => c._id);
      const majorCounts = await Major.aggregate([
        { $match: { majorCategoryId: { $in: categoryIds }, isActive: true } },
        { $group: { _id: '$majorCategoryId', count: { $sum: 1 } } }
      ]);
      const countMap = Object.fromEntries(majorCounts.map(m => [m._id.toString(), m.count]));
      categories.forEach(c => { c.majorCount = countMap[c._id.toString()] || 0; });

      res.success(categories, 'Major categories fetched successfully');
    } catch (err) { next(err); }
  }

  /** POST /api/admin/major-categories */
  async createMajorCategory(req, res, next) {
    try {
      const { code, name, description, color } = req.body;
      if (!code || !name) return res.error('Code and name are required', 400);

      const existing = await MajorCategory.findOne({ code: code.toUpperCase() });
      if (existing) return res.error('Major category with this code already exists', 400);

      const category = await MajorCategory.create({ code, name, description, color });
      res.success(category, 'Major category created successfully', 201);
    } catch (err) { next(err); }
  }

  /** PUT /api/admin/major-categories/:id */
  async updateMajorCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const category = await MajorCategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!category) return res.error('Major category not found', 404);
      res.success(category, 'Major category updated successfully');
    } catch (err) { next(err); }
  }

  /** DELETE /api/admin/major-categories/:id */
  async deleteMajorCategory(req, res, next) {
    try {
      const { id } = req.params;
      // Check for linked majors
      const linkedMajors = await Major.countDocuments({ majorCategoryId: id });
      if (linkedMajors > 0) {
        return res.error('Cannot delete: this category has linked majors. Delete them first.', 400);
      }
      const category = await MajorCategory.findByIdAndDelete(id);
      if (!category) return res.error('Major category not found', 404);
      res.success(null, 'Major category deleted successfully');
    } catch (err) { next(err); }
  }

  // =====================================================================
  // MAJOR CRUD
  // =====================================================================

  /** GET /api/admin/majors?categoryId=... */
  async getAllMajors(req, res, next) {
    try {
      const { categoryId } = req.query;
      const filter = { isActive: true };
      if (categoryId) filter.majorCategoryId = categoryId;
      const majors = await Major.find(filter).populate('majorCategoryId', 'code name color').sort({ name: 1 }).lean();

      // Attach classCount to each major
      const majorIds = majors.map(m => m._id);
      const classCounts = await AdminClass.aggregate([
        { $match: { majorId: { $in: majorIds }, isActive: true } },
        { $group: { _id: '$majorId', count: { $sum: 1 } } }
      ]);
      const countMap = Object.fromEntries(classCounts.map(c => [c._id.toString(), c.count]));
      majors.forEach(m => { m.classCount = countMap[m._id.toString()] || 0; });

      res.success(majors, 'Majors fetched successfully');
    } catch (err) { next(err); }
  }

  /** POST /api/admin/majors */
  async createMajor(req, res, next) {
    try {
      const { code, name, description, majorCategoryId } = req.body;
      if (!code || !name || !majorCategoryId) return res.error('Code, name, and majorCategoryId are required', 400);

      const category = await MajorCategory.findById(majorCategoryId);
      if (!category) return res.error('Major category not found', 404);

      const existing = await Major.findOne({ code: code.toUpperCase() });
      if (existing) return res.error('Major with this code already exists', 400);

      const major = await Major.create({ code, name, description, majorCategoryId });
      res.success(major, 'Major created successfully', 201);
    } catch (err) { next(err); }
  }

  /** PUT /api/admin/majors/:id */
  async updateMajor(req, res, next) {
    try {
      const { id } = req.params;
      const major = await Major.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!major) return res.error('Major not found', 404);
      res.success(major, 'Major updated successfully');
    } catch (err) { next(err); }
  }

  /** DELETE /api/admin/majors/:id */
  async deleteMajor(req, res, next) {
    try {
      const { id } = req.params;
      const linkedClasses = await AdminClass.countDocuments({ majorId: id });
      if (linkedClasses > 0) {
        return res.error('Cannot delete: this major has linked classes. Delete them first.', 400);
      }
      const major = await Major.findByIdAndDelete(id);
      if (!major) return res.error('Major not found', 404);
      res.success(null, 'Major deleted successfully');
    } catch (err) { next(err); }
  }

  // =====================================================================
  // ADMIN CLASS CRUD
  // =====================================================================

  /** GET /api/admin/classes?majorId=... */
  async getAllClasses(req, res, next) {
    try {
      const { majorId } = req.query;
      const filter = { isActive: true };
      if (majorId) filter.majorId = majorId;
      const classes = await AdminClass.find(filter)
        .populate({ path: 'majorId', populate: { path: 'majorCategoryId', select: 'code name color' }, select: 'code name majorCategoryId' })
        .sort({ code: 1 });
      res.success(classes, 'Classes fetched successfully');
    } catch (err) { next(err); }
  }

  /** POST /api/admin/classes */
  async createClass(req, res, next) {
    try {
      const { code, name, majorId, intake, academicYear, totalSemesters, notes } = req.body;
      if (!code || !name || !majorId) return res.error('Code, name, and majorId are required', 400);

      const major = await Major.findById(majorId);
      if (!major) return res.error('Major not found', 404);

      const existing = await AdminClass.findOne({ code: code.toUpperCase() });
      if (existing) return res.error('Class with this code already exists', 400);

      const adminClass = await AdminClass.create({ code, name, majorId, intake, academicYear, totalSemesters, notes });
      res.success(adminClass, 'Class created successfully', 201);
    } catch (err) { next(err); }
  }

  /** PUT /api/admin/classes/:id */
  async updateClass(req, res, next) {
    try {
      const { id } = req.params;
      const adminClass = await AdminClass.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!adminClass) return res.error('Class not found', 404);
      res.success(adminClass, 'Class updated successfully');
    } catch (err) { next(err); }
  }

  /** DELETE /api/admin/classes/:id */
  async deleteClass(req, res, next) {
    try {
      const { id } = req.params;
      // Clean up all semester-subject assignments for this class
      await ClassSemesterSubject.deleteMany({ classId: id });
      const adminClass = await AdminClass.findByIdAndDelete(id);
      if (!adminClass) return res.error('Class not found', 404);
      res.success(null, 'Class and its curriculum deleted successfully');
    } catch (err) { next(err); }
  }

  // =====================================================================
  // CLASS CURRICULUM BUILDER (Semester + Subject Mapping)
  // =====================================================================

  /**
   * GET /api/admin/classes/:classId/curriculum
   * Returns all subjects grouped by semester for the class.
   */
  async getClassCurriculum(req, res, next) {
    try {
      const { classId } = req.params;
      const adminClass = await AdminClass.findById(classId);
      if (!adminClass) return res.error('Class not found', 404);

      const entries = await ClassSemesterSubject.find({ classId })
        .populate('subjectId', 'code name_vi name_en credit semester prerequisite structure_type')
        .sort({ semester: 1, order_index: 1 });

      // Group by semester
      const semesters = {};
      for (let s = 1; s <= (adminClass.totalSemesters || 9); s++) {
        semesters[s] = { semester: s, subjects: [] };
      }
      entries.forEach(entry => {
        const sem = entry.semester;
        if (!semesters[sem]) semesters[sem] = { semester: sem, subjects: [] };
        semesters[sem].subjects.push({
          mappingId: entry._id,
          order_index: entry.order_index,
          subject: entry.subjectId
        });
      });

      res.success({
        classInfo: adminClass,
        semesters: Object.values(semesters)
      }, 'Curriculum fetched successfully');
    } catch (err) { next(err); }
  }

  /**
   * POST /api/admin/classes/:classId/curriculum/subjects
   * Add a subject to a class semester.
   * Body: { subjectId, semester, order_index? }
   */
  async addSubjectToClass(req, res, next) {
    try {
      const { classId } = req.params;
      const { subjectId, semester, order_index } = req.body;
      if (!subjectId || !semester) return res.error('subjectId and semester are required', 400);

      const adminClass = await AdminClass.findById(classId);
      if (!adminClass) return res.error('Class not found', 404);

      const subject = await Subject.findById(subjectId);
      if (!subject) return res.error('Subject not found', 404);

      // Find max order_index in this semester if not provided
      let orderIdx = order_index;
      if (orderIdx === undefined || orderIdx === null) {
        const maxEntry = await ClassSemesterSubject.findOne({ classId, semester }).sort({ order_index: -1 });
        orderIdx = maxEntry ? maxEntry.order_index + 1 : 0;
      }

      const entry = await ClassSemesterSubject.create({ classId, semester, subjectId, order_index: orderIdx });
      const populated = await entry.populate('subjectId', 'code name_vi name_en credit semester prerequisite');
      res.success(populated, 'Subject added to curriculum', 201);
    } catch (err) {
      if (err.code === 11000) return res.error('Subject already exists in this semester for this class', 400);
      next(err);
    }
  }

  /**
   * DELETE /api/admin/classes/:classId/curriculum/subjects/:mappingId
   * Remove a subject mapping from a class semester.
   */
  async removeSubjectFromClass(req, res, next) {
    try {
      const { classId, mappingId } = req.params;
      const entry = await ClassSemesterSubject.findOneAndDelete({ _id: mappingId, classId });
      if (!entry) return res.error('Subject mapping not found', 404);
      res.success(null, 'Subject removed from curriculum');
    } catch (err) { next(err); }
  }

  /**
   * PUT /api/admin/classes/:classId/curriculum/reorder
   * Reorder subjects within semesters (or move between semesters).
   * Body: { updates: [{ mappingId, semester, order_index }] }
   */
  async reorderCurriculum(req, res, next) {
    try {
      const { classId } = req.params;
      const { updates } = req.body;
      if (!Array.isArray(updates) || updates.length === 0) return res.error('updates array is required', 400);

      const bulkOps = updates.map(({ mappingId, semester, order_index }) => ({
        updateOne: {
          filter: { _id: mappingId, classId },
          update: { $set: { semester, order_index } }
        }
      }));

      await ClassSemesterSubject.bulkWrite(bulkOps);
      res.success(null, 'Curriculum reordered successfully');
    } catch (err) { next(err); }
  }

  /**
   * POST /api/admin/classes/:classId/curriculum/copy-from/:sourceClassId
   * Copy all semester-subject assignments from sourceClassId to classId.
   */
  async copyCurriculumFromClass(req, res, next) {
    try {
      const { classId, sourceClassId } = req.params;
      const { overwrite } = req.body;

      const [targetClass, sourceClass] = await Promise.all([
        AdminClass.findById(classId),
        AdminClass.findById(sourceClassId)
      ]);
      if (!targetClass) return res.error('Target class not found', 404);
      if (!sourceClass) return res.error('Source class not found', 404);

      if (overwrite) {
        await ClassSemesterSubject.deleteMany({ classId });
      }

      const sourceEntries = await ClassSemesterSubject.find({ classId: sourceClassId });
      if (sourceEntries.length === 0) return res.error('Source class has no curriculum to copy', 400);

      const newEntries = sourceEntries.map(e => ({
        classId,
        semester: e.semester,
        subjectId: e.subjectId,
        order_index: e.order_index
      }));

      await ClassSemesterSubject.insertMany(newEntries, { ordered: false });
      res.success({ copiedCount: newEntries.length }, 'Curriculum copied successfully');
    } catch (err) {
      // Ignore duplicate key errors (subjects that already existed)
      if (err.code === 11000 || err.name === 'MongoBulkWriteError') {
        const inserted = err.result?.nInserted ?? 0;
        return res.success({ copiedCount: inserted }, 'Curriculum partially copied (some duplicates skipped)');
      }
      next(err);
    }
  }

  /**
   * GET /api/admin/subjects
   * Get all subjects from the global pool for the drag source panel.
   */
  async getAllSubjects(req, res, next) {
    try {
      const { search } = req.query;
      const filter = {};
      if (search) {
        filter.$or = [
          { code: { $regex: search, $options: 'i' } },
          { name_vi: { $regex: search, $options: 'i' } },
          { name_en: { $regex: search, $options: 'i' } }
        ];
      }
      const subjects = await Subject.find(filter)
        .select('code name_vi name_en credit semester prerequisite structure_type')
        .sort({ code: 1 })
        .limit(200);
      res.success(subjects, 'Subjects fetched successfully');
    } catch (err) { next(err); }
  }

  /**
   * GET /api/admin/majors/:majorId/subjects
   * Get all unique subjects across all classes of a major.
   */
  async getMajorSubjects(req, res, next) {
    try {
      const { majorId } = req.params;
      const { search } = req.query;

      const major = await Major.findById(majorId);
      if (!major) return res.error('Major not found', 404);

      // Find all classes for this major
      const classes = await AdminClass.find({ majorId, isActive: true }).select('_id');
      const classIds = classes.map(c => c._id);

      if (classIds.length === 0) {
        return res.success([], 'No classes found for this major');
      }

      // Find all unique subjects across those classes
      const mappings = await ClassSemesterSubject.find({ classId: { $in: classIds } })
        .populate('subjectId')
        .sort({ semester: 1, order_index: 1 });

      // Deduplicate by subjectId
      const seen = new Set();
      const subjects = [];
      for (const mapping of mappings) {
        if (!mapping.subjectId) continue;
        const sid = mapping.subjectId._id.toString();
        if (seen.has(sid)) continue;
        seen.add(sid);

        const s = mapping.subjectId.toObject();
        s.id = s._id;
        s.semester = mapping.semester; // Use the mapped semester
        subjects.push(s);
      }

      // Optional search filter
      let result = subjects;
      if (search) {
        const q = search.toLowerCase();
        result = subjects.filter(s =>
          s.code.toLowerCase().includes(q) ||
          (s.name_vi && s.name_vi.toLowerCase().includes(q)) ||
          (s.name_en && s.name_en.toLowerCase().includes(q))
        );
      }

      res.success(result, 'Major subjects fetched successfully');
    } catch (err) { next(err); }
  }

  /**
   * PUT /api/admin/majors/:majorId/subjects/:subjectId/move
   * Move a subject to a different semester across all classes of a major.
   */
  async moveSubjectSemester(req, res, next) {
    try {
      const { majorId, subjectId } = req.params;
      const { semester } = req.body;

      if (semester === undefined || semester === null) {
        return res.error('Semester is required', 400);
      }

      const major = await Major.findById(majorId);
      if (!major) return res.error('Major not found', 404);

      // Find all classes for this major
      const classes = await AdminClass.find({ majorId, isActive: true }).select('_id');
      const classIds = classes.map(c => c._id);

      if (classIds.length === 0) {
        return res.error('No classes found for this major', 404);
      }

      // Update semester on all mappings for this subject across all classes of the major
      const result = await ClassSemesterSubject.updateMany(
        { classId: { $in: classIds }, subjectId },
        { $set: { semester: Number(semester) } }
      );

      res.success(
        { modifiedCount: result.modifiedCount },
        `Moved subject to semester ${semester}`
      );
    } catch (err) { next(err); }
  }
}

export default new AdminCurriculumController();
