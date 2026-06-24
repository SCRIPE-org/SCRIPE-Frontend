import type { PluginTierValue } from "../../domain/entities/PluginDefinition";
/**
 * Type declaration definition describing the schema of plugin tier.
 */
export type PluginTier = PluginTierValue;

/**
 * Interface structure detailing the properties and attributes of Plugin Catalog Item Model.
 */
export interface PluginCatalogItemModel {
  id: string;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  tier: PluginTier;
  iconUrl?: string;
  colorHue?: number;
  colorChroma?: number;
  manifestJson: string;
  isInstalled: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Install Plugin Request.
 */
export interface InstallPluginRequest {
  pluginDefinitionId: string;
  tenantId: string;
  installedByUserId: string;
  settingsJson?: string;
}
