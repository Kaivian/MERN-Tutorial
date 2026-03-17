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
  REGISTER: siteConfig.links.register.path,
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

  // 1. Khởi tạo biến để chứa Response cuối cùng
  let finalResponse: NextResponse = NextResponse.next();

  // --------------------------------------------------------------------------
  // 1. Token Management
  // --------------------------------------------------------------------------
  let accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  let hasRefreshed = false;

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
  // 3. Authorization Logic & Redirect Handling
  // --------------------------------------------------------------------------

  // Hàm helper để gán redirect nhưng vẫn giữ lại finalResponse để xử lý cookie sau này
  const handleRedirect = (path: string) => {
    const url = new URL(path, request.url);
    if (path === PATHS.LOGIN) url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  };

  if (isGuestOnlyRoute) {
    if (accessToken) {
      const jwtPayload = parseJwt(accessToken);
      const mustChangePassword = jwtPayload?.mustChangePassword === true || jwtPayload?.mustChangePassword === 'true';

      if (!mustChangePassword) {
        finalResponse = handleRedirect(PATHS.DASHBOARD);
      }
      // Nếu mustChangePassword, giữ nguyên NextResponse.next() để vào trang login
    }
  }
  else if (!isPublicRoute) {
    if (!accessToken) {
      finalResponse = handleRedirect(PATHS.LOGIN);
    } else {
      const jwtPayload = parseJwt(accessToken);
      const mustChangePassword = jwtPayload?.mustChangePassword === true || jwtPayload?.mustChangePassword === 'true';

      if (mustChangePassword && pathname !== PATHS.CHANGE_PASS) {
        finalResponse = handleRedirect(PATHS.CHANGE_PASS);
      } else if (!mustChangePassword && pathname === PATHS.CHANGE_PASS) {
        finalResponse = handleRedirect(PATHS.DASHBOARD);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. Finalization: Cookie Sync (QUAN TRỌNG)
  // --------------------------------------------------------------------------
  // Gán cookie vào finalResponse (dù là .next() hay .redirect())
  if (hasRefreshed && accessToken) {
    finalResponse.cookies.set({
      name: COOKIES.ACCESS_TOKEN,
      value: accessToken,
      httpOnly: true,
      path: '/',
      sameSite: 'none', // Bắt buộc cho Vercel -> Render
      secure: true,      // Bắt buộc khi sameSite='none'
      maxAge: 15 * 60,
    });

    // Đồng bộ thêm cả refreshToken nếu cần (để tránh lệch pha)
    const refreshToken = request.cookies.get(COOKIES.REFRESH_TOKEN)?.value;
    if (refreshToken) {
      finalResponse.cookies.set({
        name: COOKIES.REFRESH_TOKEN,
        value: refreshToken,
        httpOnly: true,
        path: '/',
        sameSite: 'none',
        secure: true,
      });
    }
  }

  return finalResponse;
}

export const config = {
  matcher: [
    // Exclude API, static files, favicon, and images
    '/((?!api|_next/static|_next/image|favicon.ico|403|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
