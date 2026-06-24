import type { PluginExecutionLogModel, PagedResult } from "../../data/models/LogsModels";

/**
 * Interface defining operations for the Logs network service.
 */
export interface ILogsService {
  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLogModel>>;
}
