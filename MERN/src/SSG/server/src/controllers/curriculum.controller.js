// server/src/controllers/curriculum.controller.js
import curriculumService from '../services/curriculum.service.js';

class CurriculumController {
    /**
     * @route GET /api/curriculums/programs
     * @desc Get all programs/classes grouped
     */
    async getPrograms(req, res, next) {
        try {
            const data = await curriculumService.getProgramsData();
            res.success(data, 'Programs fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /api/curriculums/:code/subjects
     * @desc Get subjects for a specific curriculum, optionally query by ?semester=N
     */
    async getSubjects(req, res, next) {
        try {
            const { code } = req.params;
            const { semester } = req.query; // Optional

            const subjects = await curriculumService.getCurriculumSubjects(code, semester);
            res.success(subjects, 'Subjects fetched successfully');
        } catch (error) {
            if (error.message === 'Curriculum not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * @route GET /api/curriculums/:code/semesters
     * @desc Get available semesters for a curriculum
     */
    async getSemesters(req, res, next) {
        try {
            const { code } = req.params;
            const semesters = await curriculumService.getAvailableSemesters(code);
            res.success(semesters, 'Semesters fetched successfully');
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

export default new CurriculumController();
