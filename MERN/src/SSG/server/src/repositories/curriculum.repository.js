// server/src/repositories/curriculum.repository.js
import Curriculum from '../models/curriculum/curriculum.model.js';
import { Subject } from '../models/curriculum/subject.model.js';
import ClassSemesterSubject from '../models/curriculum/class-semester-subject.model.js';
import AdminClass from '../models/curriculum/admin-class.model.js';

class CurriculumRepository {
    /**
     * Finds all curriculums returning basic info suitable for lists
     */
    async findAllBasicInfos() {
        return await Curriculum.find({})
            .select('curriculum_info.code curriculum_info.name_vi curriculum_info.name_en')
            .lean();
    }

    /**
     * Finds a curriculum by its exact code
     */
    async findByCode(code) {
        return await Curriculum.findOne({ 'curriculum_info.code': code.toUpperCase() }).lean();
    }

    /**
     * Finds all subjects for a curriculum, optionally filtered by semester
     */
    async findSubjectsByCurriculumCode(code, semester = null) {
        const matchCondition = semester !== null ? { semester: Number(semester) } : {};

        const curriculum = await Curriculum.findOne({ 'curriculum_info.code': code.toUpperCase() })
            .populate({
                path: 'subjects',
                match: matchCondition
            })
            .lean();

        return curriculum ? curriculum.subjects : null;
    }

    /**
     * Extracts available semesters for a curriculum
     */
    async findAvailableSemesters(code) {
        const curriculum = await Curriculum.findOne({ 'curriculum_info.code': code.toUpperCase() })
            .populate({
                path: 'subjects',
                select: 'semester'
            })
            .lean();

        if (!curriculum || !curriculum.subjects) return [];

        // Extract unique semesters
        const semesters = [...new Set(curriculum.subjects.map(s => s.semester))].sort((a, b) => a - b);
        return semesters;
    }

    // =====================================================================
    // NEW: Admin Curriculum Hierarchy — used by student-facing grade pages
    // =====================================================================

    /**
     * Finds an AdminClass by its _id. Used to get totalSemesters for profile page.
     */
    async findAdminClassById(classId) {
        return await AdminClass.findById(classId).lean();
    }

    /**
     * Finds all subjects for an AdminClass (from ClassSemesterSubject),
     * optionally filtered by semester number.
     * Returns them already populated with full subject data.
     */
    async findSubjectsByClassId(classId, semester = null) {
        const query = { classId };
        if (semester !== null) query.semester = Number(semester);

        const mappings = await ClassSemesterSubject.find(query)
            .populate({
                path: 'subjectId',
                model: 'Subject'
            })
            .sort({ semester: 1, order_index: 1 })
            .lean();

        // Normalize: attach semester number from the mapping onto each subject
        return mappings
            .filter(m => m.subjectId)
            .map(m => ({
                ...(m.subjectId),
                semester: m.semester,
                _mappingId: m._id
            }));
    }


    /**
     * Creates a new curriculum
     */
    async create(curriculumData) {
        const newCurriculum = new Curriculum(curriculumData);
        return await newCurriculum.save();
    }

    /**
     * Updates an existing curriculum
     */
    async update(code, updateData) {
        return await Curriculum.findOneAndUpdate(
            { 'curriculum_info.code': code.toUpperCase() },
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Deletes a curriculum
     */
    async delete(code) {
        return await Curriculum.findOneAndDelete({ 'curriculum_info.code': code.toUpperCase() });
    }

    /**
     * Deletes all subjects belonging to a curriculum
     */
    async deleteSubjectsForCurriculum(subjectIds) {
        if (!subjectIds || subjectIds.length === 0) return;
        await Subject.deleteMany({ _id: { $in: subjectIds } });
    }

    /**
     * Finds a subject by ID
     */
    async findSubjectById(subjectId) {
        return await Subject.findById(subjectId).lean();
    }

    /**
     * Finds a subject by Code within a curriculum context (optional optimization)
     */
    async findSubjectByCode(code) {
        return await Subject.findOne({ code: code.toUpperCase() }).lean();
    }

    /**
     * Creates a new subject
     */
    async createSubject(subjectData) {
        const newSubject = new Subject(subjectData);
        return await newSubject.save();
    }

    /**
     * Updates an existing subject
     */
    async updateSubject(subjectId, updateData) {
        return await Subject.findByIdAndUpdate(
            subjectId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Deletes a subject
     */
    async deleteSubject(subjectId) {
        return await Subject.findByIdAndDelete(subjectId);
    }

    /**
     * Adds a subject reference to a curriculum
     */
    async addSubjectToCurriculum(curriculumCode, subjectId) {
        return await Curriculum.findOneAndUpdate(
            { 'curriculum_info.code': curriculumCode.toUpperCase() },
            { $push: { subjects: subjectId } },
            { new: true }
        );
    }

    /**
     * Removes a subject reference from a curriculum
     */
    async removeSubjectFromCurriculum(curriculumCode, subjectId) {
        return await Curriculum.findOneAndUpdate(
            { 'curriculum_info.code': curriculumCode.toUpperCase() },
            { $pull: { subjects: subjectId } },
            { new: true }
        );
    }
}

export default new CurriculumRepository();
