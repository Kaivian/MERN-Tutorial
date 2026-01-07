// client/src/providers/auth-provider.tsx
"use client";

/**
 * @file src/providers/auth-provider.tsx
 * @description
 * React Context Provider for Authentication and Role-Based Access Control (RBAC).
 * It hydrates the client-side state with data fetched from the Server Layout
 * and provides optimized hooks for checking permissions.
 */

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { AuthMeResponse } from "@/types/auth.types";
import { matchPermission, hasAllPermissions } from "@/utils/permission-matcher.utils";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Defines the shape of the authentication context exposed to the application.
 */
interface AuthContextType {
  /** The current authenticated user's profile, or null if guest. */
  user: AuthMeResponse["user"] | null;

  /** The list of raw permission strings assigned to the user. */
  permissions: string[];

  /** Boolean flag indicating if a user is currently logged in. */
  isAuthenticated: boolean;

  /**
   * Checks if the user holds a specific permission (supports wildcards).
   * @param permission - The permission string to validate (e.g., 'user:create').
   * @returns {boolean} True if authorized.
   */
  hasPermission: (permission: string) => boolean;

  /**
   * Checks if the user holds ALL permissions in the provided list.
   * @param requiredPermissions - Array of required permission strings.
   * @returns {boolean} True if all permissions are satisfied.
   */
  checkAllPermissions: (requiredPermissions: readonly string[]) => boolean;
}

interface AuthProviderProps {
  /** The child components (usually the entire app structure). */
  children: React.ReactNode;
  /**
   * The initial authentication data fetched from the Server Component (Layout).
   * This prevents the need for a client-side fetch on initial load.
   */
  initialData: AuthMeResponse | null;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * Wraps the application to provide authentication state and permission helpers.
 *
 * @component
 * @example
 * // In src/app/layout.tsx
 * <AuthProvider initialData={serverFetchedData}>
 * {children}
 * </AuthProvider>
 */
export function AuthProvider({ children, initialData }: AuthProviderProps) {
  // 1. Extract data (Safe defaults)
  const user = initialData?.user || null;
  const permissions = initialData?.permissions || [];
  const isAuthenticated = !!user;

  // 2. Define Helper Functions (Stable References via useCallback)

  /**
   * Wrapper around the utility function `matchPermission`.
   * Memoized to prevent unnecessary re-creations on render.
   */
  const checkHasPermission = useCallback(
    (requiredPerm: string) => {
      return matchPermission(permissions, requiredPerm);
    },
    [permissions]
  );

  /**
   * Wrapper around the utility function `hasAllPermissions`.
   */
  const checkHasAllPermissions = useCallback(
    (requiredPerms: readonly string[]) => {
      return hasAllPermissions(permissions, requiredPerms);
    },
    [permissions]
  );

  // 3. Memoize the Context Value
  // Critical for performance: Prevents consumers from re-rendering unless auth state changes.
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      permissions,
      isAuthenticated,
      hasPermission: checkHasPermission,
      checkAllPermissions: checkHasAllPermissions,
    }),
    [user, permissions, isAuthenticated, checkHasPermission, checkHasAllPermissions]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOKS (Developer Experience)
// ============================================================================

/**
 * Access the full authentication context.
 *
 * @throws {Error} If used outside of an <AuthProvider>.
 * @returns {AuthContextType} The auth context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Convenience hook to check a single permission.
 * Optimized to avoid recalculations if parameters don't change.
 *
 * @param {string} permission - The permission string to check.
 * @returns {boolean} True if the user has the permission.
 *
 * @example
 * const canEdit = usePermission('user:edit');
 */
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useAuth();
  return useMemo(() => hasPermission(permission), [hasPermission, permission]);
};

/**
 * Convenience hook to check multiple permissions with logic strategies.
 *
 * @param {string[]} requiredPerms - List of permissions to check.
 * @param {'AND' | 'OR'} strategy - Logic to apply:
 * - 'AND': User must have ALL permissions (default).
 * - 'OR': User must have AT LEAST ONE permission.
 * @returns {boolean} True if the condition is met.
 *
 * @example
 * const canAccess = useMultiPermissions(['report:view', 'report:edit'], 'OR');
 */
export const useMultiPermissions = (
  requiredPerms: string[],
  strategy: 'AND' | 'OR' = 'AND'
): boolean => {
  const { hasPermission, checkAllPermissions } = useAuth();

  return useMemo(() => {
    if (requiredPerms.length === 0) return true;

    if (strategy === 'AND') {
      return checkAllPermissions(requiredPerms);
    }

    // Strategy: OR
    return requiredPerms.some((perm) => hasPermission(perm));
  }, [hasPermission, checkAllPermissions, requiredPerms, strategy]);
};