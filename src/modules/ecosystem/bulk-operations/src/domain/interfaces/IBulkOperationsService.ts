export interface IBulkOperationsService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
}
