/**
 * Domain model representing a Plugin Manifest Entry Point structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PluginManifestEntryPoint {
  main?: string;
  settings?: string;
  admin?: string;
}

/**
 * Domain model representing a Plugin Manifest Menu Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PluginManifestMenuItem {
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  parentSlug?: string;
  sortOrder: number;
}

/**
 * Domain model representing a Plugin Manifest Webhooks structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PluginManifestWebhooks {
  install?: string;
  uninstall?: string;
  events?: string[];
}

/**
 * Domain model representing a Plugin Manifest Pricing structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PluginManifestPricing {
  model: "free" | "paid" | "freemium";
  monthlyPrice?: number;
  yearlyPrice?: number;
  trialDays?: number;
}

/**
 * Domain model representing a Plugin Manifest structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PluginManifest {
  key: string;
  name: string;
  nameAr: string;
  version: string;
  tier: "tier1" | "tier2";
  description: string;
  descriptionAr: string;
  icon?: string;
  colorHue?: number;
  author?: { name: string; email?: string; website?: string };
  permissions?: string[];
  requiredFeatures?: string[];
  workspace?: { key?: string; menuItems?: PluginManifestMenuItem[] };
  entryPoints?: PluginManifestEntryPoint;
  webhooks?: PluginManifestWebhooks;
  pricing?: PluginManifestPricing;
}

/**
 * Domain model representing a parse Plugin Manifest structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export function parsePluginManifest(json: string): PluginManifest | null {
  try {
    return JSON.parse(json) as PluginManifest;
  } catch {
    return null;
  }
}
