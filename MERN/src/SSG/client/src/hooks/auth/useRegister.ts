// client/src/hooks/auth/useRegister.ts

/**
 * @file client/src/hooks/auth/useRegister.ts
 * @description Custom hook to manage the user registration workflow.
 * It handles API execution, client-side validation, UI feedback (toasts),
 * and automatic session synchronization (auto-login) upon success.
 */

"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/react";
import { useApi } from "@/hooks/generals/useApi";
import { authService } from "@/services/auth-client.service";
import { RegisterPayload } from "@/types/auth.types";
import { siteConfig } from "@/config/site.config";

/**
 * Interface representing the return value of the useRegister hook.
 */
interface UseRegisterReturn {
  /**
   * Function to trigger the registration process.
   * @param payload - The registration data (username, email, password, etc.).
   */
  handleRegister: (payload: RegisterPayload) => Promise<void>;

  /**
   * Indicates if the registration process is in progress.
   * Combines both API loading state and Next.js transition state.
   */
  isLoading: boolean;
}

/**
 * Custom hook for handling user registration logic.
 *
 * @returns {UseRegisterReturn} An object containing the registration handler and loading state.
 */
export const useRegister = (): UseRegisterReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Initialize API hook with the registration service
  const { execute, loading } = useApi(authService.register);

  const handleRegister = async (payload: RegisterPayload): Promise<void> => {
    // ------------------------------------------------------------------------
    // 1. Client-Side Validation Guard
    // ------------------------------------------------------------------------
    // While form libraries (e.g., React Hook Form) handle validation, 
    // this serves as a final fail-safe before the API call.
    if (!payload.username || !payload.email || !payload.password) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "danger",
        variant: "flat",
      });
      return;
    }

    if (payload.password !== payload.confirmPassword) {
      addToast({
        title: "Password Mismatch",
        description: "The confirmation password does not match.",
        color: "danger",
        variant: "flat",
      });
      return;
    }

    try {
      // ----------------------------------------------------------------------
      // 2. Execute Registration API
      // ----------------------------------------------------------------------
      // The server is expected to set HttpOnly cookies (accessToken, refreshToken)
      // immediately upon success, facilitating the "Auto-Login" pattern.
      const res = await execute(payload, { showToast: false });
      
      // Guard clause: Ensure the response contains valid user data
      if (!res?.data?.user) return;

      const { user } = res.data;

      // ----------------------------------------------------------------------
      // 3. Determine Navigation Strategy
      // ----------------------------------------------------------------------
      const callbackUrl = searchParams.get("callbackUrl");
      let targetPath: string;

      if (callbackUrl) {
        // Priority 1: User Intent (Redirect back to the originally requested page)
        targetPath = callbackUrl;
      } else {
        // Priority 2: Default Application Dashboard
        targetPath = siteConfig.links.dashboard.path;
      }

      // ----------------------------------------------------------------------
      // 4. UI Feedback
      // ----------------------------------------------------------------------
      addToast({
        title: "Registration Successful",
        description: `Welcome aboard, ${user.fullName || user.username}!`,
        color: "success",
        variant: "flat",
      });

      // ----------------------------------------------------------------------
      // 5. State Synchronization & Navigation
      // ----------------------------------------------------------------------
      // Wrapping navigation in startTransition ensures that the UI remains
      // responsive while Next.js re-validates server components (e.g., Layout headers).
      startTransition(() => {
        router.refresh(); // Invalidate client cache to reflect the new session
        router.push(targetPath); // Navigate to the target route
      });

    } catch (error) {
      // Log warning for debugging purposes.
      // Note: 'useApi' handles generic error toasts automatically.
      console.warn("[useRegister] Registration flow failed:", error);
    }
  };

  return {
    handleRegister,
    isLoading: loading || isPending,
  };
};