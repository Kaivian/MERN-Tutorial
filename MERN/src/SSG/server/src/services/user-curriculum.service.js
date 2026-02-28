// server/src/services/user-curriculum.service.js
import mongoose from 'mongoose';
import userCurriculumRepository from '../repositories/user-curriculum.repository.js';
import curriculumRepository from '../repositories/curriculum.repository.js';
import { Subject } from '../models/curriculum/subject.model.js';
import MajorCategory from '../models/curriculum/major-category.model.js';
import Major from '../models/curriculum/major.model.js';
import AdminClass from '../models/curriculum/admin-class.model.js';
import Curriculum from '../models/curriculum/curriculum.model.js';
import logger from '../utils/logger.utils.js';

/**
 * Determines if a string is a valid MongoDB ObjectId
 */
function isObjectId(val) {
    return mongoose.Types.ObjectId.isValid(val) && String(new mongoose.Types.ObjectId(val)) === val;
}

class UserCurriculumService {
    async updateContext(userId, contextUpdates) {
        return await userCurriculumRepository.updateActiveContext(userId, contextUpdates);
    }

    /**
     * Fetches subjects for a cohort_class value.
     * Supports BOTH:
     *   - New hierarchy: cohort_class = AdminClass._id (MongoDB ObjectId)
     *   - Legacy seed data: cohort_class = Curriculum code string (e.g., "BIT_SE_K19D_K20A")
     */
    async _fetchSubjects(cohortClass, semIndex) {
        if (isObjectId(cohortClass)) {
            return await curriculumRepository.findSubjectsByClassId(cohortClass, semIndex);
        } else {
            return await curriculumRepository.findSubjectsByCurriculumCode(cohortClass, semIndex);
        }
    }

    /**
     * Resolves the saved active_context IDs into human-readable labels + totalSemesters.
     * Supports both new hierarchy (ObjectId) and legacy (string codes).
     */
    async _resolveContextLabels(activeContext) {
        const labels = { block: null, program: null, cohort_class: null };
        let totalSemesters = 9; // default

        if (!activeContext.cohort_class) return { labels, totalSemesters };

        if (isObjectId(activeContext.cohort_class)) {
            // New hierarchy path
            try {
                const adminClass = await AdminClass.findById(activeContext.cohort_class)
                    .populate({ path: 'majorId', populate: { path: 'majorCategoryId' } })
                    .lean();

                if (adminClass) {
                    totalSemesters = adminClass.totalSemesters || 9;
                    labels.cohort_class = `${adminClass.code} – ${adminClass.name}`;

                    if (adminClass.majorId) {
                        labels.program = adminClass.majorId.name || adminClass.majorId.code;
                        if (adminClass.majorId.majorCategoryId) {
                            labels.block = adminClass.majorId.majorCategoryId.name || adminClass.majorId.majorCategoryId.code;
                        }
                    }
                }
            } catch (err) {
                logger.warn('[UserCurriculumService] Failed to resolve hierarchy labels:', err.message);
            }
        } else {
            // Legacy path — use old Curriculum code
            try {
                const curriculum = await Curriculum.findOne({ 'curriculum_info.code': activeContext.cohort_class }).lean();
                if (curriculum) {
                    labels.cohort_class = curriculum.curriculum_info.code;
                    labels.program = curriculum.curriculum_info.name_en || curriculum.curriculum_info.code;
                    labels.block = 'Information Technology'; // Legacy default

                    // Count distinct semesters from subjects
                    const semesters = await curriculumRepository.findAvailableSemesters(activeContext.cohort_class);
                    totalSemesters = semesters.length > 0 ? Math.max(...semesters) : 9;
                }
            } catch (err) {
                logger.warn('[UserCurriculumService] Failed to resolve legacy labels:', err.message);
            }
        }

        return { labels, totalSemesters };
    }

    async getContextAndGrades(userId, termOverride = null) {
        const userCurr = await userCurriculumRepository.findByUserId(userId);
        const activeContext = userCurr.active_context || {};

        let termGpa = null;
        let formattedSubjects = [];

        const termToUse = termOverride || activeContext.term;

        // Resolve labels for display on Grade page
        const { labels: contextLabels, totalSemesters } = await this._resolveContextLabels(activeContext);

        if (activeContext.cohort_class && termToUse) {
            const termIndexMatch = termToUse.match(/\d+/);
            const semIndex = termIndexMatch ? parseInt(termIndexMatch[0], 10) : null;

            const subjects = await this._fetchSubjects(activeContext.cohort_class, semIndex);

            if (subjects && subjects.length > 0) {
                formattedSubjects = subjects.map(sub => {
                    const userSG = userCurr.subject_grades.find(sg => sg.subjectId.toString() === sub._id.toString());

                    return {
                        id: sub._id,
                        code: sub.code,
                        name_en: sub.name_en,
                        name_vi: sub.name_vi,
                        credit: sub.credit,
                        prerequisite: sub.prerequisite,
                        semester: sub.semester,
                        assessment_plan: sub.assessment_plan || [],
                        status: userSG ? userSG.status : "Not Started",
                        score: userSG ? userSG.totalScore : null,
                        grades: userSG ? userSG.grades : []
                    };
                });

                // Calculate Term GPA
                let totalQualityPoints = 0;
                let totalCredits = 0;

                formattedSubjects.forEach(sub => {
                    if (sub.score !== null) {
                        totalQualityPoints += (sub.score * sub.credit);
                        totalCredits += sub.credit;
                    }
                });

                if (totalCredits > 0) {
                    termGpa = totalQualityPoints / totalCredits;
                }
            }
        }

        return {
            active_context: activeContext,
            context_labels: contextLabels,
            total_semesters: totalSemesters,
            current_view_term: termToUse,
            term_gpa: termGpa,
            subjects: formattedSubjects
        };
    }

    async updateSubjectGrade(userId, subjectId, payload) {
        const subject = await Subject.findById(subjectId).lean();
        if (!subject) throw new Error("Subject not found");

        const plan = subject.assessment_plan || [];

        let totalScore = 0;
        let accumulatedWeight = 0;
        let isFailed = false;

        const { grades, semester } = payload;

        const gradeMap = {};
        grades.forEach(g => {
            if (!gradeMap[g.category]) gradeMap[g.category] = [];
            gradeMap[g.category].push(g);
        });

        plan.forEach(item => {
            const recorded = gradeMap[item.category] || [];
            if (recorded.length > 0) {
                const catSum = recorded.reduce((sum, r) => sum + r.score, 0);
                const catAvg = catSum / item.part_count;

                totalScore += catAvg * (item.weight_percent / 100);
                accumulatedWeight += (item.weight_percent / item.part_count) * recorded.length;

                if (item.completion_criteria) {
                    const match = item.completion_criteria.match(/([>|<|=]+)\s*([0-9.]+)/);
                    if (match) {
                        const operator = match[1];
                        const target = parseFloat(match[2]);
                        let passed = false;
                        if (operator === ">=") passed = catAvg >= target;
                        if (operator === ">") passed = catAvg > target;
                        if (operator === "<=") passed = catAvg <= target;
                        if (operator === "<") passed = catAvg < target;
                        if (!passed) isFailed = true;
                    }
                }
            }
        });

        let status = "In Progress";
        if (accumulatedWeight >= 99) {
            if (isFailed || totalScore < 5) status = "Failed";
            else status = "Passed";
        }

        return await userCurriculumRepository.upsertSubjectGrades(
            userId,
            subjectId,
            semester,
            grades,
            totalScore,
            status
        );
    }

    async getAnalyticsData(userId) {
        const userCurr = await userCurriculumRepository.findByUserId(userId);
        const activeContext = userCurr.active_context || {};

        let termGpas = [];
        let subjectStatuses = {
            Passed: 0,
            Failed: 0,
            InProgress: 0,
            NotStarted: 0
        };
        let termDetails = {};

        if (activeContext.cohort_class) {
            // Supports both new hierarchy (ObjectId) and legacy (string code)
            const allSubjects = await this._fetchSubjects(activeContext.cohort_class, null);

            if (allSubjects && allSubjects.length > 0) {
                const semesters = [...new Set(allSubjects.map(s => s.semester))].sort((a, b) => a - b);
                semesters.forEach(sem => {
                    termDetails[`sem_${sem}`] = [];
                });

                let cumulativeQualityPoints = 0;
                let cumulativeCredits = 0;

                semesters.forEach(sem => {
                    const semSubjects = allSubjects.filter(s => s.semester === sem);
                    let termQualityPoints = 0;
                    let termCredits = 0;

                    semSubjects.forEach(sub => {
                        const userSG = userCurr.subject_grades.find(sg => sg.subjectId.toString() === sub._id.toString());
                        const status = userSG ? userSG.status : "Not Started";
                        const score = userSG ? userSG.totalScore : null;

                        if (status === "Passed") subjectStatuses.Passed++;
                        else if (status === "Failed") subjectStatuses.Failed++;
                        else if (status === "In Progress") subjectStatuses.InProgress++;
                        else subjectStatuses.NotStarted++;

                        termDetails[`sem_${sem}`].push({
                            code: sub.code,
                            name_en: sub.name_en,
                            credit: sub.credit,
                            status: status,
                            score: score,
                            grades: userSG ? userSG.grades : [],
                            assessment_plan: sub.assessment_plan || []
                        });

                        if (score !== null) {
                            termQualityPoints += (score * sub.credit);
                            termCredits += sub.credit;
                            cumulativeQualityPoints += (score * sub.credit);
                            cumulativeCredits += sub.credit;
                        }
                    });

                    const termGpa = termCredits > 0 ? (termQualityPoints / termCredits) : null;
                    const cumulativeGpa = cumulativeCredits > 0 ? (cumulativeQualityPoints / cumulativeCredits) : null;

                    if (termCredits > 0 || cumulativeCredits > 0) {
                        termGpas.push({
                            term: `Sem ${sem}`,
                            gpa: termGpa !== null ? Number(termGpa.toFixed(2)) : null,
                            cumulativeGpa: cumulativeGpa !== null ? Number(cumulativeGpa.toFixed(2)) : null
                        });
                    } else {
                        termGpas.push({ term: `Sem ${sem}`, gpa: null, cumulativeGpa: null });
                    }
                });
            }
        }

        return {
            termGpas,
            subjectStatuses: [
                { name: 'Passed', value: subjectStatuses.Passed, fill: '#10b981' },
                { name: 'Failed', value: subjectStatuses.Failed, fill: '#ef4444' },
                { name: 'In Progress', value: subjectStatuses.InProgress, fill: '#e6b689' },
                { name: 'Not Started', value: subjectStatuses.NotStarted, fill: '#d4d4d8' }
            ],
            termDetails
        };
    }
}

export default new UserCurriculumService();
