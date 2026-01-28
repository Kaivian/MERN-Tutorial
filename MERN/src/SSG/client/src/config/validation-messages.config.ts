// client/src/config/validation-messages.config.ts
/**
 * @file validation-messages.config.ts
 * @description Centralized validation messages for form fields.
 * Provides a single source of truth for consistent user feedback.
 */
export const VALIDATION_MESSAGES = {
  // BRL1.1: Required field
  REQUIRED: "This field is required.",

  // BRL1.2: Invalid date format
  INVALID_DATE: "Invalid date format.",

  // BRL1.3: Invalid date/time range
  INVALID_RANGE: "Invalid time range.",

  // BRL1.4: Invalid data (generic)
  INVALID: "Invalid value.",

  // Email format
  EMAIL_FORMAT: "Invalid email format.",

  // BRL1.5: Duplicate value
  DUPLICATE: "This value already exists.",

  // BRL1.6: English letters, numbers, underscore only
  ALPHANUMERIC_UNDERSCORE: "Only English letters, numbers, and underscore (_) are allowed.",

  // BRL1.7: Latin characters and ' . -
  LATIN_CHARACTERS: "Only Latin characters and ' . - are allowed.",

  // BRL1.9: Password length
  MIN_8_CHARS: "Must be at least 8 characters.",
  MAX_25_CHARS: "Password must not exceed 25 characters.",

  // General format
  FORMAT: "Only unaccented letters, numbers, and special characters are allowed.",

  // BRL1.10: Password same as current
  PASSWORD_SAME: "New password must be different from the current password.",

  // BRL1.11: Password mismatch
  PASSWORD_MISMATCH: "Passwords do not match.",

  // Password format
  PASSWORD_FORMAT:
    "Password must be 8–25 characters and contain only unaccented letters and numbers (a–Z, 0–9).",

  // BRL1.12: Integer only
  INTEGER_ONLY: "Only integers are allowed.",

  // BRL1.14: Number >= 0
  NON_NEGATIVE: "Only numbers greater than or equal to 0 are allowed.",

  // BRL1.15: English letters, numbers, . -
  ALPHANUMERIC_DOT_DASH: "Only English letters, numbers, and . - are allowed.",

  // BRL1.16: Invalid time format
  INVALID_TIME: "Invalid time format.",

  // BRL1.17: Invalid number (positive/negative/zero)
  INVALID_NUMBER: "Invalid number.",

  // BRL1.18: Specific to sales order
  ORDER_END_DATE_INVALID:
    "The order end date must be the same as or later than the expected delivery date.",

  // BRL1.19: Number > 0
  POSITIVE_ONLY: "Only numbers greater than 0 are allowed.",
} as const;

/**
 * Get validation message by field name and error type
 * Provides fallback to generic messages
 */
export function getValidationMessage(
  field: string,
  errorType: keyof typeof VALIDATION_MESSAGES = "INVALID"
): string {
  return VALIDATION_MESSAGES[errorType];
}
