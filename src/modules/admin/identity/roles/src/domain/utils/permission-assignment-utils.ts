/**
 * Shared normalization and serialization helpers for role permission assignments.
 * Eliminates drift between `useRoleDetailViewModel` and `useRolePermissionsDialog`
 * when parsing backend DTOs (`ScopeOverride` / `RestrictedFieldsJson`) and building
 * `AssignPermissionsRequest` payloads.
 *
 * @module roles/domain/utils
 */
import type { PermissionAssignmentJson } from "../types/PermissionTypes";

/**
 * Parses `restrictedFields` / `restrictedFieldsJson` from backend `RolePermissionResponse`
 * whether returned as a string array or a serialized JSON string.
 */
export function parseRestrictedFields(rp: Record<string, unknown>): string[] {
  const raw =
    rp.restrictedFields ??
    rp.RestrictedFields ??
    rp.restrictedFieldsJson ??
    rp.RestrictedFieldsJson;

  if (!raw || raw === "null" || raw === "") {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Normalizes backend scope values so implicit defaults (`"default"`, `"Tenant"`, `"tenant"`,
 * `null`, `""`) resolve to `undefined` (no explicit override), while preserving canonical
 * `own` / `own_tenant` / `hierarchy` / `all_tenants` overrides.
 */
export function normalizeRolePermissionScope(
  rawScope: unknown,
  allowAllTenants = true
): string | undefined {
  if (typeof rawScope !== "string") return undefined;
  const normalized = rawScope.trim().toLowerCase();
  if (!normalized || normalized === "default" || normalized === "tenant") {
    return undefined;
  }
  if (!allowAllTenants && normalized === "all_tenants") {
    return undefined;
  }
  return normalized;
}

/**
 * Extracts normalized assignment metadata from a raw backend role-permission item.
 */
export function extractRolePermissionAssignment(
  rp: Record<string, unknown>,
  fallbackPermissionId = ""
): { code: string; assignment: PermissionAssignmentJson } | null {
  const code = (rp.permissionCode || rp.PermissionCode || rp.code || rp.Code) as
    | string
    | undefined;
  if (!code) return null;

  const permId =
    ((rp.permissionId || rp.PermissionId || rp.id || rp.Id) as string | undefined) ||
    fallbackPermissionId;

  const explicitOverride = rp.scopeOverride ?? rp.ScopeOverride;
  const effectiveRaw = explicitOverride ?? rp.scope ?? rp.Scope;

  return {
    code,
    assignment: {
      permissionId: permId,
      scopeOverride: normalizeRolePermissionScope(effectiveRaw),
      restrictedFields: parseRestrictedFields(rp),
    },
  };
}
