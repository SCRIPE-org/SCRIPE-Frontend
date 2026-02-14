/**
 * Navigation Tree — Sidebar structure for the documentation portal.
 * This is the single source of truth for sidebar navigation.
 */

import type { DocCategoryData } from '../domain/entities/DocCategory';

export const navigationData: DocCategoryData[] = [
      // ─── Get Started ───────────────────────────────────────────
      {
            id: 'get-started',
            titleKey: 'nav.getStarted',
            icon: 'rocket',
            order: 1,
            items: [
                  { id: 'gs-overview', titleKey: 'getStarted.overview.title', slug: 'get-started/overview', order: 1 },
                  { id: 'gs-prerequisites', titleKey: 'getStarted.prerequisites.title', slug: 'get-started/prerequisites', order: 2 },
                  { id: 'gs-quick-start', titleKey: 'getStarted.quickStart.title', slug: 'get-started/quick-start', order: 3 },
                  { id: 'gs-project-structure', titleKey: 'getStarted.projectStructure.title', slug: 'get-started/project-structure', order: 4 },
            ],
      },

      // ─── Tutorials ─────────────────────────────────────────────
      {
            id: 'tutorials',
            titleKey: 'nav.tutorials',
            icon: 'book-open',
            order: 2,
            items: [
                  { id: 'tut-backend-module', titleKey: 'tutorials.firstBackendModule.title', slug: 'tutorials/first-backend-module', order: 1 },
                  { id: 'tut-frontend-module', titleKey: 'tutorials.firstFrontendModule.title', slug: 'tutorials/first-frontend-module', order: 2 },
                  { id: 'tut-add-entity', titleKey: 'tutorials.addEntity.title', slug: 'tutorials/add-entity', order: 3 },
                  { id: 'tut-add-command', titleKey: 'tutorials.addCommand.title', slug: 'tutorials/add-command', order: 4 },
                  { id: 'tut-add-query', titleKey: 'tutorials.addQuery.title', slug: 'tutorials/add-query', order: 5 },
                  { id: 'tut-add-permissions', titleKey: 'tutorials.addPermissions.title', slug: 'tutorials/add-permissions', order: 6 },
                  { id: 'tut-add-endpoint', titleKey: 'tutorials.addApiEndpoint.title', slug: 'tutorials/add-api-endpoint', order: 7 },
                  { id: 'tut-api-integration', titleKey: 'tutorials.apiIntegration.title', slug: 'tutorials/api-integration', order: 8 },
            ],
      },

      // ─── Architecture ──────────────────────────────────────────
      {
            id: 'architecture',
            titleKey: 'nav.architecture',
            icon: 'layout',
            order: 3,
            items: [
                  { id: 'arch-overview', titleKey: 'architecture.overview.title', slug: 'architecture/overview', order: 1 },
                  { id: 'arch-backend', titleKey: 'architecture.backend.title', slug: 'architecture/backend', order: 2 },
                  { id: 'arch-frontend', titleKey: 'architecture.frontend.title', slug: 'architecture/frontend', order: 3 },
                  { id: 'arch-cqrs', titleKey: 'architecture.cqrs.title', slug: 'architecture/cqrs', order: 4 },
                  { id: 'arch-modules', titleKey: 'architecture.modules.title', slug: 'architecture/modules', order: 5 },
                  { id: 'arch-solid', titleKey: 'architecture.solidPattern.title', slug: 'architecture/solid-pattern', order: 6 },
                  { id: 'arch-state', titleKey: 'architecture.stateManagement.title', slug: 'architecture/state-management', order: 7 },
                  { id: 'arch-data-flow', titleKey: 'architecture.dataFlow.title', slug: 'architecture/data-flow', order: 8 },
            ],
      },

      // ─── Features ──────────────────────────────────────────────
      {
            id: 'features',
            titleKey: 'nav.features',
            icon: 'star',
            order: 4,
            items: [
                  { id: 'feat-auth', titleKey: 'features.authentication.title', slug: 'features/authentication', order: 1 },
                  { id: 'feat-2fa', titleKey: 'features.twoFactorAuth.title', slug: 'features/two-factor-auth', order: 2 },
                  { id: 'feat-sessions', titleKey: 'features.sessionManagement.title', slug: 'features/session-management', order: 3 },
                  { id: 'feat-profile', titleKey: 'features.profileManagement.title', slug: 'features/profile-management', order: 4 },
                  { id: 'feat-admin', titleKey: 'features.adminManagement.title', slug: 'features/admin-management', order: 5 },
                  { id: 'feat-roles', titleKey: 'features.roleManagement.title', slug: 'features/role-management', order: 6 },
                  { id: 'feat-permissions', titleKey: 'features.permissionSystem.title', slug: 'features/permission-system', order: 7 },
                  { id: 'feat-tenants', titleKey: 'features.tenantManagement.title', slug: 'features/tenant-management', order: 8 },
                  { id: 'feat-menus', titleKey: 'features.menuSystem.title', slug: 'features/menu-system', order: 9 },
                  { id: 'feat-dashboard', titleKey: 'features.dashboardAnalytics.title', slug: 'features/dashboard-analytics', order: 10 },
                  { id: 'feat-audit', titleKey: 'features.auditLogging.title', slug: 'features/audit-logging', order: 11 },
                  { id: 'feat-recycle', titleKey: 'features.recycleBin.title', slug: 'features/recycle-bin', order: 12 },
                  { id: 'feat-files', titleKey: 'features.fileManagement.title', slug: 'features/file-management', order: 13 },
                  { id: 'feat-user-auth', titleKey: 'features.userAuthentication.title', slug: 'features/user-authentication', order: 14 },
            ],
      },

      // ─── Frontend Modules ──────────────────────────────────────
      {
            id: 'frontend',
            titleKey: 'nav.frontend',
            icon: 'monitor',
            order: 5,
            items: [
                  { id: 'fe-auth', titleKey: 'frontend.authModule.title', slug: 'frontend/auth-module', order: 1 },
                  { id: 'fe-profile', titleKey: 'frontend.profileModule.title', slug: 'frontend/profile-module', order: 2 },
                  { id: 'fe-system', titleKey: 'frontend.systemModule.title', slug: 'frontend/system-module', order: 3 },
                  { id: 'fe-crud', titleKey: 'frontend.crudEngine.title', slug: 'frontend/crud-engine', order: 4 },
            ],
      },

      // ─── Security ──────────────────────────────────────────────
      {
            id: 'security',
            titleKey: 'nav.security',
            icon: 'shield',
            order: 6,
            items: [
                  { id: 'sec-rbac', titleKey: 'security.rbac.title', slug: 'security/rbac', order: 1 },
                  { id: 'sec-field', titleKey: 'security.fieldLevel.title', slug: 'security/field-level', order: 2 },
                  { id: 'sec-id', titleKey: 'security.idEncryption.title', slug: 'security/id-encryption', order: 3 },
                  { id: 'sec-tokens', titleKey: 'security.tokens.title', slug: 'security/tokens', order: 4 },
            ],
      },

      // ─── API Reference ─────────────────────────────────────────
      {
            id: 'api-reference',
            titleKey: 'nav.apiReference',
            icon: 'code',
            order: 7,
            items: [
                  { id: 'api-admin-auth', titleKey: 'apiReference.adminAuth.title', slug: 'api-reference/admin-auth', order: 1 },
                  { id: 'api-user-auth', titleKey: 'apiReference.userAuth.title', slug: 'api-reference/user-auth', order: 2 },
                  { id: 'api-admin-mgmt', titleKey: 'apiReference.adminManagement.title', slug: 'api-reference/admin-management', order: 3 },
                  { id: 'api-roles', titleKey: 'apiReference.roles.title', slug: 'api-reference/roles', order: 4 },
                  { id: 'api-tenants', titleKey: 'apiReference.tenants.title', slug: 'api-reference/tenants', order: 5 },
                  { id: 'api-menus', titleKey: 'apiReference.menus.title', slug: 'api-reference/menus', order: 6 },
                  { id: 'api-audit', titleKey: 'apiReference.audit.title', slug: 'api-reference/audit', order: 7 },
            ],
      },

      // ─── Infrastructure ────────────────────────────────────────
      {
            id: 'infrastructure',
            titleKey: 'nav.infrastructure',
            icon: 'server',
            order: 8,
            items: [
                  { id: 'infra-db', titleKey: 'infrastructure.database.title', slug: 'infrastructure/database', order: 1 },
                  { id: 'infra-multi-db', titleKey: 'infrastructure.multiDatabase.title', slug: 'infrastructure/multi-database', order: 2 },
                  { id: 'infra-migrations', titleKey: 'infrastructure.migrations.title', slug: 'infrastructure/migrations', order: 3 },
                  { id: 'infra-caching', titleKey: 'infrastructure.caching.title', slug: 'infrastructure/caching', order: 4 },
            ],
      },
];
