import type { PluginExecutionLog } from "../entities/PluginExecutionLog";
import type { PagedResult } from "../../data/models/LogsModels";

/**
 * Repository layer implementing client request queries for i logs.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface ILogsRepository {
  getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLog>>;
}
