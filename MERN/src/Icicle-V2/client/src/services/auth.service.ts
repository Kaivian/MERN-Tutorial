// client/src/services/auth.service.ts
/**
 * @file services/auth.service.ts
 * @description Service responsible for handling authentication API requests.
 */

import { env } from "@/config/env.config";
import type { 
  AuthResponse, 
  LoginPayload, 
  ChangePasswordPayload, 
  ChangePasswordResponse 
} from "@/types/auth.types";

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUTH_BASE_URL = `${env.API_URL}/api/auth`;

const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const authService = {
  /**
   * Authenticates the user with credentials.
   * @param {LoginPayload} payload - The username and password.
   * @returns {Promise<AuthResponse>} The user data and access status.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = data?.message || `Authentication failed (${response.status})`;
        throw new Error(errorMessage);
      }

      return data as AuthResponse;

    } catch (error) {
      throw error;
    }
  },

  /**
   * Logs out the current user.
   */
  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
        headers: HEADERS,
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn(`[AuthService] Logout returned status: ${response.status}`);
      }
    } catch (error) {
      console.error("[AuthService] Logout request failed:", error);
    }
  },

  /**
   * Changes the user's password.
   * @param {ChangePasswordPayload} payload - Contains username, currentPassword, and newPassword.
   * @returns {Promise<void>}
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/change-password`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
        credentials: 'include', 
      });

      // 1. Parse Data
      const data = await response.json().catch(() => null);

      // 2. Handle Errors
      if (!response.ok) {
        const errorMessage = data?.message || `Change password failed (${response.status})`;
        throw new Error(errorMessage);
      }
      
      // 3. Return Data (Crucial for useApi type compatibility)
      return data as ChangePasswordResponse;

    } catch (error) {
      throw error;
    }
  },

  /**
   * Attempts to refresh the access token using the HttpOnly refresh token cookie.
   * Useful for client-side interceptors or manual refresh calls.
   * @returns {Promise<AuthResponse>} The new access token data.
   */
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      // Assuming the backend endpoint is /refresh-token
      const response = await fetch(`${AUTH_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: HEADERS,
        credentials: 'include', // Important: sends the Refresh Token cookie
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = data?.message || `Token refresh failed (${response.status})`;
        throw new Error(errorMessage);
      }

      return data as AuthResponse;
    } catch (error) {
      throw error;
    }
  }
};