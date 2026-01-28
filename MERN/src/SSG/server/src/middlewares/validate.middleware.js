// server/src/middlewares/validate.middleware.js
import logger from '../utils/logger.utils.js';

/**
 * Middleware adapter to validate request data against a Joi schema.
 * @param {Object} schema - The Joi schema definition.
 * @param {string} source - The property of req to validate ('body', 'query', 'params').
 * @returns {Function} Express middleware.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  // Joi validation options
  const options = {
    abortEarly: false, // Return all errors found, not just the first one
    stripUnknown: true, // Remove keys that are not defined in the schema (Security)
    errors: {
      wrap: {
        label: '' // Clean up error messages (remove quotes around field names)
      }
    }
  };

  const { error, value } = schema.validate(req[source], options);

  if (error) {
    // Create a single string message from all error details
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    
    // Log warning for monitoring bad requests
    logger.warn(`[Validation] Blocked Request on ${req.originalUrl}: ${errorMessages}`);
    
    // Return 422 Unprocessable Entity
    return res.error(errorMessages, 422);
  }

  // Replace req data with the sanitized (clean) value
  req[source] = value;
  next();
};

export default validate;