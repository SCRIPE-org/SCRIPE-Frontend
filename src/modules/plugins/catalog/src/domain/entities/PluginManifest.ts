/**
 * Interface structure detailing the properties and attributes of Plugin Manifest Entry Point.
 */
export interface PluginManifestEntryPoint {
  main?: string;
  settings?: string;
  admin?: string;
}

/**
 * Interface structure detailing the properties and attributes of Plugin Manifest Menu Item.
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
 * Interface structure detailing the properties and attributes of Plugin Manifest Webhooks.
 */
export interface PluginManifestWebhooks {
  install?: string;
  uninstall?: string;
  events?: string[];
}

/**
 * Interface structure detailing the properties and attributes of Plugin Manifest Pricing.
 */
export interface PluginManifestPricing {
  model: "free" | "paid" | "freemium";
  monthlyPrice?: number;
  yearlyPrice?: number;
  trialDays?: number;
}

/**
 * Interface structure detailing the properties and attributes of Plugin Manifest.
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
 * Utility function executing operational rules for parse plugin manifest.
 */
export function parsePluginManifest(json: string): PluginManifest | null {
  try {
    return JSON.parse(json) as PluginManifest;
  } catch {
    return null;
  }
}
