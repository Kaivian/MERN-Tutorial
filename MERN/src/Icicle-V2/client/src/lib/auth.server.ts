// src/lib/auth.server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { env } from '@/config/env.config';
import { hasAllPermissions } from '@/utils/permission-matcher.utils';
import type { AuthMeResponse } from '@/types/auth.types';

/**
 * @file src/lib/auth.server.ts
 * @description Server-side authentication utilities.
 * Handles fetching user context and verifying permissions within Server Components and Server Actions.
 * strictly ensures this code never runs on the client via 'server-only'.
 */

/**
 * Retrieves the authenticated user's context server-side by calling the `/auth/me` endpoint.
 * It automatically extracts the `accessToken` from the request cookies.
 *
 * @returns {Promise<AuthMeResponse | null>} The user context object (user & permissions) or null if unauthenticated/error.
 */
export async function getServerUserContext(): Promise<AuthMeResponse | null> {
  // Note: In Next.js 15+, `cookies()` returns a Promise and must be awaited.
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${env.API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Ensure fresh data is fetched on every server request
      cache: 'no-store', 
    });

    if (!res.ok) return null;

    // Define the expected response structure from the backend
    // Assumes backend returns: { status: "success", data: { user:..., permissions:... } }
    type BackendResponse = {
      status: string;
      data: AuthMeResponse;
    };

    const json = (await res.json()) as BackendResponse;
    
    // Return only the AuthMeResponse data (user info + permissions)
    return json.data;
    
  } catch (error) {
    console.error('[ServerAuth] Error fetching user context:', error);
    return null;
  }
}

/**
 * Verifies if the current user possesses the required permissions server-side.
 * Suitable for use in Layouts, Pages, or Server Actions to gate content.
 *
 * @param {string | string[]} requiredPerms - A single permission string or an array of required permission strings.
 * @returns {Promise<boolean>} Resolves to `true` if the user is active and has all permissions, otherwise `false`.
 */
export async function checkPermissionServer(requiredPerms: string | string[]): Promise<boolean> {
  const userContext = await getServerUserContext();

  // Validation: Check if context exists and user status is active
  if (!userContext || !userContext.user) return false;
  if (userContext.user.status !== 'active') return false;

  const permsToCheck = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];
  
  // Verify using the utility matcher
  return hasAllPermissions(userContext.permissions, permsToCheck);
}