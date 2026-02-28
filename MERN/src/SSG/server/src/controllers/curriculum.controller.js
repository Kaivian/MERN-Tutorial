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

    /**
     * @route POST /api/curriculums
     * @desc Create a new curriculum
     */
    async createCurriculum(req, res, next) {
        try {
            const newCurriculum = await curriculumService.createCurriculum(req.body);
            res.success(newCurriculum, 'Curriculum created successfully', 201);
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * @route PUT /api/curriculums/:code
     * @desc Update an existing curriculum
     */
    async updateCurriculum(req, res, next) {
        try {
            const { code } = req.params;
            const updatedCurriculum = await curriculumService.updateCurriculum(code, req.body);
            res.success(updatedCurriculum, 'Curriculum updated successfully');
        } catch (error) {
            if (error.message === 'Curriculum not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * @route DELETE /api/curriculums/:code
     * @desc Delete a curriculum
     */
    async deleteCurriculum(req, res, next) {
        try {
            const { code } = req.params;
            await curriculumService.deleteCurriculum(code);
            res.success(null, 'Curriculum deleted successfully');
        } catch (error) {
            if (error.message === 'Curriculum not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * @route POST /api/curriculums/:code/subjects
     * @desc Create a new subject for a curriculum
     */
    async createSubject(req, res, next) {
        try {
            const { code } = req.params;
            const newSubject = await curriculumService.createSubject(code, req.body);
            res.success(newSubject, 'Subject created successfully', 201);
        } catch (error) {
            if (error.message === 'Curriculum not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * @route PUT /api/subjects/:subjectId
     * @desc Update a subject
     */
    async updateSubject(req, res, next) {
        try {
            const { subjectId } = req.params;
            const updatedSubject = await curriculumService.updateSubject(subjectId, req.body);
            res.success(updatedSubject, 'Subject updated successfully');
        } catch (error) {
            if (error.message === 'Subject not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * @route DELETE /api/curriculums/:code/subjects/:subjectId
     * @desc Delete a subject
     */
    async deleteSubject(req, res, next) {
        try {
            const { code, subjectId } = req.params;
            await curriculumService.deleteSubject(code, subjectId);
            res.success(null, 'Subject deleted successfully');
        } catch (error) {
            if (error.message === 'Subject not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

export default new CurriculumController();
