// client/src/services/auth.service.ts
import { ApiResponse, AuthResponseData } from '@/types/api';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;

/**
 * Generic HTTP wrapper to handle request configuration, JSON parsing, 
 * and standardized error throwing.
 * * @template T - The expected shape of the success response data.
 * @param {string} path - The API endpoint path (e.g., '/login').
 * @param {RequestInit} [config] - Optional fetch configuration (method, headers, body).
 * @returns {Promise<ApiResponse<T>>} The parsed JSON response from the server.
 * @throws {Error} Throws an error if the HTTP status is not 2xx.
 */
async function http<T>(path: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
  const request = new Request(`${API_URL}${path}`, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  const response = await fetch(request);

  // 1. Safe JSON Parsing
  // Attempt to parse the response body. If the server returns an empty body,
  // plain text, or HTML (common in 500/502 errors), .json() would normally crash.
  // Using .catch(() => null) prevents the crash and allows us to handle the error gracefully.
  const body = await response.json().catch(() => null);

  // 2. HTTP Error Handling
  // The native fetch API does NOT throw errors for HTTP 4xx or 5xx status codes.
  // We must explicitly check `response.ok` (status in the range 200-299).
  if (!response.ok) {
    // Priority for Error Message:
    // 1. Message from Backend JSON body (e.g., "Invalid password")
    // 2. Standard HTTP Status Text (e.g., "Unauthorized")
    // 3. Fallback generic message
    const errorMessage = body?.message || response.statusText || `Request failed with status ${response.status}`;
    
    // Throwing here ensures the flow jumps to the 'catch' block in useApi/components
    throw new Error(errorMessage);
  }

  // 3. Success
  return body as ApiResponse<T>;
}

export const authService = {
  /**
   * Authenticates a user with their credentials.
   * @param credentials - Object containing identifier (username/email) and password.
   */
  login: (credentials: { identifier: string; password: string }) => 
    http<AuthResponseData>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  /**
   * Logs out the current user.
   * Typically clears the HttpOnly cookie on the server side.
   */
  logout: () => 
    http<null>('/logout', { method: 'POST' }),

  /**
   * Retrieves the profile and permissions of the currently authenticated user.
   * Used for session persistence and hydration.
   */
  getMe: () => 
    http<AuthResponseData>('/me', { method: 'GET' }),

  /**
   * Updates the user's password.
   * Applicable for both voluntary updates and force-change-password flows.
   */
  changePassword: (payload: { currentPassword: string; newPassword: string }) => 
    http<null>('/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};