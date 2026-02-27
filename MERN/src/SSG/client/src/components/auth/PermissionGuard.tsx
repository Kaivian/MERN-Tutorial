// client/src/components/auth/PermissionGuard.tsx
"use client";

import React, { ReactNode } from "react";
import { useMultiPermissions, usePermission } from "@/providers/auth.provider";

interface PermissionGuardProps {
  /**
   * The single permission string required to render children.
   */
  permission?: string;

  /**
   * A list of permissions required to render children.
   */
  permissions?: string[];

  /**
   * Logic to apply when checking multiple permissions.
   * - 'AND': User must have ALL permissions (default).
   * - 'OR': User must have AT LEAST ONE permission.
   */
  strategy?: "AND" | "OR";

  /**
   * Content to render if the user DOES NOT have permission.
   * Defaults to null (hidden).
   */
  fallback?: ReactNode;

  children: ReactNode;
}

/**
 * A wrapper component that conditionally renders its children
 * based on the current user's permissions.
 */
export function PermissionGuard({
  permission,
  permissions = [],
  strategy = "AND",
  fallback = null,
  children,
}: PermissionGuardProps) {
  const hasSingle = usePermission(permission || "");
  const hasMultiple = useMultiPermissions(permissions, strategy);

  // Determine if authorized based on props provided
  let isAuthorized = true;

  if (permission) {
    isAuthorized = hasSingle;
  } else if (permissions.length > 0) {
    isAuthorized = hasMultiple;
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
