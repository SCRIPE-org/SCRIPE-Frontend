import type { IWorkflowsRepository } from "../../domain/interfaces/IWorkflowsRepository";
import type { IWorkflowsService } from "../../domain/interfaces/IWorkflowsService";
import { WorkflowsMapper } from "../mappers/WorkflowsMapper";
import { WorkflowsEntity } from "../../domain/entities/WorkflowsEntity";

export class WorkflowsRepository implements IWorkflowsRepository {
  constructor(private readonly service: IWorkflowsService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: WorkflowsEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => WorkflowsMapper.toEntity(item as Parameters<typeof WorkflowsMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<WorkflowsEntity> {
    const result = await this.service.getById(id);
    return WorkflowsMapper.toEntity(result as Parameters<typeof WorkflowsMapper.toEntity>[0]);
  }

  async create(data: Record<string, unknown>): Promise<unknown> {
    return this.service.create(data);
  }

  async start(definitionId: string, data?: Record<string, unknown>): Promise<unknown> {
    return this.service.start(definitionId, data ?? {});
  }
}
