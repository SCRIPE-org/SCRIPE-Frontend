import type { PluginInstallation } from "../entities/PluginInstallation";

/**
 * Repository layer implementing client request queries for i installed.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IInstalledRepository {
  getInstalled(tenantId: string): Promise<PluginInstallation[]>;
  uninstall(installationId: string, tenantId: string): Promise<void>;
  activate(installationId: string, tenantId: string): Promise<void>;
  deactivate(installationId: string, tenantId: string): Promise<void>;
  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void>;
}
