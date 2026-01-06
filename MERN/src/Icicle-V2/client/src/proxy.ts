// client/src/proxy.ts
/**
 * @file src/proxy.ts
 * @description
 * Next.js Middleware (Edge Runtime).
 *
 * Responsibilities:
 * 1. Intercepts all requests matching the config matcher.
 * 2. Manages Token Lifecycle:
 * - Checks for Access Token.
 * - Attempts Server-Side Refresh if Access Token is missing but Refresh Token exists.
 * 3. Decodes JWT to extract User State (isAuthenticated, mustChangePassword).
 * 4. Enforces Route Protection (Public, Guest-Only, Private).
 * 5. Syncs new tokens to the browser via Cookies.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES_CONFIG, siteConfig } from '@/config/site.config';
import { RouteConfig } from '@/types/auth.types';
import { env } from '@/config/env.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Structure of the JWT Payload extracted from the Access Token.
 */
interface JWTPayload {
  /** User ID or Subject */
  sub?: string;
  /** Custom claim for password change policy */
  mustChangePassword?: boolean | string;
  /** Expiration timestamp (Unix) */
  exp?: number;
  /** Allow flexibility for other claims */
  [key: string]: unknown;
}

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
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Matches the current pathname against the route configuration.
 * @param {string} pathname - The current request path.
 * @returns {RouteConfig | undefined} The matching configuration or undefined.
 */
function getRouteConfig(pathname: string): RouteConfig | undefined {
  return ROUTES_CONFIG.find((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

/**
 * Safely parses a JWT payload in an Edge environment without external libraries.
 * Handles URL-safe Base64 decoding and UTF-8 characters properly.
 * * @param {string} token - The JWT string.
 * @returns {JWTPayload | null} The decoded payload or null if invalid.
 */
function parseJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decoding compliant with Edge Runtime (Node.js Buffer might not be available)
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Calls the Backend API to refresh the access token using the Refresh Token cookie.
 * This runs on the Server (Edge) before the request reaches the Client.
 * * @param {NextRequest} request - The incoming request containing cookies.
 * @returns {Promise<string | null>} The new access token or null if failed.
 */
async function refreshAccessToken(request: NextRequest): Promise<string | null> {
  const refreshToken = request.cookies.get(COOKIES.REFRESH_TOKEN)?.value;
  
  if (!refreshToken) return null;

  try {
    // Forward the Cookie header to the backend so it can read the httpOnly refreshToken
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (request.headers.get('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    const res = await fetch(`${env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      return null;
    }

    const responseData = await res.json();
    
    // Flexible handling depending on your backend response structure
    // Adjust 'data.accessToken' or 'accessToken' based on your ApiResponse wrapper
    return (responseData.data?.accessToken as string) || (responseData.accessToken as string) || null;

  } catch (error) {
    console.error('[Middleware] Token refresh failed:', error);
    return null;
  }
}

// ============================================================================
// MAIN MIDDLEWARE LOGIC
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next();
  
  // --------------------------------------------------------------------------
  // 1. Token Management (Check & Refresh)
  // --------------------------------------------------------------------------
  
  let accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  let hasRefreshed = false;

  // If Access Token is missing but Refresh Token exists, attempt auto-refresh
  if (!accessToken && request.cookies.has(COOKIES.REFRESH_TOKEN)) {
    const newAccessToken = await refreshAccessToken(request);
    if (newAccessToken) {
      accessToken = newAccessToken;
      hasRefreshed = true;
    }
  }

  // --------------------------------------------------------------------------
  // 2. State Extraction
  // --------------------------------------------------------------------------

  let isAuthenticated = false;
  let mustChangePassword = false;

  if (accessToken) {
    const payload = parseJwt(accessToken);
    if (payload) {
      // Optional: Check 'exp' here if you want to save a backend call on expired tokens
      // const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : true;
      
      isAuthenticated = true;
      const rawFlag = payload.mustChangePassword;
      mustChangePassword = rawFlag === true || rawFlag === 'true';
    }
  }

  // --------------------------------------------------------------------------
  // 3. Routing Authorization
  // --------------------------------------------------------------------------

  const routeConfig = getRouteConfig(pathname);
  const isPublicRoute = !routeConfig || routeConfig.type === 'PUBLIC';
  const isGuestOnlyRoute = routeConfig?.type === 'GUEST_ONLY';

  // SCENARIO 1: Guest Only Routes (e.g., Login)
  if (isGuestOnlyRoute) {
    if (isAuthenticated) {
      // If user is logged in, redirect to Dashboard
      // EXCEPT: If they are forced to change password, allow/redirect to that page
      if (mustChangePassword) {
         // Logic choice: Redirect to change pass or stay? 
         // Usually we redirect to change-password to force the flow.
         response = NextResponse.redirect(new URL(PATHS.CHANGE_PASS, request.url));
      } else {
         response = NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
      }
    }
    // If not authenticated, allow access to Login page (response is already .next())
  }
  
  // SCENARIO 2: Private Routes (Dashboard, Profile, etc.)
  else if (!isPublicRoute) {
    
    // 2a. Not Authenticated -> Redirect to Login
    if (!isAuthenticated) {
      const loginUrl = new URL(PATHS.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      response = NextResponse.redirect(loginUrl);
    } 
    
    // 2b. Authenticated but Password Change Required
    else if (mustChangePassword) {
      if (pathname !== PATHS.CHANGE_PASS) {
        response = NextResponse.redirect(new URL(PATHS.CHANGE_PASS, request.url));
      }
      // If currently on CHANGE_PASS page, allow access (.next())
    }
    
    // 2c. Authenticated + No Password Change Needed + Trying to access Change Password Page
    else if (pathname === PATHS.CHANGE_PASS && !mustChangePassword) {
      response = NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
    }
    
    // 2d. All good -> Allow access (.next())
  }

  // --------------------------------------------------------------------------
  // 4. Finalization: Cookie Sync
  // --------------------------------------------------------------------------
  
  // If we performed a server-side refresh, we MUST set the new cookie on the outgoing response.
  // This ensures the browser receives the new token and subsequent client-side requests use it.
  if (hasRefreshed && accessToken) {
    response.cookies.set({
      name: COOKIES.ACCESS_TOKEN,
      value: accessToken,
      httpOnly: false, // Set 'true' if Client Components NEVER need to read this cookie
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60, // 15 minutes (Sync with Backend JWT expiry)
    });
  }

  return response;
}

export const config = {
  // Matcher ignoring static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};