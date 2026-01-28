// server/src/validations/user.validation.js
import Joi from 'joi';
import { password, objectId } from './custom.validation.js';

/**
 * Schema for creating a new user manually (Admin Action).
 */
export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  
  username: Joi.string().min(3).max(30).required(),
  
  // Use the same consistent password rule
  password: Joi.string().custom(password).required(),
  
  fullName: Joi.string().min(2).max(100).required(),
  
  // Role can be slug (string) or ObjectId
  role: Joi.alternatives().try(
    Joi.string().min(3).max(20),
    Joi.string().custom(objectId)
  ).optional()
});