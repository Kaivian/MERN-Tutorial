// client/src/services/auth.service.ts
/**
 * @file src/services/auth.service.ts
 * @description Authentication Service.
 * Centralizes all auth-related API interactions for Client Components.
 * Utilizes the configured axiosClient to handle request interception and response unwrapping.
 */

import axiosClient from "@/utils/axios-client.utils";
import type { 
  AuthResponse, 
  LoginPayload, 
  RegisterPayload, // [NEW IMPORT]
  ChangePasswordPayload, 
  ChangePasswordResponse,
  AuthMeResponse 
} from "@/types/auth.types";

// ============================================================================
// ENDPOINTS CONSTANTS
// ============================================================================

const ENDPOINTS = {
  REGISTER: '/auth/register', // [NEW ENDPOINT]
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  ME: '/auth/me',
} as const;

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const authService = {
  /**
   * Registers a new user account.
   * On success, the server returns the user profile and sets auth cookies (Auto-Login).
   * * @param {RegisterPayload} payload - The registration form data.
   * @returns {Promise<AuthResponse>} A promise resolving to the new user data and access tokens.
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return axiosClient.post(ENDPOINTS.REGISTER, payload) as Promise<AuthResponse>;
  },

  /**
   * Authenticates a user using their credentials.
   * * @param {LoginPayload} payload - The object containing username/email and password.
   * @returns {Promise<AuthResponse>} A promise resolving to the user data and access tokens.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // Note: The return type is cast because the axiosClient interceptor 
    // is configured to return `response.data` directly, bypassing the Axios wrapper.
    return axiosClient.post(ENDPOINTS.LOGIN, payload) as Promise<AuthResponse>;
  },

  /**
   * Logs out the current user and invalidates the session.
   * Clears server-side HTTP-only cookies via the API endpoint.
   * * @remarks
   * This method suppresses any errors during the logout process (e.g., if the token 
   * is already expired) to ensure the client-side cleanup always proceeds smoothly.
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      // Non-blocking error handling: Log warning but allow UI to redirect.
      console.warn("[AuthService] Logout warning (non-fatal):", error);
    }
  },

  /**
   * Updates the authenticated user's password.
   * * @param {ChangePasswordPayload} payload - Object containing the current and new passwords.
   * @returns {Promise<ChangePasswordResponse>} The status of the password change operation.
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
    return axiosClient.post(ENDPOINTS.CHANGE_PASSWORD, payload) as Promise<ChangePasswordResponse>;
  },

  /**
   * Manually triggers an access token refresh.
   * * @remarks
   * Typically, the axios interceptor handles token refreshing automatically on 401 errors.
   * Use this method only when a manual refresh is explicitly required (e.g., pre-checks).
   * * @returns {Promise<AuthResponse>} The new access token and user data.
   */
  refreshToken: async (): Promise<AuthResponse> => {
    return axiosClient.post(ENDPOINTS.REFRESH) as Promise<AuthResponse>;
  },

  /**
   * Retrieves the current user's profile, roles, and permissions.
   * Essential for client-side state hydration and RBAC permission checks.
   * * @returns {Promise<AuthMeResponse>} The detailed user context including permissions.
   */
  getMe: async (): Promise<AuthMeResponse> => {
    return axiosClient.get(ENDPOINTS.ME) as Promise<AuthMeResponse>;
  }
};
