// server/src/models/recurring-expense.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const recurringExpenseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['WEEKLY', 'MONTHLY', 'CUSTOM'],
    required: true
  },
  nextExecutionDate: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  collection: 'recurring_expenses'
});

export default mongoose.model('RecurringExpense', recurringExpenseSchema);
