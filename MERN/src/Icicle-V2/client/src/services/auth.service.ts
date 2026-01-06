// client/src/services/auth.service.ts
/**
 * @file services/auth.service.ts
 * @description Authentication Service.
 * Used by Client Components to interact with Auth APIs.
 * Utilizes the centralized axiosClient for consistent error handling and interceptors.
 */

import axiosClient from "@/utils/axios-client.utils";
import type { 
  AuthResponse, 
  LoginPayload, 
  ChangePasswordPayload, 
  ChangePasswordResponse 
} from "@/types/auth.types";

// ============================================================================
// ENDPOINTS CONSTANTS
// ============================================================================

const ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
} as const;

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const authService = {
  /**
   * Authenticates the user with credentials.
   * @param {LoginPayload} payload - The username/email and password.
   * @returns {Promise<AuthResponse>} The user data and access status.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // [FIX]: Cast the return type to Promise<AuthResponse>
    // Since our Interceptor unwraps response.data, TypeScript needs to know
    // that the 'AxiosResponse' wrapper is gone.
    return axiosClient.post(ENDPOINTS.LOGIN, payload) as Promise<AuthResponse>;
  },

  /**
   * Logs out the current user.
   * Clears cookies on the server side via the API call.
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      // Logout errors are usually non-blocking (e.g., token already expired),
      // so we just log a warning instead of crashing the UI flow.
      console.warn("[AuthService] Logout warning:", error);
    }
  },

  /**
   * Changes the user's password.
   * @param {ChangePasswordPayload} payload - Contains currentPassword and newPassword.
   * @returns {Promise<ChangePasswordResponse>} Result of the operation.
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
    // [FIX]: Cast to Promise<ChangePasswordResponse>
    // This fixes the "Type 'AxiosResponse' is missing properties..." error.
    return axiosClient.post(ENDPOINTS.CHANGE_PASSWORD, payload) as Promise<ChangePasswordResponse>;
  },

  /**
   * Manually triggers a token refresh.
   * Note: The axiosClient interceptor handles this automatically on 401 errors.
   * This method is exposed only for specific use cases (e.g., pre-fetching validity).
   * @returns {Promise<AuthResponse>} The new access token data.
   */
  refreshToken: async (): Promise<AuthResponse> => {
    // [FIX]: Cast to Promise<AuthResponse>
    return axiosClient.post(ENDPOINTS.REFRESH) as Promise<AuthResponse>;
  }
};