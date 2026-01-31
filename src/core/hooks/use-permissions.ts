"use client";

/**
 * use-permissions.ts
 *
 * This file re-exports the usePermissions hook from the PermissionProvider.
 * The hook provides permission checking utilities for RBAC.
 *
 * @example
 * const { hasPermission, hasAnyPermission, canAccessPage } = usePermissions();
 *
 * if (hasPermission('admins.create')) {
 *   // Show create button
 * }
 */

export { usePermissions, PermissionGate } from "@core/providers/permission-provider";
export type { PermissionCode } from "@core/common/types/permissions";
