// client/src/config/error-mapping.config.ts
/**
 * @file client/src/config/error-mapping.config.ts
 * @description Maps raw backend error messages to friendly Vietnamese UI messages.
 */

// Define the structure of our UI friendly error
export interface UIError {
  title: string;
  msg: string;
}

/**
 * ERROR DICTIONARY
 * Key: The exact error string returned from Backend (auth.service.ts)
 * Value: The friendly { title, msg } for Vietnamese Users
 */
const ERROR_MAP: Record<string, UIError> = {
  /* -------------------------------------------------------------------------- */
  /* AUTHENTICATION ERRORS                                                      */
  /* -------------------------------------------------------------------------- */
  "User not found": {
    title: "Tài khoản không tồn tại",
    msg: "Email hoặc tên đăng nhập này chưa được đăng ký trong hệ thống.",
  },
  "Invalid username/email or password": {
    title: "Đăng nhập thất bại",
    msg: "Tên đăng nhập hoặc mật khẩu không chính xác.",
  },
  "Invalid password": {
    title: "Sai mật khẩu",
    msg: "Mật khẩu bạn nhập không đúng. Vui lòng thử lại.",
  },
  "Account banned": {
    title: "Tài khoản bị khóa",
    msg: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin.",
  },

  /* -------------------------------------------------------------------------- */
  /* PASSWORD CHANGE ERRORS (Mới thêm)                                          */
  /* -------------------------------------------------------------------------- */
  "Incorrect current password": {
    title: "Mật khẩu cũ không đúng",
    msg: "Mật khẩu hiện tại bạn nhập không chính xác. Vui lòng kiểm tra lại.",
  },
  "New password cannot be the same as current password": {
    title: "Trùng mật khẩu cũ",
    msg: "Mật khẩu mới không được giống với mật khẩu hiện tại.",
  },

  /* -------------------------------------------------------------------------- */
  /* TOKEN / SESSION ERRORS                                                     */
  /* -------------------------------------------------------------------------- */
  "Invalid refresh token": {
    title: "Phiên đăng nhập lỗi",
    msg: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  },
  "Session expired or revoked": {
    title: "Hết hạn phiên",
    msg: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  },

  /* -------------------------------------------------------------------------- */
  /* COMMON / NETWORK ERRORS                                                    */
  /* -------------------------------------------------------------------------- */
  "Network Error": {
    title: "Lỗi kết nối",
    msg: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.",
  },
  "Failed to fetch": {
    title: "Lỗi kết nối",
    msg: "Không thể liên lạc với Server. Server có thể đang bảo trì.",
  },
  "An error occurred during the request.": {
    title: "Lỗi hệ thống",
    msg: "Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.",
  },
};

/**
 * Helper function to convert Backend Error -> UI Friendly Error
 * @param backendMessage The raw error string from the `catch(error)` block
 * @returns {UIError} An object containing { title, msg }
 */
export const getFriendlyError = (backendMessage: string): UIError => {
  // 1. Trim input to avoid mismatch due to spaces
  const cleanMessage = backendMessage?.trim();

  // 2. Lookup in the map
  if (cleanMessage && ERROR_MAP[cleanMessage]) {
    return ERROR_MAP[cleanMessage];
  }

  // 3. Fallback (For unmapped errors - Helps Devs debug)
  return {
    title: "Lỗi chưa xác định (Unhandled)",
    msg: cleanMessage || "Đã xảy ra lỗi không rõ nguyên nhân.",
  };
};