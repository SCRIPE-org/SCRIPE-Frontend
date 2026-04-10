export interface IReportsService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  execute(data: Record<string, unknown>): Promise<unknown>;
  export(data: Record<string, unknown>): Promise<Blob>;
  getDataSources(): Promise<unknown>;
}
