// server/src/services/user-curriculum.service.js
import userCurriculumRepository from '../repositories/user-curriculum.repository.js';
import curriculumRepository from '../repositories/curriculum.repository.js';
import { Subject } from '../models/curriculum/subject.model.js';
import logger from '../utils/logger.utils.js';

class UserCurriculumService {
    async updateContext(userId, contextUpdates) {
        return await userCurriculumRepository.updateActiveContext(userId, contextUpdates);
    }

    async getContextAndGrades(userId) {
        // Fetch raw curriculum from DB
        const userCurr = await userCurriculumRepository.findByUserId(userId);
        const activeContext = userCurr.active_context || {};

        let termGpa = null;
        let formattedSubjects = [];

        // If they have a selected class and term, fetch subjects and compute 
        if (activeContext.cohort_class && activeContext.term) {
            const termIndexMatch = activeContext.term.match(/\d+/);
            const semIndex = termIndexMatch ? parseInt(termIndexMatch[0], 10) : null;

            const subjects = await curriculumRepository.findSubjectsByCurriculumCode(
                activeContext.cohort_class,
                semIndex
            );

            if (subjects) {
                formattedSubjects = subjects.map(sub => {
                    // Find user's grades for this subject
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
                        grades: userSG ? userSG.grades : [] // Raw array of { category, part_index, score }
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
            term_gpa: termGpa,
            subjects: formattedSubjects
        };
    }

    async updateSubjectGrade(userId, subjectId, payload) {
        // payload: { semester, grades: [{ category, part_index, score }] }

        // 1. Fetch Subject to parse weighting
        const subject = await Subject.findById(subjectId).lean();
        if (!subject) throw new Error("Subject not found");

        const plan = subject.assessment_plan || [];

        // 2. Compute the total score from saved pieces
        let totalScore = 0;
        let accumulatedWeight = 0;
        let isFailed = false;

        const { grades, semester } = payload;

        // Group grades by category
        const gradeMap = {};
        grades.forEach(g => {
            if (!gradeMap[g.category]) gradeMap[g.category] = [];
            gradeMap[g.category].push(g);
        });

        plan.forEach(item => {
            const recorded = gradeMap[item.category] || [];
            if (recorded.length > 0) {
                // Average for this category
                const catSum = recorded.reduce((sum, r) => sum + r.score, 0);
                const catAvg = catSum / item.part_count;

                totalScore += catAvg * (item.weight_percent / 100);
                accumulatedWeight += (item.weight_percent / item.part_count) * recorded.length;

                // Simple check for completion criteria, e.g. ">= 4"
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

        // 3. Save it 
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
            // Fetch all subjects across all semesters for this cohort
            const allSubjects = await curriculumRepository.findSubjectsByCurriculumCode(
                activeContext.cohort_class,
                null
            );

            if (allSubjects) {
                // Pre-populate termDetails buckets and organize subjects by semester
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

                        // Tally statuses
                        if (status === "Passed") subjectStatuses.Passed++;
                        else if (status === "Failed") subjectStatuses.Failed++;
                        else if (status === "In Progress") subjectStatuses.InProgress++;
                        else subjectStatuses.NotStarted++;

                        // Add to termDetails
                        termDetails[`sem_${sem}`].push({
                            code: sub.code,
                            name_en: sub.name_en,
                            credit: sub.credit,
                            status: status,
                            score: score
                        });

                        // Calculate GPA
                        if (score !== null) {
                            termQualityPoints += (score * sub.credit);
                            termCredits += sub.credit;

                            cumulativeQualityPoints += (score * sub.credit);
                            cumulativeCredits += sub.credit;
                        }
                    });

                    // Push term GPA
                    const termGpa = termCredits > 0 ? (termQualityPoints / termCredits) : null;
                    const cumulativeGpa = cumulativeCredits > 0 ? (cumulativeQualityPoints / cumulativeCredits) : null;

                    // Only add if there were credits attempted in this or previous semesters
                    if (termCredits > 0 || cumulativeCredits > 0) {
                        termGpas.push({
                            term: `Sem ${sem}`,
                            gpa: termGpa !== null ? Number(termGpa.toFixed(2)) : null,
                            cumulativeGpa: cumulativeGpa !== null ? Number(cumulativeGpa.toFixed(2)) : null
                        });
                    } else {
                        // placeholder for empty terms up to now
                        termGpas.push({ term: `Sem ${sem}`, gpa: null, cumulativeGpa: null });
                    }
                });
            }
        }

        return {
            termGpas,
            subjectStatuses: [
                { name: 'Passed', value: subjectStatuses.Passed, fill: '#10b981' }, // emerald-500
                { name: 'Failed', value: subjectStatuses.Failed, fill: '#ef4444' }, // red-500
                { name: 'In Progress', value: subjectStatuses.InProgress, fill: '#e6b689' }, // warning
                { name: 'Not Started', value: subjectStatuses.NotStarted, fill: '#d4d4d8' } // zinc-300
            ],
            termDetails
        };
    }
}

export default new UserCurriculumService();
