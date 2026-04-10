export interface IWorkflowsService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getInstances(params?: Record<string, unknown>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  getInstance(id: string): Promise<unknown>;
  create(data: Record<string, unknown>): Promise<unknown>;
  start(definitionId: string, data: Record<string, unknown>): Promise<unknown>;
}
