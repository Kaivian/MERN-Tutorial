// server/src/services/expense.service.js
import expenseRepository from '../repositories/expense.repository.js';
import createError from 'http-errors';

class ExpenseService {
  /* ================= TRANSACTIONS ================= */
  async createTransaction(userId, data) {
    return await expenseRepository.createTransaction({ ...data, userId });
  }

  async getTransactions(userId, filters = {}) {
    const filter = { userId, ...filters };
    return await expenseRepository.getTransactions(filter);
  }

  async updateTransaction(id, userId, data) {
    const updated = await expenseRepository.updateTransaction(id, userId, data);
    if (!updated) throw createError(404, 'Transaction not found');
    return updated;
  }

  async deleteTransaction(id, userId) {
    const deleted = await expenseRepository.deleteTransaction(id, userId);
    if (!deleted) throw createError(404, 'Transaction not found');
    return deleted;
  }

  /* ================= RECURRING ================= */
  async createRecurringExpense(userId, data) {
    return await expenseRepository.createRecurringExpense({ ...data, userId });
  }

  async getRecurringExpenses(userId) {
    return await expenseRepository.getRecurringExpenses({ userId });
  }

  async updateRecurringExpense(id, userId, data) {
    const updated = await expenseRepository.updateRecurringExpense(id, userId, data);
    if (!updated) throw createError(404, 'Recurring expense not found');
    return updated;
  }

  async deleteRecurringExpense(id, userId) {
    const deleted = await expenseRepository.deleteRecurringExpense(id, userId);
    if (!deleted) throw createError(404, 'Recurring expense not found');
    return deleted;
  }

  async processDueRecurringExpenses() {
    const now = new Date();
    const dueExpenses = await expenseRepository.getDueRecurringExpenses(now);

    let processedCount = 0;

    for (const expense of dueExpenses) {
      // Create the transaction
      await expenseRepository.createTransaction({
        userId: expense.userId,
        amount: expense.amount,
        type: 'EXPENSE',
        category: expense.category,
        description: `Auto-generated: ${expense.description || expense.category}`,
        paymentMethod: 'BANK', // Default for auto-recurring
        transactionDate: now
      });

      // Calculate next date
      const nextDate = new Date(expense.nextExecutionDate);
      if (expense.frequency === 'WEEKLY') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (expense.frequency === 'MONTHLY') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1); // fallback custom
      }

      await expenseRepository.updateRecurringExpense(expense._id, expense.userId, {
        nextExecutionDate: nextDate
      });

      processedCount++;
    }
    return { processed: processedCount };
  }

  /* ================= BUDGETS ================= */
  async setBudget(userId, category, monthlyLimit) {
    return await expenseRepository.setBudget(userId, category, monthlyLimit);
  }

  async getBudgets(userId) {
    return await expenseRepository.getBudgets(userId);
  }

  async updateBudget(id, userId, data) {
    const updated = await expenseRepository.updateBudget(id, userId, data);
    if (!updated) throw createError(404, 'Budget not found');
    return updated;
  }

  async deleteBudget(id, userId) {
    const deleted = await expenseRepository.deleteBudget(id, userId);
    if (!deleted) throw createError(404, 'Budget not found');
    return deleted;
  }

  /* ================= DASHBOARD & INSIGHTS ================= */
  async getDashboardSummary(userId) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Overview
    const overview = await expenseRepository.getMonthlySummary(userId, firstDay, lastDay);

    // 2. Categories
    const categoriesSum = await expenseRepository.getExpenseCategoriesSummary(userId, firstDay, lastDay);
    const topCategories = categoriesSum.slice(0, 3);

    // 3. Budgets
    const budgets = await expenseRepository.getBudgets(userId);
    const budgetUsage = budgets.map(b => {
      const spentInfo = categoriesSum.find(c => c._id === b.category);
      const totalSpent = spentInfo ? spentInfo.totalSpent : 0;
      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        totalSpent,
        percentageUsed: (totalSpent / b.monthlyLimit) * 100
      };
    });

    // 4. Insights
    const prevMonthFirstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthOverview = await expenseRepository.getMonthlySummary(userId, prevMonthFirstDay, prevMonthLastDay);

    const daysPassed = now.getDate();
    const avgDailySpending = overview.totalExpense / daysPassed;

    let financialHealth = 'GOOD';
    let suggestion = "You are doing great! Keep tracking your expenses.";
    let warnings = [];

    // Increase > 30% check
    if (prevMonthOverview.totalExpense > 0) {
      const increaseRatio = (overview.totalExpense - prevMonthOverview.totalExpense) / prevMonthOverview.totalExpense;
      if (increaseRatio > 0.3) {
        financialHealth = 'WARNING';
        suggestion = "Your spending is significantly higher than last month. Try to cut back on non-essentials.";
        warnings.push(`Spending increased by ${(increaseRatio * 100).toFixed(0)}% compared to last month.`);
      }
    }

    // Checking if over 80% on total limits or net cash flow is negative
    if (overview.netCashFlow < 0) {
      financialHealth = 'RISK';
      suggestion = "You are spending more than you earn! Immediate re-budgeting is advised.";
      warnings.push("Negative cash flow detected.");
    }

    const overLimitBudgets = budgetUsage.filter(b => b.percentageUsed >= 80);
    if (overLimitBudgets.length > 0) {
      if (financialHealth !== 'RISK') financialHealth = 'WARNING';
      overLimitBudgets.forEach(b => {
        warnings.push(`Approaching/Exceeded limit for category: ${b.category} (${b.percentageUsed.toFixed(0)}%)`);
      });
    }

    return {
      overview: { ...overview, avgDailySpending: Math.round(avgDailySpending) },
      topCategories,
      budgetUsage,
      insights: {
        financialHealth,
        suggestion,
        warnings
      }
    };
  }
}

export default new ExpenseService();
