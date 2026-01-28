// server/src/validations/auth.validation.js
import Joi from 'joi';
import { password } from './custom.validation.js';

/**
 * Schema for User Registration.
 * Ensures strict data integrity before hitting the database.
 */
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username must only contain alpha-numeric characters',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must be strictly less than 30 characters'
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address'
  }),

  // Uses the centralized password complexity rule
  password: Joi.string().custom(password).required(),

  // Frontend should send this field to prevent typo errors
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  }),
});

/**
 * Schema for User Login.
 * Allows 'identifier' OR 'email' OR 'username' + 'password'.
 */
export const loginSchema = Joi.object({
  identifier: Joi.string(),
  username: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().required()
}).or('identifier', 'username', 'email')
  .messages({
    'object.missing': 'Username or Email is required'
  });

/**
 * Schema for Change Password Form.
 * Matches the fields sent from your Frontend component.
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),

  newPassword: Joi.string().custom(password).required()
    .disallow(Joi.ref('currentPassword')) // Security: New pass != Old pass
    .messages({
      'any.invalid': 'New password must be different from current password'
    }),

  // Must match newPassword exactly
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Confirm password does not match new password'
    })
});