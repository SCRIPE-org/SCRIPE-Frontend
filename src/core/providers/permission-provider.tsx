"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useAppStore } from "@core/store/useAppStore";
import {
  PermissionCode,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  PAGE_PERMISSIONS,
} from "@core/common/types/permissions";

interface PermissionContextType {
  /**
   * All permissions the current user has
   */
  permissions: PermissionCode[];

  /**
   * Check if user has a specific permission
   */
  hasPermission: (permission: PermissionCode) => boolean;

  /**
   * Check if user has ANY of the specified permissions
   */
  hasAnyPermission: (permissions: PermissionCode[]) => boolean;

  /**
   * Check if user has ALL of the specified permissions
   */
  hasAllPermissions: (permissions: PermissionCode[]) => boolean;

  /**
   * Check if user can access a specific page
   */
  canAccessPage: (path: string) => boolean;

  /**
   * Get the user's role names
   */
  roleNames: string[];

  /**
   * Whether the user is a platform super admin (no tenant claim/context, highest system operator)
   */
  isPlatformSuperAdmin: boolean;

  /**
   * Whether the user is a tenant super admin (belongs to a tenant and holds tenant super admin role)
   */
  isTenantSuperAdmin: boolean;

  /**
   * Whether the user is a super admin (alias for isPlatformSuperAdmin for platform-level operations)
   */
  isSuperAdmin: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
}

/**
 * Helper to match resolved pathnames with Next.js dynamic page templates in PAGE_PERMISSIONS.
 * Example: matches "/roles/123" with "/roles/[id]"
 */
function matchesRoutePattern(pathname: string, pattern: string): boolean {
  const pathSegs = pathname.split("/").filter(Boolean);
  const patternSegs = pattern.split("/").filter(Boolean);

  if (pathSegs.length !== patternSegs.length) return false;

  for (let i = 0; i < patternSegs.length; i++) {
    const patternSeg = patternSegs[i];
    const pathSeg = pathSegs[i];

    if (patternSeg.startsWith("[") && patternSeg.endsWith("]")) {
      continue;
    }

    if (patternSeg !== pathSeg) {
      return false;
    }
  }

  return true;
}

function getRequiredPermissionsForPath(pathname: string): PermissionCode[] | undefined {
  // Try exact match first
  if (PAGE_PERMISSIONS[pathname]) {
    return PAGE_PERMISSIONS[pathname];
  }

  // Try matching dynamic route patterns
  for (const pattern of Object.keys(PAGE_PERMISSIONS)) {
    if (pattern.includes("[") && matchesRoutePattern(pathname, pattern)) {
      return PAGE_PERMISSIONS[pattern];
    }
  }

  return undefined;
}

/**
 * PermissionProvider
 *
 * Provides permission checking utilities throughout the app.
 * Must be placed inside providers that have access to auth state.
 *
 * @example
 * // In layout
 * <PermissionProvider>
 *   <App />
 * </PermissionProvider>
 *
 * // In component
 * const { hasPermission } = usePermissions();
 * if (hasPermission('admins.create')) { ... }
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
  const permissions = useAppStore((state) => state.permissions);
  const roles = useAppStore((state) => state.roles);
  const user = useAppStore((state) => state.user);

  const hasPermission = useCallback(
    (permission: PermissionCode): boolean => {
      return checkPermission(permissions, permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: PermissionCode[]): boolean => {
      return checkAnyPermission(permissions, requiredPermissions);
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: PermissionCode[]): boolean => {
      return checkAllPermissions(permissions, requiredPermissions);
    },
    [permissions]
  );

  const canAccessPage = useCallback(
    (path: string): boolean => {
      const requiredPermissions = getRequiredPermissionsForPath(path);

      // If no permissions defined for page, allow access (authenticated only)
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      return checkAllPermissions(permissions, requiredPermissions);
    },
    [permissions]
  );

  const roleNames = useMemo(() => {
    return roles.map((r) => r.roleName);
  }, [roles]);

  const isPlatformSuperAdmin = useMemo(() => {
    // A user is a PLATFORM Super Admin ONLY if they belong to NO tenant (system-level)
    // and hold platform-wide superadmin privileges.
    if (user?.tenantId) {
      return false;
    }
    return (
      permissions.includes("*") ||
      roles.some((r) => r.roleCode === "SYSTEM_SUPER_ADMIN" || r.roleName === "System Super Admin") ||
      user?.isProtected === true ||
      (user as any)?.isSuperAdmin === true ||
      user?.adminTypeName?.toLowerCase() === "system super admin"
    );
  }, [permissions, roles, user]);

  const isTenantSuperAdmin = useMemo(() => {
    if (!user?.tenantId) return false;
    return (
      roles.some(
        (r) =>
          r.roleCode?.endsWith("_SUPER_ADMIN") ||
          r.roleName?.toLowerCase().includes("super")
      ) || Boolean(user?.adminTypeName?.toLowerCase().includes("super"))
    );
  }, [roles, user]);

  // Backward-compatibility: isSuperAdmin aliases isPlatformSuperAdmin
  const isSuperAdmin = isPlatformSuperAdmin;

  const value = useMemo(
    () => ({
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccessPage,
      roleNames,
      isPlatformSuperAdmin,
      isTenantSuperAdmin,
      isSuperAdmin,
    }),
    [
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccessPage,
      roleNames,
      isPlatformSuperAdmin,
      isTenantSuperAdmin,
      isSuperAdmin,
    ]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

/**
 * usePermissions Hook
 *
 * Provides permission checking utilities for RBAC.
 *
 * @example
 * const { hasPermission, hasAnyPermission, canAccessPage, isSuperAdmin } = usePermissions();
 *
 * if (hasPermission('admins.create')) {
 *   // Show create button
 * }
 *
 * if (canAccessPage('/system/admins')) {
 *   // Allow access
 * }
 */
export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }

  return context;
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on permissions.
 *
 * @example
 * <PermissionGate permission="admins.create">
 *   <Button>Create Admin</Button>
 * </PermissionGate>
 *
 * <PermissionGate permissions={['admins.update', 'admins.delete']} requireAll={false}>
 *   <ActionsMenu />
 * </PermissionGate>
 */
interface PermissionGateProps {
  /**
   * Single permission to check
   */
  permission?: PermissionCode;

  /**
   * Multiple permissions to check
   */
  permissions?: PermissionCode[];

  /**
   * If true, requires ALL permissions. If false, requires ANY permission.
   * Default: false (any permission)
   */
  requireAll?: boolean;

  /**
   * Content to render if permission check passes
   */
  children: React.ReactNode;

  /**
   * Optional fallback content if permission check fails
   */
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    // No permissions specified, allow by default
    allowed = true;
  }

  return <>{allowed ? children : fallback}</>;
}
