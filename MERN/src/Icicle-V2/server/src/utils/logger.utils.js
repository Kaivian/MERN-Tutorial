// server/src/utils/logger.utils.js
/**
 * ANSI Escape Codes for terminal colors.
 * Used to visually distinguish different log levels.
 */
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

/**
 * Formats the log message with a timestamp and color.
 *
 * @param {string} level - The severity level (INFO, SUCCESS, WARN, ERROR).
 * @param {string} message - The main log message.
 * @param {string} color - The ANSI color code for the level.
 * @returns {string} The formatted string with timestamp and tags.
 */
const formatLog = (level, message, color) => {
  const timestamp = new Date().toISOString();
  return `${colors.reset}[${timestamp}] ${color}[${level}]${colors.reset} ${message}`;
};

/**
 * Centralized application logger utility.
 * Provides standardized logging with timestamps and color coding for the server console.
 * * @module utils/logger
 */
const logger = {
  /**
   * Logs general informational messages.
   *
   * @param {string} message - The message to log.
   * @param {...any} args - Additional data or objects to log.
   */
  info(message, ...args) {
    console.log(formatLog('INFO', message, colors.cyan), ...args);
  },

  /**
   * Logs success messages (e.g., DB connected, Server started).
   *
   * @param {string} message - The success message.
   * @param {...any} args - Additional data.
   */
  success(message, ...args) {
    console.log(formatLog('SUCCESS', message, colors.green), ...args);
  },

  /**
   * Logs warning messages that do not halt execution.
   *
   * @param {string} message - The warning message.
   * @param {...any} args - Additional data.
   */
  warn(message, ...args) {
    console.warn(formatLog('WARN', message, colors.yellow), ...args);
  },

  /**
   * Logs critical error messages.
   *
   * @param {string} message - The error description.
   * @param {...any} args - The error object or stack trace.
   */
  error(message, ...args) {
    console.error(formatLog('ERROR', message, colors.red), ...args);
  },
};

export default logger;