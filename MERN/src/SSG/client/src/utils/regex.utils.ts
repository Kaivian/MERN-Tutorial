// client/src/utils/regex.utils.ts
/**
 * @file client/src/utils/regex.utils.ts
 * @description Centralized regular expressions for validation.
 */

/**
 * Validates password requirements:
 * - Length: 8-25 characters
 * - Allowed characters: ASCII printable characters (x21-x7E)
 */
export const PASSWORD_REGEX = /^[\x21-\x7E]{8,25}$/;

/**
 * Validates standard email format.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
