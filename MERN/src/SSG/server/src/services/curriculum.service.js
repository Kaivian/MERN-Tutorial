// server/src/services/curriculum.service.js
import curriculumRepository from '../repositories/curriculum.repository.js';
import logger from '../utils/logger.utils.js';

class CurriculumService {
    /**
     * Gets all curriculums grouped by program (Extracted from Code)
     * Assuming code format: BLOCK_PROGRAM_COHORT (e.g., BIT_SE_K19D_K20A)
     */
    async getProgramsData() {
        const curriculums = await curriculumRepository.findAllBasicInfos();

        // Group logic: By Default, we just return the full list and 
        // the client can group them if needed, or we format it here to help the client.
        const programs = {};

        curriculums.forEach(curr => {
            const code = curr.curriculum_info.code;
            const parts = code.split('_');

            // Just a fallback in case the code is simple
            const programCode = parts.length >= 2 ? parts[1].toLowerCase() : 'other';
            const blockCode = parts.length >= 1 ? parts[0].toLowerCase() : 'other';

            if (!programs[programCode]) {
                programs[programCode] = {
                    key: programCode,
                    label: programCode.toUpperCase(),
                    startSeason: "Spring", // Default, might be parsed from DB if available
                    startYear: new Date().getFullYear(),
                    classes: []
                };
            }

            programs[programCode].classes.push({
                key: code,
                label: code,
                name_vi: curr.curriculum_info.name_vi,
                name_en: curr.curriculum_info.name_en
            });
        });

        // Convert the grouped mapping into an array format if desired
        return programs;
    }

    /**
     * Gets subjects for a curriculum, mapped to the format needed by the client UI
     */
    async getCurriculumSubjects(code, semester = null) {
        const subjects = await curriculumRepository.findSubjectsByCurriculumCode(code, semester);

        if (!subjects) {
            throw new Error('Curriculum not found');
        }

        return subjects.map(sub => ({
            code: sub.code,
            name_en: sub.name_en,
            name_vi: sub.name_vi,
            credit: sub.credit,
            prerequisite: sub.prerequisite,
            semester: sub.semester,
            assessment_plan: sub.assessment_plan || [],
            status: "Not Started",
            score: null
        }));
    }

    /**
     * Gets available semesters for a curriculum
     */
    async getAvailableSemesters(code) {
        const semesters = await curriculumRepository.findAvailableSemesters(code);
        if (!semesters || semesters.length === 0) {
            throw new Error('Curriculum not found or has no subjects');
        }

        // Map to client format
        return semesters.map(sem => ({
            key: `sem_${sem}`,
            label: `Semester ${sem}`,
            shortLabel: `Sem ${sem}`,
            semesterIndex: sem
        }));
    }
}

export default new CurriculumService();
