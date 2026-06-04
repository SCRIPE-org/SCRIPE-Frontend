import type { PluginInstallationModel } from "../../data/models/InstalledModels";

export class PluginInstallation {
  constructor(private readonly data: PluginInstallationModel) {}

  get id() {
    return this.data.id;
  }
  get pluginDefinitionId() {
    return this.data.pluginDefinitionId;
  }
  get pluginKey() {
    return this.data.pluginKey;
  }
  get pluginName() {
    return this.data.pluginName;
  }
  get pluginNameAr() {
    return this.data.pluginNameAr;
  }
  get iconUrl() {
    return this.data.iconUrl ?? null;
  }
  /** The plugin's own frontend app URL — load this in PluginFrame. Distinct from iconUrl. */
  get frontendUrl() {
    return this.data.frontendUrl ?? null;
  }
  get status() {
    return this.data.status;
  }
  get isInstalling() {
    return this.data.status === "Installing";
  }
  get isActive() {
    return this.data.status === "Active";
  }
  get isDisabled() {
    return this.data.status === "Disabled";
  }
  get isUninstalling() {
    return this.data.status === "Uninstalling";
  }
  get isFailed() {
    return this.data.status === "Failed";
  }
  get installedAt() {
    return new Date(this.data.installedAt);
  }
  get healthCheckPassing() {
    return this.data.healthCheckPassing;
  }
  get lastHealthCheckAt() {
    return this.data.lastHealthCheckAt ? new Date(this.data.lastHealthCheckAt) : null;
  }

  toModel() {
    return this.data;
  }
}
