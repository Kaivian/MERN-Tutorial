import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES_CONFIG, siteConfig } from '@/config/site.config';
import { RouteConfig } from '@/types/auth.types';
import { ENV } from '@/config/env.config';

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

interface JWTPayload {
  sub?: string;
  mustChangePassword?: boolean | string;
  exp?: number;
  [key: string]: unknown;
}

function getRouteConfig(pathname: string): RouteConfig | undefined {
  return ROUTES_CONFIG.find((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

function parseJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

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
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let targetResponse = NextResponse.next();

  let accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  let hasRefreshed = false;

  if (!accessToken && request.cookies.has(COOKIES.REFRESH_TOKEN)) {
    const newAccessToken = await refreshAccessToken(request);
    if (newAccessToken) {
      accessToken = newAccessToken;
      hasRefreshed = true;

      request.cookies.set(COOKIES.ACCESS_TOKEN, accessToken);
    }
  }

  const routeConfig = getRouteConfig(pathname);
  const isPublicRoute = !routeConfig || routeConfig.type === 'PUBLIC';
  const isGuestOnlyRoute = routeConfig?.type === 'GUEST_ONLY';

  if (isGuestOnlyRoute) {
    if (accessToken) {
      const jwtPayload = parseJwt(accessToken);
      const mustChangePassword = jwtPayload?.mustChangePassword === true || jwtPayload?.mustChangePassword === 'true';

      if (!mustChangePassword) {
        targetResponse = NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
      }
    }
  } else if (!isPublicRoute) {
    if (!accessToken) {
      const loginUrl = new URL(PATHS.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      targetResponse = NextResponse.redirect(loginUrl);
    } else {
      const jwtPayload = parseJwt(accessToken);
      const mustChangePassword = jwtPayload?.mustChangePassword === true || jwtPayload?.mustChangePassword === 'true';

      if (mustChangePassword && pathname !== PATHS.CHANGE_PASS) {
        targetResponse = NextResponse.redirect(new URL(PATHS.CHANGE_PASS, request.url));
      } else if (!mustChangePassword && pathname === PATHS.CHANGE_PASS) {
        targetResponse = NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
      }
    }
  }

  if (hasRefreshed && accessToken) {
    targetResponse.cookies.set({
      name: COOKIES.ACCESS_TOKEN,
      value: accessToken,
      httpOnly: true,
      path: '/',
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60,
    });
  }

  return targetResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|403|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};