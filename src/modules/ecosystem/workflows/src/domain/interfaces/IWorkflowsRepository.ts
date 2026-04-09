import type { WorkflowsEntity } from "../entities/WorkflowsEntity";

export interface IWorkflowsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: WorkflowsEntity[]; totalCount: number }>;
  getById(id: string): Promise<WorkflowsEntity>;
}
