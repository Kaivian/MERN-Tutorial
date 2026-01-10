// server/src/middlewares/error.middleware.js
import logger from '../utils/logger.utils.js';
import ENV from '../config/env.config.js';

/**
 * Global Error Handling Middleware.
 * Catches all errors thrown in the application and formats them consistently.
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - Express Request object.
 * @param {import('express').Response} res - Express Response object.
 */
export const errorHandler = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error for server-side debugging
  logger.error(`[Error] ${req.method} ${req.originalUrl}`, err.message);

  const response = {
    status: 'error',
    code: statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  // Attach stack trace in development
  if (ENV.app.env === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};