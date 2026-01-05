// client/src/hooks/auth/useLogin.ts
/**
 * @file client/src/hooks/auth/useLogin.ts
 * @description Hook to handle user authentication, server state synchronization, and conditional navigation.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { useApi } from "@/hooks/generals/useApi";
import { authService } from "@/services/auth.service";
import { LoginPayload } from "@/types/auth.types";
import { siteConfig } from "@/config/site.config";

interface UseLoginReturn {
  handleLogin: (payload: LoginPayload) => Promise<void>;
  isLoading: boolean;
}

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { execute, loading } = useApi(authService.login);

  const handleLogin = async (payload: LoginPayload): Promise<void> => {
    // 1. Basic Validation
    if (!payload.username || !payload.password) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.",
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

      // 3. Determine Scenario (Standard vs Forced Change)
      // Normalize flag to boolean to handle both true (boolean) and "true" (string)
      const isForceChange = user.mustChangePassword === true;

      // 4. Config UI Feedback & Destination
      const targetPath = isForceChange
        ? siteConfig.links.changeDefaultPassword.path+`?username=${encodeURIComponent(user.username)}`
        : siteConfig.links.dashboard.path;

      if (isForceChange) {
        addToast({
          title: "Hành động cần thiết",
          description: "Vui lòng đổi mật khẩu để bảo vệ tài khoản trước khi sử dụng.",
          color: "warning",
          variant: "flat",
        });
      } else {
        addToast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${user.fullName || user.username} quay trở lại!`,
          color: "success",
          variant: "flat",
        });
      }

      // 5. Sync Server State & Navigate
      // Wrapping both actions in startTransition ensures high-priority UI updates 
      // are not blocked and helps coordinate the router cache invalidation.
      startTransition(() => {
        router.refresh(); // Invalidate Client Cache & Re-fetch Server Components (RootLayout)
        router.push(targetPath); // Navigate to the determined path
      });

    } catch (error) {
      console.error("[useLogin] Login process failed:", error);
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