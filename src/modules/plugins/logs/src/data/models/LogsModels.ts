/**
 * Interface defining property specifications, keys types, and structural contract rules for plugin execution log model.
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
 * Interface defining property specifications, keys types, and structural contract rules for paged result.
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
