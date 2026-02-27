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
    title: "User is invalid",
    msg: "Account does not exist. Please check your username.",
  },
  "Invalid credentials": {
    title: "Failed to login",
    msg: "Incorrect username or password. Please try again.",
  },
  "Account banned": {
    title: "Account is banned",
    msg: "Your account has been disabled. Please contact Admin.",
  },

  /* -------------------------------------------------------------------------- */
  /* PASSWORD CHANGE ERRORS (Mới thêm)                                          */
  /* -------------------------------------------------------------------------- */
  "Incorrect current password": {
    title: "Incorrect current password",
    msg: "The current password you entered is incorrect. Please double-check.",
  },
  "New password cannot be the same as current password": {
    title: "New password cannot be the same as current password",
    msg: "The new password cannot be the same as the current password.",
  },

  /* -------------------------------------------------------------------------- */
  /* TOKEN / SESSION ERRORS                                                     */
  /* -------------------------------------------------------------------------- */
  "Invalid refresh token": {
    title: "Invalid refresh token",
    msg: "Invalid refresh token. Please log in again.",
  },
  "Session expired or revoked": {
    title: "Session expired or revoked",
    msg: "Your session has expired or been revoked. Please log in again.",
  },

  /* -------------------------------------------------------------------------- */
  /* COMMON / NETWORK ERRORS                                                    */
  /* -------------------------------------------------------------------------- */
  "Network Error": {
    title: "Network Error",
    msg: "Cannot connect to the server. Please check your internet connection.",
  },
  "Failed to fetch": {
    title: "Network Error",
    msg: "Failed to communicate with the server. The server might be down.",
  },
  "An error occurred during the request.": {
    title: "System Error",
    msg: "An unexpected error occurred. Please try again later.",
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
    title: "Unhandled Error",
    msg: cleanMessage || "An unexpected error occurred.",
  };
};
