import type { IInstalledRepository } from "../../domain/interfaces/IInstalledRepository";
import type { IInstalledService } from "../../domain/interfaces/IInstalledService";
import type { PluginInstallation } from "../../domain/entities/PluginInstallation";
import { InstalledMapper } from "../mappers/InstalledMapper";

/**
 * Repository layer implementing client request queries for installed.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class InstalledRepository implements IInstalledRepository {
  constructor(private readonly service: IInstalledService) {}

  async getInstalled(tenantId: string): Promise<PluginInstallation[]> {
    const models = await this.service.getInstalled(tenantId);
    return models.map(InstalledMapper.toEntity);
  }

  uninstall(installationId: string, tenantId: string): Promise<void> {
    return this.service.uninstall(installationId, tenantId);
  }

  activate(installationId: string, tenantId: string): Promise<void> {
    return this.service.activate(installationId, tenantId);
  }

  deactivate(installationId: string, tenantId: string): Promise<void> {
    return this.service.deactivate(installationId, tenantId);
  }

  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void> {
    return this.service.upgrade(installationId, tenantId, newVersionId);
  }
}
