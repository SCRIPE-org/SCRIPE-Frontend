export interface IBulkOperationsService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  importData(file: File): Promise<unknown>;
  exportData(params: Record<string, unknown>): Promise<Blob>;
  cancel(operationId: string): Promise<void>;
}
