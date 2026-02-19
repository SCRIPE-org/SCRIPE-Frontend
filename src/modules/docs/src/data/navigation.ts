/**
 * Navigation Tree — Sidebar structure for the documentation portal.
 * This is the single source of truth for sidebar navigation.
 *
 * Categories with id starting with "commercial-" are shown only
 * when the user toggles to "Commercial" mode in the header.
 */

import type { DocCategoryData } from "../domain/entities/DocCategory";

export const navigationData: DocCategoryData[] = [
  // ═══════════════════════════════════════════════════════════
  //  TECHNICAL DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── Get Started ───────────────────────────────────────────
  {
    id: "get-started",
    titleKey: "nav.getStarted",
    icon: "rocket",
    order: 1,
    items: [
      { id: "gs-overview", titleKey: "getStarted.overview.title", slug: "get-started/overview", order: 1 },
      { id: "gs-prerequisites", titleKey: "getStarted.prerequisites.title", slug: "get-started/prerequisites", order: 2 },
      { id: "gs-quick-start", titleKey: "getStarted.quickStart.title", slug: "get-started/quick-start", order: 3 },
      { id: "gs-project-structure", titleKey: "getStarted.projectStructure.title", slug: "get-started/project-structure", order: 4 },
    ],
  },

  // ─── Architecture ──────────────────────────────────────────
  {
    id: "architecture",
    titleKey: "nav.architecture",
    icon: "layout",
    order: 2,
    items: [
      { id: "arch-overview", titleKey: "architecture.overview.title", slug: "architecture/overview", order: 1 },
      { id: "arch-backend", titleKey: "architecture.backend.title", slug: "architecture/backend", order: 2 },
      { id: "arch-frontend", titleKey: "architecture.frontend.title", slug: "architecture/frontend", order: 3 },
      { id: "arch-cqrs", titleKey: "architecture.cqrs.title", slug: "architecture/cqrs", order: 4 },
      { id: "arch-modules", titleKey: "architecture.modules.title", slug: "architecture/modules", order: 5 },
      { id: "arch-solid", titleKey: "architecture.solidPattern.title", slug: "architecture/solid-pattern", order: 6 },
      { id: "arch-state", titleKey: "architecture.stateManagement.title", slug: "architecture/state-management", order: 7 },
      { id: "arch-data-flow", titleKey: "architecture.dataFlow.title", slug: "architecture/data-flow", order: 8 },
    ],
  },

  // ─── Features ──────────────────────────────────────────────
  {
    id: "features",
    titleKey: "nav.features",
    icon: "star",
    order: 3,
    items: [
      { id: "feat-auth", titleKey: "features.authentication.title", slug: "features/authentication", order: 1 },
      { id: "feat-multi-tenancy", titleKey: "features.multiTenancy.title", slug: "features/multi-tenancy", order: 2 },
      { id: "feat-roles", titleKey: "features.rolePermissions.title", slug: "features/role-permissions", order: 3 },
      { id: "feat-audit", titleKey: "features.auditSystem.title", slug: "features/audit-system", order: 4 },
    ],
  },

  // ─── Security ──────────────────────────────────────────────
  {
    id: "security",
    titleKey: "nav.security",
    icon: "shield",
    order: 4,
    items: [
      { id: "sec-overview", titleKey: "security.overview.title", slug: "security/overview", order: 1 },
    ],
  },

  // ─── API Reference ─────────────────────────────────────────
  {
    id: "api-reference",
    titleKey: "nav.apiReference",
    icon: "code",
    order: 5,
    items: [
      { id: "api-overview", titleKey: "apiReference.overview.title", slug: "api-reference/overview", order: 1 },
    ],
  },
];
