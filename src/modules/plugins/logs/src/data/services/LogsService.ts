import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { ILogsService } from "../../domain/interfaces/ILogsService";
import type { PluginExecutionLogModel, PagedResult } from "../models/LogsModels";

export class LogsService implements ILogsService {
  constructor(private readonly api: IApiService) {}

  getLogs(installationId: string, page: number, pageSize: number): Promise<PagedResult<PluginExecutionLogModel>> {
    return this.api.get<PagedResult<PluginExecutionLogModel>>(
      `${API_ENDPOINTS.PLUGINS.LOGS(installationId)}?page=${page}&pageSize=${pageSize}`
    );
  }
}
