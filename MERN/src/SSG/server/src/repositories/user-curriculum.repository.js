// server/src/repositories/user-curriculum.repository.js
import UserCurriculum from '../models/user-curriculum.model.js';

class UserCurriculumRepository {
    async findByUserId(userId) {
        let doc = await UserCurriculum.findOne({ userId });
        // Create an empty record if it doesn't exist
        if (!doc) {
            doc = await UserCurriculum.create({ userId, active_context: {} });
        }
        return doc;
    }

    async updateActiveContext(userId, contextUpdates) {
        return await UserCurriculum.findOneAndUpdate(
            { userId },
            { $set: { active_context: contextUpdates } },
            { new: true, upsert: true } // upsert ensures it creates if not exists
        ).lean();
    }

    async upsertSubjectGrades(userId, subjectId, semester, gradeUpdates, totalScore, status) {
        // Use MongoDB array filters to update a specific subject, or push it if it doesn't exist
        const curriculum = await this.findByUserId(userId);

        const subjectIndex = curriculum.subject_grades.findIndex(
            sg => sg.subjectId.toString() === subjectId.toString()
        );

        if (subjectIndex >= 0) {
            curriculum.subject_grades[subjectIndex].grades = gradeUpdates;
            curriculum.subject_grades[subjectIndex].totalScore = totalScore;
            curriculum.subject_grades[subjectIndex].status = status;
        } else {
            curriculum.subject_grades.push({
                subjectId,
                semester,
                grades: gradeUpdates,
                totalScore,
                status
            });
        }

        await curriculum.save();
        return curriculum;
    }
}

export default new UserCurriculumRepository();
