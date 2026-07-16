import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { ILogsService } from "../../domain/interfaces/ILogsService";
import type { PluginExecutionLogModel, PagedResult } from "../models/LogsModels";

/**
 * Http API network service for logs.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class LogsService implements ILogsService {
  constructor(private readonly api: IApiService) {}

  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLogModel>> {
    return this.api.get<PagedResult<PluginExecutionLogModel>>(
      `${API_ENDPOINTS.PLUGINS.LOGS(installationId)}?page=${page}&pageSize=${pageSize}`
    );
  }
}
