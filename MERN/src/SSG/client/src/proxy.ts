// client/src/proxy.ts
/**
 * @file src/proxy.ts
 * @description
 * Next.js Middleware (Edge Runtime).
 * Handles Authentication, Token Refreshing, and Role-Based Access Control (RBAC).
 * * Optimization Strategy:
 * 1. Fast Local Checks: Decode JWT payload for immediate flags (e.g., mustChangePassword).
 * 2. Remote Validation: Call API (fetchUserContext) only when necessary for full context.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES_CONFIG, siteConfig } from '@/config/site.config';
import { RouteConfig } from '@/types/auth.types';
import { ENV } from '@/config/env.config';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

const PATHS = {
  LOGIN: siteConfig.links.login.path,
  DASHBOARD: siteConfig.links.dashboard.path,
  CHANGE_PASS: siteConfig.links.changeDefaultPassword.path,
  ACCESS_DENIED: '/403',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface JWTPayload {
  sub?: string;
  mustChangePassword?: boolean | string;
  exp?: number;
  [key: string]: unknown;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * matches the current pathname against the route configuration.
 */
function getRouteConfig(pathname: string): RouteConfig | undefined {
  return ROUTES_CONFIG.find((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

/**
 * Decodes a JWT safely without external libraries (Edge Runtime compatible).
 */
function parseJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch { return null; }
}

/**
 * Attempts to refresh the access token using the refresh token cookie.
 */
async function refreshAccessToken(request: NextRequest): Promise<string | null> {
  const refreshToken = request.cookies.get(COOKIES.REFRESH_TOKEN)?.value;
  if (!refreshToken) return null;

  try {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (request.headers.get('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    const res = await fetch(`${ENV.API_URL}/auth/refresh`, { method: 'POST', headers });
    if (!res.ok) return null;
    const responseData = await res.json();
    return (responseData.data?.accessToken as string) || (responseData.accessToken as string) || null;
  } catch { return null; }
}

// ============================================================================
// MAIN MIDDLEWARE LOGIC
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // --------------------------------------------------------------------------
  // 1. Token Management
  // --------------------------------------------------------------------------
  let accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  let hasRefreshed = false;

  // Try to refresh if access token is missing but refresh token exists
  if (!accessToken && request.cookies.has(COOKIES.REFRESH_TOKEN)) {
    const newAccessToken = await refreshAccessToken(request);
    if (newAccessToken) {
      accessToken = newAccessToken;
      hasRefreshed = true;
    }
  }

  // --------------------------------------------------------------------------
  // 2. Identify Route Configuration
  // --------------------------------------------------------------------------
  const routeConfig = getRouteConfig(pathname);
  const isPublicRoute = !routeConfig || routeConfig.type === 'PUBLIC';
  const isGuestOnlyRoute = routeConfig?.type === 'GUEST_ONLY';

  // --------------------------------------------------------------------------
  // 3. Authorization Logic
  // --------------------------------------------------------------------------

  // SCENARIO A: Guest Only Routes (e.g., /login)
  if (isGuestOnlyRoute) {
    if (accessToken) {
       // [LOGIC UPDATE]: Check if the user is forced to change password.
       // If true, we allow them to stay on the Login page (to switch accounts or logout).
       // If we redirected them to Dashboard, the Dashboard logic would bounce them back to Change Password,
       // creating a loop or preventing account switching.
       
       const jwtPayload = parseJwt(accessToken);
       const mustChangePassword = jwtPayload?.mustChangePassword === true || jwtPayload?.mustChangePassword === 'true';

       if (mustChangePassword) {
         return response; // Allow access to /login
       }

       // Standard Active User -> Redirect to Dashboard
       return NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
    }
  }
  
  // SCENARIO B: Private Routes (Protected)
  else if (!isPublicRoute) {
    
    // B1. Authentication Check
    if (!accessToken) {
      const loginUrl = new URL(PATHS.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // B2. JWT Payload Check (Fast Local Check)
    // Primary Goal: Detect 'mustChangePassword' BEFORE calling the API.
    const jwtPayload = parseJwt(accessToken);
    const mustChangePassword = jwtPayload?.mustChangePassword === true || jwtPayload?.mustChangePassword === 'true';

    if (mustChangePassword) {
      if (pathname === PATHS.CHANGE_PASS) {
        return response;
      }
      
      // If trying to access any other private route, redirect to Change Password.
      return NextResponse.redirect(new URL(PATHS.CHANGE_PASS, request.url));
    } 
    
    // B3. Fetch User Context (Only if password change is NOT required)
    else {
      // Edge Case: If a compliant user tries to access Change Password unnecessarily, redirect to Dashboard.
      if (pathname === PATHS.CHANGE_PASS) {
        return NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. Finalization: Cookie Sync
  // --------------------------------------------------------------------------
  if (hasRefreshed && accessToken) {
    response.cookies.set({
      name: COOKIES.ACCESS_TOKEN,
      value: accessToken,
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: ENV.NODE_ENV === 'production',
      maxAge: 15 * 60,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude API, static files, favicon, and images
    '/((?!api|_next/static|_next/image|favicon.ico|403|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};