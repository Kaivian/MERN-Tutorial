// server/src/config/mongo.config.js
import config from './env.config.js';

/**
 * Determines the target database name based on the environment.
 * - If NODE_ENV is 'development', the database name is strictly 'development'.
 * - If NODE_ENV is 'production', the database name is 'icicle_app' (or your main project name).
 *
 * @constant
 * @type {string}
 */
const targetDbName = config.app.env === 'development' 
  ? 'development' 
  : 'icicle_app';

/**
 * MongoDB Configuration Object.
 * Centralizes the connection URI and connection options.
 *
 * @constant
 * @namespace mongoConfig
 */
const mongoConfig = {
  /** The connection URI from environment variables. */
  uri: config.db.url,

  /**
   * Mongoose connection options.
   * Explicitly sets 'dbName' to force Mongoose to use the specific database.
   */
  options: {
    dbName: targetDbName,
  },

  /** The resolved database name (used for logging). */
  name: targetDbName
};

export default mongoConfig;