// server/src/models/user-curriculum.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Grade entry per subject part
 * Contains individual scores for categories like 'Assignment 1', 'Final Exam', etc.
 */
const GradeComponentSchema = new Schema({
    category: { type: String, required: true }, // Should match Subject.assessment_plan.category
    part_index: { type: Number, required: true },
    score: { type: Number, required: true, min: 0, max: 10 }
}, { _id: false });

/**
 * Subject Grade Record
 */
const SubjectGradeSchema = new Schema({
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    semester: { type: Number, required: true },
    grades: [GradeComponentSchema],
    totalScore: { type: Number, default: null }, // Computed automatically
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Passed', 'Failed'],
        default: 'Not Started'
    }
}, { _id: false });

/**
 * User Curriculum Context
 */
const UserCurriculumSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // The current selection on the Grade page
    active_context: {
        block: { type: String, default: null },
        program: { type: String, default: null },
        cohort_class: { type: String, default: null },
        term: { type: String, default: null }
    },

    // Recorded grades for specific subjects
    subject_grades: [SubjectGradeSchema]

}, {
    timestamps: true,
    collection: 'user_curriculums'
});

const UserCurriculum = mongoose.model('UserCurriculum', UserCurriculumSchema);
export default UserCurriculum;
