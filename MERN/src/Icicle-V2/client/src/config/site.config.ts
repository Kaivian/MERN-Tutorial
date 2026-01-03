// client/src/config/site.config.ts
/**
 * @file site.config.ts
 * @description Defines the site structure, navigation links, and permission requirements.
 * This file serves as the primary configuration source for both UI Navigation and Middleware Routing.
 */

import { env } from "@/config/env.config";
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
  name: env.APP_NAME,
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
    // Note: Implicitly 'PRIVATE' because neither isPublic nor guestOnly is true.
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
    userAccount: { 
      label: "Người dùng", 
      path: "/user-account", 
      requiredPerms: ["user-account:view"] as const 
    },
    createAccount: { 
      label: "Tạo tài khoản", 
      path: "/user-account/create", 
      requiredPerms: ["user-account:create"] as const 
    },
    role: { 
      label: "Phân quyền", 
      path: "/role", 
      requiredPerms: ["role:view"] as const 
    },
    createRole: { 
      label: "Tạo phân quyền", 
      path: "/role/create", 
      requiredPerms: ["role:create"] as const 
    },

  } satisfies Record<string, RouteLinkEntry>,
} as const;


// --- Auto-Generated Route Configuration ---

/**
 * Generates the configuration array required by the Middleware/AuthGuard.
 * * Logic:
 * 1. Converts the `siteConfig.links` object values into an array.
 * 2. Determines the route `type` (PUBLIC, GUEST_ONLY, or PRIVATE).
 * - Defaults to 'PRIVATE' if no flags are set.
 * 3. Sorts routes by path length (descending) to ensure nested routes 
 * are matched correctly before their parents (Specific > General).
 * * @returns {RouteConfig[]} Sorted array of route configurations.
 */
export const ROUTES_CONFIG: RouteConfig[] = (Object.values(siteConfig.links) as RouteLinkEntry[])
  .map((link) => {
    // 1. Default to PRIVATE (Secure by default)
    let type: RouteConfig['type'] = 'PRIVATE';

    // 2. Override based on specific flags
    if (link.isPublic) {
      type = 'PUBLIC';
    } else if (link.guestOnly) {
      type = 'GUEST_ONLY';
    }

    // 3. Construct the config object
    return {
      path: link.path,
      type: type,
      // Pass permissions if they exist, otherwise undefined
      requiredPerms: link.requiredPerms ? [...link.requiredPerms] : undefined,
    };
  })
  .sort((a, b) => b.path.length - a.path.length); // Critical: Nested routes first