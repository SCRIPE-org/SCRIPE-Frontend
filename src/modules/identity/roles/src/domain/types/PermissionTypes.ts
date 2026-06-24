/**
 * Permission Types — Domain Layer (Roles Module)
 *
 * Shared types for permission assignments and scoping.
 * Single source of truth — data/models re-exports from here.
 *
 * @module roles/domain
 */

// ── Permission Assignment ────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Permission Assignment Json.
 */
export interface PermissionAssignmentJson {
  permissionId: string;
  scopeOverride?: string | null;
  restrictedFields?: string[] | null;
}

// ── Permission Scopes ────────────────────────────────────

/**
 * Constant definition representing permission scopes.
 */
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

/**
 * Type declaration definition describing the schema of permission scope type.
 */
export type PermissionScopeType = (typeof PermissionScopes)[keyof typeof PermissionScopes];
