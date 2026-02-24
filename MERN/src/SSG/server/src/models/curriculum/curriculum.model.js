// src/models/Curriculum.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Learning Outcome Schema (PLO)
 */
const PLOSchema = new Schema({
    id: { type: String, required: true, trim: true }, // e.g., "PLO1"
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true }
}, { _id: false });

/**
 * Job Position Schema
 */
const JobPositionSchema = new Schema({
    vi: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
}, { _id: false });

/**
 * Curriculum Schema
 */
const CurriculumSchema = new Schema({
    curriculum_info: {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        }, // e.g., "BIT_SE_K19D_K20A"
        name_vi: { type: String, required: true, trim: true },
        name_en: { type: String, required: true, trim: true },
        total_credits: { type: Number, required: true },
        decision_info: {
            number: { type: String, trim: true },
            date: { type: Date }
        }
    },

    training_objectives: {
        general_objectives: {
            vi: { type: String, trim: true },
            en: { type: String, trim: true }
        },
        job_positions: [JobPositionSchema]
    },

    program_learning_outcomes: [PLOSchema],

    // Relationship: References to the Subject collection
    subjects: [{
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    }]
}, {
    timestamps: true,
    collection: 'curriculums'
});

// Index for faster searches
CurriculumSchema.index({ 'curriculum_info.code': 1 });

const Curriculum = mongoose.model('Curriculum', CurriculumSchema);

export default Curriculum;