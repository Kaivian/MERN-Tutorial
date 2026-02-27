// client/src/types/api.ts

/**
 * Standard API Response structure from the Backend.
 * @template T - The type of the data payload (default: unknown).
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'warning' | 'fail';
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * User Profile DTO (Data Transfer Object).
 * Matches the clean JSON structure returned by GET /api/auth/me
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  roles: string[]; // e.g. ["super_admin", "user"]
  mustChangePassword: boolean; // Critical for AuthGuard
  status: 'active' | 'banned' | 'pending';
}

/**
 * Specific Response Type for Auth Context (Login / Me endpoints).
 * Contains User Identity + Permissions.
 */
export interface AuthResponseData {
  user: UserProfile;
  permissions: string[]; // e.g. ["user:view", "post:create"]
}
