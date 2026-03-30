/**
 * Permission Types — Domain Layer (Roles Module)
 *
 * Shared types for permission assignments and scoping.
 * Single source of truth — data/models re-exports from here.
 *
 * @module roles/domain
 */

// ── Permission Assignment ────────────────────────────────

export interface PermissionAssignmentJson {
  permissionId: string;
  scopeOverride?: string | null;
  restrictedFields?: string[] | null;
}

// ── Permission Scopes ────────────────────────────────────

export const PermissionScopes = {
  /** No override - uses permission's default scope */
  Default: "default",
  /** Only own records (CreatedBy == CurrentUserId) */
  Own: "own",
  /** All records in own tenant */
  OwnTenant: "own_tenant",
  /** All records in own tenant + child tenants */
  Hierarchy: "hierarchy",
  /** All records in all tenants */
  AllTenants: "all_tenants",
} as const;

export type PermissionScopeType = (typeof PermissionScopes)[keyof typeof PermissionScopes];
