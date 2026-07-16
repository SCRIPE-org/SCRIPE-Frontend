import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IInstalledService } from "../../domain/interfaces/IInstalledService";
import type { PluginInstallationModel } from "../models/InstalledModels";

/**
 * Http API network service for installed.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class InstalledService implements IInstalledService {
  constructor(private readonly api: IApiService) {}

  getInstalled(tenantId: string): Promise<PluginInstallationModel[]> {
    return this.api.get<PluginInstallationModel[]>(
      `${API_ENDPOINTS.PLUGINS.INSTALLED}?tenantId=${tenantId}`
    );
  }

  uninstall(installationId: string, tenantId: string): Promise<void> {
    return this.api.delete<void>(
      `${API_ENDPOINTS.PLUGINS.UNINSTALL(installationId)}?tenantId=${tenantId}`
    );
  }

  activate(installationId: string, tenantId: string): Promise<void> {
    return this.api.post<void>(
      `${API_ENDPOINTS.PLUGINS.ACTIVATE(installationId)}?tenantId=${tenantId}`,
      {}
    );
  }

  deactivate(installationId: string, tenantId: string): Promise<void> {
    return this.api.post<void>(
      `${API_ENDPOINTS.PLUGINS.DEACTIVATE(installationId)}?tenantId=${tenantId}`,
      {}
    );
  }

  upgrade(installationId: string, tenantId: string, newVersionId: string): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.PLUGINS.UPGRADE(installationId), {
      tenantId,
      newVersionId,
    });
  }
}
