import type { PluginExecutionLog } from "../entities/PluginExecutionLog";
import type { PagedResult } from "../../data/models/LogsModels";

export interface ILogsRepository {
  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLog>>;
}
