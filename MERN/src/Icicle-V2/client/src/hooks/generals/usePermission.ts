// src/hooks/use-permission.ts
'use client';

/**
 * @file src/hooks/use-permission.ts
 * @description Custom hook for managing RBAC (Role-Based Access Control) permissions client-side.
 * It implements a Singleton pattern with global caching to prevent redundant API calls
 * across multiple component instances.
 */

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { matchPermission } from '@/utils/permission-matcher.utils';
import type { AuthMeResponse } from '@/types/auth.types';

// ============================================================================
// GLOBAL CACHE (SINGLETON PATTERN)
// ============================================================================
// These variables exist outside the hook to persist data across component unmounts/remounts.

let cachedData: AuthMeResponse | null = null;
let fetchPromise: Promise<AuthMeResponse> | null = null;

/**
 * Hook to access user permissions and identity.
 *
 * @returns {Object} An object containing:
 * - `can(permission)`: Function to check if the user has a specific permission.
 * - `isLoading`: Boolean indicating if the user context is being fetched.
 * - `user`: The current user object (undefined if loading or not authenticated).
 * - `refreshPermissions`: Function to force a re-fetch of the user context.
 */
export function usePermission() {
  // 1. STATE INITIALIZATION
  // Initialize state directly from global cache (if available) to avoid
  // unnecessary loading states during initial render (immediate hydration).
  const [data, setData] = useState<AuthMeResponse | null>(cachedData);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedData);

  useEffect(() => {
    // 2. CACHE CHECK
    // If data exists in the global cache, the state is already initialized above.
    // No further action is required.
    if (cachedData) return;

    // 3. SINGLETON FETCH LOGIC
    // Ensure only one API request is in flight at a time, even if multiple
    // components use this hook simultaneously.
    if (!fetchPromise) {
      fetchPromise = authService.getMe()
        .then((res) => {
          cachedData = res;
          return res;
        })
        .catch((err) => {
          console.error('[UsePermission] Failed to fetch user context:', err);
          // Return valid structure or handle error appropriately
          return null as unknown as AuthMeResponse;
        });
    }

    let isMounted = true;

    // Subscribe to the pending promise
    fetchPromise.then((res) => {
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    });

    // Cleanup: prevent state updates on unmounted components
    return () => { isMounted = false; };
  }, []); // Empty dependency array ensures this runs once per mount

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Checks if the current user possesses the required permission.
   *
   * @param {string} requiredPerm - The permission string to check (e.g., 'users:read').
   * @returns {boolean} True if the user has permission, False otherwise.
   */
  const can = (requiredPerm: string): boolean => {
    // Fail safe: If loading, no data, or inactive user -> Deny access
    if (isLoading || !data) return false;
    if (data.user.status !== 'active') return false;

    return matchPermission(data.permissions, requiredPerm);
  };

  /**
   * Forcefully refreshes the user context from the server.
   * useful after a role change or permission update.
   */
  const refreshPermissions = () => {
    // 1. Clear global cache
    cachedData = null;
    fetchPromise = null;

    // 2. Reset local state to trigger loading UI
    setData(null);
    setIsLoading(true);

    // 3. Re-fetch immediately
    fetchPromise = authService.getMe()
      .then((res) => {
        cachedData = res;
        setData(res); // Update UI with fresh data
        setIsLoading(false);
        return res;
      })
      .catch((err) => {
        console.error('[UsePermission] Refresh failed:', err);
        setIsLoading(false);
        return null as unknown as AuthMeResponse;
      });
  };

  return { 
    can, 
    isLoading, 
    user: data?.user, 
    refreshPermissions 
  };
}