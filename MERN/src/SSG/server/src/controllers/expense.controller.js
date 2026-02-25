// server/src/controllers/expense.controller.js
import expenseService from '../services/expense.service.js';
import {
  createTransactionSchema, updateTransactionSchema,
  createRecurringSchema, updateRecurringSchema,
  setBudgetSchema, updateBudgetSchema
} from '../validations/expense.validation.js';

class ExpenseController {

  /* ================= TRANSACTIONS ================= */
  async createTransaction(req, res, next) {
    try {
      const { error, value } = createTransactionSchema.validate(req.body);
      if (error) return res.error(error.details[0].message, 400);

      const result = await expenseService.createTransaction(req.user.id, value);
      res.success(result, 'Transaction created carefully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await expenseService.getTransactions(req.user.id, req.query);
      res.success(result, 'Transactions fetched');
    } catch (err) {
      next(err);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const { error, value } = updateTransactionSchema.validate(req.body);
      if (error) return res.error(error.details[0].message, 400);

      const result = await expenseService.updateTransaction(req.params.id, req.user.id, value);
      res.success(result, 'Transaction updated');
    } catch (err) {
      next(err);
    }
  }

  async deleteTransaction(req, res, next) {
    try {
      await expenseService.deleteTransaction(req.params.id, req.user.id);
      res.success(null, 'Transaction deleted');
    } catch (err) {
      next(err);
    }
  }

  /* ================= RECURRING EXPENSES ================= */
  async createRecurringExpense(req, res, next) {
    try {
      const { error, value } = createRecurringSchema.validate(req.body);
      if (error) return res.error(error.details[0].message, 400);

      const result = await expenseService.createRecurringExpense(req.user.id, value);
      res.success(result, 'Recurring expense created', 201);
    } catch (err) {
      next(err);
    }
  }

  async getRecurringExpenses(req, res, next) {
    try {
      const result = await expenseService.getRecurringExpenses(req.user.id);
      res.success(result, 'Recurring expenses fetched');
    } catch (err) {
      next(err);
    }
  }

  async updateRecurringExpense(req, res, next) {
    try {
      const { error, value } = updateRecurringSchema.validate(req.body);
      if (error) return res.error(error.details[0].message, 400);

      const result = await expenseService.updateRecurringExpense(req.params.id, req.user.id, value);
      res.success(result, 'Recurring expense updated');
    } catch (err) {
      next(err);
    }
  }

  async deleteRecurringExpense(req, res, next) {
    try {
      await expenseService.deleteRecurringExpense(req.params.id, req.user.id);
      res.success(null, 'Recurring expense deleted');
    } catch (err) {
      next(err);
    }
  }

  async processRecurring(req, res, next) {
    try {
      const result = await expenseService.processDueRecurringExpenses();
      res.success(result, 'Processed due recurring expenses');
    } catch (err) {
      next(err);
    }
  }

  /* ================= BUDGETS ================= */
  async setBudget(req, res, next) {
    try {
      const { error, value } = setBudgetSchema.validate(req.body);
      if (error) return res.error(error.details[0].message, 400);

      const result = await expenseService.setBudget(req.user.id, value.category, value.monthlyLimit);
      res.success(result, 'Budget set successfully');
    } catch (err) {
      next(err);
    }
  }

  async getBudgets(req, res, next) {
    try {
      const result = await expenseService.getBudgets(req.user.id);
      res.success(result, 'Budgets fetched');
    } catch (err) {
      next(err);
    }
  }

  async updateBudget(req, res, next) {
    try {
      const { error, value } = updateBudgetSchema.validate(req.body);
      if (error) return res.error(error.details[0].message, 400);

      const result = await expenseService.updateBudget(req.params.id, req.user.id, value);
      res.success(result, 'Budget updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteBudget(req, res, next) {
    try {
      await expenseService.deleteBudget(req.params.id, req.user.id);
      res.success(null, 'Budget deleted');
    } catch (err) {
      next(err);
    }
  }

  /* ================= DASHBOARD ================= */
  async getDashboardSummary(req, res, next) {
    try {
      const result = await expenseService.getDashboardSummary(req.user.id);
      res.success(result, 'Dashboard summary fetched');
    } catch (err) {
      next(err);
    }
  }
}

export default new ExpenseController();
