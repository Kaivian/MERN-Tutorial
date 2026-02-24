import mongoose from 'mongoose';

const { Schema } = mongoose;

const SubTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    }
}, { _id: true }); // Generate IDs so toggle works properly

const TaskSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Null implies it's a "Personal" task
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        default: null,
    },
    // Nullable if personal task
    category: {
        type: String,
        trim: true,
        default: null,
    },
    // Nullable if personal task
    weight: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    slot: {
        type: Number,
        min: 1,
        max: 6,
        default: null,
    },
    color: {
        type: String,
        trim: true,
        default: null,
    },
    startDate: {
        type: Date,
        required: true,
    },
    // Nullable for non-deadline, ongoing tasks
    endDate: {
        type: Date,
        default: null,
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    estimatedHours: {
        type: Number,
        min: 0,
        required: true,
    },
    subTasks: {
        type: [SubTaskSchema],
        default: [],
    },
    // Pre-calculated or client-provided score based on urgency formulation
    urgencyScore: {
        type: Number,
        default: 0,
    },
    // Feature: Mark entire task as complete
    isCompleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    collection: 'tasks'
});

const Task = mongoose.model('Task', TaskSchema);

export default Task;
