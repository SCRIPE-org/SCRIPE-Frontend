import type { PluginTierValue } from "../../domain/entities/PluginDefinition";
/**
 * Exported type defining parameters and fields for plugin tier configurations.
 */
export type PluginTier = PluginTierValue;

/**
 * Interface defining property specifications, keys types, and structural contract rules for plugin catalog item model.
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
 * Interface defining property specifications, keys types, and structural contract rules for install plugin request.
 */
export interface InstallPluginRequest {
  pluginDefinitionId: string;
  tenantId: string;
  installedByUserId: string;
  settingsJson?: string;
}
