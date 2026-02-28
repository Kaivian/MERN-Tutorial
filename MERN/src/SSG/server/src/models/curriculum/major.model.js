// server/src/models/curriculum/major.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const MajorSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  }, // e.g., "SE", "AI", "IS", "ADS"
  name: {
    type: String,
    required: true,
    trim: true
  }, // e.g., "Software Engineering"
  description: {
    type: String,
    trim: true,
    default: null
  },
  majorCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'MajorCategory',
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'majors'
});

const Major = mongoose.model('Major', MajorSchema);
export default Major;
