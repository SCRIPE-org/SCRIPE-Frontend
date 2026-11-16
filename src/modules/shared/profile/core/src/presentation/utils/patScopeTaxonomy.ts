/**
 * patScopeTaxonomy
 *
 * Pure localization, classification, expiration formatting, and dynamic
 * least-privilege preset helpers for Personal Access Token scopes.
 */
import type { PatScopeOption } from "../../domain/entities/SovereignAccountWorkstationEntities";

/** Risk classification tiers for Personal Access Token permission scopes. */
export type PatScopeAccessTier = "read" | "write" | "sensitive";

const READ_ACTIONS = new Set([
  "view",
  "read",
  "view_details",
  "view_children",
  "export",
  "export_pdf",
  "search",
  "list",
]);

const SENSITIVE_KEYWORDS = [
  "delete",
  "override",
  "impersonate",
  "approve",
  "refund",
  "lockdown",
  "assign_roles",
  "reset_password",
  "revoke",
  "billing",
];

/** Classifies a permission action or code into Read-Only, Write, or Sensitive risk tier. */
export function classifyPatScopeAccess(actionOrCode: string): PatScopeAccessTier {
  const lower = actionOrCode.trim().toLowerCase();
  const tail = lower.includes(".") ? (lower.split(".").pop() ?? lower) : lower;
  if (SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw))) return "sensitive";
  if (READ_ACTIONS.has(tail)) return "read";
  return "write";
}

/** Resolves bilingual display name (`nameAr` / `nameEn`) with clean humanized fallback. */
export function getLocalizedPatScopeName(
  scope: Pick<PatScopeOption, "code" | "displayName" | "nameEn" | "nameAr">,
  language: string
): string {
  const isArabic = language.toLowerCase().startsWith("ar");
  const candidate = isArabic
    ? scope.nameAr || scope.nameEn || scope.displayName
    : scope.nameEn || scope.displayName;
  if (candidate && candidate.trim() && candidate.trim() !== scope.code) {
    return candidate.trim();
  }
  return scope.displayName || scope.code;
}

/** Resolves bilingual explanation (`descriptionAr` / `descriptionEn`). */
export function getLocalizedPatScopeDescription(
  scope: Pick<PatScopeOption, "descriptionEn" | "descriptionAr">,
  language: string
): string {
  const isArabic = language.toLowerCase().startsWith("ar");
  return (isArabic ? scope.descriptionAr || scope.descriptionEn : scope.descriptionEn) || "";
}

/** Formats an unambiguous localized target expiration date string `days` days from now. */
export function formatPatExpiryTargetDate(days: number, language: string): string {
  const safeDays = Math.min(365, Math.max(1, Math.round(days)));
  const target = new Date(Date.now() + safeDays * 86_400_000);
  const locale = language.toLowerCase().startsWith("ar") ? "ar-EG" : "en-US";
  return target.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Converts a positive day delta to `YYYY-MM-DD` datepicker string in UTC. */
export function daysToYmd(days: number): string {
  const safeDays = Math.min(365, Math.max(1, Math.round(days)));
  const d = new Date(Date.now() + safeDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Computes whole days (clamped `1..365`) between today and a `YYYY-MM-DD` string. */
export function ymdToClampedDays(ymd: string): number {
  const parsed = Date.parse(`${ymd}T12:00:00Z`);
  if (Number.isNaN(parsed)) return 90;
  const diffDays = Math.round((parsed - Date.now()) / 86_400_000);
  return Math.min(365, Math.max(1, diffDays));
}

/** Quick least-privilege starter scope template derived dynamically from entitled scopes. */
export interface PatQuickPreset {
  id: "readOnly" | "analyticsAudit" | "venueOps" | "clearAll";
  scopes: string[];
}

/** Builds dynamic least-privilege starter presets strictly from the caller's entitled catalog. */
export function buildPatQuickPresets(scopeCatalog: PatScopeOption[]): PatQuickPreset[] {
  const readOnly = scopeCatalog
    .filter((s) => classifyPatScopeAccess(s.action || s.code) === "read")
    .slice(0, 8)
    .map((s) => s.code);

  const analyticsAudit = scopeCatalog
    .filter(
      (s) =>
        s.moduleKey.toLowerCase().includes("analytics") ||
        s.moduleKey.toLowerCase().includes("compliance") ||
        s.code.toLowerCase().includes("audit.view")
    )
    .map((s) => s.code);

  const venueOps = scopeCatalog
    .filter(
      (s) =>
        s.moduleKey.toLowerCase() === "venue" &&
        classifyPatScopeAccess(s.action || s.code) === "read"
    )
    .slice(0, 8)
    .map((s) => s.code);

  const presets: PatQuickPreset[] = [];
  if (readOnly.length > 0) presets.push({ id: "readOnly", scopes: readOnly });
  if (analyticsAudit.length > 0) presets.push({ id: "analyticsAudit", scopes: analyticsAudit });
  if (venueOps.length > 0) presets.push({ id: "venueOps", scopes: venueOps });
  presets.push({ id: "clearAll", scopes: [] });
  return presets;
}
