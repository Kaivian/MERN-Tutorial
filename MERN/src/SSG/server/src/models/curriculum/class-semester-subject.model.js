// server/src/models/curriculum/class-semester-subject.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * ClassSemesterSubject is the flexible mapping table that ties a Subject
 * to a specific Class+Semester slot, with an ordering index.
 *
 * This allows:
 * - Same subject to be reused across multiple classes
 * - Different ordering per class
 * - Different semester placement per class
 */
const ClassSemesterSubjectSchema = new Schema({
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'AdminClass',
    required: true,
    index: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  }, // 1 = Semester 1, 2 = Semester 2, etc.
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  order_index: {
    type: Number,
    default: 0
  } // Controls ordering within a semester lane
}, {
  timestamps: true,
  collection: 'class_semester_subjects'
});

// Compound index: one subject per semester per class
ClassSemesterSubjectSchema.index(
  { classId: 1, semester: 1, subjectId: 1 },
  { unique: true }
);

// Index for efficient ordering retrieval
ClassSemesterSubjectSchema.index({ classId: 1, semester: 1, order_index: 1 });

const ClassSemesterSubject = mongoose.model('ClassSemesterSubject', ClassSemesterSubjectSchema);
export default ClassSemesterSubject;
