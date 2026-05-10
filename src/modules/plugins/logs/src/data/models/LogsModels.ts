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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
