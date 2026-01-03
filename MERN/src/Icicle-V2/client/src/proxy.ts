// client/src/proxy.ts
/**
 * @file src/proxy.ts
 * @description
 * Next.js 16 Proxy (Middleware).
 * Handles request interception, authentication validation, route protection,
 * and enforces the "Force Password Change" policy using Edge Runtime compatible logic.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES_CONFIG, siteConfig } from '@/config/site.config';
import { RouteConfig } from '@/types/auth.types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Defines the shape of the decoded JWT Payload.
 * We only define the fields we strictly need to access in the Middleware.
 */
interface JWTPayload {
  mustChangePassword?: boolean | string;
  // We use 'unknown' for other potential fields to strictly avoid 'any'
  // while acknowledging the object might have more data.
  [key: string]: unknown;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** The name of the cookie containing the JWT access token. */
const COOKIE_NAME = 'accessToken';

/** Centralized path definitions for redirection logic. */
const PATHS = {
  LOGIN: siteConfig.links.login.path,
  DASHBOARD: siteConfig.links.dashboard.path,
  CHANGE_PASS: siteConfig.links.changeDefaultPassword.path,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Matches the current request path against the sorted route configuration.
 *
 * @param {string} pathname - The current request URL path.
 * @returns {RouteConfig | undefined} The matching route configuration or undefined.
 */
function getRouteConfig(pathname: string): RouteConfig | undefined {
  // ROUTES_CONFIG is assumed to be sorted by path length (descending)
  return ROUTES_CONFIG.find((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

/**
 * Manually decodes a JWT payload in the Edge Runtime environment.
 * Note: This function only reads the payload and does NOT verify the signature.
 *
 * @param {string} token - The JWT string.
 * @returns {JWTPayload | null} The typed JSON payload or null if invalid.
 */
function parseJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // Safe Type Assertion: We assert the parsed JSON matches our Interface
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    // In Edge runtime, console.error might be limited, but useful for local debug
    console.error('[Proxy] Failed to parse JWT:', error);
    return null;
  }
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --------------------------------------------------------------------------
  // 1. Authentication & Token Parsing
  // --------------------------------------------------------------------------
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let mustChangePassword = false;

  if (token) {
    isAuthenticated = true;
    const payload = parseJwt(token);

    if (payload) {
      // Handle both boolean true and string "true" from backend
      const rawFlag = payload.mustChangePassword;
      mustChangePassword = rawFlag === true || rawFlag === 'true';
    }
  }

  // --------------------------------------------------------------------------
  // 2. Route Configuration Matching
  // --------------------------------------------------------------------------
  const routeConfig = getRouteConfig(pathname);

  // Case A: Unconfigured Routes (Assets, API, 404s) -> Pass through
  if (!routeConfig) {
    return NextResponse.next();
  }

  // Case B: Public Routes -> Always Allow
  if (routeConfig.type === 'PUBLIC') {
    return NextResponse.next();
  }

  // --------------------------------------------------------------------------
  // 3. Guest Only Routes (e.g., Login Page)
  // --------------------------------------------------------------------------
  if (routeConfig.type === 'GUEST_ONLY') {
    if (isAuthenticated) {
      // EXCEPTION: If the user is forced to change password but wants to access
      // the Login page (to logout or switch accounts), we ALLOW it.
      if (mustChangePassword) {
        return NextResponse.next();
      }

      // Standard behavior: Authenticated users are redirected to Dashboard
      return NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
    }
    // Not authenticated -> Allow access to Login
    return NextResponse.next();
  }

  // --------------------------------------------------------------------------
  // 4. Private Routes (Dashboard, Admin, Business Logic)
  // --------------------------------------------------------------------------
  if (routeConfig.type === 'PRIVATE') {
    // 4.1. Not Authenticated -> Redirect to Login
    if (!isAuthenticated) {
      const loginUrl = new URL(PATHS.LOGIN, request.url);
      // Append callbackUrl so the Login page knows where to return
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4.2. Authenticated but Forced to Change Password
    if (mustChangePassword) {
      // If already on the Change Password page -> Allow
      if (pathname === PATHS.CHANGE_PASS) {
        return NextResponse.next();
      }

      // If trying to access any other private route -> Redirect to Change Password
      return NextResponse.redirect(new URL(PATHS.CHANGE_PASS, request.url));
    }

    // 4.3. Authenticated and Standard Status (No force change)
    // Prevent access to Change Password page if not required
    if (pathname === PATHS.CHANGE_PASS && !mustChangePassword) {
      return NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
    }

    // Allow access to the requested private route
    return NextResponse.next();
  }

  // Fallback -> Allow
  return NextResponse.next();
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};