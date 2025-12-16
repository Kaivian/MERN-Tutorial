import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from './config/env.config.js';
import { apiLimiter } from './middlewares/rate-limit.middleware.js';
import { responseMiddleware } from './middlewares/response.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

/* ==================== 1. CORE CONFIGURATION ==================== */

/**
 * Trust Proxy setting.
 * Essential when deploying behind a reverse proxy (Nginx, Heroku, AWS ELB).
 * Ensures that 'req.ip' returns the real client IP, allowing Rate Limiter to work correctly.
 */
app.set('trust proxy', 1);

/* ==================== 2. GLOBAL MIDDLEWARES ==================== */

/** Security Headers (Helmet). */
app.use(helmet());

/** Enable CORS with options from config. */
app.use(cors({
  origin: config.security.allowedOrigins,
  credentials: true // Allow cookies to be sent across domains
}));

/** Compress response bodies for all requests to improve performance. */
app.use(compression());

/** * Global API Rate Limiter.
 * Protects the entire application from DDoS and Brute-force attacks.
 * Configured differently for Development vs Production.
 */
app.use(apiLimiter);

/** Request Body Parsers. */
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(config.security.cookieSecret)); // Parse cookies

/** HTTP Request Logger (Dev mode only). */
if (config.app.env === 'development') {
  app.use(morgan('dev'));
}

/** * Response Standardization Middleware.
 * Attaches 'res.success' and 'res.error' helpers.
 * MUST be placed BEFORE routes.
 */
app.use(responseMiddleware);

/* ==================== 3. ROUTES ==================== */

/**
 * Health Check Endpoint.
 * Uses 'res.success' for a standardized JSON response.
 */
app.get('/', (req, res) => {
  res.success({
    environment: config.app.env,
    database: config.app.env === 'development' ? 'development_db' : 'production_db',
    uptime: process.uptime()
  }, 'Icicle Backend API is running smoothly');
});

// TODO: Import and use API routes here
// app.use('/api/v1', routes);

/* ==================== 4. ERROR HANDLING ==================== */

/** * 404 Not Found Handler.
 * Catches any request that doesn't match a defined route.
 */
app.use((req, res, next) => {
  const error = new Error(`Resource Not Found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

/** * Global Error Handler.
 * Catches all errors forwarded by 'next(error)' from previous middlewares.
 */
app.use(errorHandler);

export default app;