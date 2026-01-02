// server/src/config/env.config.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/* ==========================================================================
 * ENVIRONMENT CONFIGURATION SETUP
 * ========================================================================== */

/**
 * Resolve the directory path of the current module.
 * Required because __dirname is not available in ES Modules.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Determine the current runtime environment.
 * Defaults to 'development' if NODE_ENV is not set.
 */
const currentEnv = process.env.NODE_ENV || 'development';

/**
 * Construct the specific environment filename based on the runtime environment.
 * Example: if NODE_ENV is 'development', it looks for '.env.development'.
 */
const envFileName = `.env.${currentEnv}`;

/**
 * Resolve the absolute path to the environment file.
 * We navigate up two levels (../../) from 'src/config' to reach the 'server' root.
 */
const envPath = path.join(__dirname, `../../${envFileName}`);

// Log the file being loaded to help with debugging
console.log(`[Config] Loading environment variables from: ${envFileName}`);

/**
 * Load the environment variables from the calculated path.
 */
dotenv.config({ path: envPath });

/* ==========================================================================
 * UTILITIES & EXPORTS
 * ========================================================================== */

/**
 * Helper to convert strings like "15m", "7d" to milliseconds.
 * Fallback to default values if .env is missing.
 */
const parseDurationToMs = (durationStr, defaultMs) => {
  if (!durationStr) return defaultMs;
  
  const unit = durationStr.slice(-1); // Get last character ('m', 'd', 'h')
  const value = parseInt(durationStr.slice(0, -1), 10); // Get the number

  if (isNaN(value)) return defaultMs;

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return defaultMs; // Return default if unit is unknown
  }
};

/**
 * Helper function to retrieve environment variables.
 * Throws an error if a required variable is missing to prevent runtime failures.
 *
 * @param {string} key - The name of the environment variable (e.g., 'DATABASE_URL').
 * @param {string|number} [defaultValue] - An optional default value to return if the key is undefined.
 * @returns {string} The value of the environment variable.
 * @throws {Error} If the key is missing and no default value is provided.
 */
const getEnv = (key, defaultValue) => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return String(defaultValue);
    }
    throw new Error(`[Config Error] Missing required environment variable: ${key}`);
  }
  return value;
};

/**
 * Global configuration object derived from environment variables.
 * Organized by functional domain (App, DB, Auth, Security, Email).
 *
 * @constant
 * @namespace config
 */
const config = {
  /**
   * General application settings.
   * @property {string} env - The runtime environment (development/production).
   * @property {number} port - The port number the server listens on.
   */
  app: {
    env: currentEnv,
    port: parseInt(getEnv('PORT', 5000), 10),
  },

  /**
   * Database connection settings.
   * @property {string} url - The full MongoDB connection URI.
   */
  db: {
    url: getEnv('DATABASE_URL'),
  },

  /**
   * JWT (JSON Web Token) Strategy configuration.
   * Separated into Access and Refresh token logic.
   * @property {string} issuer - The 'iss' claim identifying this server.
   * @property {object} audience - Audience claims ('aud') for token verification.
   * @property {object} accessToken - Settings for short-lived access tokens.
   * @property {object} refreshToken - Settings for long-lived refresh tokens.
   */
  jwt: {
    issuer: getEnv('JWT_ISSUER'),
    audience: {
      access: getEnv('JWT_ACCESS_AUDIENCE_ID'),
      refresh: getEnv('JWT_REFRESH_AUDIENCE_ID'),
    },
    accessToken: {
      secret: getEnv('JWT_ACCESS_SECRET'),
      expiresIn: getEnv('JWT_ACCESS_EXPIRES_IN'),
      maxAge: parseDurationToMs(getEnv('JWT_ACCESS_EXPIRES_IN'), 15 * 60 * 1000), // Default 15 minutes
    },
    refreshToken: {
      secret: getEnv('JWT_REFRESH_SECRET'),
      expiresIn: getEnv('JWT_REFRESH_EXPIRES_IN'),
      maxAge: parseDurationToMs(getEnv('JWT_REFRESH_EXPIRES_IN'), 7 * 24 * 60 * 60 * 1000), // Default 7 days
    },
  },

  /**
   * Google OAuth 2.0 configuration.
   * Used for handling "Login with Google".
   * @property {string} clientId - The public Google Client ID.
   * @property {string} clientSecret - The private Google Client Secret.
   * @property {string} callbackUrl - The authorized redirect URI.
   */
  google: {
    clientId: getEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    callbackUrl: getEnv('GOOGLE_CALLBACK_URL'),
  },

  /**
   * Security utilities configuration.
   * @property {string} cookieSecret - Secret key used for signing cookies.
   * @property {string[]} allowedOrigins - List of allowed CORS origins (parsed from comma-separated string).
   */
  security: {
    cookieSecret: getEnv('COOKIE_SECRET'),
    allowedOrigins: getEnv('ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  },

  /**
   * Email service configuration (SMTP).
   * Optional settings (defaults to empty strings if not provided).
   * @property {string} username - SMTP username.
   * @property {string} password - SMTP password.
   * @property {string} host - SMTP server host.
   * @property {number} port - SMTP server port.
   */
  email: {
    username: process.env.EMAIL_USERNAME || '',
    password: process.env.EMAIL_PASSWORD || '',
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
  },
};

export default config;