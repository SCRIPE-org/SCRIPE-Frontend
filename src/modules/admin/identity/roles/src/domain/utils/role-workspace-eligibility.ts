/**
 * Domain utilities for Role per-workspace start page eligibility and
 * live PermissionTree mismatch detection.
 */

import { normalizeRoutePath } from "@core/config/app-route-manifest";
import {
  PAGE_PERMISSIONS,
  hasAllPermissions,
  hasPermission,
} from "@core/common/types/permissions";
import type {
  LandingTargetCatalog,
  LandingTargetCatalogItem,
  LandingTargetScopeMode,
  LandingTargetWorkspace,
} from "@core/navigation";
import type { PermissionModuleGroup } from "@modules/identity/permissions";

/** Editable draft state for one sparse role workspace start-page rule row. */
export interface DraftRoleWorkspaceEntryRule {
  workspaceKey: string;
  target: string;
  isEnforced: boolean;
  persistedIsStale?: boolean;
}

/** Live PermissionTree mismatch assessment for one role workspace start-page rule. */
export interface RoleWorkspaceRulePermissionWarning {
  hasWarning: boolean;
  missingPermissions: string[];
  isPersistedStaleOnly: boolean;
}

const ADMIN_WORKSPACE_MODULES = new Set([
  "identity",
  "admins",
  "roles",
  "tenants",
  "users",
  "usergroups",
  "user-groups",
  "permissions",
  "identityproviders",
  "identity-providers",
  "oauthapps",
  "oauth-apps",
  "entitlements",
  "billing",
  "editions",
  "features",
  "subscriptions",
  "invoices",
  "customization",
  "branding",
  "themes",
  "menus",
  "communication",
  "integrations",
  "monitoring",
  "audit",
  "security",
  "ecosystem",
  "recyclebin",
  "recycle-bin",
  "media",
  "customfields",
  "custom-fields",
  "datatransfer",
  "data-transfer",
]);

function mapModuleNameToWorkspaceKey(moduleName: string): string {
  const normalized = moduleName
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  if (!normalized) return "";
  if (ADMIN_WORKSPACE_MODULES.has(normalized) || ADMIN_WORKSPACE_MODULES.has(normalized.replace(/-/g, ""))) {
    return "admin";
  }
  if (normalized === "partykernel") return "party-kernel";
  if (normalized === "workmanagement") return "hrms";
  return normalized;
}

function isCatalogWorkspaceScopeCompatible(
  ws: LandingTargetWorkspace,
  scopeMode: LandingTargetScopeMode
): boolean {
  if (scopeMode === "platform_role") {
    return ws.contextScope !== "TenantOnly" && ws.workspaceType !== "Module";
  }
  if (scopeMode === "tenant_role") {
    return ws.contextScope !== "PlatformOnly";
  }
  return true;
}

function isCatalogItemScopeCompatible(
  item: LandingTargetCatalogItem,
  scopeMode: LandingTargetScopeMode
): boolean {
  if (scopeMode === "platform_role") {
    return item.contextScope !== "TenantOnly";
  }
  if (scopeMode === "tenant_role") {
    return item.contextScope !== "PlatformOnly";
  }
  return true;
}

function hasGrantedPermissionInWorkspace(
  wsKey: string,
  catalog: LandingTargetCatalog,
  selectedArray: string[],
  selectedSet: Set<string>,
  moduleGroups: PermissionModuleGroup[]
): boolean {
  if (selectedSet.size === 0) return false;
  if (selectedSet.has("*")) return true;

  for (const item of catalog.items) {
    if (item.workspaceKey.trim().toLowerCase() !== wsKey) continue;
    const reqs = PAGE_PERMISSIONS[normalizeRoutePath(item.route)];
    if (reqs && reqs.length > 0 && hasAllPermissions(selectedArray, reqs)) {
      return true;
    }
  }

  for (const mg of moduleGroups) {
    if (mapModuleNameToWorkspaceKey(mg.module) !== wsKey) continue;
    for (const cat of mg.categories) {
      for (const perm of cat.permissions) {
        if (selectedSet.has(perm.code)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Returns unlocked, scope-compatible workspaces in canonical rail sort order
 * where the role currently holds `>= 1` granted permission.
 */
export function getEligibleWorkspacesForRole(
  catalog: LandingTargetCatalog | null | undefined,
  selectedPermissionCodes: Set<string>,
  scopeMode: LandingTargetScopeMode,
  moduleGroups: PermissionModuleGroup[] = []
): LandingTargetWorkspace[] {
  if (!catalog || selectedPermissionCodes.size === 0) return [];
  const selectedArray = Array.from(selectedPermissionCodes);

  return catalog.workspaces
    .filter(
      (ws) =>
        isCatalogWorkspaceScopeCompatible(ws, scopeMode) &&
        hasGrantedPermissionInWorkspace(
          ws.workspaceKey.trim().toLowerCase(),
          catalog,
          selectedArray,
          selectedPermissionCodes,
          moduleGroups
        )
    )
    .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder);
}

/**
 * Finds the first authorized `menu:<slug>` leaf target inside a workspace
 * for pre-populating a newly added sparse rule row.
 */
export function findFirstAuthorizedTargetForWorkspace(
  workspaceKey: string,
  catalog: LandingTargetCatalog | null | undefined,
  selectedPermissionCodes: Set<string>,
  scopeMode: LandingTargetScopeMode
): string {
  if (!catalog) return "";
  const wsKey = workspaceKey.trim().toLowerCase();
  if (!wsKey) return "";
  const selectedArray = Array.from(selectedPermissionCodes);

  const scopedItems = catalog.items.filter(
    (item) =>
      item.workspaceKey.trim().toLowerCase() === wsKey &&
      isCatalogItemScopeCompatible(item, scopeMode) &&
      item.slug.trim().toLowerCase() !== "overview"
  );

  const authorized = scopedItems.find((item) => {
    const reqs = PAGE_PERMISSIONS[normalizeRoutePath(item.route)];
    return !reqs || reqs.length === 0 || hasAllPermissions(selectedArray, reqs);
  });

  const chosen = authorized ?? scopedItems[0];
  return chosen ? `menu:${chosen.slug.trim().toLowerCase()}` : "";
}

/**
 * Evaluates live against `PermissionTreeCard` selections whether a configured role
 * workspace rule is missing its required page permission(s).
 */
export function getRulePermissionWarning(
  rule: DraftRoleWorkspaceEntryRule,
  catalog: LandingTargetCatalog | null | undefined,
  selectedPermissionCodes: Set<string>
): RoleWorkspaceRulePermissionWarning {
  const wsKey = rule.workspaceKey.trim().toLowerCase();
  const rawTarget = rule.target.trim().toLowerCase();
  const slug = rawTarget.startsWith("menu:") ? rawTarget.slice("menu:".length) : "";
  const selectedArray = Array.from(selectedPermissionCodes);

  if (catalog && slug && wsKey) {
    const item = catalog.items.find(
      (entry) =>
        entry.workspaceKey.trim().toLowerCase() === wsKey &&
        entry.slug.trim().toLowerCase() === slug
    );

    if (item) {
      const reqs = PAGE_PERMISSIONS[normalizeRoutePath(item.route)];
      if (reqs && reqs.length > 0) {
        const missing = reqs.filter((req) => !hasPermission(selectedArray, req));
        if (missing.length > 0) {
          return {
            hasWarning: true,
            missingPermissions: missing,
            isPersistedStaleOnly: false,
          };
        }
        return {
          hasWarning: false,
          missingPermissions: [],
          isPersistedStaleOnly: false,
        };
      }
    }
  }

  if (rule.persistedIsStale) {
    return {
      hasWarning: true,
      missingPermissions: [],
      isPersistedStaleOnly: true,
    };
  }

  return {
    hasWarning: false,
    missingPermissions: [],
    isPersistedStaleOnly: false,
  };
}
