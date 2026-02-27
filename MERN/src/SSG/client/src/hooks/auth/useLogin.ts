// client/src/hooks/auth/useLogin.ts
/**
 * @file client/src/hooks/auth/useLogin.ts
 * @description Hook to handle user authentication, server state synchronization, and conditional navigation including callbackUrl support.
 */

"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/react";
import { useApi } from "@/hooks/generals/useApi";
import { authService } from "@/services/auth-client.service";
import { LoginPayload } from "@/types/auth.types";
import { siteConfig } from "@/config/site.config";

interface UseLoginReturn {
  handleLogin: (payload: LoginPayload) => Promise<void>;
  isLoading: boolean;
}

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { execute, loading } = useApi(authService.login);

  const handleLogin = async (payload: LoginPayload): Promise<void> => {
    // 1. Basic Validation
    if (!payload.username || !payload.password) {
      addToast({
        title: "Missing Information",
        description: "Please provide both username and password.",
        color: "danger",
        variant: "flat",
      });
      return;
    }

    try {
      // 2. Execute API
      // The API should set the HttpOnly cookie upon success.
      const res = await execute(payload, { showToast: false });

      // Safety check in case useApi doesn't throw but returns null/undefined on error
      if (!res?.data?.user) return;

      const { user } = res.data;

      // 3. Determine Scenario & Logic Priority
      // Priority 1: Force Password Change (Security requirement overrides user intent)
      // Priority 2: Callback URL (User intent)
      // Priority 3: Default Dashboard

      const isForceChange = user.mustChangePassword === true;
      const callbackUrl = searchParams.get("callbackUrl");

      let targetPath: string;

      if (isForceChange) {
        // Force redirect to change password page regardless of callback
        targetPath = `${siteConfig.links.changeDefaultPassword.path}?username=${encodeURIComponent(user.username)}`;
      } else if (callbackUrl) {
        // Validate callbackUrl to ensure it's a relative path (starts with /) to prevent Open Redirect attacks
        // If it is absolute (starts with http), we might want to ignore it or validate the domain.
        // For now, we assume simple usage:
        targetPath = callbackUrl;
      } else {
        // Default fallback
        targetPath = siteConfig.links.dashboard.path;
      }

      // 4. Config UI Feedback
      if (isForceChange) {
        addToast({
          title: "Action Required",
          description: "Please change your password to secure your account before using it.",
          color: "warning",
          variant: "flat",
        });
      } else {
        addToast({
          title: "Login Successful",
          description: `Welcome back, ${user.fullName || user.username}!`,
          color: "success",
          variant: "flat",
        });
      }

      // 5. Sync Server State & Navigate
      // Wrapping both actions in startTransition ensures high-priority UI updates 
      // are not blocked and helps coordinate the router cache invalidation.
      // It fetch 2 times but it's acceptable/
      startTransition(() => {
        router.refresh(); // Invalidate Client Cache & Re-fetch Server Components (RootLayout)
        router.push(targetPath); // Navigate to the determined path
      });

    } catch (error) {
      console.warn("[useLogin] Login process failed:", error);
      // Note: useApi usually handles generic error toasts. 
      // Add manual handling here only if needed.
    }
  };

  return {
    handleLogin,
    // Combine API loading state with the transition pending state
    // to prevent user interaction while redirecting.
    isLoading: loading || isPending,
  };
};
