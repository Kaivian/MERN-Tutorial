// server/src/routes/expense.routes.js
import { Router } from 'express';
import expenseController from '../controllers/expense.controller.js';

// Since this route is mounted under a private section or requires auth:
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all routes in this module
router.use(verifyAccessToken);

/* ====================== DASHBOARD ====================== */
router.get('/dashboard', expenseController.getDashboardSummary);

/* ====================== TRANSACTIONS ====================== */
router.post('/transactions', expenseController.createTransaction);
router.get('/transactions', expenseController.getTransactions);
router.put('/transactions/:id', expenseController.updateTransaction);
router.delete('/transactions/:id', expenseController.deleteTransaction);

/* ====================== RECURRING EXPENSES ====================== */
router.post('/recurring', expenseController.createRecurringExpense);
router.get('/recurring', expenseController.getRecurringExpenses);
router.put('/recurring/:id', expenseController.updateRecurringExpense);
router.delete('/recurring/:id', expenseController.deleteRecurringExpense);

// Manually trigger recurring (would ideally be a cron or secure webhook)
router.post('/recurring/process', expenseController.processRecurring);

/* ====================== BUDGETS ====================== */
router.post('/budgets', expenseController.setBudget);
router.get('/budgets', expenseController.getBudgets);
router.put('/budgets/:id', expenseController.updateBudget);
router.delete('/budgets/:id', expenseController.deleteBudget);

export default router;
