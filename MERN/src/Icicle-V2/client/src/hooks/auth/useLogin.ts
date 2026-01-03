// client/src/hooks/useLogin.ts
"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/generals/useApi";
import { authService } from "@/services/auth.service";
import { LoginPayload } from "@/types/auth.types";

/**
 * Interface for the return value of the useLogin hook.
 */
interface UseLoginReturn {
  /**
   * Function to execute the login sequence.
   * Handles multi-scenario toast feedback and conditional redirection.
   * @param {LoginPayload} payload - User credentials.
   */
  handleLogin: (payload: LoginPayload) => Promise<void>;

  /**
   * Loading state for the login request.
   */
  isLoading: boolean;
}

/**
 * Custom Hook: useLogin
 * ---------------------
 * Orchestrates the authentication process, managing user redirection 
 * and specific toast feedback for both standard login and forced password change.
 *
 * @returns {UseLoginReturn} The login handler and loading state.
 */
export const useLogin = (): UseLoginReturn => {
  const router = useRouter();

  // Initialize the API handler with authService.login
  const { execute, loading } = useApi(authService.login);

  /**
   * Handles the login form submission.
   * Logic splits based on the 'mustChangePassword' flag or 'requireAction' field from the server.
   * @param {LoginPayload} payload - Credentials provided by the user.
   */
  const handleLogin = async (payload: LoginPayload): Promise<void> => {
    if (!payload.username || !payload.password) {
      return;
    }

    try {
      /**
       * 1. PRE-DETERMINE THE FLOW
       * We first check the response without showing a toast immediately if we want
       * absolute precision, but since 'execute' usually triggers the toast based on 
       * the success of the call, we handle the two scenarios here.
       */
      
      const res = await execute(payload, { showToast: false });

      const { user } = res.data;

      // Check if the server requires a password change
      const isPasswordChangeRequired = user.mustChangePassword;

      if (isPasswordChangeRequired) {
        /**
         * SCENARIO A: Forced Password Change
         * Trigger a custom warning toast manually through the API wrapper or global toast system.
         */
        await execute(payload, {
          showToast: true,
          title: "Hành động cần thiết",
          msg: "Vui lòng đổi mật khẩu để bảo vệ tài khoản của bạn trước khi tiếp tục.",
          variant: "flat",
          color: "warning", // Using warning color for password change requirement
        });

        const targetUrl = `/login/change-default-password?username=${encodeURIComponent(user.username)}`;
        router.push(targetUrl);
      } else {
        /**
         * SCENARIO B: Standard Success Access
         * Trigger the standard success toast.
         */
        await execute(payload, {
          showToast: true,
          title: "Đăng nhập thành công",
          msg: `Chào mừng ${user.fullName || user.username} quay trở lại hệ thống!`,
          variant: "flat",
          color: "success",
        });

        router.push("/dashboard");
      }

    } catch (error) {
      /**
       * Error Handling
       * Errors are typically caught and displayed as toasts by the 'useApi' internal logic.
       */
      console.debug("[Auth Flow] Login aborted or failed.", error);
    }
  };

  return {
    handleLogin,
    isLoading: loading,
  };
};