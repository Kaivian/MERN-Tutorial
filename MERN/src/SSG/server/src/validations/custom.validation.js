// server/src/validations/custom.validation.js
/**
 * Validates that a string is a valid MongoDB ObjectId.
 * @param {string} value
 * @param {Object} helpers
 */
export const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid Mongo ID');
  }
  return value;
};

/**
 * Validate password matching Frontend rules exactly.
 * Regex: /^[\x21-\x7E]{8,25}$/
 * Rules:
 * - Min 8, Max 25 characters.
 * - Allowed chars: ASCII printable characters (excluding space).
 * - No specific requirement for numbers/uppercase (based on your regex).
 * * @param {string} value
 * @param {Object} helpers
 */
export const password = (value, helpers) => {
  // 1. Check Length
  if (value.length < 8) {
    return helpers.message('Password must be at least 8 characters');
  }
  if (value.length > 25) {
    return helpers.message('Password must be at most 25 characters');
  }

  // 2. Check Character Set (ASCII printable \x21-\x7E)
  if (!value.match(/^[\x21-\x7E]+$/)) {
    return helpers.message('Password contains invalid characters (spaces are not allowed)');
  }

  return value;
};