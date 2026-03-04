// client/src/hooks/useLogout.ts
"use client";

import { useCallback, useRef, useState } from "react";
import { authService } from "@/services/auth-client.service";

interface UseLogoutOptions {
  redirectTo?: string;
}

export const useLogout = (options?: UseLogoutOptions) => {
  const onceRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(async () => {
    if (onceRef.current || isLoading) return;

    onceRef.current = true;
    setIsLoading(true);

    try {
      await authService.logout();
      window.location.href = options?.redirectTo || "/login";
    } finally {
      setIsLoading(false);
      onceRef.current = false;
    }
  }, [isLoading, options?.redirectTo]);

  return {
    logout,
    isLoading,
  };
};
