import type { PluginInstallationModel } from "../../data/models/InstalledModels";

export class PluginInstallation {
  constructor(private readonly data: PluginInstallationModel) {}

  get id() { return this.data.id; }
  get pluginDefinitionId() { return this.data.pluginDefinitionId; }
  get pluginKey() { return this.data.pluginKey; }
  get pluginName() { return this.data.pluginName; }
  get pluginNameAr() { return this.data.pluginNameAr; }
  get iconUrl() { return this.data.iconUrl ?? null; }
  get status() { return this.data.status; }
  get isActive() { return this.data.status === 2; }
  get isDisabled() { return this.data.status === 3; }
  get installedAt() { return new Date(this.data.installedAt); }
  get healthCheckPassing() { return this.data.healthCheckPassing; }
  get lastHealthCheckAt() {
    return this.data.lastHealthCheckAt ? new Date(this.data.lastHealthCheckAt) : null;
  }

  toModel() { return this.data; }
}
