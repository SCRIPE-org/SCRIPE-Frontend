// ═══════════════════════════════════════════════════════════════════════════
// planHelpers — Plan Picker Pure Functions
//
// These are pure data-transformation utilities that previously lived inside
// usePlanPickerViewModel. They have NO React dependencies and NO side-effects,
// making them fully testable in isolation.
// ═══════════════════════════════════════════════════════════════════════════

import type { PlanEdition, ComparisonCategory, ComparisonCellData } from "../../domain/entities";
import { FEATURE_CATEGORY_ORDER } from "../../domain/constants/signupConstants";

// ─── Feature name formatting ──────────────────────────────────────────────────

/**
 * Converts raw feature names like "Identity.Admins.MaxPerTenant" to
 * a human-readable "Max Admins Per Tenant" display label.
 *
 * Used in the comparison table when no displayLabelEn is provided.
 */
export function formatFeatureName(raw: string): string {
  if (!raw) return raw;

  // Already readable (has spaces and starts uppercase)
  if (raw.includes(" ") && raw[0] === raw[0].toUpperCase()) return raw;

  // MIME-type-like strings — return as-is
  if (raw.includes("/") && raw.includes("*")) return raw;

  // Dotted names: "Identity.Admins.MaxPerTenant" → take last 1–2 meaningful segments
  if (raw.includes(".")) {
    const segments = raw.split(".");
    const lastTwo = segments.slice(-2);
    const NOISE = ["Enabled", "Max", "Modules", "Marketing", "Identity"];
    raw = lastTwo.filter((s) => !NOISE.includes(s)).join(" ");
    if (!raw) raw = segments[segments.length - 1];
  }

  // camelCase / PascalCase → spaces
  raw = raw.replace(/([a-z])([A-Z])/g, "$1 $2");
  // snake_case / kebab-case → spaces
  raw = raw.replace(/[_-]/g, " ");
  // Capitalize each word
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

// ─── Feature display category grouping ───────────────────────────────────────

/**
 * Maps a raw feature name to one of the known comparison table category groups.
 * This is intentionally deterministic — no server call needed.
 */
export function getFeatureDisplayCategory(name: string): string {
  if (name.startsWith("Identity.")) return "Users & Access";
  if (name.startsWith("Modules.")) return "Modules";

  if (
    name.startsWith("Marketing.SSO") ||
    name.startsWith("Identity.2FA") ||
    name.startsWith("Identity.Require2FA") ||
    name.startsWith("Identity.SecurityPage") ||
    name.startsWith("Compliance") ||
    name.includes("AuditLog") ||
    name.includes("Encryption")
  )
    return "Security";

  if (
    name.startsWith("Marketing.Support") ||
    name.startsWith("Marketing.Onboarding") ||
    name.startsWith("Marketing.Training") ||
    name.startsWith("Marketing.AccountManager") ||
    name.includes("SupportTickets") ||
    name.includes("SlackChannel")
  )
    return "Support";

  if (
    name.startsWith("Marketing.SLA") ||
    name.startsWith("Marketing.Backup") ||
    name.startsWith("Marketing.DataRetention") ||
    name.includes("CDN") ||
    name.includes("Uptime") ||
    name.includes("Caching")
  )
    return "Performance";

  if (
    name.includes("Billing") ||
    name.includes("Invoice") ||
    name.includes("Payment") ||
    name.includes("Subscription")
  )
    return "Billing";

  if (
    name.includes("Storage") ||
    name.includes("ApiCalls") ||
    name.includes("Bandwidth") ||
    name.includes("FileSize") ||
    name.includes("Max") ||
    name.includes("Limit")
  )
    return "Quotas";

  if (name.startsWith("Marketing.")) return "General";

  return "General";
}

// ─── Comparison table builder ─────────────────────────────────────────────────

/**
 * Sort helper that respects a preferred ordering array,
 * falling back to alphabetical for items not in the list.
 */
export function sortByPriority(a: string, b: string, order: readonly string[]): number {
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.localeCompare(b);
}

/**
 * Builds the comparison table matrix from a list of plan editions.
 *
 * Output: one ComparisonCategory per feature group, each containing a row
 * per unique feature with a value cell for every edition.
 */
export function buildComparisonCategories(
  editions: PlanEdition[],
  _language: string
): ComparisonCategory[] {
  type FeatureEntry = {
    name: string;
    sortOrder: number;
    displayCategory: string;
    values: Record<string, ComparisonCellData>;
  };

  // 1. Collect all unique features across all editions
  const featureMap = new Map<string, FeatureEntry>();

  for (const edition of editions) {
    for (const feat of edition.allFeatures) {
      if (!featureMap.has(feat.name)) {
        featureMap.set(feat.name, {
          name: feat.name,
          sortOrder: feat.sortOrder ?? 999,
          displayCategory: getFeatureDisplayCategory(feat.name),
          values: {},
        });
      }
      featureMap.get(feat.name)!.values[edition.id] = {
        value: feat.value,
        valueType: feat.valueType,
        displayLabelEn: feat.displayLabelEn ?? null,
        displayLabelAr: feat.displayLabelAr ?? null,
      };
    }
  }

  // 2. Group by display category
  const grouped = new Map<string, FeatureEntry[]>();
  for (const feat of featureMap.values()) {
    const cat = feat.displayCategory;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(feat);
  }

  // 3. Build sorted result
  const result: ComparisonCategory[] = [];
  for (const [catName, features] of grouped) {
    features.sort((a, b) => a.sortOrder - b.sortOrder);
    result.push({
      key: catName,
      label: catName,
      features: features.map((f) => ({
        featureName: f.name,
        label: formatFeatureName(f.name),
        values: f.values,
      })),
    });
  }

  return result.sort((a, b) => sortByPriority(a.key, b.key, FEATURE_CATEGORY_ORDER));
}
