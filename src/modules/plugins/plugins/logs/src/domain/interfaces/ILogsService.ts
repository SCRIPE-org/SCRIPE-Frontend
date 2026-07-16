import type { PluginExecutionLogModel, PagedResult } from "../../data/models/LogsModels";

/**
 * Http API network service for i logs.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ILogsService {
  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLogModel>>;
}
