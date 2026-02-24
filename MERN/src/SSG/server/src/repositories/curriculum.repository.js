// server/src/repositories/curriculum.repository.js
import Curriculum from '../models/curriculum/curriculum.model.js';
import { Subject } from '../models/curriculum/subject.model.js';

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
}

export default new CurriculumRepository();
