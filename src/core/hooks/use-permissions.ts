"use client";

import { useCallback, useMemo } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { Permission, PAGE_PERMISSIONS, ROLES } from "@core/common/types/permissions";

/**
 * usePermissions Hook
 * 
 * Provides permission checking utilities for RBAC.
 * 
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions, canAccessPage } = usePermissions();
 * 
 * if (hasPermission('users:create')) {
 *   // Show create button
 * }
 * 
 * if (canAccessPage('/admin/users')) {
 *   // Allow access
 * }
 */
export function usePermissions() {
      const user = useAppStore((state) => state.user);

      /**
       * Get user's permissions from their role
       */
      const userPermissions = useMemo((): Permission[] => {
            if (!user) return [];

            // If user has permissions array directly
            if (user.permissions && Array.isArray(user.permissions)) {
                  return user.permissions as Permission[];
            }

            // If user has a role, get permissions from ROLES
            if (user.role) {
                  const roleKey = user.role.toUpperCase().replace('-', '_');
                  const role = ROLES[roleKey];
                  return role?.permissions || [];
            }

            // Default: no permissions
            return [];
      }, [user]);

      /**
       * Check if user has a specific permission
       */
      const hasPermission = useCallback((permission: Permission): boolean => {
            // Wildcard grants all permissions
            if (userPermissions.includes('*')) return true;
            return userPermissions.includes(permission);
      }, [userPermissions]);

      /**
       * Check if user has ANY of the specified permissions
       */
      const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
            if (userPermissions.includes('*')) return true;
            return permissions.some(p => userPermissions.includes(p));
      }, [userPermissions]);

      /**
       * Check if user has ALL of the specified permissions
       */
      const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
            if (userPermissions.includes('*')) return true;
            return permissions.every(p => userPermissions.includes(p));
      }, [userPermissions]);

      /**
       * Check if user can access a specific page
       */
      const canAccessPage = useCallback((path: string): boolean => {
            const requiredPermissions = PAGE_PERMISSIONS[path];

            // If no permissions defined for page, allow access (authenticated only)
            if (!requiredPermissions || requiredPermissions.length === 0) {
                  return true;
            }

            return hasAllPermissions(requiredPermissions);
      }, [hasAllPermissions]);

      /**
       * Get user's role name
       */
      const roleName = useMemo(() => {
            if (!user?.role) return 'Guest';
            const roleKey = user.role.toUpperCase().replace('-', '_');
            return ROLES[roleKey]?.name || user.role;
      }, [user]);

      return {
            permissions: userPermissions,
            roleName,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            canAccessPage,
      };
}
