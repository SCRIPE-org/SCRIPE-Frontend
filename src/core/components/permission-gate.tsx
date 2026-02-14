/**
 * PermissionGate Component
 *
 * Declarative component for conditional rendering based on user permissions.
 * Hides children if the user doesn't have the required permission(s).
 *
 * @example
 * // Single permission
 * <PermissionGate permission="admins.create">
 *   <Button>Create Admin</Button>
 * </PermissionGate>
 *
 * @example
 * // Any of multiple permissions
 * <PermissionGate permissions={["admins.update", "admins.delete"]} requireAll={false}>
 *   <ActionButtons />
 * </PermissionGate>
 *
 * @example
 * // All permissions required
 * <PermissionGate permissions={["reports.view", "reports.export"]} requireAll={true}>
 *   <ExportButton />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate permission="premium.feature" fallback={<UpgradePrompt />}>
 *   <PremiumFeature />
 * </PermissionGate>
 */

"use client";

import { type ReactNode } from "react";
import { usePermissions } from "@core/hooks/use-permission";
import type { PermissionCode } from "@core/common/types/permissions";

export interface PermissionGateProps {
  /**
   * Single permission to check
   */
  permission?: PermissionCode;

  /**
   * Multiple permissions to check
   */
  permissions?: PermissionCode[];

  /**
   * If true, ALL permissions are required. If false, ANY permission is sufficient.
   * @default false
   */
  requireAll?: boolean;

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Content to render if user lacks permission
   * @default null (renders nothing)
   */
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { has, hasAny, hasAll } = usePermissions();

  // Determine if user has required permissions
  let hasAccess = true;

  if (permission) {
    // Single permission check
    hasAccess = has(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    hasAccess = requireAll ? hasAll(permissions) : hasAny(permissions);
  }
  // If no permission specified, allow access (fail-open for convenience)

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export default PermissionGate;
