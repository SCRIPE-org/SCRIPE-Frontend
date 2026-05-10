export type InstallationStatus = 1 | 2 | 3 | 4 | 5;

export interface PluginInstallationModel {
  id: string;
  pluginDefinitionId: string;
  pluginKey: string;
  pluginName: string;
  pluginNameAr: string;
  iconUrl?: string;
  status: InstallationStatus;
  settingsJson?: string;
  installedAt: string;
  healthCheckPassing: boolean;
  lastHealthCheckAt?: string;
}
