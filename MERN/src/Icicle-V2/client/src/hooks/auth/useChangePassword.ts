// client/src/hooks/auth/useChangePassword.ts
/**
 * @file client/src/hooks/auth/useChangePassword.ts
 * @description Hook to handle password change logic, server state sync, and navigation.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { useApi } from "@/hooks/generals/useApi";
import { authService } from "@/services/auth-client.service";
import { ChangePasswordPayload } from "@/types/auth.types";
import { siteConfig } from "@/config/site.config";
import { VALIDATION_MESSAGES } from "@/config/validation-messages.config";
import { PASSWORD_REGEX } from "@/utils/regex.utils";

interface UseChangePasswordReturn {
  handleChangePassword: (payload: ChangePasswordPayload & { confirmPassword: string }) => Promise<void>;
  isLoading: boolean;
}

export const useChangePassword = (): UseChangePasswordReturn => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { execute, loading } = useApi(authService.changePassword);

  const handleChangePassword = async (payload: ChangePasswordPayload & { confirmPassword: string }): Promise<void> => {
    if (!payload.username || !payload.currentPassword || !payload.newPassword) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin.",
        color: "danger",
        variant: "flat",
      });
      return;
    }

    if (payload.newPassword !== payload.confirmPassword) {
      addToast({
        title: "Lỗi xác nhận",
        description: VALIDATION_MESSAGES.PASSWORD_MISMATCH || "Mật khẩu xác nhận không khớp.",
        color: "danger",
        variant: "flat",
      });
      return;
    }

    if (!PASSWORD_REGEX.test(payload.newPassword)) {
      addToast({
        title: "Mật khẩu yếu",
        description: VALIDATION_MESSAGES.FORMAT || "Mật khẩu không đúng định dạng.",
        color: "danger",
        variant: "flat",
      });
      return;
    }

    try {
      // 2. Execute API
      // Destructure confirmPassword out, as API typically doesn't need it
      const {...apiPayload } = payload;
      
      // The API should set the HttpOnly cookie upon success.
      const res = await execute(apiPayload, { showToast: false });
      
      if (!res) return;

      // 3. UI Feedback
      addToast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công. Bạn đang được chuyển hướng...",
        color: "success",
        variant: "flat",
      });

      // 4. Sync Server State & Navigate
      // Using startTransition to ensure the router refresh (server data re-fetch) 
      // completes before we push the new route.
      startTransition(() => {
        router.refresh(); // Invalidate Client Cache & Re-fetch Server Components (e.g. check 'mustChangePassword' flag)
        router.push(siteConfig.links.dashboard.path); // Navigate to Dashboard
      });

    } catch (error) {
      console.warn("[useChangePassword] Process failed:", (error as Error).message);
      // useApi handles the error toast display automatically
    }
  };

  return {
    handleChangePassword,
    // Combine API loading state with the transition pending state
    // to prevent user interaction while redirecting.
    isLoading: loading || isPending,
  };
};