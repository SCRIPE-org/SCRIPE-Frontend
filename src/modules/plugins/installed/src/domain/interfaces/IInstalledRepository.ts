import type { PluginInstallation } from "../entities/PluginInstallation";

/**
 * Interface defining repository methods for managing Installed data access.
 */
export interface IInstalledRepository {
  getInstalled(tenantId: string): Promise<PluginInstallation[]>;
  uninstall(installationId: string, tenantId: string): Promise<void>;
  activate(installationId: string, tenantId: string): Promise<void>;
  deactivate(installationId: string, tenantId: string): Promise<void>;
  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void>;
}
