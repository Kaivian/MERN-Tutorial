// client/src/components/guards/AuthGuard.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES_CONFIG } from '@/config/routes.config';
import { UserProfile } from '@/types/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, checkPermission, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Calculates the redirect path based on current auth state and route config.
   * This runs synchronously during render to prevent content flashing.
   */
  const getRedirectPath = (
    currentUser: UserProfile | null,
    isAuth: boolean,
    path: string
  ): string | null => {
    // 1. Find Route Config
    const activeRoute = ROUTES_CONFIG.find((route) => {
      if (route.path === path) return true;
      if (route.matcher && route.matcher.test(path)) return true;
      return false;
    });

    // Default to PRIVATE for security
    const routeType = activeRoute?.type || 'PRIVATE';
    const requiredPermission = activeRoute?.permission;

    // 2. Logic: GUEST_ONLY (Login, Register)
    if (routeType === 'GUEST_ONLY') {
      if (isAuth && currentUser) {
        return currentUser.mustChangePassword 
          ? '/login/change-default-password' 
          : '/dashboard';
      }
      return null;
    }

    // 3. Logic: PRIVATE Routes
    if (routeType === 'PRIVATE') {
      // 3.1 Unauthenticated
      if (!isAuth || !currentUser) {
        return `/login?callbackUrl=${encodeURIComponent(path)}`;
      }

      // 3.2 Force Change Password Flow
      const isChangePassPage = path === '/login/change-default-password';
      
      if (currentUser.mustChangePassword) {
        if (!isChangePassPage) return '/login/change-default-password';
      } else {
        if (isChangePassPage) return '/dashboard';
      }

      // 3.3 RBAC (Permissions)
      if (requiredPermission && !checkPermission(requiredPermission)) {
        return '/403';
      }
    }

    return null; // Access Granted
  };

  // Determine redirect path immediately
  const redirectPath = !isLoading ? getRedirectPath(user, isAuthenticated, pathname) : null;

  // Perform the redirect as a side effect
  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [redirectPath, router]);

  // --- RENDER ---

  // Show Loading while redirecting (Prevents flash of unauthorized content)
  if (redirectPath) {
    return <LoadingScreen text="Đang chuyển hướng..." />;
  }

  // 3. Render content
  return <>{children}</>;
}

/**
 * Internal Loading Component
 */
function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">{text}</p>
      </div>
    </div>
  );
}