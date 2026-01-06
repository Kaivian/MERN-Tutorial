// src/utils/permission-matcher.utils.ts

/**
 * @file src/utils/permission-matcher.utils.ts
 * @description Utility functions for Role-Based Access Control (RBAC) permission matching.
 * Implements logic for exact matches, global wildcards, and scoped wildcards.
 */

/**
 * Checks if a specific required permission matches any of the user's held permissions.
 * Supports Wildcard patterns.
 *
 * @param {string[]} userPerms - The list of permissions held by the user.
 * @param {string} requiredPerm - The specific permission string to validate.
 * @returns {boolean} True if the user has access, False otherwise.
 *
 * @example
 * // 1. Global Wildcard
 * matchPermission(['*'], 'users:delete') // => true
 *
 * // 2. Scoped Wildcard
 * matchPermission(['users:*'], 'users:view') // => true
 * matchPermission(['users:*'], 'orders:view') // => false
 *
 * // 3. Exact Match
 * matchPermission(['users:create'], 'users:create') // => true
 */
export function matchPermission(userPerms: string[], requiredPerm: string): boolean {
  if (!userPerms || userPerms.length === 0) return false;

  return userPerms.some((heldPerm) => {
    // 1. Global Admin Wildcard: User has access to everything
    if (heldPerm === '*') return true;

    // 2. Exact Match: The string matches perfectly
    if (heldPerm === requiredPerm) return true;

    // 3. Scoped Wildcard Match (e.g., held="users:*", required="users:view")
    if (heldPerm.endsWith(':*')) {
      const prefix = heldPerm.slice(0, -2); // Remove ":*" to get the scope (e.g., "users")
      
      // Check if the required permission starts with the scope prefix followed by a colon.
      // This prevents "user:*" from incorrectly matching "usertest:view".
      return requiredPerm.startsWith(`${prefix}:`);
    }

    return false;
  });
}

/**
 * Validates that a user possesses ALL permissions in a required list (Logical AND).
 *
 * @param {string[]} userPerms - The list of permissions held by the user.
 * @param {readonly string[] | string[]} requiredPerms - The list of permissions required to access the resource.
 * @returns {boolean} True only if every required permission is satisfied.
 */
export function hasAllPermissions(userPerms: string[], requiredPerms: readonly string[] | string[]): boolean {
  if (!requiredPerms || requiredPerms.length === 0) return true;
  
  // Every single required permission must pass the matcher logic
  return requiredPerms.every((req) => matchPermission(userPerms, req));
}