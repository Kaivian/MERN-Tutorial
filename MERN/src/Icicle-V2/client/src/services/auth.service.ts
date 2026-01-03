// client/src/services/auth.service.ts
/**
 * @file services/auth.service.ts
 * @description Service responsible for handling authentication API requests.
 */

import { env } from "@/config/env.config";
import type { AuthResponse, LoginPayload } from "@/types/auth.types";

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Base API Endpoint for Authentication */
const AUTH_BASE_URL = `${env.API_URL}/api/auth`;

/** Standard headers for JSON requests */
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
   * * @param {LoginPayload} payload - The username and password.
   * @returns {Promise<AuthResponse>} The user data and access status.
   * @throws {Error} If authentication fails.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
        credentials: 'include', // Required for HttpOnly Cookies
      });

      // 1. Handle Response Data
      // We explicitly try/catch json parsing because sometimes servers return 
      // HTML (500 Error) or Empty Body instead of JSON.
      const data = await response.json().catch(() => null);

      // 2. Handle HTTP Errors (4xx, 5xx)
      if (!response.ok) {
        // Prefer server message, fallback to status text
        const errorMessage = data?.message || `Authentication failed (${response.status})`;
        throw new Error(errorMessage);
      }

      // 3. Return Typed Data
      return data as AuthResponse;

    } catch (error) {
      // Re-throw to be handled by the calling hook (useApi)
      throw error;
    }
  },

  /**
   * Logs out the current user.
   * Typically clears HttpOnly cookies on the server.
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
      // Logout errors are often non-critical for UI, but good to log
      console.error("[AuthService] Logout request failed:", error);
    }
  }
};