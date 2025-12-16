// server/src/middlewares/response.middleware.js
import config from '../config/env.config.js';

/**
 * Standardized API Response Structure.
 * @typedef {Object} ApiResponse
 * @property {string} status - 'success' or 'error'.
 * @property {number} code - HTTP status code (e.g., 200, 400, 500).
 * @property {string} message - Human-readable message.
 * @property {any} [data] - The payload data (optional).
 * @property {string} timestamp - ISO timestamp of the response.
 * @property {string} [stack] - Error stack trace (development only).
 */

/**
 * Middleware to attach standardized response helpers to the 'res' object.
 * This ensures consistency across all API endpoints.
 *
 * @param {import('express').Request} req - Express Request object.
 * @param {import('express').Response} res - Express Response object.
 * @param {import('express').NextFunction} next - Express Next function.
 */
export const responseMiddleware = (req, res, next) => {
  /**
   * Sends a success response.
   * @param {any} data - The data payload to send to the client.
   * @param {string} [message='Operation successful'] - Success message.
   * @param {number} [statusCode=200] - HTTP status code.
   */
  res.success = (data, message = 'Operation successful', statusCode = 200) => {
    res.status(statusCode).json({
      status: 'success',
      code: statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Sends an error response.
   * @param {string} [message='Operation failed'] - Error message.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {Error|null} [error=null] - The original error object (for debugging).
   */
  res.error = (message = 'Operation failed', statusCode = 500, error = null) => {
    const response = {
      status: 'error',
      code: statusCode,
      message,
      timestamp: new Date().toISOString()
    };

    // Include stack trace only in development environment for debugging
    if (config.app.env === 'development' && error) {
      response.stack = error.stack;
    }

    res.status(statusCode).json(response);
  };

  next();
};