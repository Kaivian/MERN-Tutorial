// server/src/middlewares/rate-limit.middleware.js
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.utils.js';
import ENV from '../config/env.config.js';

/**
 * Helper function to determine the limit based on the environment.
 * In 'development', limits are relaxed to avoid blocking workflow.
 * * @param {number} productionLimit - The limit to enforce in production.
 * @param {number} devLimit - The limit to enforce in development.
 * @returns {number} The appropriate limit for the current environment.
 */
const getLimit = (productionLimit, devLimit = 10000) => {
  return ENV.app.env === 'development' ? devLimit : productionLimit;
};

/**
 * 1. General API Rate Limiter.
 * @description
 * Applies a global rate limit to all API routes to prevent DDoS and spam.
 * * **Configuration:**
 * - **Window:** 15 minutes.
 * - **Limit (Prod):** 100 requests per IP.
 * - **Limit (Dev):** 10,000 requests per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getLimit(100), // 100 in Prod, 10000 in Dev
  standardHeaders: true, // Return 'RateLimit-*' headers (Draft-7)
  legacyHeaders: false, // Disable 'X-RateLimit-*' headers
  handler: (req, res, next, options) => {
    logger.warn(`[RateLimit] IP ${req.ip} exceeded general API limit.`);
    res.status(options.statusCode).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    });
  },
});

/**
 * 2. Sensitive Authentication Rate Limiter.
 * @description
 * Applies strict limits to critical routes like Login, Register, and Password Reset
 * to prevent Brute-force and Dictionary attacks.
 * * **Configuration:**
 * - **Window:** 1 minute.
 * - **Limit (Prod):** 5 requests per IP.
 * - **Limit (Dev):** 1,000 requests per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: getLimit(5, 1000), // 5 in Prod, 1000 in Dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again after 1 minute.'
  }
});