// server/src/models/curriculum/admin-class.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * AdminClass represents a concrete class cohort (e.g., BIT_SE_K19D_K20A).
 * This is the admin-facing model for curriculum management, separate from
 * the student-facing Curriculum model used in the Grade page.
 */
const AdminClassSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  }, // e.g., "BIT_SE_K19D_K20A"
  name: {
    type: String,
    required: true,
    trim: true
  }, // Human-readable display name
  majorId: {
    type: Schema.Types.ObjectId,
    ref: 'Major',
    required: true,
    index: true
  },
  intake: {
    type: String,
    trim: true
  }, // e.g., "K19", "K20"
  academicYear: {
    type: String,
    trim: true
  }, // e.g., "2019-2023"
  totalSemesters: {
    type: Number,
    default: 9,
    min: 1,
    max: 12
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true,
  collection: 'admin_classes'
});

const AdminClass = mongoose.model('AdminClass', AdminClassSchema);
export default AdminClass;
