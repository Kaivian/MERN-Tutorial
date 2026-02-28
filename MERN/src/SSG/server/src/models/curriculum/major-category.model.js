// server/src/models/curriculum/major-category.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const MajorCategorySchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  }, // e.g., "IT", "DMT", "BA"
  name: {
    type: String,
    required: true,
    trim: true
  }, // e.g., "Information Technology"
  description: {
    type: String,
    trim: true,
    default: null
  },
  color: {
    type: String,
    trim: true,
    default: '#6366f1' // Default indigo color for UI
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'major_categories'
});

const MajorCategory = mongoose.model('MajorCategory', MajorCategorySchema);
export default MajorCategory;
