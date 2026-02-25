// server/src/models/budget.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const budgetSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'budgets'
});

budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
