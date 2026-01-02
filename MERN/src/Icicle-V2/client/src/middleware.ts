// client/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';
import { ROUTES_CONFIG } from '@/config/routes.config';
import { RouteConfig } from '@/types/auth.types';

// --- Configuration Constants ---
const JWT_SECRET_KEY = process.env.JWT_ACCESS_SECRET;
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);

const PATHS = {
  LOGIN: '/login',
  CHANGE_PASSWORD: '/login/change-default-password',
  DASHBOARD: '/dashboard',
};

// Ensure Secret Key exists in Runtime
if (!JWT_SECRET_KEY) {
  throw new Error('[Middleware] JWT_ACCESS_SECRET is missing in Client Environment Variables.');
}

// Interface for Custom JWT Payload
interface UserJwtPayload extends JWTPayload {
  mustChangePassword?: boolean;
}

/**
 * Retrieves the specific configuration for a given pathname.
 * * Logic: Matches the path against configured routes. If multiple matches occur
 * (e.g., nested routes), it prioritizes the longest path for specificity.
 *
 * @param {string} pathname - The current request URL path.
 * @returns {RouteConfig | undefined} The matched route configuration or undefined.
 */
function getRouteConfig(pathname: string): RouteConfig | undefined {
  const matchedRoutes = ROUTES_CONFIG.filter((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );

  // Sort by length descending to ensure specific routes override general ones
  // e.g., "/login/change-password" (length 22) > "/login" (length 6)
  matchedRoutes.sort((a, b) => b.path.length - a.path.length);

  return matchedRoutes[0];
}

/**
 * Next.js Middleware for Authentication and Authorization.
 * Handles JWT verification, route protection, and mandatory password change enforcement.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeConfig = getRouteConfig(pathname);

  // 1. Bypass checks for Public routes or routes without config
  if (!routeConfig || routeConfig.type === 'PUBLIC') {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;

  // 2. Verify Token & Extract Payload
  let payload: UserJwtPayload | null = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload as UserJwtPayload;
    } catch {
      // If verification fails on a PRIVATE route, force logout immediately
      if (routeConfig.type === 'PRIVATE') {
        const response = NextResponse.redirect(new URL(PATHS.LOGIN, request.url));
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
      // If on GUEST_ONLY route, treat as unauthenticated (handled below)
    }
  }

  const isAuthenticated = !!payload;
  const mustChangePassword = payload?.mustChangePassword === true;

  // ==========================================
  // ACCESS CONTROL LOGIC
  // ==========================================

  // CASE 1: Unauthenticated User trying to access Private Route
  if (!isAuthenticated && routeConfig.type === 'PRIVATE') {
    return NextResponse.redirect(new URL(PATHS.LOGIN, request.url));
  }

  // CASE 2: Authenticated User
  if (isAuthenticated) {
    // 2.1: Handle "Guest Only" Routes (e.g., Login, Register)
    if (routeConfig.type === 'GUEST_ONLY') {
      // Exception: Allow access to Login page if user needs to change password 
      // (This might be needed for a specific logout flow or edge case)
      if (pathname === PATHS.LOGIN && mustChangePassword) {
        return NextResponse.next();
      }
      // Default: Redirect logged-in users to Dashboard
      return NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
    }

    // 2.2: Handle "Private" Routes
    if (routeConfig.type === 'PRIVATE') {
      // Sub-case: User MUST change password
      if (mustChangePassword) {
        // Enforce redirect to Change Password page if they aren't there
        if (pathname !== PATHS.CHANGE_PASSWORD) {
          return NextResponse.redirect(new URL(PATHS.CHANGE_PASSWORD, request.url));
        }
        return NextResponse.next();
      }

      // Sub-case: Standard User (Password is OK)
      // Prevent access to Change Password page if not required
      if (pathname === PATHS.CHANGE_PASSWORD) {
        return NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
      }
    }
  }

  // Allow request to proceed if no restrictions matched
  return NextResponse.next();
}

// Configure Matcher to exclude static files and APIs
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};