export type PluginTier = 1 | 2;

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

export interface InstallPluginRequest {
  pluginDefinitionId: string;
  tenantId: string;
  installedByUserId: string;
  settingsJson?: string;
}
