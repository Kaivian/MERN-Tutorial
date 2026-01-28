// src/models/grade/common/assessment.schema.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * AssessmentComponent Schema
 * Represents a single component of the assessment plan (e.g., Progress Test, Final Exam).
 * Designed to be embedded within Subject documents.
 */
const AssessmentDetailsSchema = new Schema({
    question_type: {
        type: String,
        trim: true,
        description: 'Type of questions (e.g., Multiple Choice, Essay, Project)'
    },
    question_count: {
        type: Schema.Types.Mixed, // Can be Number (50) or String ("30-35")
        description: 'Number of questions involved'
    },
    description: {
        type: String,
        trim: true,
        description: 'Detailed description of the assessment content'
    },
    knowledge_and_skill: {
        type: String,
        trim: true,
        description: 'Specific knowledge and skills covered'
    }
}, { _id: false }); // No ID needed for simple sub-document details

const AssessmentComponentSchema = new Schema({
    category: {
        type: String,
        required: true,
        trim: true,
        index: true, // Index for querying specific assessment types (e.g., 'Final exam')
        description: 'Category of assessment (e.g., Assignment, Progress Test, Final exam)'
    },
    type: {
        type: String,
        trim: true,
        description: 'Execution type (e.g., On-going, Final exam)'
    },
    part_count: {
        type: Number,
        default: 1,
        min: 0,
        description: 'Number of parts or occurrences'
    },
    weight_percent: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        description: 'Weight of this component in the final grade (%)'
    },
    completion_criteria: {
        type: String,
        trim: true,
        description: 'Condition to pass (e.g., "> 0", ">= 4")'
    },
    duration: {
        type: String,
        trim: true,
        description: 'Duration of the assessment (e.g., "60 minutes")'
    },
    clos_covered: {
        type: String,
        trim: true,
        description: 'Course Learning Outcomes covered (e.g., "CLO1, CLO2")'
    },
    details: {
        type: AssessmentDetailsSchema,
        default: () => ({})
    },
    grading_guide: {
        type: String,
        trim: true,
        description: 'Guidelines for grading'
    },
    note: {
        type: String,
        trim: true,
        description: 'Additional notes or requirements'
    }
}, { 
    _id: true, // Keep ID to uniquely identify assessment items if needed
    timestamps: false 
});

module.exports = AssessmentComponentSchema;