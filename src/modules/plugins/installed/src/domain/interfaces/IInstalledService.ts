import type { PluginInstallationModel } from "../../data/models/InstalledModels";

/**
 * Http API network service for i installed.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IInstalledService {
  getInstalled(tenantId: string): Promise<PluginInstallationModel[]>;
  uninstall(installationId: string, tenantId: string): Promise<void>;
  activate(installationId: string, tenantId: string): Promise<void>;
  deactivate(installationId: string, tenantId: string): Promise<void>;
  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void>;
}
