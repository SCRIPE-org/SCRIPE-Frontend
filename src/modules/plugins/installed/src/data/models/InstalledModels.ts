/** Backend InstallationStatus enum (serialized as JSON strings). */
export type InstallationStatus = "Installing" | "Active" | "Disabled" | "Uninstalling" | "Failed";

export interface PluginInstallationModel {
  id: string;
  pluginDefinitionId: string;
  pluginKey: string;
  pluginName: string;
  pluginNameAr: string;
  iconUrl?: string;
  /** Base URL of the plugin's embedded frontend app (for PluginFrame iframe). Distinct from iconUrl. */
  frontendUrl?: string;
  status: InstallationStatus;
  settingsJson?: string;
  installedAt: string;
  healthCheckPassing: boolean;
  lastHealthCheckAt?: string;
}
