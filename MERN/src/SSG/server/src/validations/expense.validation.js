// server/src/validations/expense.validation.js
import Joi from 'joi';

export const createTransactionSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  type: Joi.string().valid('INCOME', 'EXPENSE').required(),
  category: Joi.string().required(),
  description: Joi.string().max(500).allow('').optional(),
  paymentMethod: Joi.string().valid('CASH', 'BANK', 'EWALLET').required(),
  transactionDate: Joi.date().iso().required(),
});

export const updateTransactionSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  type: Joi.string().valid('INCOME', 'EXPENSE').optional(),
  category: Joi.string().optional(),
  description: Joi.string().max(500).allow('').optional(),
  paymentMethod: Joi.string().valid('CASH', 'BANK', 'EWALLET').optional(),
  transactionDate: Joi.date().iso().optional(),
}).min(1);

export const createRecurringSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  category: Joi.string().required(),
  frequency: Joi.string().valid('WEEKLY', 'MONTHLY', 'CUSTOM').required(),
  nextExecutionDate: Joi.date().iso().required(),
  description: Joi.string().max(500).allow('').optional(),
});

export const updateRecurringSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  frequency: Joi.string().valid('WEEKLY', 'MONTHLY', 'CUSTOM').optional(),
  nextExecutionDate: Joi.date().iso().optional(),
  isActive: Joi.boolean().optional(),
  description: Joi.string().max(500).allow('').optional(),
}).min(1);

export const setBudgetSchema = Joi.object({
  category: Joi.string().required(),
  monthlyLimit: Joi.number().min(0).required()
});

export const updateBudgetSchema = Joi.object({
  category: Joi.string().optional(),
  monthlyLimit: Joi.number().min(0).optional()
}).min(1);
