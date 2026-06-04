import type { PluginExecutionLogModel, PagedResult } from "../../data/models/LogsModels";

export interface ILogsService {
  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLogModel>>;
}
