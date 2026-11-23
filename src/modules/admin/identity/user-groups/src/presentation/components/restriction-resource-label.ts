import { extractPermissionResource } from "@core/common/types/permissions";

/** Minimal permission shape needed to resolve a canonical restrictable resource string. */
export interface PermissionResourceCandidate {
  code: string;
  resource?: string | null;
}

/**
 * Common permission action suffixes used to distinguish an action-qualified
 * permission code (e.g. `crm.opportunities.view`) from a bare multi-segment
 * resource (e.g. `crm.opportunities`).
 */
const KNOWN_PERMISSION_ACTIONS = new Set([
  "approve",
  "assign",
  "assign_roles",
  "assign_group",
  "audit",
  "backfill",
  "backfill-field-group-keys",
  "backfill-values",
  "bind",
  "bulk_activate",
  "bulk_deactivate",
  "bulk_delete",
  "cancel",
  "cascade_delete",
  "change-resource",
  "check-in",
  "clone",
  "close",
  "complete",
  "configure",
  "confirm",
  "create",
  "customize",
  "customize_tenant",
  "delete",
  "devices_manage",
  "drill_down",
  "edit",
  "execute",
  "export",
  "export_pdf",
  "followup",
  "generate",
  "impersonate",
  "import",
  "install",
  "list",
  "manage",
  "manage-keys",
  "manage_links",
  "manage_members",
  "manage_permissions",
  "manage_quotas",
  "manage_roles",
  "manage_settings",
  "manage_tags",
  "mark-read",
  "mark_paid",
  "move",
  "override",
  "publish",
  "read",
  "record",
  "reopen",
  "reset",
  "resolve",
  "restore",
  "revoke",
  "rotate",
  "rotate-keys",
  "run",
  "schedule",
  "send",
  "settings",
  "settings_manage",
  "sync",
  "toggle",
  "transfer",
  "update",
  "update_permissions",
  "upload",
  "view",
  "view_admins",
  "view_analytics",
  "view_details",
  "view_health",
  "view_roles",
  "view_self",
  "view_subTenants",
  "waive",
  "write",
]);

const UPPERCASE_SEGMENTS = new Set(["api", "crm", "hr", "kpi", "pos", "rbac", "sso"]);

/**
 * Resolves either a bare resource (single or multi-segment, e.g. `crm.opportunities`)
 * or an action-qualified permission code (e.g. `crm.opportunities.view`,
 * `crm.opportunities.stage.override`) to its canonical lowercase resource string
 * using `extractPermissionResource` without truncating dotted resource names.
 */
export function resolveRestrictableResource(
  value: string,
  availablePermissions: ReadonlyArray<PermissionResourceCandidate> = []
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.toLowerCase();
  const knownResources = new Set<string>();
  const codeToResource = new Map<string, string>();

  for (const perm of availablePermissions) {
    const canonical = extractPermissionResource(perm.code, perm.resource).trim().toLowerCase();
    if (canonical) {
      knownResources.add(canonical);
      if (perm.code?.trim()) {
        codeToResource.set(perm.code.trim().toLowerCase(), canonical);
      }
    }
  }

  const mappedFromCode = codeToResource.get(normalized);
  if (mappedFromCode) {
    return mappedFromCode;
  }

  if (knownResources.has(normalized)) {
    return extractPermissionResource(trimmed, normalized).toLowerCase();
  }

  if (normalized.endsWith(".stage.override")) {
    return extractPermissionResource(trimmed).toLowerCase();
  }

  const lastDot = normalized.lastIndexOf(".");
  if (lastDot > 0) {
    const suffix = normalized.slice(lastDot + 1);
    if (KNOWN_PERMISSION_ACTIONS.has(suffix)) {
      return extractPermissionResource(trimmed).toLowerCase();
    }
    return extractPermissionResource(trimmed, normalized).toLowerCase();
  }

  return extractPermissionResource(trimmed).toLowerCase();
}

function translateIfPresent(t: (key: string) => string, key: string): string | null {
  const translated = t(key);
  if (
    !translated ||
    translated === key ||
    translated.startsWith("nav.") ||
    translated.startsWith("dataExchange.")
  ) {
    return null;
  }
  return translated;
}

function formatSegmentFallback(segment: string): string {
  const lower = segment.toLowerCase();
  if (UPPERCASE_SEGMENTS.has(lower)) {
    return lower.toUpperCase();
  }
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * Resolves a human-readable bilingual label for a permission code or dotted resource,
 * never leaking raw `nav.*` key names when an i18n lookup misses.
 */
export function formatRestrictableResourceLabel(
  value: string,
  t: (key: string) => string,
  availablePermissions: ReadonlyArray<PermissionResourceCandidate> = []
): string {
  const canonical = resolveRestrictableResource(value, availablePermissions);
  if (!canonical) {
    return value.trim();
  }

  const segments = canonical.split(".").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? canonical;
  const candidateKeys = [
    `nav.${canonical}`,
    `nav.${canonical.replace(/-/g, "_")}`,
    `nav.routeSegments.${lastSegment}`,
    `nav.routeSegments.${lastSegment.replace(/_/g, "-")}`,
    `nav.${lastSegment}`,
    `nav.${lastSegment.replace(/-/g, "_")}`,
  ];

  for (const key of candidateKeys) {
    const match = translateIfPresent(t, key);
    if (match) {
      return match;
    }
  }

  return segments.map(formatSegmentFallback).join(" · ");
}
