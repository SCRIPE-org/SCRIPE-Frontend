import type { PluginInstallationModel } from "../../data/models/InstalledModels";

/**
 * Interface defining operations for the Installed network service.
 */
export interface IInstalledService {
  getInstalled(tenantId: string): Promise<PluginInstallationModel[]>;
  uninstall(installationId: string, tenantId: string): Promise<void>;
  activate(installationId: string, tenantId: string): Promise<void>;
  deactivate(installationId: string, tenantId: string): Promise<void>;
  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void>;
}
