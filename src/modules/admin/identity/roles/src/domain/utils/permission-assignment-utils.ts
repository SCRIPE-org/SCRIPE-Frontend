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

/** Splits comma/newline-separated restricted-field input and merges with case-insensitive dedup. */
export function parseRestrictedFieldDraft(
  rawDraft: string,
  existingFields: string[]
): { nextFields: string[]; added: string[]; duplicateIgnored: boolean } {
  const seen = new Set(existingFields.map((field) => field.toLowerCase()));
  const nextFields = [...existingFields];
  const added: string[] = [];
  let duplicateIgnored = false;

  for (const part of rawDraft.split(/[,\r\n]+/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      duplicateIgnored = true;
      continue;
    }
    seen.add(key);
    nextFields.push(trimmed);
    added.push(trimmed);
  }

  return { nextFields, added, duplicateIgnored };
}

/** Collects restricted fields (committed tags + uncommitted draft tokens) that target required custom fields. */
export function findRequiredRestrictedFields(
  committedFields: string[],
  draftValue: string,
  requiredKeysLower: ReadonlySet<string>
): string[] {
  const { nextFields } = parseRestrictedFieldDraft(draftValue, committedFields);
  return nextFields.filter((field) => requiredKeysLower.has(field.toLowerCase()));
}

/** Canonical comparison snapshot for permission assignments (selection, scope override, sorted fields). */
export interface PermissionAssignmentSnapshot {
  scope: string;
  fieldsKey: string;
}

/** Builds a deterministic comparison snapshot for tracking dirty permission/scope/field state. */
export function snapshotPermissionAssignments(
  assignments: Map<string, PermissionAssignmentJson>
): Map<string, PermissionAssignmentSnapshot> {
  const snapshot = new Map<string, PermissionAssignmentSnapshot>();
  for (const [code, assignment] of assignments.entries()) {
    snapshot.set(code, {
      scope: assignment.scopeOverride ?? "",
      fieldsKey: [...(assignment.restrictedFields ?? [])].sort().join("|"),
    });
  }
  return snapshot;
}

/** Computes added, removed, and scope/restricted-field modified counts relative to an initial snapshot. */
export function diffPermissionAssignmentSnapshots(
  current: Map<string, PermissionAssignmentJson>,
  initial: Map<string, PermissionAssignmentSnapshot>
): { added: number; removed: number; modified: number } {
  let added = 0;
  let removed = 0;
  let modified = 0;

  for (const [code, assignment] of current.entries()) {
    const baseline = initial.get(code);
    if (!baseline) {
      added += 1;
      continue;
    }
    const currentScope = assignment.scopeOverride ?? "";
    const currentFieldsKey = [...(assignment.restrictedFields ?? [])].sort().join("|");
    if (currentScope !== baseline.scope || currentFieldsKey !== baseline.fieldsKey) {
      modified += 1;
    }
  }

  for (const code of initial.keys()) {
    if (!current.has(code)) {
      removed += 1;
    }
  }

  return { added, removed, modified };
}
