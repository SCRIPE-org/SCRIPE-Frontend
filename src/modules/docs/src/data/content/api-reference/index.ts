import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

function apiPage(slug: string, key: string, order: number, sections: DocPageData['sections'], related: string[] = []): void {
      registerPage({
            slug: `api-reference/${slug}`, titleKey: `apiReference.${key}.title`, descriptionKey: `apiReference.${key}.description`,
            category: 'api-reference', order, relatedSlugs: related, sections,
      });
}

// ─── Admin Auth ──────────────
apiPage('admin-auth', 'adminAuth', 1, [
      { type: 'paragraph', contentKey: 'apiReference.adminAuth.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'POST', path: '/api/auth/admin/login', description: 'Admin login with email/password', auth: false },
                  { method: 'POST', path: '/api/auth/admin/verify-2fa', description: 'Verify 2FA code', auth: false },
                  { method: 'POST', path: '/api/auth/admin/refresh-token', description: 'Refresh access token', auth: false },
                  { method: 'POST', path: '/api/auth/admin/logout', description: 'Invalidate session', auth: true },
                  { method: 'POST', path: '/api/auth/admin/forgot-password', description: 'Send password reset email', auth: false },
                  { method: 'POST', path: '/api/auth/admin/reset-password', description: 'Reset password with token', auth: false },
            ]
      },
], ['features/authentication']);

// ─── User Auth ──────────────
apiPage('user-auth', 'userAuth', 2, [
      { type: 'paragraph', contentKey: 'apiReference.userAuth.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'POST', path: '/api/auth/user/login', description: 'Tenant user login', auth: false },
                  { method: 'POST', path: '/api/auth/user/verify-2fa', description: 'Verify 2FA code', auth: false },
                  { method: 'POST', path: '/api/auth/user/refresh-token', description: 'Refresh access token', auth: false },
                  { method: 'POST', path: '/api/auth/user/logout', description: 'Invalidate session', auth: true },
            ]
      },
], ['features/user-authentication']);

// ─── Admin Management ──────────────
apiPage('admin-management', 'adminManagementApi', 3, [
      { type: 'paragraph', contentKey: 'apiReference.adminManagementApi.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'GET', path: '/api/admin', description: 'List admins (paginated)', auth: true, permission: 'Admins.View' },
                  { method: 'GET', path: '/api/admin/{id}', description: 'Get admin details', auth: true, permission: 'Admins.View' },
                  { method: 'POST', path: '/api/admin', description: 'Create admin', auth: true, permission: 'Admins.Create' },
                  { method: 'PUT', path: '/api/admin/{id}', description: 'Update admin', auth: true, permission: 'Admins.Edit' },
                  { method: 'DELETE', path: '/api/admin/{id}', description: 'Soft-delete admin', auth: true, permission: 'Admins.Delete' },
                  { method: 'PATCH', path: '/api/admin/{id}/block', description: 'Block/unblock', auth: true, permission: 'Admins.Block' },
            ]
      },
], ['features/admin-management']);

// ─── Roles ──────────────
apiPage('roles', 'roles', 4, [
      { type: 'paragraph', contentKey: 'apiReference.roles.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'GET', path: '/api/roles', description: 'List all roles', auth: true, permission: 'Roles.View' },
                  { method: 'GET', path: '/api/roles/{id}', description: 'Get role with permissions', auth: true, permission: 'Roles.View' },
                  { method: 'POST', path: '/api/roles', description: 'Create role', auth: true, permission: 'Roles.Create' },
                  { method: 'PUT', path: '/api/roles/{id}', description: 'Update role', auth: true, permission: 'Roles.Edit' },
                  { method: 'DELETE', path: '/api/roles/{id}', description: 'Delete role', auth: true, permission: 'Roles.Delete' },
                  { method: 'POST', path: '/api/roles/{id}/permissions', description: 'Assign permissions', auth: true, permission: 'Roles.AssignPermissions' },
            ]
      },
], ['features/role-management']);

// ─── Tenants ──────────────
apiPage('tenants', 'tenants', 5, [
      { type: 'paragraph', contentKey: 'apiReference.tenants.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'GET', path: '/api/tenants', description: 'List tenants (tree)', auth: true, permission: 'Tenants.View' },
                  { method: 'GET', path: '/api/tenants/{id}', description: 'Get tenant details', auth: true, permission: 'Tenants.View' },
                  { method: 'POST', path: '/api/tenants', description: 'Create tenant', auth: true, permission: 'Tenants.Create' },
                  { method: 'PUT', path: '/api/tenants/{id}', description: 'Update tenant', auth: true, permission: 'Tenants.Edit' },
                  { method: 'DELETE', path: '/api/tenants/{id}', description: 'Delete tenant', auth: true, permission: 'Tenants.Delete' },
                  { method: 'PUT', path: '/api/tenants/{id}/settings', description: 'Update settings', auth: true, permission: 'Tenants.ManageSettings' },
            ]
      },
], ['features/tenant-management']);

// ─── Menus ──────────────
apiPage('menus', 'menus', 6, [
      { type: 'paragraph', contentKey: 'apiReference.menus.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'GET', path: '/api/menus', description: 'Get menu tree', auth: true, permission: 'Menus.View' },
                  { method: 'POST', path: '/api/menus', description: 'Create menu item', auth: true, permission: 'Menus.Create' },
                  { method: 'PUT', path: '/api/menus/{id}', description: 'Update menu item', auth: true, permission: 'Menus.Edit' },
                  { method: 'DELETE', path: '/api/menus/{id}', description: 'Delete menu item', auth: true, permission: 'Menus.Delete' },
                  { method: 'PUT', path: '/api/menus/reorder', description: 'Reorder menu items', auth: true, permission: 'Menus.Edit' },
            ]
      },
], ['features/menu-system']);

// ─── Audit ──────────────
apiPage('audit', 'audit', 7, [
      { type: 'paragraph', contentKey: 'apiReference.audit.description' },
      {
            type: 'api-table', endpoints: [
                  { method: 'GET', path: '/api/audit-logs', description: 'List audit logs (paginated)', auth: true, permission: 'Audit.View' },
                  { method: 'GET', path: '/api/audit-logs/{id}', description: 'Get audit detail', auth: true, permission: 'Audit.View' },
                  { method: 'GET', path: '/api/audit-logs/export', description: 'Export to Excel', auth: true, permission: 'Audit.Export' },
                  { method: 'DELETE', path: '/api/audit-logs/{id}', description: 'Delete audit record', auth: true, permission: 'Audit.Delete' },
            ]
      },
      { type: 'info', variant: 'note', contentKey: 'apiReference.audit.description' },
], ['features/audit-logging']);
