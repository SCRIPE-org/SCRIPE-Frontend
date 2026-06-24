/**
 * Interface structure detailing the properties and attributes of Plugin Execution Log Model.
 */
export interface PluginExecutionLogModel {
  id: string;
  installationId: string;
  pluginKey: string;
  endpoint: string;
  executedAt: string;
  durationMs: number;
  isSuccess: boolean;
  statusCode?: number;
  errorMessage?: string;
}

/**
 * Interface structure detailing the properties and attributes of Paged Result.
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
