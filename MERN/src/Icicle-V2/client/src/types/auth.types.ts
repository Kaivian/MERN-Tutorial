// client/src/types/auth.types.ts

// ==========================================
// 1. CONSTANTS (SYSTEM DEFINITIONS)
// ==========================================

/**
 * System Roles constants.
 * Currently, the system only enforces one hardcoded role: Super Admin.
 * Other roles might exist dynamically but are not hardcoded here.
 * @constant
 * @readonly
 */
export const ROLES = {
  /** Full Access */
  SUPER_ADMIN: 'super_admin',
  /** Regular User */
  USER: 'user',
} as const;

/**
 * User Account Status.
 * @constant
 * @readonly
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
} as const;

// ==========================================
// 2. DOMAIN TYPES (CORE ENTITIES)
// ==========================================

/**
 * Helper type to extract values from ROLES constant.
 * - Returns 'super_admin'
 * - Also allows generic strings (string & {}) for dynamic roles from DB.
 */
export type RoleSlug = (typeof ROLES)[keyof typeof ROLES] | (string & {});

/**
 * Helper type for User Status values.
 */
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/**
 * Represents the User entity matching the Backend response.
 */
export interface User {
  /** Unique identifier (MongoDB ObjectId) */
  id: string;

  /** User's unique login identifier */
  username: string;

  /** User's email address */
  email: string;

  /** Display name of the user */
  fullName: string;

  /** URL to user's avatar image (optional) */
  avatarUrl?: string;

  /** * List of role slugs assigned to user.
   * e.g., ['super_admin'] or dynamic roles like ['editor'] 
   */
  roles: RoleSlug[];

  /** * Flag indicating if the user is forced to change password.
   * - true: Must redirect to change-password page.
   * - false: Can access dashboard.
   */
  mustChangePassword: boolean;

  /** Account status */
  status: UserStatus;

  /** Email verification status */
  isVerified: boolean;
}

// ==========================================
// 3. API REQUEST/RESPONSE TYPES
// ==========================================

/**
 * Payload required for Login API.
 */
export interface LoginPayload {
  username?: string;
  password?: string;
  rememberMe?: boolean;
}

/**
 * Standard API Response structure wrapper.
 * @template T - The type of the data payload.
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Specific response structure for Authentication.
 */
export type AuthResponse = ApiResponse<{
  user: User;
  /** Access Token (JWT) */
  accessToken?: string;
}>;

// ==========================================
// 4. ROUTING & PERMISSION CONFIG
// ==========================================

/**
 * Access levels for routes.
 */
export type RouteAccessType = 'PUBLIC' | 'GUEST_ONLY' | 'PRIVATE';

/**
 * Configuration object for route protection.
 */
export interface RouteConfig {
  /** The URL path (e.g., '/dashboard') */
  path: string;

  /** Access level required */
  type: RouteAccessType;

  /** * (Optional) Specific permission required to view this route.
   * e.g., 'user:create'
   */
  permission?: string;
}