import type { IApiService } from "@core/interfaces/api.interface";
import type { IInstalledService } from "../../domain/interfaces/IInstalledService";
import type { PluginInstallationModel } from "../models/InstalledModels";
import { INSTALLED_ENDPOINTS } from "./installed.endpoints";

/**
 * Http API network service for installed.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class InstalledService implements IInstalledService {
  constructor(private readonly api: IApiService) {}

  getInstalled(tenantId: string): Promise<PluginInstallationModel[]> {
    return this.api.get<PluginInstallationModel[]>(
      `${INSTALLED_ENDPOINTS.INSTALLED}?tenantId=${tenantId}`
    );
  }

  uninstall(installationId: string, tenantId: string): Promise<void> {
    return this.api.delete<void>(
      `${INSTALLED_ENDPOINTS.UNINSTALL(installationId)}?tenantId=${tenantId}`
    );
  }

  activate(installationId: string, tenantId: string): Promise<void> {
    return this.api.post<void>(
      `${INSTALLED_ENDPOINTS.ACTIVATE(installationId)}?tenantId=${tenantId}`,
      {}
    );
  }

  deactivate(installationId: string, tenantId: string): Promise<void> {
    return this.api.post<void>(
      `${INSTALLED_ENDPOINTS.DEACTIVATE(installationId)}?tenantId=${tenantId}`,
      {}
    );
  }

  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void> {
    return this.api.post<void>(INSTALLED_ENDPOINTS.UPGRADE(installationId), {
      tenantId,
      newVersionId,
    });
  }
}
