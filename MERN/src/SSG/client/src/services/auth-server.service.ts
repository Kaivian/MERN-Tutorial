/**
 * @file src/services/auth.server.ts
 * @description Server-side Authentication Service.
 * STRICTLY for use in Server Components (Layouts, Pages) or Server Actions.
 * DO NOT import this into Client Components.
 */

import { cookies } from 'next/headers';
import { ENV } from '@/config/env.config';
import type { AuthMeResponse } from '@/types/auth.types';

/**
 * Fetches the current user context directly from the API using server-side fetch.
 * Automatically handles cookie extraction from the incoming request.
 */
export async function getCurrentUser(): Promise<AuthMeResponse | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) return null;

  try {
    // Note: We must use the full URL including domain for server-side fetch
    const res = await fetch(`${ENV.API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure we always get fresh data on page load
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    return (json.data || json) as AuthMeResponse;
  } catch (error) {
    console.error('[AuthServer] getCurrentUser error:', error);
    return null;
  }
}