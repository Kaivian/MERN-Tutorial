// server/src/models/transaction.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema({
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
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'BANK', 'EWALLET'],
    required: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'transactions'
});

export default mongoose.model('Transaction', transactionSchema);
