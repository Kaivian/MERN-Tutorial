// client/src/types/auth.types.ts
/**
 * @file client/src/types/auth.types.ts
 * @description Type definitions for the Authentication domain.
 * Includes System Constants, Entity Models, API Payloads/Responses, and Routing Configurations.
 */

// ============================================================================
// 1. CONSTANTS (SYSTEM DEFINITIONS)
// ============================================================================

/**
 * System Role Constants.
 * Defines the hardcoded roles recognized by the frontend logic.
 * Note: The backend may support dynamic roles not listed here.
 */
export const ROLES = {
  /** Full system access */
  SUPER_ADMIN: 'super_admin',
  /** Standard user access */
  USER: 'user',
} as const;

/**
 * User Account Status Constants.
 * Determines the user's ability to log in or access resources.
 */
export const USER_STATUS = {
  /** Fully operational account */
  ACTIVE: 'active',
  /** Account created but not verified or temporarily disabled */
  INACTIVE: 'inactive',
  /** Account permanently restricted */
  BANNED: 'banned',
} as const;

// ============================================================================
// 2. DOMAIN TYPES (CORE ENTITIES)
// ============================================================================

/**
 * Type helper for User Roles.
 * @remarks
 * The `(string & {})` intersection allows for "loose autocomplete". 
 * It preserves IntelliSense for known `ROLES` (e.g., 'super_admin') 
 * while still accepting any other string value (dynamic roles from DB).
 */
export type RoleSlug = (typeof ROLES)[keyof typeof ROLES] | (string & {});

/**
 * Type helper for User Status.
 * Restricts values to the specific keys defined in `USER_STATUS`.
 */
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/**
 * Represents the User entity as returned by the Backend.
 * Acts as the single source of truth for User profile data on the client.
 */
export interface User {
  /** Unique identifier (mapped from MongoDB `_id`) */
  id: string;

  /** User's unique login identifier */
  username: string;

  /** User's email address */
  email: string;

  /** Full display name of the user */
  fullName: string;

  /** URL to user's avatar image (optional) */
  avatarUrl?: string;

  /** * List of role slugs assigned to the user.
   * Used for high-level role checks (though Permission-based checks are preferred).
   */
  roles: RoleSlug[];

  /** * Security flag indicating if a password reset is mandatory.
   * If true, Middleware will redirect the user to the Change Password page.
   */
  mustChangePassword: boolean;

  /** Current state of the account */
  status: UserStatus;

  /** Email verification status */
  isVerified?: boolean;
}

// ============================================================================
// 3. API REQUEST PAYLOADS
// ============================================================================

/**
 * Payload required for the Login API endpoint (`/auth/login`).
 */
export interface LoginPayload {
  username?: string; 
  password?: string;
  rememberMe?: boolean;
}

/**
 * Payload required for the Change Password API endpoint (`/auth/change-password`).
 */
export interface ChangePasswordPayload {
  /** Optional if the backend derives the user from the Bearer Token */
  username?: string;
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// 4. API RESPONSE STRUCTURES
// ============================================================================

/**
 * Standard API Response Wrapper.
 * Uniform structure for all JSON responses from the backend.
 * @template T - The specific shape of the `data` property.
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Response structure for the Login and Register endpoints.
 */
export type AuthResponse = ApiResponse<{
  user: User;
  /** JWT Access Token (Refresh tokens are usually handled via HTTP-only cookies) */
  accessToken?: string;
}>;

/**
 * Data structure returned by the `/auth/me` endpoint.
 * @description This interface separates the User Profile from their computed Permissions,
 * forming the complete "User Context" for the frontend.
 */
export interface AuthMeResponse {
  user: User;
  /** * Flattened list of permission strings (e.g., `['user:create', 'report:view']`).
   * Computed by the backend based on the user's roles.
   */
  permissions: string[];
}

/**
 * Response structure for the Change Password endpoint.
 * Returns null data on success, relies on status code/message.
 */
export type ChangePasswordResponse = ApiResponse<null>;

// ============================================================================
// 5. ROUTING & PERMISSION CONFIG
// ============================================================================

/**
 * Route Access Levels.
 * - `PUBLIC`: Accessible by anyone (no token required).
 * - `GUEST_ONLY`: Accessible ONLY by unauthenticated users (e.g., Login page).
 * - `PRIVATE`: Requires a valid token.
 */
export type RouteAccessType = 'PUBLIC' | 'GUEST_ONLY' | 'PRIVATE';

/**
 * Configuration object for Route Protection.
 * Used by Middleware (`proxy.ts`) and Site Config to define access rules.
 */
export interface RouteConfig {
  /** The URL path (e.g., '/dashboard/users') */
  path: string;

  /** The access level required for this route */
  type: RouteAccessType;

  /** * (Optional) specific permissions required to view this route.
   * If defined, the user must possess ALL listed permissions (or ANY, depending on implementation logic).
   */
  requiredPerms?: readonly string[] | string[];
}