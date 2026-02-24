// server/src/controllers/user-curriculum.controller.js
import userCurriculumService from '../services/user-curriculum.service.js';

class UserCurriculumController {
    /**
     * @route GET /api/user/curriculum
     * @desc Get user's active context and calculated GPA
     */
    async getContext(req, res, next) {
        try {
            // req.user logic depends on your auth middleware
            // Based on authService, decoded sub is the Id
            const userId = req.user?.id || req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const data = await userCurriculumService.getContextAndGrades(userId);
            res.success(data, 'User context fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route PATCH /api/user/curriculum/context
     * @desc Update user's active context selections
     */
    async updateContext(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            const contextUpdates = req.body;

            const data = await userCurriculumService.updateContext(userId, contextUpdates);
            res.success(data.active_context, 'Context updated effectively');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route POST /api/user/curriculum/subjects/:subjectId/grades
     * @desc Save grades for a subject and recalculate total
     */
    async saveGrades(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            const { subjectId } = req.params;
            const payload = req.body; // { semester, grades }

            await userCurriculumService.updateSubjectGrade(userId, subjectId, payload);

            // To be consistent, return the fresh page state
            const fullData = await userCurriculumService.getContextAndGrades(userId);
            res.success(fullData, 'Grades saved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /api/user/curriculum/analytics
     * @desc Get analytics data for grade charts
     */
    async getAnalytics(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const data = await userCurriculumService.getAnalyticsData(userId);
            res.success(data, 'Analytics data fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new UserCurriculumController();
