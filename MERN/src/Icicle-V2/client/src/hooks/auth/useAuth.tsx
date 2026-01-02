// client/src/hooks/auth/useAuth.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, AuthResponseData } from '@/types/api';
import { authService } from '@/services/auth.service';
import { useApi } from '@/hooks/generals/useApi';

/* -------------------------------------------------------------------------- */
/* TYPES                                   */
/* -------------------------------------------------------------------------- */

interface AuthState {
  user: UserProfile | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  /**
   * Manually updates the auth state (used after successful Login/Register).
   * Automatically handles redirection based on `mustChangePassword`.
   */
  loginOnClient: (data: AuthResponseData) => void;
  
  /**
   * Logs out the user via API and clears client state.
   */
  logout: () => Promise<void>;
  
  /**
   * Checks if the current user has a specific permission.
   */
  checkPermission: (requiredPermission?: string) => boolean;
  
  /**
   * Re-fetches the user profile from the server.
   */
  refreshProfile: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* CONTEXT                                  */
/* -------------------------------------------------------------------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // --- STATE ---
  const [state, setState] = useState<AuthState>({
    user: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: true, // Default to true to prevent UI flash
  });

  // --- API HOOKS ---
  // We use your custom useApi hook here
  const { execute: executeGetMe } = useApi(authService.getMe);
  const { execute: executeLogout } = useApi(authService.logout);

  /* -------------------------------------------------------------------------- */
  /* LOGIC                                    */
  /* -------------------------------------------------------------------------- */

  /**
   * Core function to fetch user identity.
   * Runs silently (no toast) on mount.
   */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await executeGetMe({ showToast: false });
      
      if (res && res.data) {
        const { user, permissions } = res.data;
        setState({
          user,
          permissions: permissions || [],
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      // If 401/403 or network error, assume not authenticated
      setState((prev) => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      }));
    }
  }, [executeGetMe]);

  // Initial Load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Helper to update state after Login Form success.
   */
  const loginOnClient = useCallback((data: AuthResponseData) => {
    setState({
      user: data.user,
      permissions: data.permissions || [],
      isAuthenticated: true,
      isLoading: false,
    });

    // Smart Redirection Logic
    if (data.user.mustChangePassword) {
      router.replace('/login/change-default-password');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  /**
   * Full Logout Logic
   */
  const logout = useCallback(async () => {
    try {
      await executeLogout({ 
        showToast: true, 
        msg: 'Bạn đã đăng xuất thành công.',
        title: 'Đăng xuất'
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear state and redirect
      setState({ user: null, permissions: [], isAuthenticated: false, isLoading: false });
      router.push('/login');
    }
  }, [executeLogout, router]);

  /**
   * RBAC Permission Check
   */
  const checkPermission = useCallback((requiredPermission?: string) => {
    if (!state.user) return false;
    
    // Super Admin Bypass
    if (state.user.roles.includes('super_admin')) return true;

    // No permission required -> Access granted
    if (!requiredPermission) return true;

    // Check capability
    return state.permissions.includes(requiredPermission);
  }, [state.user, state.permissions]);

  /* -------------------------------------------------------------------------- */
  /* PROVIDER                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        loginOnClient, 
        logout, 
        checkPermission, 
        refreshProfile: fetchProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* HOOK                                    */
/* -------------------------------------------------------------------------- */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};