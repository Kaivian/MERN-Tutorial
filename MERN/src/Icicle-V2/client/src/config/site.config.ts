// client/src/config/site.config.ts
/**
 * @file site.config.ts
 * @description Defines the site structure, navigation links, and permission requirements.
 * This file serves as the primary configuration source for both UI Navigation and Middleware Routing.
 */

import { ENV } from "@/config/env.config";
import { RouteConfig } from '@/types/auth.types';

// --- Type Definitions ---

/**
 * Represents a single navigation entry in the application.
 */
export type RouteLinkEntry = {
  /** The display text for the link (e.g., used in Sidebars/Menus). */
  label: string;
  /** The URL path for the route. */
  path: string;
  /** If true, this route is ONLY accessible to unauthenticated users (e.g., Login). */
  guestOnly?: boolean;
  /** If true, this route is accessible to everyone (no login required). */
  isPublic?: boolean;
  /** List of permission strings required to access this route (e.g., 'role:view'). */
  requiredPerms?: readonly string[];
};

export type SiteConfig = typeof siteConfig;

// --- Main Configuration (Single Source of Truth) ---

export const siteConfig = {
  name: ENV.APP_NAME,
  description: "Comprehensive management system for Ice Factories.",

  /**
   * Central dictionary of all application routes.
   * Keys are used for internal referencing; Values define behavior.
   */
  links: {
    // ========================================================================
    // 1. PUBLIC ROUTES (Accessible by everyone)
    // ========================================================================
    landing: { 
      label: "Trang chủ", 
      path: "/", 
      isPublic: true 
    },
    about: { 
      label: "Giới thiệu", 
      path: "/about", 
      isPublic: true 
    },

    // ========================================================================
    // 2. GUEST ONLY ROUTES (Accessible only when NOT logged in)
    // ========================================================================
    login: { 
      label: "Đăng nhập", 
      path: "/login", 
      guestOnly: true 
    },

    // ========================================================================
    // 3. SYSTEM PRIVATE ROUTES (Login Required)
    // ========================================================================
    // No flags = Implicitly PRIVATE
    changeDefaultPassword: { 
      label: "Đổi mật khẩu mặc định", 
      path: "/login/change-default-password" 
    },
    dashboard: { 
      label: "Bảng thống kê", 
      path: "/dashboard" 
    },
    profile: { 
      label: "Hồ sơ cá nhân", 
      path: "/profile" 
    },

    // ========================================================================
    // 4. BUSINESS ROUTES (Login Required)
    // ========================================================================
    customer: { label: "Khách hàng",  path: "/customers" },
    product:  { label: "Sản phẩm",    path: "/products" },
    truck:    { label: "Xe chở hàng", path: "/trucks" },
    order:    { label: "Đơn hàng",    path: "/orders" },
    delivery: { label: "Giao hàng",   path: "/deliveries" },
    report:   { label: "Báo cáo",     path: "/reports" },

    // ========================================================================
    // 5. ADMIN ROUTES (Login + Permissions Required)
    // ========================================================================
    // Note: These have requiredPerms, so logic will force them to PRIVATE
    userAccount: { 
      label: "Người dùng", 
      path: "/user-accounts", 
      requiredPerms: ["user-accounts:view"] as const 
    },
    createAccount: { 
      label: "Tạo tài khoản", 
      path: "/user-accounts/create", 
      requiredPerms: ["user-accounts:create"] as const 
    },
    role: { 
      label: "Phân quyền", 
      path: "/roles", 
      requiredPerms: ["roles:view"] as const 
    },
    createRole: { 
      label: "Tạo phân quyền", 
      path: "/roles/create", 
      requiredPerms: ["roles:create"] as const 
    },

  } satisfies Record<string, RouteLinkEntry>,
} as const;


// --- Auto-Generated Route Configuration ---

/**
 * Generates the configuration array required by the Middleware/AuthGuard.
 * * Logic flow for determining Route Type:
 * 1. Has Permissions? -> FORCE PRIVATE (Security First).
 * 2. isPublic flag? -> PUBLIC.
 * 3. guestOnly flag? -> GUEST_ONLY.
 * 4. Default -> PRIVATE.
 * * @returns {RouteConfig[]} Sorted array of route configurations.
 */
export const ROUTES_CONFIG: RouteConfig[] = (Object.values(siteConfig.links) as RouteLinkEntry[])
  .map((link) => {
    // 1. Initialize as PRIVATE (Default safe state)
    let type: RouteConfig['type'] = 'PRIVATE';

    const hasPermissions = link.requiredPerms && link.requiredPerms.length > 0;

    // 2. Determine Type with Priority
    if (hasPermissions) {
        // SAFETY: If permissions are required, it MUST be PRIVATE.
        // This prevents accidental exposure even if isPublic is wrongly set to true.
        type = 'PRIVATE'; 
    } else if (link.isPublic) {
        type = 'PUBLIC';
    } else if (link.guestOnly) {
        type = 'GUEST_ONLY';
    }
    // else: remains 'PRIVATE'

    // 3. Construct the config object
    return {
      path: link.path,
      type: type,
      // Pass permissions if they exist, otherwise undefined
      requiredPerms: link.requiredPerms ? [...link.requiredPerms] : undefined,
    };
  })
  .sort((a, b) => b.path.length - a.path.length); // Critical: Nested routes first (Specific > General)