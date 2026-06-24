import type { PluginExecutionLog } from "../entities/PluginExecutionLog";
import type { PagedResult } from "../../data/models/LogsModels";

/**
 * Interface defining repository methods for managing Logs data access.
 */
export interface ILogsRepository {
  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLog>>;
}
