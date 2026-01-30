/**
 * Permission Types
 * 
 * Defines the permission system for Role-Based Access Control (RBAC).
 */

/**
 * Available permissions in the system.
 * Extend this type as needed.
 */
export type Permission =
      // User management
      | 'users:read'
      | 'users:create'
      | 'users:update'
      | 'users:delete'
      // Product management
      | 'products:read'
      | 'products:create'
      | 'products:update'
      | 'products:delete'
      // Settings
      | 'settings:read'
      | 'settings:update'
      // Admin
      | 'admin:access'
      | 'admin:manage-roles'
      // Wildcard
      | '*';

/**
 * Role definition with permissions
 */
export interface Role {
      id: string;
      name: string;
      permissions: Permission[];
}

/**
 * Predefined roles for common use cases
 */
export const ROLES: Record<string, Role> = {
      SUPER_ADMIN: {
            id: 'super_admin',
            name: 'Super Admin',
            permissions: ['*'],
      },
      ADMIN: {
            id: 'admin',
            name: 'Administrator',
            permissions: [
                  'users:read', 'users:create', 'users:update', 'users:delete',
                  'products:read', 'products:create', 'products:update', 'products:delete',
                  'settings:read', 'settings:update',
                  'admin:access',
            ],
      },
      MANAGER: {
            id: 'manager',
            name: 'Manager',
            permissions: [
                  'users:read',
                  'products:read', 'products:create', 'products:update',
                  'settings:read',
            ],
      },
      USER: {
            id: 'user',
            name: 'User',
            permissions: [
                  'products:read',
                  'settings:read',
            ],
      },
      GUEST: {
            id: 'guest',
            name: 'Guest',
            permissions: [],
      },
};

/**
 * Page permission mapping
 * Maps routes to required permissions
 */
export const PAGE_PERMISSIONS: Record<string, Permission[]> = {
      '/': [], // Public
      '/login': [], // Public
      '/settings': ['settings:read'],
      '/profile': [], // Authenticated only, no special permission
      '/demo/products': ['products:read'],
      '/demo/tree': ['admin:access'],
      '/admin/users': ['users:read'],
};
