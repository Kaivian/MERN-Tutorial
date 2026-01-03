// client/src/config/validation-messages.config.ts
/**
 * @file validation-messages.config.ts
 * @description Centralized validation messages for form fields.
 * Provides a single source of truth for consistent user feedback.
 */
export const VALIDATION_MESSAGES = {
  // BRL1.1: Required field
  REQUIRED: "Trường này là bắt buộc.",

  // BRL1.2: Invalid date format
  INVALID_DATE: "Ngày không hợp lệ.",

  // BRL1.3: Invalid date/time range
  INVALID_RANGE: "Khoảng thời gian không hợp lệ.",

  // BRL1.4: Invalid data (generic)
  INVALID: "Thông tin không hợp lệ.",

  // BRL1.5: Duplicate value
  DUPLICATE: "Giá trị này đã tồn tại.",

  // BRL1.6: English, numbers, underscore only
  ALPHANUMERIC_UNDERSCORE: "Chỉ cho phép ký tự tiếng Anh, chữ số, và _",

  // BRL1.7: Latin characters and ' . -
  LATIN_CHARACTERS: "Chỉ cho phép ký tự Latin và ' . -",

  // BRL1.9: Minimum 8 characters
  MIN_8_CHARS: "Cần nhập ít nhất 8 ký tự.",
  MAX_25_CHARS: "Mật khẩu không được vượt quá 25 ký tự.",
  FORMAT: "Chỉ chấp nhận chữ cái không dấu, số và ký tự đặc biệt.",

  // BRL1.10: Password same as current
  PASSWORD_SAME: "Không được trùng với mật khẩu cũ.",

  // BRL1.11: Password mismatch
  PASSWORD_MISMATCH: "Mật khẩu mới không khớp.",

  PASSWORD_FORMAT: "Mật khẩu từ 8-25 ký tự, chỉ chứa chữ cái không dấu và số (a-Z, 0-9)",

  // BRL1.12: Integer only
  INTEGER_ONLY: "Chỉ cho phép nhập số nguyên.",

  // BRL1.14: Number >= 0
  NON_NEGATIVE: "Chỉ cho phép nhập số >= 0.",

  // BRL1.15: English, numbers, . -
  ALPHANUMERIC_DOT_DASH: "Chỉ cho phép ký tự tiếng Anh, chữ số, và . -",

  // BRL1.16: Invalid time format
  INVALID_TIME: "Thời gian không hợp lệ.",

  // BRL1.17: Invalid number (positive/negative/zero)
  INVALID_NUMBER: "Số không hợp lệ.",

  // BRL1.18: Specific to sales order
  ORDER_END_DATE_INVALID: "Ngày kết thúc đơn hàng phải bằng hoặc sau ngày giao hàng dự kiến.",

  // BRL1.19: Number > 0
  POSITIVE_ONLY: "Chỉ cho phép nhập số > 0.",
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