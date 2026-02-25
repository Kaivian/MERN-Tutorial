// server/src/repositories/expense.repository.js
import Transaction from '../models/transaction.model.js';
import RecurringExpense from '../models/recurring-expense.model.js';
import Budget from '../models/budget.model.js';
import mongoose from 'mongoose';

class ExpenseRepository {
  /* ================= TRANSACTION ================= */
  async createTransaction(data) {
    return await Transaction.create(data);
  }

  async getTransactions(filter, sort = { transactionDate: -1 }, limit = 0) {
    return await Transaction.find(filter).sort(sort).limit(limit).lean();
  }

  async getTransactionById(id, userId) {
    return await Transaction.findOne({ _id: id, userId });
  }

  async updateTransaction(id, userId, data) {
    return await Transaction.findOneAndUpdate({ _id: id, userId }, data, { returnDocument: 'after' });
  }

  async deleteTransaction(id, userId) {
    return await Transaction.findOneAndDelete({ _id: id, userId });
  }

  /* ================= DASHBOARD AGGREGATIONS ================= */
  async getMonthlySummary(userId, startDate, endDate) {
    const pipe = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" }
        }
      }
    ];

    const result = await Transaction.aggregate(pipe);
    let totalIncome = 0;
    let totalExpense = 0;

    result.forEach(r => {
      if (r._id === 'INCOME') totalIncome = r.totalAmount;
      if (r._id === 'EXPENSE') totalExpense = r.totalAmount;
    });

    return { totalIncome, totalExpense, netCashFlow: totalIncome - totalExpense };
  }

  async getExpenseCategoriesSummary(userId, startDate, endDate) {
    const pipe = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'EXPENSE',
          transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" }
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ];
    return await Transaction.aggregate(pipe);
  }

  /* ================= RECURRING EXPENSES ================= */
  async createRecurringExpense(data) {
    return await RecurringExpense.create(data);
  }

  async getRecurringExpenses(filter) {
    return await RecurringExpense.find(filter).lean();
  }

  async getRecurringExpenseById(id, userId) {
    return await RecurringExpense.findOne({ _id: id, userId });
  }

  async updateRecurringExpense(id, userId, data) {
    return await RecurringExpense.findOneAndUpdate({ _id: id, userId }, data, { returnDocument: 'after' });
  }

  async deleteRecurringExpense(id, userId) {
    return await RecurringExpense.findOneAndDelete({ _id: id, userId });
  }

  async getDueRecurringExpenses(currentDate) {
    return await RecurringExpense.find({
      isActive: true,
      nextExecutionDate: { $lte: new Date(currentDate) }
    });
  }

  /* ================= BUDGETS ================= */
  async setBudget(userId, category, monthlyLimit) {
    return await Budget.findOneAndUpdate(
      { userId, category },
      { monthlyLimit },
      { upsert: true, returnDocument: 'after' }
    );
  }

  async getBudgets(userId) {
    return await Budget.find({ userId }).lean();
  }

  async updateBudget(id, userId, data) {
    return await Budget.findOneAndUpdate({ _id: id, userId }, data, { returnDocument: 'after' });
  }

  async deleteBudget(id, userId) {
    return await Budget.findOneAndDelete({ _id: id, userId });
  }
}

export default new ExpenseRepository();
