// client/src/services/auth.service.ts
import { AuthResponse, LoginPayload } from "@/types/auth.types";

/**
 * Base API URL configuration.
 * Prioritizes environment variable, falls back to localhost for development.
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

/**
 * Authentication Service.
 * * Responsible for handling raw HTTP requests related to authentication (Login, Logout).
 * This service is designed to be used with the `useApi` hook.
 * * Key Features:
 * - Uses `credentials: 'include'` to support HttpOnly Cookies.
 * - Throws errors with server messages for upstream handling/mapping.
 */
export const authService = {

  /**
   * Authenticates the user using Username and Password.
   * * @param {LoginPayload} payload - The login credentials (username, password).
   * @returns {Promise<AuthResponse>} The full API response containing user data.
   * * @throws {Error} Throws an error if the HTTP status is not 2xx. 
   * The error message is taken from the server response (e.g., "User not found") 
   * to allow `useApi` to map it to a friendly UI message.
   * * @example
   * const response = await authService.login({ username: 'kaivian', password: '123' });
   * console.log(response.data.user);
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add extra headers here if needed (e.g., Device-ID)
        },
        body: JSON.stringify(payload),
        
        // CRITICAL: Required for the browser to accept the 'Set-Cookie' header 
        // from the server (HttpOnly Token).
        credentials: 'include', 
      });

      const data = await response.json();

      // Check for HTTP errors (400, 401, 403, 500, etc.)
      if (!response.ok) {
        // Throw the raw message from server so 'useApi' can map it using ERROR_MAP
        // Fallback to status text if message is missing
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data as AuthResponse;
    } catch (error) {
      // Re-throw the error to be caught by the useApi hook
      throw error;
    }
  },

  /**
   * Logs out the user.
   * * Sends a request to the server to clear the HttpOnly cookie.
   * This is more secure than just deleting client-side state.
   * * @returns {Promise<void>} Resolves when the logout request is complete (regardless of success).
   */
  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CRITICAL: Required to send the existing cookie to the server 
        // so the server knows WHICH session to invalidate.
        credentials: 'include', 
      });
    } catch (error) {
      // Logout failures are usually non-blocking for the UX, 
      // but we log them for debugging purposes.
      console.error("Logout service error:", error);
    }
  }
};