// src/models/grade/subject.model.js
const mongoose = require('mongoose');
const AssessmentComponentSchema = require('./common/Assessment.schema');
const { Schema } = mongoose;

// Enum for subject structure types
const STRUCTURE_TYPES = {
    STANDARD: 'STANDARD',             // Normal subjects (e.g., CEA201)
    ELECTIVE_GROUP: 'ELECTIVE_GROUP', // Group of simple electives (e.g., TMI_ELE)
    COMBO_CONTAINER: 'COMBO_CONTAINER', // Combo placeholder (e.g., SE_COM*1)
    GRADUATION_OPTION: 'GRADUATION_OPTION' // Graduation thesis options (e.g., SE_GRA_ELE)
};

/**
 * Embedded Subject Info Schema
 * Used for detailed subject info inside Combo options (e.g., JPD133 inside SE_COM*1).
 */
const EmbeddedSubjectInfoSchema = new Schema({
    code: { type: String, required: true, trim: true },
    name_en: { type: String, trim: true },
    name_vi: { type: String, trim: true },
    decision_no: { type: String, trim: true }, // Specific for graduation options
    assessment_plan: [AssessmentComponentSchema]
}, { _id: false });

/**
 * Combo Option Schema
 * Represents a specific path/option within a Combo subject.
 */
const ComboOptionSchema = new Schema({
    combo_name: { type: String, trim: true, description: 'Name of the specialization topic' },
    combo_code: [{ type: String, trim: true }], // Array of codes e.g., ["SE_COM7.1"]
    
    // The actual subject details for this option
    subject_info: { type: EmbeddedSubjectInfoSchema }
}, { _id: true });

/**
 * Simple Elective Option Schema
 * Used for TMI_ELE where options are just names without deep structure.
 */
const SimpleElectiveOptionSchema = new Schema({
    code: { type: String, required: true },
    name_vi: { type: String },
    name_en: { type: String }
}, { _id: false });

/**
 * Main Subject Schema
 */
const SubjectSchema = new Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        index: true 
    },
    name_en: { type: String, required: true, trim: true },
    name_vi: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 0, max: 9 },
    credit: { type: Number, required: true, min: 0 },
    prerequisite: { type: String, default: null, trim: true },

    // Discriminator field to handle different data shapes
    structure_type: {
        type: String,
        enum: Object.values(STRUCTURE_TYPES),
        default: STRUCTURE_TYPES.STANDARD,
        required: true
    },

    // 1. For STANDARD & ELECTIVE_GROUP: The common assessment plan
    assessment_plan: {
        type: [AssessmentComponentSchema],
        default: undefined // Allow undefined if it's a COMBO_CONTAINER
    },

    // 2. For ELECTIVE_GROUP (e.g., TMI_ELE): List of selectable instruments
    elective_simple_options: {
        type: [SimpleElectiveOptionSchema],
        default: undefined
    },

    // 3. For COMBO_CONTAINER & GRADUATION_OPTION: List of complex options
    combo_options: {
        type: [ComboOptionSchema],
        default: undefined
    }
}, {
    timestamps: true,
    collection: 'subjects'
});

// Middleware to ensure data consistency based on structure_type (Optional)
SubjectSchema.pre('save', function(next) {
    if (this.structure_type === STRUCTURE_TYPES.COMBO_CONTAINER && !this.combo_options) {
        return next(new Error('COMBO_CONTAINER must have combo_options'));
    }
    next();
});

const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = { Subject, STRUCTURE_TYPES };