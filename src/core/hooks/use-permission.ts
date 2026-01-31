/**
 * usePermission Hook
 * 
 * Provides convenient permission checking against the current user's effective permissions.
 * This hook accesses the global permissions array stored after login.
 * 
 * @example
 * // Single permission check
 * const canCreate = usePermission("admins.create");
 * if (canCreate) { showCreateButton(); }
 * 
 * @example
 * // Multiple permission checks
 * const { has, hasAny, hasAll } = usePermissions();
 * if (has("reports.print")) { showPrintButton(); }
 * if (hasAny(["users.view", "admins.view"])) { showUserSection(); }
 */

import { useAppStore } from "@core/store/useAppStore";
import {
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      type PermissionCode
} from "@core/common/types/permissions";

/**
 * Check if current user has a specific permission
 * Returns true if no permission is required (undefined/empty)
 */
export function usePermission(requiredPermission?: PermissionCode): boolean {
      const permissions = useAppStore((state) => state.permissions);

      // No permission required = always allowed
      if (!requiredPermission) return true;

      // Check against user's effective permissions
      return hasPermission(permissions, requiredPermission);
}

/**
 * Get permission checking utilities for the current user
 * Useful when checking multiple permissions in a component
 */
export function usePermissions() {
      const permissions = useAppStore((state) => state.permissions);
      const user = useAppStore((state) => state.user);

      return {
            /**
             * All permission codes the current user has
             */
            permissions,

            /**
             * Current user object
             */
            user,

            /**
             * Check if user has a specific permission
             */
            has: (permission: PermissionCode): boolean => {
                  return hasPermission(permissions, permission);
            },

            /**
             * Check if user has ANY of the specified permissions
             */
            hasAny: (requiredPermissions: PermissionCode[]): boolean => {
                  return hasAnyPermission(permissions, requiredPermissions);
            },

            /**
             * Check if user has ALL of the specified permissions
             */
            hasAll: (requiredPermissions: PermissionCode[]): boolean => {
                  return hasAllPermissions(permissions, requiredPermissions);
            },

            /**
             * Check if user is authenticated
             */
            isAuthenticated: !!user,
      };
}

export default usePermission;
